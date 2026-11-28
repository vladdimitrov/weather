"""The morning forecast in the Telegram/Viber channels, with a fake HTTP layer (no network, no tokens needed).
Run: cd tools/social && python -m pytest tests -q"""
import re
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest
import requests

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from wp_social import channels, jobs  # noqa: E402


class Resp:
    def __init__(self, body, status=200):
        self._body, self.status_code, self.text = body, status, str(body)

    def json(self):
        return self._body

    def raise_for_status(self):
        pass


class FakeWeb:
    """Records every call; `fail` is a set of hosts that answer with an error."""
    def __init__(self):
        self.calls, self.fail, self.files = [], set(), {}

    def log(self, host):
        return [c for c in self.calls if host in c[1]]

    def post(self, url, **kw):
        self.calls.append(("POST", url, kw))
        if "telegram" in url:
            if "telegram" in self.fail:
                return Resp({"ok": False, "description": "chat not found"})
            return Resp({"ok": True, "result": {"message_id": 11}})
        if "viber" in url:
            if "viber" in self.fail:
                return Resp({"status": 5, "status_message": "bad token"})
            if url.endswith("get_account_info"):
                return Resp({"status": 0, "members": [{"id": "A1", "role": "superadmin"}]})
            return Resp({"status": 0, "message_token": 22})
        if "graph.facebook" in url or "graph.instagram" in url:
            return Resp({"id": "meta1"})
        return Resp({}, 404)

    def get(self, url, **kw):
        self.calls.append(("GET", url, kw))
        if "api.github.com" in url:
            return Resp([{"name": n} for n in self.files])
        if "graph.facebook" in url:
            return Resp({"status_code": "FINISHED", "id": "meta1"})
        return Resp({}, 404)

    def put(self, url, **kw):
        self.calls.append(("PUT", url, kw))
        self.files[url.rsplit("/", 1)[1]] = True
        return Resp({}, 201)

    def head(self, url, **kw):
        return Resp({}, 200)


@pytest.fixture
def env(tmp_path, monkeypatch):
    web = FakeWeb()
    for m in ("post", "get", "put", "head"):
        monkeypatch.setattr(requests, m, getattr(web, m))
    monkeypatch.setenv("WP_TELEGRAM_TOKEN", "t")
    monkeypatch.setenv("WP_TELEGRAM_CHAT", "@chan")
    monkeypatch.setenv("WP_VIBER_TOKEN", "v")
    monkeypatch.setenv("GITHUB_TOKEN", "g")
    monkeypatch.setattr(jobs, "FORECAST_STATE", tmp_path / "state" / "forecast-channels.json")
    monkeypatch.setattr(jobs, "fetch_forecast", lambda *a, **k: [])
    monkeypatch.setattr(jobs, "render_forecast", lambda f, day, label, path, title="": Path(path).write_bytes(b"jpg"))
    monkeypatch.setattr(jobs, "build_caption", lambda *a, **k: "Времето днес " + a[2])
    monkeypatch.setattr("time.sleep", lambda s: None)
    cfg = {"timezone": "Europe/Sofia", "site_url": "https://weatherpulse.eu", "cities": [],
           "output_dir": str(tmp_path / "out"),
           "meta": {"page_id": "p", "page_access_token": "x", "ig_user_id": "i"},
           "hosting": {"mode": "github", "public_base_url": "https://weatherpulse.eu/social/",
                       "github": {"repo": "o/r"}, "wait_public_seconds": 0},
           "channels": {"forecast": True}}
    Path(cfg["output_dir"]).mkdir()
    return web, cfg


def meta_posts(web):
    return [c for c in web.calls if "graph" in c[1] and c[0] == "POST"]


def test_forecast_goes_to_both_channels_with_the_picture_url(env):
    web, cfg = env
    jobs.run_forecast(cfg)
    assert len(web.log("api.telegram.org")) == 1 and "sendPhoto" in web.log("api.telegram.org")[0][1]
    post = web.log("chatapi.viber.com/pa/post")[0][2]["json"]
    assert post["type"] == "picture" and post["media"].startswith("https://weatherpulse.eu/social/")
    assert "utm_source=viber" in post["text"]
    assert "utm_source=telegram" in web.log("api.telegram.org")[0][2]["data"]["caption"]
    assert len(meta_posts(web)) >= 2  # Facebook and Instagram went too


def test_second_run_the_same_day_posts_nothing(env):
    web, cfg = env
    jobs.run_forecast(cfg)
    web.calls.clear()
    assert jobs.run_forecast(cfg) is None
    assert not web.log("telegram") and not web.log("viber") and not meta_posts(web)


def test_a_failed_channel_gets_only_itself_on_the_next_run(env):
    web, cfg = env
    web.fail.add("viber")
    jobs.run_forecast(cfg)
    assert len(meta_posts(web)) >= 2 and len(web.log("api.telegram.org")) == 1  # Facebook/Instagram not stopped
    web.calls.clear()
    web.fail.clear()
    jobs.run_forecast(cfg)
    assert not web.log("telegram") and not meta_posts(web)
    post = web.log("chatapi.viber.com/pa/post")[0][2]["json"]
    assert post["type"] == "picture" and post["media"].startswith("https://weatherpulse.eu/social/")
    web.calls.clear()
    assert jobs.run_forecast(cfg) is None
    assert not web.log("viber") and not web.log("telegram")


def test_forecast_false_keeps_the_forecast_out_of_the_channels(env):
    web, cfg = env
    cfg["channels"]["forecast"] = False
    jobs.run_forecast(cfg)
    assert not web.log("telegram") and not web.log("viber") and len(meta_posts(web)) >= 2
    # ... while the other posts (storms, full Moon, warnings) still use channels.send
    assert set(channels.send(Path(cfg["output_dir"]) / f"forecast-{datetime.now(ZoneInfo('Europe/Sofia')).date()}.jpg", "x")) == {"telegram", "viber"}


def test_both_channels_failing_never_stops_facebook_and_instagram(env):
    web, cfg = env
    web.fail |= {"telegram", "viber"}
    assert jobs.run_forecast(cfg) is not None
    assert len(meta_posts(web)) >= 2


def test_channels_test_reports_each_channel(env):
    web, _ = env
    web.fail.add("telegram")
    res = channels.test()
    assert res["telegram"][0] is False and res["viber"][0] is True
    assert "проверка на канала" in web.log("sendMessage")[0][2]["data"]["text"]
    assert "проверка на канала" in web.log("chatapi.viber.com/pa/post")[0][2]["json"]["text"]
