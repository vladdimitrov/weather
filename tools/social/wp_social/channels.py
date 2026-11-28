"""Posts to messaging channels: a Telegram channel and a Viber channel. A standing audience outside Facebook
for the posts that matter on the day (magnetic storms of Kp 5+, the full Moon, orange and red warnings of
NIMH after the owner approved the draft). Everything else (forecast, queue photos) stays on Facebook/Instagram.

Off until the tokens exist (environment, GitHub secrets):
  WP_TELEGRAM_TOKEN   token of a Telegram bot (@BotFather) that is an admin of the channel
  WP_TELEGRAM_CHAT    the channel: @name or its numeric id
  WP_VIBER_TOKEN      token of the Viber channel (Channel info → Developer tools → Post API)
A channel that fails is logged and skipped: it never stops the Facebook/Instagram post."""
import logging
import os
from pathlib import Path

import requests

from .utm import for_network

log = logging.getLogger(__name__)

TELEGRAM_API = "https://api.telegram.org/bot{token}/{method}"
VIBER_API = "https://chatapi.viber.com/pa/{method}"
TELEGRAM_CAPTION = 1024   # Telegram's limit for the text under a photo
VIBER_TEXT = 700          # Viber keeps the text of a picture post short


def enabled():
    """The channels that have their tokens."""
    names = []
    if os.environ.get("WP_TELEGRAM_TOKEN") and os.environ.get("WP_TELEGRAM_CHAT"):
        names.append("telegram")
    if os.environ.get("WP_VIBER_TOKEN"):
        names.append("viber")
    return names


def _cut(text, limit):
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def telegram(img_path: Path, caption: str, timeout=60):
    token, chat = os.environ["WP_TELEGRAM_TOKEN"], os.environ["WP_TELEGRAM_CHAT"]
    with open(img_path, "rb") as f:
        r = requests.post(TELEGRAM_API.format(token=token, method="sendPhoto"),
                          data={"chat_id": chat, "caption": _cut(caption, TELEGRAM_CAPTION)},
                          files={"photo": (img_path.name, f, "image/jpeg")}, timeout=timeout)
    body = r.json()
    if not body.get("ok"):
        raise RuntimeError(f"Telegram: {body.get('description', r.status_code)}")
    return body["result"]["message_id"]


def _viber(method, payload, timeout=60):
    r = requests.post(VIBER_API.format(method=method), json=payload,
                      headers={"X-Viber-Auth-Token": os.environ["WP_VIBER_TOKEN"]}, timeout=timeout)
    body = r.json()
    if body.get("status") != 0:
        raise RuntimeError(f"Viber {method}: {body.get('status_message', r.status_code)}")
    return body


def viber(image_url, caption):
    """A picture post when the card has a public address (hosting), else the text alone."""
    account = _viber("get_account_info", {})
    admins = [m["id"] for m in account.get("members", []) if m.get("role") == "superadmin"]
    if not admins:
        raise RuntimeError("Viber: the channel has no superadmin to post as")
    post = {"from": admins[0], "type": "text", "text": _cut(caption, 7000)}
    if image_url:
        post = {"from": admins[0], "type": "picture", "media": image_url, "text": _cut(caption, VIBER_TEXT)}
    return _viber("post", post).get("message_token")


def send(img_path: Path, caption: str, image_url=None, skip=()):
    """Posts to every enabled channel not in `skip`. Returns {channel: id} of the ones that worked."""
    done = {}
    for name in enabled():
        if name in skip:
            continue
        try:
            done[name] = telegram(img_path,for_network(caption, name)) if name == "telegram" else viber(image_url, for_network(caption, name))
            log.info("%s: %s", name.capitalize(), done[name])
        except Exception as error:  # a channel must never stop the other posts
            log.warning("%s post failed: %s", name.capitalize(), error)
    return done
