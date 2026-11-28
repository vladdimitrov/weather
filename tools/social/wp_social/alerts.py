"""Alert posts, checked once a day (evening): a magnetic storm tomorrow (NOAA Kp forecast) and a full
Moon tomorrow (/luna/moon-phases.ics of the site). Each is posted at most once per date."""
import logging
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

from .alerts_render import render_full_moon, render_storm
from .config import ROOT
from .hosting import Hosting
from .render import MONTHS, bg_date
from .utm import for_network, tagged

log = logging.getLogger(__name__)

NOAA_KP = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json"
# Same steps as the site (build-storm-pages.js): Kp rounded, a storm from 5 (NOAA G scale)
LEVELS = [(9, "Изключителна магнитна буря", "G5"), (8, "Много силна магнитна буря", "G4"), (7, "Силна магнитна буря", "G3"),
          (6, "Умерена магнитна буря", "G2"), (5, "Слаба магнитна буря", "G1"), (4, "Повишена активност", ""), (0, "Спокойно", "")]
MONTH_SLUG = ["yanuari", "fevruari", "mart", "april", "may", "yuni", "yuli", "avgust", "septemvri", "oktomvri", "noemvri", "dekemvri"]
# the site's iCalendar file: in the repository (GitHub Actions) or downloaded from the site
ICS_LOCAL = ROOT.parent.parent / "luna" / "moon-phases.ics"
ICS_URL = "https://weatherpulse.eu/luna/moon-phases.ics"


def level_of(kp):
    return next((name, g) for limit, name, g in LEVELS if round(kp) >= limit)


# ---------------- data ----------------
def storm_tomorrow(tz, days_ahead=1):
    """(date, [(start, end, kp), ...]) for tomorrow (days_ahead=1) or today (0) in Bulgarian time from NOAA's forecast; the list is empty if it doesn't cover the day."""
    data = requests.get(NOAA_KP, timeout=60).json()
    # NOAA serves either a list of objects ({"time_tag": ..., "kp": ...}, current) or a header row
    # followed by rows (older format)
    if data and isinstance(data[0], dict):
        entries = [(row.get("time_tag"), row.get("kp")) for row in data]
    else:
        head = data[0]
        i_time, i_kp = head.index("time_tag"), head.index("kp")
        entries = [(row[i_time], row[i_kp]) for row in data[1:]]
    tomorrow = (datetime.now(tz) + timedelta(days=days_ahead)).date()
    slots = []
    for time_tag, kp in entries:
        if not time_tag or kp is None:
            continue
        start = datetime.fromisoformat(str(time_tag).replace(" ", "T").rstrip("Z")).replace(tzinfo=timezone.utc).astimezone(tz)
        if start.date() == tomorrow:
            end = start + timedelta(hours=3)
            slots.append((f"{start:%H:%M}", f"{end:%H:%M}", float(kp)))
    return tomorrow, slots


def full_moon_tomorrow(tz):
    """(datetime in Bulgarian time, supermoon) if a full Moon falls tomorrow, else None."""
    try:
        text = ICS_LOCAL.read_text(encoding="utf-8") if ICS_LOCAL.exists() else requests.get(ICS_URL, timeout=60).text
    except requests.RequestException as e:
        log.warning("Moon calendar not available: %s", e)
        return None
    tomorrow = (datetime.now(tz) + timedelta(days=1)).date()
    for block in text.split("BEGIN:VEVENT")[1:]:
        start = re.search(r"DTSTART:(\d{8}T\d{6})Z", block)
        summary = re.search(r"SUMMARY:(.*)", block)
        if not (start and summary and "Пълнолуние" in summary.group(1)):
            continue
        when = datetime.strptime(start.group(1), "%Y%m%dT%H%M%S").replace(tzinfo=timezone.utc).astimezone(tz)
        if when.date() == tomorrow:
            return when, "суперлуна" in summary.group(1).lower()
    return None


# ---------------- posting ----------------
def _post(cfg, client, host, img_path: Path, caption: str, stamp: str):
    to_fb, to_ig = cfg["meta"].get("post_to_facebook", True), cfg["meta"].get("post_to_instagram", True)
    url = host.publish(img_path, f"{stamp}-{img_path.name}") if (to_ig or host.enabled) else None
    if to_fb:
        log.info("Facebook post id: %s", client.fb_photo(img_path, for_network(caption, "facebook")))
    if to_ig:
        log.info("Instagram media id: %s", client.ig_image(url, for_network(caption, "instagram")))


