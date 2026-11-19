"""Posts for official warnings (orange and red codes of NIMH), prepared as DRAFTS for the owner to look at.

Nothing here publishes anything. For every new orange or red warning in /data/warnings-bg.json (written every
30 minutes by .github/scripts/build-warnings.js) a card and a text are written to queue/drafts/ and a GitHub
issue tells the owner (--notify). The owner approves with the workflow "Social draft" (.github/workflows/social-draft.yml),
which moves the draft to queue/, from where the queue job posts it at the next slot, or deletes it.

  one draft per warning (kind + level + day of its start), at most `warnings.max_per_day` new drafts a day
  (red first, then the ones that cover more provinces); the state is in state/warnings.json.
A magnetic storm is NOT here: alerts.py posts those (Kp 5 and more) on its own."""
import json
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import requests
from PIL import Image, ImageDraw

from .config import ROOT
from .render import H, MONTHS, W, _font, _gradient

log = logging.getLogger(__name__)

SITE_ROOT = ROOT.parent.parent
DATA_FILE = SITE_ROOT / "data" / "warnings-bg.json"
STATE_FILE = ROOT / "state" / "warnings.json"

LEVELS = {"orange": ("ОРАНЖЕВ КОД", "Оранжев код", "#FB8C00"), "red": ("ЧЕРВЕН КОД", "Червен код", "#E53935")}
# the names of the provinces (as in .github/scripts/bg-provinces.js); the page of its main city, where there is one
PROVINCES = {
    "sofia-city": "София-град", "sofia-province": "Софийска област", "blagoevgrad": "Благоевград", "burgas": "Бургас",
    "varna": "Варна", "veliko-tarnovo": "Велико Търново", "vidin": "Видин", "vratsa": "Враца", "gabrovo": "Габрово",
    "dobrich": "Добрич", "kardzhali": "Кърджали", "kyustendil": "Кюстендил", "lovech": "Ловеч", "montana": "Монтана",
    "pazardzhik": "Пазарджик", "pernik": "Перник", "pleven": "Плевен", "plovdiv": "Пловдив", "razgrad": "Разград",
    "ruse": "Русе", "silistra": "Силистра", "sliven": "Сливен", "smolyan": "Смолян", "stara-zagora": "Стара Загора",
    "targovishte": "Търговище", "haskovo": "Хасково", "shumen": "Шумен", "yambol": "Ямбол",
}
CITY_PAGE = {"sofia-city": "sofia"}  # the others: the page has the name of the province


def _local(value, tz):
    return datetime.fromisoformat(value).astimezone(tz)


def collect(data, now, tz):
    """The orange and red warnings that have not expired, one per (kind, level, day of the start), with all their provinces."""
    groups = {}
    for province, items in (data.get("provinces") or {}).items():
        for item in items:
            if item.get("level") not in LEVELS or province not in PROVINCES:
                continue
            expires = _local(item["expires"], tz)
            if expires <= now:
                continue
            onset = _local(item.get("onset") or item["expires"], tz)
            key = f"{item.get('type') or 'other'}-{item['level']}-{onset.date().isoformat()}"
            group = groups.setdefault(key, {
                "key": key, "kind": item.get("type") or "other", "level": item["level"], "event": (item.get("event") or {}).get("bg", "").strip(" !"),
                "onset": onset, "expires": expires, "provinces": set()})
            group["provinces"].add(province)
            group["onset"] = min(group["onset"], onset)
            group["expires"] = max(group["expires"], expires)
    return list(groups.values())


def order(groups):
    """Red first, then the ones that cover more provinces."""
    return sorted(groups, key=lambda g: (g["level"] != "red", -len(g["provinces"]), g["key"]))


def link_for(group, site):
    """One province with a city page: that page; else the page of all the warnings."""
    if len(group["provinces"]) == 1:
        (province,) = group["provinces"]
        slug = CITY_PAGE.get(province, province)
        if (SITE_ROOT / "vremeto" / slug / "index.html").exists():
            return f"{site}/vremeto/{slug}/"
    return f"{site}/vremeto/preduprezhdeniya/"


def names(group):
    return sorted(PROVINCES[p] for p in group["provinces"])


def when_text(group, today):
    start, end = group["onset"], group["expires"]
    def at(d):
        return f"{d.day} {MONTHS[d.month - 1]}, {d:%H:%M} ч."
    if start.date() <= today:
        return f"Важи до {at(end)}"
    return f"От {at(start)} до {at(end)}"


