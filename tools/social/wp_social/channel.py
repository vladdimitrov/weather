"""The standing audience: the same short messages as on Facebook, sent to a Viber channel and/or a Telegram channel.

Nothing here can break the main jobs: a channel that is not configured is skipped, and an error is only logged.
Configuration (config.yaml, section `channels`; secrets in environment variables):

  viber:    token (Channels Post API token: channel info -> Developer Tools), from (Viber user id of a channel super admin)
  telegram: token (bot token of @BotFather), chat_id (@name of the channel; the bot must be its administrator)

Viber shows a preview card of a link (the share card of the page), so a text with the link is enough; Telegram also gets
the picture.
"""
import logging
import re
from pathlib import Path

import requests

log = logging.getLogger(__name__)

VIBER_POST = "https://chatapi.viber.com/pa/post"
VIBER_INFO = "https://chatapi.viber.com/pa/get_account_info"
TIMEOUT = 30


def plain(text: str) -> str:
    """The caption of a Facebook post without its hashtags (they mean nothing in a channel)."""
    lines = [ln for ln in text.splitlines() if not re.fullmatch(r"(\s*#\S+)+\s*", ln)]
    return re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip()


class Channels:
    def __init__(self, cfg):
        c = (cfg or {}).get("channels") or {}
        v, t = c.get("viber") or {}, c.get("telegram") or {}
        self.viber = self._pair(v.get("token"), v.get("from"))
        self.telegram = self._pair(t.get("token"), t.get("chat_id"))

    @staticmethod
    def _pair(a, b):
        """Both values set; an unset ${ENV_VAR} stays as text and counts as not set."""
        ok = lambda x: bool(x) and "${" not in str(x)
        return (str(a), str(b)) if ok(a) and ok(b) else None

    @property
    def enabled(self):
        return bool(self.viber or self.telegram)

    def send(self, text: str, image: Path | None = None) -> dict:
        """Returns {'viber': True/False, 'telegram': True/False} for the configured channels."""
        text = plain(text)
        done = {}
        if self.viber:
            done["viber"] = self._viber(text)
        if self.telegram:
            done["telegram"] = self._telegram(text, image)
        return done

    # ---- Viber Channels Post API ----
    def _viber(self, text):
        token, sender = self.viber
        try:
            r = requests.post(VIBER_POST, json={"auth_token": token, "from": sender, "type": "text", "text": text}, timeout=TIMEOUT)
            body = r.json()
            ok = r.ok and body.get("status") == 0
            if not ok:
                log.warning("Viber channel: %s", body)
            else:
                log.info("Viber channel: posted (message %s)", body.get("message_token"))
            return ok
        except (requests.RequestException, ValueError) as e:
            log.warning("Viber channel failed: %s", e)
            return False

    # ---- Telegram Bot API ----
    def _telegram(self, text, image):
        token, chat = self.telegram
        base = f"https://api.telegram.org/bot{token}"
        try:
            if image and Path(image).exists() and len(text) <= 1000:
                with open(image, "rb") as f:
                    r = requests.post(f"{base}/sendPhoto", data={"chat_id": chat, "caption": text}, files={"photo": f}, timeout=TIMEOUT)
            else:
                r = requests.post(f"{base}/sendMessage", data={"chat_id": chat, "text": text}, timeout=TIMEOUT)
            ok = r.ok and r.json().get("ok")
            log.info("Telegram channel: %s", "posted" if ok else r.text[:200])
            return bool(ok)
        except (requests.RequestException, ValueError) as e:
            log.warning("Telegram channel failed: %s", e)
            return False


def broadcast(cfg, text: str, image: Path | None = None) -> dict:
    """The one call the jobs use. Safe to call when no channel is set up."""
    ch = Channels(cfg)
    if not ch.enabled:
        return {}
    try:
        return ch.send(text, image)
    except Exception:  # a channel must never break a post on Facebook
        log.exception("Channel broadcast failed")
        return {}


def viber_info(cfg):
    """Prints the channel name and its members with their ids: the id of the super admin is the `from` of the posts."""
    v = ((cfg.get("channels") or {}).get("viber")) or {}
    if not v.get("token") or "${" in v["token"]:
        raise SystemExit("channels.viber.token is not set (WP_VIBER_TOKEN).")
    r = requests.post(VIBER_INFO, json={"auth_token": v["token"]}, timeout=TIMEOUT)
    print(r.status_code, r.text[:2000])


def check(cfg):
    ch = Channels(cfg)
    print("Viber:", "set" if ch.viber else "not set", "| Telegram:", "set" if ch.telegram else "not set")
    if ch.telegram:
        r = requests.get(f"https://api.telegram.org/bot{ch.telegram[0]}/getMe", timeout=TIMEOUT)
        print("Telegram bot:", r.text[:200])
