"""Cards for the alert posts: a magnetic storm tomorrow and a full Moon tomorrow (1080x1350).

The night scenes are drawn procedurally with numpy (no photos, so nothing to license): a starry sky,
an aurora over a mountain ridge for the storm, and a full Moon with its real maria and the bright
craters Tycho, Copernicus and Kepler for the Moon card."""
from datetime import date, datetime
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from .render import H, MONTHS, W, _font, bg_date

KP_COLORS = [(4.5, "#7CB342"), (5.5, "#FBC02D"), (6.5, "#FB8C00"), (7.5, "#E53935"), (99, "#B03FD0")]


def _kp_color(kp):
    if kp < 4.5:
        return "#4FC3F7" if kp < 3.5 else "#81C784"
    return next(c for limit, c in KP_COLORS if kp < limit)


# ---------------- procedural helpers ----------------
def _noise(h, w, scale, seed, octaves=5):
    """Fractal value noise in [0, 1], shape (h, w); `scale` = size of the largest features in px."""
    rng = np.random.default_rng(seed)
    total, amp, norm = np.zeros((h, w), np.float32), 1.0, 0.0
    for _ in range(octaves):
        gh, gw = max(2, int(h / scale) + 2), max(2, int(w / scale) + 2)
        grid = Image.fromarray(rng.random((gh, gw)).astype(np.float32), "F")
        total += amp * np.asarray(grid.resize((w, h), Image.BICUBIC))
        norm += amp
        amp *= 0.5
        scale = max(2, scale / 2)
    total /= norm
    return np.clip((total - total.min()) / (np.ptp(total) + 1e-6), 0, 1)


def _sky(top, bottom, seed, star_count=900, avoid=()):
    """Night sky gradient with stars of different brightness (float array H x W x 3, 0..255)."""
    t = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    sky = (np.array(top, np.float32) * (1 - t) + np.array(bottom, np.float32) * t) * np.ones((1, W, 1), np.float32)
    sky += (_noise(H, W, 400, seed, 3)[..., None] - 0.5) * 10  # faint unevenness, like haze
    rng = np.random.default_rng(seed + 1)
    for _ in range(star_count):
        x, y = int(rng.integers(0, W)), int(rng.integers(0, H))
        if any(a <= y <= b for a, b in avoid):
            continue
        b = rng.random() ** 3 * 230 + 25
        tint = np.array([1.0, 0.97 + rng.random() * 0.03, 0.9 + rng.random() * 0.1], np.float32)
        r = 1 if b < 180 else 2
        y0, y1, x0, x1 = max(0, y - r), min(H, y + r + 1), max(0, x - r), min(W, x + r + 1)
        yy, xx = np.mgrid[y0:y1, x0:x1]
        fall = np.exp(-((yy - y) ** 2 + (xx - x) ** 2) / (0.6 * r * r))[..., None]
        sky[y0:y1, x0:x1] = np.maximum(sky[y0:y1, x0:x1], fall * b * tint)
    return sky


def _ridge(seed, base, height, roughness=0.55):
    """Mountain ridge: y of the skyline for every x (1D fractal noise)."""
    rng = np.random.default_rng(seed)
    y = np.zeros(W, np.float32)
    amp, n = 1.0, 6
    for _ in range(7):
        pts = rng.random(n + 1)
        y += amp * np.interp(np.linspace(0, n, W), np.arange(n + 1), pts)
        amp *= roughness
        n *= 2
    y = (y - y.min()) / (np.ptp(y) + 1e-6)
    return base - y * height


def _land(img, ridge, color, fade_to=None):
    """Fill everything under the ridge with `color` (optionally a gradient towards fade_to)."""
    yy = np.arange(H, dtype=np.float32)[:, None]
    mask = ((yy >= ridge[None, :]) * 255).astype(np.uint8)
    mask = np.asarray(Image.fromarray(mask).filter(ImageFilter.GaussianBlur(0.8)), np.float32)[..., None] / 255
    col = np.array(color, np.float32)
    if fade_to is not None:
        t = np.clip((yy - ridge.min()) / (H - ridge.min()), 0, 1)[..., None]
        col = col * (1 - t) + np.array(fade_to, np.float32) * t
    return img * (1 - mask) + col * mask


def _to_image(arr):
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def _text(d, xy, text, font, fill):
    d.text(xy, text, font=font, fill=fill, anchor="mm", stroke_width=3, stroke_fill=(5, 8, 20))