def caption(group, site, today, extra_tags, qcfg):
    """The queue adds its default line and hashtags unless they are in the text: they are written here, in the order of the post."""
    label = LEVELS[group["level"]][1]
    provinces = names(group)
    shown = ", ".join(provinces) if len(provinces) <= 12 else ", ".join(provinces[:12]) + f" и още {len(provinces) - 12}"
    return (f"⚠️ {label} – {group['event'] or 'предупреждение'}\n\n"
            f"{when_text(group, today)}\n"
            f"{'Област' if len(provinces) == 1 else 'Области'}: {shown}.\n\n"
            f"Прогноза и предупреждения: {link_for(group, site)}\n\n"
            f"Източник: НИМХ\n\n{qcfg.get('default_caption', '')}\n\n{qcfg.get('hashtags', '')} {extra_tags}".strip())


def render(group, today, site_label, out_path):
    """The card: 1080x1350, the colour of the code, the kind of warning, the provinces and the time."""
    big, _small, color = LEVELS[group["level"]]
    image = _gradient((10, 16, 36), (22, 36, 71))
    d = ImageDraw.Draw(image)
    d.rectangle([0, 0, W, 330], fill=color)
    d.text((W / 2, 120), "ВНИМАНИЕ", font=_font(46), fill=(255, 255, 255), anchor="mm")
    d.text((W / 2, 235), big, font=_font(104, True), fill=(255, 255, 255), anchor="mm")
    # the kind of warning, in one or two lines
    title = (group["event"] or "Предупреждение").upper()
    lines, line = [], ""
    for word in title.split():
        if d.textlength((line + " " + word).strip(), font=_font(64, True)) > W - 140 and line:
            lines.append(line)
            line = word
        else:
            line = (line + " " + word).strip()
    lines.append(line)
    y = 455
    for text in lines[:3]:
        d.text((W / 2, y), text, font=_font(64, True), fill="white", anchor="mm")
        y += 82
    d.text((W / 2, y + 40), when_text(group, today), font=_font(38), fill=(220, 228, 255), anchor="mm")
    # the provinces, wrapped
    provinces = names(group)
    head = "Област" if len(provinces) == 1 else f"Области ({len(provinces)})"
    d.text((W / 2, y + 150), head, font=_font(34, True), fill=color, anchor="mm")
    text, rows, row = ", ".join(provinces), [], ""
    for word in text.split(" "):
        if d.textlength((row + " " + word).strip(), font=_font(36)) > W - 160 and row:
            rows.append(row)
            row = word
        else:
            row = (row + " " + word).strip()
    rows.append(row)
    yy = y + 215
    for text in rows[:7]:
        d.text((W / 2, yy), text, font=_font(36), fill=(236, 240, 255), anchor="mm")
        yy += 52
    if len(rows) > 7:
        d.text((W / 2, yy), "…", font=_font(36), fill=(236, 240, 255), anchor="mm")
    d.text((W / 2, 1195), "Официално предупреждение на НИМХ", font=_font(30), fill=(200, 206, 238), anchor="mm")
    d.text((W / 2, 1275), site_label, font=_font(46, True), fill="white", anchor="mm")
    image.save(out_path, "JPEG", quality=92)
    return Path(out_path)


# ---------------- state ----------------
def _state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    return {"drafts": {}}


def _save(state, now):
    # forget what is older than 30 days (the warning itself is long over)
    state["drafts"] = {k: v for k, v in state["drafts"].items() if datetime.fromisoformat(v["created"]) > now - timedelta(days=30)}
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")


def sample_data(now):
    start, end = now.replace(minute=0, second=0, microsecond=0), now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=30)
    one = lambda level, kind, event: {"level": level, "type": kind, "event": {"bg": event, "en": event}, "onset": start.isoformat(), "expires": end.isoformat()}
    return {"provinces": {
        "pernik": [one("orange", "wind", "Силен вятър!")], "sofia-city": [one("orange", "wind", "Силен вятър!")],
        "sofia-province": [one("orange", "wind", "Силен вятър!")], "kyustendil": [one("orange", "wind", "Силен вятър!")],
        "varna": [one("red", "rain", "Интензивни валежи!")], "dobrich": [one("yellow", "wind", "Силен вятър!")]}}


