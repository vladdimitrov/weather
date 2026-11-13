"""Makes a local file reachable at a public https URL (Instagram downloads media from a URL).

Modes:
  github – commits the file into the GitHub Pages repo of the site (e.g. social/<name>)
           and waits until it is live on the public URL
  local  – copies into a folder served by the web server
  ftp    – uploads to the hosting via FTP(S)
"""
import base64
import ftplib
import logging
import os
import shutil
import time
from pathlib import Path

import requests

log = logging.getLogger(__name__)


class Hosting:
    def __init__(self, cfg):
        self.mode = cfg.get("mode", "none")
        self.base_url = cfg.get("public_base_url", "").rstrip("/") + "/"
        self.local_dir = cfg.get("local_dir")
        self.ftp = cfg.get("ftp", {})
        self.github = cfg.get("github", {})
        self.wait_seconds = int(cfg.get("wait_public_seconds", 600 if self.mode == "github" else 0))

    @property
    def enabled(self):
        return self.mode in ("local", "ftp", "github")

    def publish(self, path: Path, name: str) -> str:
        path = Path(path)
        if self.mode == "local":
            dest = Path(self.local_dir)
            dest.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, dest / name)
        elif self.mode == "ftp":
            cls = ftplib.FTP_TLS if self.ftp.get("tls", True) else ftplib.FTP
            with cls(self.ftp["host"], timeout=120) as ftp:
                ftp.login(self.ftp["user"], self.ftp["password"])
                if isinstance(ftp, ftplib.FTP_TLS):
                    ftp.prot_p()
                if self.ftp.get("remote_dir"):
                    ftp.cwd(self.ftp["remote_dir"])
                with open(path, "rb") as f:
                    ftp.storbinary(f"STOR {name}", f)
        elif self.mode == "github":
            self._github_upload(path, name)
        else:
            raise RuntimeError("hosting.mode is 'none' – Instagram posting needs 'github', 'local' or 'ftp'.")
        url = self.base_url + name
        if self.wait_seconds:
            self._wait_public(url)
        return url

    def _github_upload(self, path: Path, name: str):
        gh = self.github
        token = gh.get("token") or os.environ.get("WP_GITHUB_TOKEN") or os.environ.get("GITHUB_TOKEN")
        if not token:
            raise RuntimeError("GitHub hosting needs a token: set WP_GITHUB_TOKEN (or GITHUB_TOKEN in Actions).")
        repo_path = f"{gh.get('path', 'social').strip('/')}/{name}"
        api = f"https://api.github.com/repos/{gh['repo']}/contents/{repo_path}"
        r = requests.put(
            api,
            headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
            json={"message": f"social: add {name}",
                  "content": base64.b64encode(path.read_bytes()).decode(),
                  "branch": gh.get("branch", "main")},
            timeout=300,
        )
        if r.status_code not in (200, 201):
            raise RuntimeError(f"GitHub upload failed: HTTP {r.status_code} {r.text[:300]}")
        log.info("Uploaded to GitHub: %s/%s", gh["repo"], repo_path)
        # Commits made with the Actions token may not start a Pages build on their own – ask for one.
        try:
            b = requests.post(f"https://api.github.com/repos/{gh['repo']}/pages/builds",
                              headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
                              timeout=30)
            log.info("Pages build request: HTTP %s", b.status_code)
        except requests.RequestException as e:
            log.warning("Pages build request failed: %s", e)

    def _wait_public(self, url):
        """GitHub Pages needs ~1–2 minutes to publish a new commit."""
        start = time.time()
        while time.time() - start < self.wait_seconds:
            try:
                if requests.head(url, allow_redirects=True, timeout=30).status_code == 200:
                    log.info("Public: %s", url)
                    return
            except requests.RequestException:
                pass
            time.sleep(15)
        raise RuntimeError(f"{url} is not public after {self.wait_seconds}s")