# ---------------- storm ----------------
def _aurora(kp, seed):
    """Aurora curtains: green at the lower edge, purple higher up; taller and brighter with a higher Kp."""
    x = np.arange(W, dtype=np.float32)
    rng = np.random.default_rng(seed)
    phase = rng.random(3) * 6.28
    base = 560 + 45 * np.sin(x / 260 + phase[0]) + 25 * np.sin(x / 97 + phase[1])  # lower edge of the curtain
    height = 260 + 60 * np.sin(x / 180 + phase[2]) + 30 * (min(kp, 9) - 5)
    rays = _noise(1, W, 6, seed + 2, 3)[0] ** 1.5                                   # vertical rays
    folds = 0.45 + 0.55 * _noise(1, W, 160, seed + 3, 3)[0]
    yy = np.arange(H, dtype=np.float32)[:, None]
    above = base[None, :] - yy                                                       # px above the lower edge
    inside = np.clip(above / height[None, :], 0, 1)
    profile = np.where(above < 0, np.exp(np.minimum(above, 0) / 12), np.exp(-inside * 3.0))
    strength = profile * (0.30 + 0.70 * rays[None, :]) * folds[None, :]
    green, purple = np.array([40, 255, 150], np.float32), np.array([170, 60, 230], np.float32)
    mix = np.clip(inside * 1.6 - 0.25, 0, 1)[..., None]
    glow = strength[..., None] * (green * (1 - mix) + purple * mix) * (0.70 + 0.05 * min(kp, 9))
    return np.asarray(Image.fromarray(np.clip(glow, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)), np.float32)


def render_storm(day: date, slots, max_kp: float, level: str, scale: str, site_label: str, out_path: Path):
    """slots: [(start 'HH:MM', end 'HH:MM', kp), ...] in Bulgarian time for `day`."""
    seed = day.toordinal()
    sky = _sky((4, 8, 22), (14, 26, 40), seed, 700, avoid=[(60, 220), (260, 510)]) + _aurora(max_kp, seed)
    img = _land(sky, _ridge(seed + 10, 680, 120, 0.5), (16, 24, 36))
    img = _land(img, _ridge(seed + 11, 740, 80, 0.6), (6, 10, 16), fade_to=(8, 10, 20))
    image = _to_image(img)
    panel = Image.new("RGBA", image.size, (0, 0, 0, 0))
    ImageDraw.Draw(panel).rounded_rectangle([50, 760, W - 50, 1230], radius=30, fill=(4, 6, 16, 165))
    image = Image.alpha_composite(image.convert("RGBA"), panel).convert("RGB")
    d = ImageDraw.Draw(image)

    _text(d, (W / 2, 110), "МАГНИТНА БУРЯ УТРЕ", _font(66, True), "white")
    _text(d, (W / 2, 185), bg_date(day), _font(36), (220, 228, 255))
    _text(d, (W / 2, 350), f"Kp {round(max_kp)}", _font(170, True), _kp_color(max_kp))  # NOAA thirds: 6.33 = 6+
    _text(d, (W / 2, 485), f"{level}{f' ({scale})' if scale else ''}", _font(46, True), "white")

    left, right, top, bottom = 120, W - 90, 840, 1120
    d.text((left - 30, top - 55), "Kp по часове (българско време)", font=_font(30), fill=(205, 212, 240))
    for k in (0, 3, 6, 9):
        y = bottom - (bottom - top) * k / 9
        d.line([(left, y), (right, y)], fill=(70, 78, 110), width=1)
        d.text((left - 20, y), str(k), font=_font(26), fill=(190, 198, 230), anchor="rm")
    y5 = bottom - (bottom - top) * 5 / 9
    d.line([(left, y5), (right, y5)], fill="#FBC02D", width=3)
    d.text((right, y5 - 8), "буря", font=_font(24, True), fill="#FBC02D", anchor="rb")
    bw = (right - left) / max(1, len(slots))
    for i, (start, _end, kp) in enumerate(slots):
        x0, x1 = left + i * bw + 10, left + (i + 1) * bw - 10
        y = bottom - (bottom - top) * min(kp, 9) / 9
        d.rounded_rectangle([x0, min(y, bottom - 6), x1, bottom], radius=10, fill=_kp_color(kp))
        d.text(((x0 + x1) / 2, bottom + 30), start, font=_font(26), fill=(210, 216, 245), anchor="mm")
    d.text((W / 2, 1205), "Прогноза на NOAA · подробно по часове на сайта", font=_font(28), fill=(200, 206, 238), anchor="mm")
    _text(d, (W / 2, 1290), site_label, _font(44, True), "white")
    image.save(out_path, "JPEG", quality=92)
    return Path(out_path)


# ---------------- full Moon ----------------
# Maria as seen from the northern hemisphere, north up: (x, y, rx, ry) in units of the radius
MARIA = [(-0.36, -0.42, 0.30, 0.26), (0.13, -0.40, 0.17, 0.16), (0.30, -0.08, 0.22, 0.19), (0.66, -0.30, 0.12, 0.10),
         (0.55, 0.16, 0.13, 0.20), (0.34, 0.26, 0.09, 0.09), (-0.58, -0.02, 0.26, 0.42), (-0.16, 0.33, 0.18, 0.13),
         (-0.47, 0.38, 0.10, 0.09), (-0.30, 0.05, 0.16, 0.12), (0.03, -0.20, 0.09, 0.07)]