# ---------------- the job ----------------
def run_warnings(cfg, dry_run=False, sample=False):
    """Writes the new drafts (card + text) to queue/drafts/ and the state; with dry_run only the cards, in output/."""
    wcfg = cfg.get("warnings", {})
    tz = ZoneInfo(cfg["timezone"])
    now = datetime.now(tz)
    site = cfg["site_url"].rstrip("/")
    label = cfg.get("forecast", {}).get("site_label", site.split("//")[-1])
    extra_tags = wcfg.get("hashtags", "#предупреждение")
    limit = int(wcfg.get("max_per_day", 2))
    data = sample_data(now) if sample else json.loads(DATA_FILE.read_text(encoding="utf-8"))
    state = {"drafts": {}} if sample else _state()
    drafts_dir = Path(cfg["queue"]["dir"]) / "drafts"
    out_dir = Path(cfg["output_dir"]) if (dry_run or sample) else drafts_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    today = now.date()
    made_today = sum(1 for v in state["drafts"].values() if datetime.fromisoformat(v["created"]).astimezone(tz).date() == today)
    made = []
    for group in order(collect(data, now, tz)):
        if group["key"] in state["drafts"]:
            continue
        if made_today >= limit:
            log.info("Limit of %s drafts a day reached: %s is left for the next day (if it lasts).", limit, group["key"])
            continue
        name = f"{group['onset'].date().isoformat()}-warning-{group['kind']}-{group['level']}"
        img = render(group, today, label, out_dir / f"{name}.jpg")
        text = caption(group, site, today, extra_tags, cfg["queue"])
        (out_dir / f"{name}.txt").write_text(text + "\n", encoding="utf-8")
        log.info("Draft: %s (%s provinces)", name, len(group["provinces"]))
        state["drafts"][group["key"]] = {"name": name, "created": now.isoformat(), "issue": None,
                                         "title": f"{LEVELS[group['level']][1]} – {group['event'] or 'предупреждение'}, "
                                                  f"{len(group['provinces'])} {'област' if len(group['provinces']) == 1 else 'области'}"}
        made_today += 1
        made.append((img, text))
        if dry_run or sample:
            print(f"--- {name}\n{text}\n")
    if not made:
        log.info("No new orange or red warnings.")
    if not (dry_run or sample):
        _save(state, now)
    return made


def notify(cfg, dry_run=False):
    """A GitHub issue for every draft that has none yet (the owner gets the e-mail of GitHub)."""
    repo = cfg.get("hosting", {}).get("github", {}).get("repo")
    branch = cfg.get("hosting", {}).get("github", {}).get("branch", "main")
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("WP_GITHUB_TOKEN")
    state = _state()
    pending = [(k, v) for k, v in state["drafts"].items() if not v.get("issue")]
    if not pending:
        log.info("Every draft has its issue.")
        return []
    if not (repo and token) and not dry_run:
        raise SystemExit("notify needs hosting.github.repo and GITHUB_TOKEN")
    made = []
    for key, draft in pending:
        name = draft["name"]
        text_file = Path(cfg["queue"]["dir"]) / "drafts" / f"{name}.txt"
        text = text_file.read_text(encoding="utf-8").strip() if text_file.exists() else ""
        image = f"https://raw.githubusercontent.com/{repo}/{branch}/tools/social/queue/drafts/{name}.jpg"
        body = (f"Чернова за публикация във Facebook и Instagram. **Нищо не е публикувано.**\n\n![картата]({image})\n\n"
                f"**Текст:**\n\n```\n{text}\n```\n\n"
                f"**Какво да направите:** GitHub → Actions → **Social draft** → Run workflow → в „draft“ напишете `{name}`, "
                f"а в „action“ изберете `publish` (излиза в следващия слот в 12:29 или 18:29), `publish-now` (веднага) или `delete`.\n\n"
                f"Файловете: `tools/social/queue/drafts/{name}.jpg` и `.txt`. Текстът може да се редактира преди одобряване.")
        title = f"[чернова] {draft['title']} ({name})"
        if dry_run:
            print(title + "\n" + body)
            continue
        r = requests.post(f"https://api.github.com/repos/{repo}/issues", timeout=30,
                          headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
                          json={"title": title, "body": body})
        if r.status_code != 201:
            log.error("Issue for %s failed: HTTP %s %s", name, r.status_code, r.text[:200])
            continue
        draft["issue"] = r.json()["number"]
        log.info("Issue #%s for %s", draft["issue"], name)
        made.append(draft["issue"])
    if not dry_run:
        _save(state, datetime.now(ZoneInfo(cfg["timezone"])))
    return made
