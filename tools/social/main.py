#!/usr/bin/env python3
"""WeatherPulse social automation.

  python main.py forecast [--dry-run] [--sample] [--tomorrow]   # daily forecast image -> FB + IG
  python main.py queue    [--dry-run]                            # post next photo/video from queue/
  python main.py check                                           # verify token, page and IG account
  python main.py serve                                           # run forever on the schedule in config.yaml
"""
import argparse
import logging
import time
from datetime import datetime, timedelta
from logging.handlers import RotatingFileHandler
from zoneinfo import ZoneInfo

from wp_social.config import ROOT, load_config
from wp_social.jobs import make_client, run_forecast, run_queue

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
    sub.add_parser("check")
    sub.add_parser("serve")
    a = p.parse_args()

    setup_logging()
    cfg = load_config(a.config)
    if a.cmd == "forecast":
        run_forecast(cfg, dry_run=a.dry_run, sample=a.sample, tomorrow=a.tomorrow, force=a.force)
    elif a.cmd == "queue":
        run_queue(cfg, dry_run=a.dry_run, force=a.force)
    elif a.cmd == "check":
        print(make_client(cfg).check())
    elif a.cmd == "serve":
        serve(cfg)


if __name__ == "__main__":
    main()
