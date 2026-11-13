"""Minimal Meta Graph API client for a Facebook Page and its linked Instagram professional account."""
import logging
import time

import requests

log = logging.getLogger(__name__)


class MetaError(RuntimeError):
    pass


class MetaClient:
    def __init__(self, page_id, token, ig_user_id=None, version="v23.0", timeout=120):
        self.page_id, self.token, self.ig_user_id = page_id, token, ig_user_id
        self.base = f"https://graph.facebook.com/{version}"
        self.vbase = f"https://graph-video.facebook.com/{version}"
        self.timeout = timeout

    # ---- helpers ----
    @staticmethod
    def _check(r):
        try:
            data = r.json()
        except ValueError:
            data = {}
        if r.status_code >= 400 or "error" in data:
            err = data.get("error", {})
            raise MetaError(f"HTTP {r.status_code}: {err.get('message', r.text[:300])} "
                            f"(code {err.get('code')}, subcode {err.get('error_subcode')})")
        return data

    def _get(self, path, **params):
        params["access_token"] = self.token
        return self._check(requests.get(f"{self.base}/{path}", params=params, timeout=self.timeout))

    def _post(self, path, data=None, files=None, video=False):
        data = dict(data or {}, access_token=self.token)
        url = f"{self.vbase if video else self.base}/{path}"
        return self._check(requests.post(url, data=data, files=files, timeout=self.timeout))

    # ---- checks ----
    def check(self):
        page = self._get(self.page_id, fields="name")
        info = {"facebook_page": page.get("name")}
        if self.ig_user_id:
            ig = self._get(self.ig_user_id, fields="username")
            info["instagram"] = ig.get("username")
        return info

    # ---- Facebook ----
    def fb_photo(self, path, caption):
        with open(path, "rb") as f:
            res = self._post(f"{self.page_id}/photos", {"message": caption}, files={"source": f})
        return res.get("post_id") or res.get("id")

    def fb_video(self, path, caption):
        # Simple (non-resumable) upload: fine for short clips; Meta recommends resumable upload above ~1 GB.
        with open(path, "rb") as f:
            res = self._post(f"{self.page_id}/videos", {"description": caption}, files={"source": f}, video=True)
        return res.get("id")

    # ---- Instagram (needs a PUBLIC https URL of the media) ----
    def _ig_wait(self, container_id, max_wait=600):
        start = time.time()
        while time.time() - start < max_wait:
            status = self._get(container_id, fields="status_code").get("status_code")
            if status == "FINISHED":
                return
            if status in ("ERROR", "EXPIRED"):
                raise MetaError(f"Instagram container {container_id} status {status}")
            time.sleep(5)
        raise MetaError(f"Instagram container {container_id} not ready after {max_wait}s")

    def _ig_publish(self, params):
        if not self.ig_user_id:
            raise MetaError("ig_user_id is not configured")
        cid = self._post(f"{self.ig_user_id}/media", params)["id"]
        self._ig_wait(cid)
        return self._post(f"{self.ig_user_id}/media_publish", {"creation_id": cid})["id"]

    def ig_image(self, image_url, caption):
        return self._ig_publish({"image_url": image_url, "caption": caption})

    def ig_reel(self, video_url, caption, share_to_feed=True):
        return self._ig_publish({"media_type": "REELS", "video_url": video_url, "caption": caption,
                                 "share_to_feed": "true" if share_to_feed else "false"})