# Bright young craters: (x, y, radius, ray length) – Tycho, Copernicus, Kepler, Aristarchus
BRIGHT = [(-0.11, 0.72, 0.030, 0.9), (-0.25, -0.17, 0.035, 0.35), (-0.50, -0.10, 0.022, 0.25), (-0.66, -0.36, 0.018, 0.12)]


def _moon_disc(R, seed):
    """RGBA image (2R x 2R) of a full Moon with limb darkening, maria and ray craters."""
    s = 2 * R
    yy, xx = np.mgrid[0:s, 0:s].astype(np.float32)
    x, y = (xx - R + 0.5) / R, (yy - R + 0.5) / R
    r2 = x * x + y * y
    z = np.sqrt(np.clip(1 - r2, 0, 1))
    rough = _noise(s, s, R * 0.35, seed, 6)
    fine = _noise(s, s, R * 0.05, seed + 1, 5)
    mottle = _noise(s, s, R * 0.15, seed + 3, 5)
    # warp the coordinates so the plains get ragged, natural outlines and flow into each other
    wx = x + (_noise(s, s, R * 0.45, seed + 4, 4) - 0.5) * 0.28
    wy = y + (_noise(s, s, R * 0.45, seed + 5, 4) - 0.5) * 0.28
    mare = np.zeros_like(x)
    for mx, my, rx, ry in MARIA:  # soft, ragged dark plains
        d = np.sqrt(((wx - mx) / (rx * 1.35)) ** 2 + ((wy - my) / (ry * 1.35)) ** 2) + (rough - 0.5) * 0.5
        mare = np.maximum(mare, np.clip((1.0 - d) / 0.7, 0, 1))
    mare = mare * mare * (3 - 2 * mare)  # smoothstep
    albedo = 0.84 - 0.24 * mare * (0.8 + 0.4 * mottle) + 0.08 * (mottle - 0.5) + 0.05 * (fine - 0.5)
    rng = np.random.default_rng(seed + 2)
    ang = np.arctan2(y, x)
    for cx, cy, cr, ray_len in BRIGHT:  # bright young craters with fine, uneven rays
        dist = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        albedo += 0.16 * np.exp(-(dist / cr) ** 2)
        a = (np.arctan2(y - cy, x - cx) + np.pi) / (2 * np.pi) * 360
        ray_profile = rng.random(361) ** 6
        rays = np.interp(a, np.arange(361), ray_profile)
        albedo += 0.07 * rays * np.exp(-dist / (ray_len * 0.4)) * np.clip((dist - cr) / cr, 0, 1)
    for _ in range(70):  # small craters: barely visible at full Moon (light from the front)
        cx, cy = rng.uniform(-0.95, 0.95, 2)
        cr = rng.uniform(0.006, 0.025)
        dist = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        albedo += 0.018 * np.exp(-((dist - cr) / (cr * 0.5)) ** 2)
    light = albedo * (0.80 + 0.20 * z ** 0.6)
    rgb = np.stack([light * 248, light * 243, light * 230], -1)
    alpha = np.clip((1 - np.sqrt(r2)) * R * 1.5, 0, 1) * 255
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha]).astype(np.uint8), "RGBA")


def render_full_moon(when: datetime, supermoon: bool, site_label: str, out_path: Path):
    """when: the moment of the full Moon in Bulgarian time."""
    seed = when.toordinal()
    sky = _sky((3, 6, 18), (16, 26, 52), seed, 900, avoid=[(60, 220), (900, 1080)])
    cx, cy = W / 2, 540
    R = 290 if supermoon else 260
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    sky = sky + np.exp(-np.clip(dist - R, 0, None) / 170)[..., None] * np.array([70, 74, 90], np.float32)  # moonlight halo
    img = _land(sky, _ridge(seed + 20, 1180, 140, 0.55), (8, 12, 22), fade_to=(4, 6, 12))
    image = _to_image(img).convert("RGBA")
    image.alpha_composite(_moon_disc(R, seed), (int(cx - R), int(cy - R)))
    image = image.convert("RGB")
    d = ImageDraw.Draw(image)

    _text(d, (W / 2, 110), "ПЪЛНОЛУНИЕ УТРЕ", _font(70, True), "white")
    if supermoon:
        _text(d, (W / 2, 185), "суперлуна", _font(40, True), (255, 224, 140))
    _text(d, (W / 2, 950), f"{when.day} {MONTHS[when.month - 1]} {when.year}", _font(58, True), "white")
    _text(d, (W / 2, 1030), f"в {when:%H:%M} ч. българско време", _font(40), (215, 224, 255))
    d.text((W / 2, 1210), "Лунен календар по месеци на сайта", font=_font(28), fill=(200, 206, 238), anchor="mm")
    _text(d, (W / 2, 1290), site_label, _font(44, True), "white")
    image.save(out_path, "JPEG", quality=92)
    return Path(out_path)
