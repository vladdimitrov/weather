"""Loads config.yaml and expands ${ENV_VAR} placeholders (keep secrets in env vars)."""
import os
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent


def _expand(value):
    if isinstance(value, str):
        return os.path.expandvars(value)
    if isinstance(value, list):
        return [_expand(v) for v in value]
    if isinstance(value, dict):
        return {k: _expand(v) for k, v in value.items()}
    return value


def load_config(path=None):
    path = Path(path or os.environ.get("WP_CONFIG", ROOT / "config.yaml"))
    if not path.exists():
        raise SystemExit(f"Config not found: {path}. Copy config.example.yaml to config.yaml.")
    with open(path, encoding="utf-8") as f:
        cfg = _expand(yaml.safe_load(f))
    cfg.setdefault("timezone", "Europe/Sofia")
    cfg.setdefault("output_dir", str(ROOT / "output"))
    Path(cfg["output_dir"]).mkdir(parents=True, exist_ok=True)
    q = cfg.setdefault("queue", {})
    qdir = Path(q.get("dir", ROOT / "queue"))
    if not qdir.is_absolute():
        qdir = ROOT / qdir
    q["dir"] = str(qdir)
    return cfg
