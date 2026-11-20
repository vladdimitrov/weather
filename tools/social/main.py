#!/usr/bin/env python3
"""WeatherPulse social automation.

  python main.py forecast [--dry-run] [--sample] [--tomorrow]   # daily forecast image -> FB + IG
  python main.py queue    [--dry-run]                            # post next photo/video from queue/
  python main.py alerts   [--dry-run] [--sample] [--today]               # magnetic storm / full Moon tomorrow
  python main.py cards    [--sample] [--static] [--force]         # share cards (og:image) of passes, storms, air
  python main.py warnings [--dry-run] [--sample] [--notify]       # DRAFTS for orange/red warnings of NIMH (nothing is posted)
  python main.py check                                           # verify token, page and IG account
  python main.py channel [--test] [--viber-info]                 # the Viber / Telegram channel: state, a test message, the Viber ids
  python main.py serve                                           # run forever on the schedule in config.yaml
"""
import argparse
import logging
import time
from datetime import datetime, timedelta
from logging.handlers import RotatingFileHandler
from zoneinfo import ZoneInfo

from wp_social.channel import broadcast, check as channel_check, viber_info
from wp_social.config import ROOT, load_config
from wp_social.alerts import run_alerts
from wp_social.cards import run_cards
from wp_social.jobs import make_client, run_forecast, run_queue
from wp_social.warnings import notify, run_warnings

log = logging.getLogger("weatherpulse")


def setup_logging():
    (ROOT / "logs").mkdir(exist_ok=True)
    fmt = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    for h in (logging.StreamHandler(),
              RotatingFileHandler(ROOT / "logs" / "social.log", maxBytes=1_000_000, backupCount=3, encoding="utf-8")):
        h.setFormatter(fmt)
        root.addHandler(h)


def serve(cfg, grace_minutes=30):
    """Simple built-in scheduler. A job runs once per day within `grace_minutes` after its time."""
    tz = ZoneInfo(cfg["timezone"])
    sch = cfg.get("schedule", {})
    jobs = []
    if sch.get("forecast_time"):
        jobs.append(("forecast", sch["forecast_time"], lambda: run_forecast(cfg, tomorrow=sch.get("forecast_tomorrow", False))))
    for t in sch.get("queue_times", []):
        jobs.append(("queue", t, lambda: run_queue(cfg)))
    log.info("Scheduler started: %s", ", ".join(f"{n}@{t}" for n, t, _ in jobs))
    last_run = {}
    while True:
        now = datetime.now(tz)
        for name, hhmm, fn in jobs:
            h, m = map(int, hhmm.split(":"))
            due = now.replace(hour=h, minute=m, second=0, microsecond=0)
            key = (name, hhmm)
            if due <= now < due + timedelta(minutes=grace_minutes) and last_run.get(key) != now.date():
                last_run[key] = now.date()
                try:
                    log.info("Running %s (%s)", name, hhmm)
                    fn()
                except Exception:
                    log.exception("Job %s failed", name)
        time.sleep(30)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--config", help="path to config.yaml")
    sub = p.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("forecast")
    f.add_argument("--dry-run", action="store_true", help="only make the image and print the caption")
    f.add_argument("--sample", action="store_true", help="use sample data (no internet)")
    f.add_argument("--tomorrow", action="store_true", help="forecast for tomorrow")
    f.add_argument("--force", action="store_true", help="post even if today's forecast is already published")
    q = sub.add_parser("queue")
    q.add_argument("--dry-run", action="store_true")
    q.add_argument("--force", action="store_true", help="post even if the last queue post was recent")
    al = sub.add_parser("alerts", help="magnetic storm / full Moon tomorrow")
    al.add_argument("--dry-run", action="store_true")
    al.add_argument("--sample", action="store_true", help="sample storm and full Moon (no internet)")
    al.add_argument("--force", action="store_true")
    al.add_argument("--today", action="store_true", help="morning run: a magnetic storm expected today (skipped if the evening run already posted it)")
    cd = sub.add_parser("cards", help="share cards for passes, storms and air (images/cards/)")
    cd.add_argument("--sample", action="store_true", help="invented data (no internet)")
    cd.add_argument("--static", action="store_true", help="neutral cards without numbers")
    cd.add_argument("--force", action="store_true", help="redraw every card")
    wd = sub.add_parser("warnings", help="drafts (card + text in queue/drafts/) for orange and red warnings; nothing is posted")
    wd.add_argument("--dry-run", action="store_true", help="only the cards in output/ and the texts on the screen; no state, no drafts")
    wd.add_argument("--sample", action="store_true", help="invented warnings (no data file)")
    wd.add_argument("--notify", action="store_true", help="a GitHub issue for every draft that has none (needs GITHUB_TOKEN)")
    ch = sub.add_parser("channel", help="the Viber / Telegram channel: which are set, a test message")
    ch.add_argument("--test", action="store_true", help="send a short test message to every channel that is set")
    ch.add_argument("--viber-info", action="store_true", help="the name and the members of the Viber channel (the super admin id is WP_VIBER_FROM)")
    sub.add_parser("check")
    sub.add_parser("serve")
    a = p.parse_args()

    setup_logging()
    cfg = load_config(a.config)
    if a.cmd == "forecast":
        run_forecast(cfg, dry_run=a.dry_run, sample=a.sample, tomorrow=a.tomorrow, force=a.force)
    elif a.cmd == "queue":
        run_queue(cfg, dry_run=a.dry_run, force=a.force)
    elif a.cmd == "alerts":
        run_alerts(cfg, make_client, dry_run=a.dry_run, sample=a.sample, force=a.force, today=a.today)
    elif a.cmd == "cards":
        run_cards("sample" if a.sample else "static" if a.static else "live", force=a.force)
    elif a.cmd == "warnings":
        if a.notify:
            notify(cfg, dry_run=a.dry_run)
        else:
            run_warnings(cfg, dry_run=a.dry_run, sample=a.sample)
    elif a.cmd == "channel":
        channel_check(cfg)
        if a.viber_info:
            viber_info(cfg)
        if a.test:
            print(broadcast(cfg, "Тест от WeatherPulse: така ще изглеждат съобщенията тук. https://weatherpulse.eu/"))
    elif a.cmd == "check":
        print(make_client(cfg).check())
    elif a.cmd == "serve":
        serve(cfg)


if __name__ == "__main__":
    main()