def run_alerts(cfg, make_client, dry_run=False, sample=False, force=False, today=False):
    """today=True: the morning run, a storm expected today only (the Moon is left to the evening run). The picture has the
    same name as the evening one, so a storm already announced the evening before is not posted twice."""
    acfg = cfg.get("alerts", {})
    if not acfg.get("enabled", False) and not dry_run:
        log.info("Alerts are off (alerts.enabled: false in config.yaml).")
        return []
    tz = ZoneInfo(cfg["timezone"])
    site = cfg["site_url"].rstrip("/")
    label = cfg.get("forecast", {}).get("site_label", site.split("//")[-1])
    out = Path(cfg["output_dir"])
    host = Hosting(cfg.get("hosting", {}))
    stamp = datetime.now(tz).strftime("%Y%m%d-%H%M%S")
    made = []
    client = None if dry_run else make_client(cfg)

    # magnetic storm tomorrow
    min_kp = float(acfg.get("storm_min_kp", 5))
    if sample:
        day = (datetime.now(tz) + timedelta(days=0 if today else 1)).date()
        slots = [(f"{h:02d}:00", f"{(h + 3) % 24:02d}:00", kp) for h, kp in
                 zip(range(2, 26, 3), [2.33, 3, 4.67, 6, 6.33, 5, 3.67, 3])]
    else:
        try:
            day, slots = storm_tomorrow(tz, 0 if today else 1)
        except (requests.RequestException, ValueError, KeyError) as e:
            log.warning("NOAA forecast not available: %s", e)
            day, slots = None, []
    if slots:
        max_kp = max(kp for _, _, kp in slots)
        log.info("Kp %s (%s): up to %.2f", "today" if today else "tomorrow", day, max_kp)
        name = f"storm-{day.isoformat()}.jpg"
        if round(max_kp) >= min_kp and (dry_run or force or not host.already_published("-" + name)):
            level, scale = level_of(max_kp)
            peak = max(slots, key=lambda s: s[2])
            img = render_storm(day, slots, max_kp, level, scale, label, out / name)
            when_word, page = ("днес", "dnes") if today else ("утре", "utre")
            caption = (f"🧲 Магнитна буря {when_word} – {bg_date(day)}\n\n"
                       f"Очакван Kp до {round(max_kp)} – {level.lower()}{f' ({scale})' if scale else ''}.\n"
                       f"Най-силна активност: {peak[0]}–{peak[1]} ч.\n\n"
                       f"Прогноза по часове: {tagged(f'{site}/magnitni-buri/{page}/', 'storm')}\n\n"
                       f"{acfg.get('storm_hashtags', '#магнитнибури #магнитнабуря #weatherpulse')}")
            made.append((img, caption))
            if not dry_run:
                _post(cfg, client, host, img, caption, stamp)

    # full Moon tomorrow (evening run only)
    if acfg.get("full_moon", True) and not today:
        if sample:
            moon = ((datetime.now(tz) + timedelta(days=1)).replace(hour=18, minute=45, second=0, microsecond=0), True)
        else:
            moon = full_moon_tomorrow(tz)
        if moon:
            when, supermoon = moon
            name = f"fullmoon-{when.date().isoformat()}.jpg"
            if dry_run or force or not host.already_published("-" + name):
                img = render_full_moon(when, supermoon, label, out / name)
                month_url = f"{site}/luna/{when.year}/{MONTH_SLUG[when.month - 1]}/"
                caption = (f"🌕 Пълнолуние утре – {when.day} {MONTHS[when.month - 1]}, в {when:%H:%M} ч."
                           f"{' Суперлуна!' if supermoon else ''}\n\n"
                           f"Лунен календар за {MONTHS[when.month - 1]} {when.year}: {tagged(month_url, 'fullmoon')}\n\n"
                           f"{acfg.get('moon_hashtags', '#пълнолуние #луна #луненкалендар #weatherpulse')}")
                made.append((img, caption))
                if not dry_run:
                    _post(cfg, client, host, img, caption, stamp)
    if not made:
        log.info("No alerts for %s.", "today" if today else "tomorrow")
    for img, caption in made:
        log.info("Alert image: %s", img)
        if dry_run:
            print(caption, "\n---")
    return made
