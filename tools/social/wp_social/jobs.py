"""The two jobs: daily forecast post and the media queue post."""
import json
import logging
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from PIL import Image

from .hosting import Hosting
from .meta_api import MetaClient
from .render import build_caption, render_forecast
from .weather import fetch_forecast, sample_forecast

log = logging.getLogger(__name__)

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp"}
VIDEO_EXT = {".mp4", ".mov"}


def make_client(cfg):
    m = cfg["meta"]
    return MetaClient(m["page_id"], m["page_access_token"], m.get("ig_user_id"), m.get("graph_version", "v23.0"))


def _targets(cfg):
    m = cfg["meta"]
    return m.get("post_to_facebook", True), m.get("post_to_instagram", True)


# ---------------- forecast ----------------
def run_forecast(cfg, dry_run=False, sample=False, tomorrow=False):
    tz = ZoneInfo(cfg["timezone"])
    offset = 1 if tomorrow else 0
    day = (datetime.now(tz) + timedelta(days=offset)).date()
    fc_cfg = cfg.get("forecast", {})
    cities = cfg["cities"]

    forecasts = sample_forecast(cities) if sample else fetch_forecast(cities, cfg["timezone"], offset)
    site_url = cfg["site_url"].rstrip("/")
    img_path = Path(cfg["output_dir"]) / f"forecast-{day.isoformat()}.jpg"
    render_forecast(forecasts, day, fc_cfg.get("site_label", site_url.split("//")[-1]), img_path,
                    title=fc_cfg.get("title", "ВРЕМЕТО В БЪЛГАРИЯ"))
    link = site_url + fc_cfg.get("link_path", "/")
    caption = build_caption(forecasts, day, link, fc_cfg.get("hashtags", ""), fc_cfg.get("caption_template", ""))
    log.info("Forecast image: %s", img_path)

    if dry_run:
        print(caption)
        return img_path

    client, host = make_client(cfg), Hosting(cfg.get("hosting", {}))
    to_fb, to_ig = _targets(cfg)
    if to_fb:
        log.info("Facebook post id: %s", client.fb_photo(img_path, caption))
    if to_ig:
        url = host.publish(img_path, f"{datetime.now(tz).strftime('%Y%m%d-%H%M%S')}-{img_path.name}")
        log.info("Instagram media id: %s", client.ig_image(url, caption))
    return img_path


# ---------------- queue ----------------
def _caption_for(item: Path, qcfg):
    txt = item.with_suffix(".txt")
    text = txt.read_text(encoding="utf-8").strip() if txt.exists() else qcfg.get("default_caption", "")
    tags = qcfg.get("hashtags", "")
    return f"{text}\n\n{tags}".strip() if tags and tags not in text else text


def _next_item(qdir: Path):
    items = sorted(p for p in qdir.iterdir()
                   if p.is_file() and p.suffix.lower() in IMAGE_EXT | VIDEO_EXT and not p.name.startswith("."))
    return items[0] if items else None


def _as_jpeg(item: Path, out_dir: Path) -> Path:
    """Instagram accepts only JPEG images."""
    if item.suffix.lower() in (".jpg", ".jpeg"):
        return item
    out = out_dir / (item.stem + ".jpg")
    Image.open(item).convert("RGB").save(out, "JPEG", quality=92)
    return out


def run_queue(cfg, dry_run=False):
    qcfg = cfg["queue"]
    qdir = Path(qcfg["dir"])
    qdir.mkdir(parents=True, exist_ok=True)
    posted_dir = qdir / "posted"
    state_file = qdir / ".state.json"
    state = json.loads(state_file.read_text()) if state_file.exists() else {}

    item = _next_item(qdir)
    if not item:
        log.info("Queue is empty: %s", qdir)
        return None
    is_video = item.suffix.lower() in VIDEO_EXT
    caption = _caption_for(item, qcfg)
    log.info("Next in queue: %s (%s)", item.name, "video" if is_video else "image")
    if dry_run:
        print(caption)
        return item

    client, host = make_client(cfg), Hosting(cfg.get("hosting", {}))
    to_fb, to_ig = _targets(cfg)
    done = state.setdefault(item.name, {})

    def save():
        state_file.write_text(json.dumps(state, ensure_ascii=False, indent=1))

    # Each platform is recorded separately, so a retry never double-posts the one that already succeeded.
    if to_fb and "facebook" not in done:
        done["facebook"] = client.fb_video(item, caption) if is_video else client.fb_photo(item, caption)
        save()
        log.info("Facebook: %s", done["facebook"])
    if to_ig and "instagram" not in done:
        src = item if is_video else _as_jpeg(item, Path(cfg["output_dir"]))
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        url = host.publish(src, f"{stamp}-{src.name}")
        done["instagram"] = client.ig_reel(url, caption) if is_video else client.ig_image(url, caption)
        save()
        log.info("Instagram: %s", done["instagram"])

    posted_dir.mkdir(exist_ok=True)
    prefix = datetime.now().strftime("%Y-%m-%d_")
    for f in (item, item.with_suffix(".txt")):
        if f.exists():
            shutil.move(str(f), posted_dir / (prefix + f.name))
    state.pop(item.name, None)
    save()
    return item
