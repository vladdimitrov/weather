"""Cards for the alert posts: a magnetic storm tomorrow and a full Moon tomorrow (1080x1350)."""
import math
import random
from datetime import date, datetime
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

from .render import H, MONTHS, W, _font, _gradient, bg_date

# Kp -> colour of the bar (same steps as the site: 5 = G1 ... 9 = G5)
KP_COLORS = [(4.5, "#7CB342"), (5.5, "#FBC02D"), (6.5, "#FB8C00"), (7.5, "#E53935"), (99, "#8E24AA")]


def _kp_color(kp):
    if kp < 4.5:
        return "#4FC3F7" if kp < 3.5 else "#81C784"
    return next(c for limit, c in KP_COLORS if kp < limit)


def render_storm(day: date, slots, max_kp: float, level: str, scale: str, site_label: str, out_path: Path):
    """slots: [(start 'HH:MM', end 'HH:MM', kp), ...] in Bulgarian time for `day`."""
    img = _gradient((14, 16, 46), (66, 26, 92))
    d = ImageDraw.Draw(img)
    # a soft aurora band behind the title
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i, col in enumerate([(0, 230, 160, 70), (0, 180, 255, 50), (160, 80, 255, 40)]):
        gd.ellipse([-200 + i * 80, 60 + i * 40, W + 200 - i * 60, 420 + i * 30], fill=col)
    img = Image.alpha_composite(img.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(70))).convert("RGB")
    d = ImageDraw.Draw(img)

    d.text((W / 2, 110), "МАГНИТНА БУРЯ УТРЕ", font=_font(66, True), fill="white", anchor="mm")
    d.text((W / 2, 185), bg_date(day), font=_font(36), fill=(215, 220, 255), anchor="mm")

    kp_txt = f"Kp {round(max_kp)}"  # NOAA gives thirds (6.33 = 6+); the caption and the site say 6
    d.text((W / 2, 345), kp_txt, font=_font(170, True), fill=_kp_color(max_kp), anchor="mm")
    d.text((W / 2, 470), f"{level}{f' ({scale})' if scale else ''}", font=_font(46, True), fill="white", anchor="mm")

    # bars: Kp every 3 hours
    left, right, top, bottom = 110, W - 70, 580, 1080
    d.text((left - 10, top - 50), "Kp по часове (българско време)", font=_font(30), fill=(200, 205, 240))
    for k in range(0, 10, 1):
        y = bottom - (bottom - top) * k / 9
        d.line([(left, y), (right, y)], fill=(70, 62, 112) if k % 3 else (120, 120, 170), width=1)
        if k % 3 == 0:
            d.text((left - 20, y), str(k), font=_font(26), fill=(190, 195, 230), anchor="rm")
    y5 = bottom - (bottom - top) * 5 / 9
    d.line([(left, y5), (right, y5)], fill="#FBC02D", width=3)
    d.text((right, y5 - 8), "буря", font=_font(24, True), fill="#FBC02D", anchor="rb")
    n = max(1, len(slots))
    bw = (right - left) / n
    for i, (start, _end, kp) in enumerate(slots):
        x0, x1 = left + i * bw + 10, left + (i + 1) * bw - 10
        y = bottom - (bottom - top) * min(kp, 9) / 9
        d.rounded_rectangle([x0, min(y, bottom - 6), x1, bottom], radius=10, fill=_kp_color(kp))
        d.text(((x0 + x1) / 2, bottom + 30), start, font=_font(26), fill=(210, 215, 245), anchor="mm")

    d.text((W / 2, 1190), "Прогноза на NOAA · подробно по часове на сайта", font=_font(30), fill=(200, 205, 240), anchor="mm")
    d.text((W / 2, 1275), site_label, font=_font(44, True), fill="white", anchor="mm")
    img.save(out_path, "JPEG", quality=92)
    return Path(out_path)


def render_full_moon(when: datetime, supermoon: bool, site_label: str, out_path: Path):
    """when: the moment of the full Moon in Bulgarian time."""
    img = _gradient((6, 10, 30), (20, 30, 70))
    rnd = random.Random(when.toordinal())
    d = ImageDraw.Draw(img)
    text_bands = [(50, 220), (900, 1310)]
    for _ in range(260):  # stars, not behind the text
        x, y, r = rnd.randrange(W), rnd.randrange(H), rnd.choice([1, 1, 1, 2])
        if any(a <= y <= b for a, b in text_bands) and 120 < x < W - 120:
            continue
        c = rnd.randrange(150, 256)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(c, c, c))

    cx, cy, R = W / 2, 560, 300 if supermoon else 270
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([cx - R - 90, cy - R - 90, cx + R + 90, cy + R + 90], fill=(255, 240, 200, 90))
    img = Image.alpha_composite(img.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(60)))
    moon = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    md = ImageDraw.Draw(moon)
    md.ellipse([cx - R, cy - R, cx + R, cy + R], fill=(246, 241, 222, 255))
    for _ in range(14):  # maria and craters
        a, dist = rnd.uniform(0, 2 * math.pi), rnd.uniform(0, R * 0.7)
        rr = rnd.uniform(R * 0.06, R * 0.24)
        x, y = cx + math.cos(a) * dist, cy + math.sin(a) * dist
        md.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(226, 219, 197, 255))
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).ellipse([cx - R, cy - R, cx + R, cy + R], fill=255)
    moon.putalpha(Image.composite(moon.split()[3], Image.new("L", (W, H), 0), mask))
    img = Image.alpha_composite(img, moon.filter(ImageFilter.GaussianBlur(4))).convert("RGB")
    d = ImageDraw.Draw(img)

    d.text((W / 2, 110), "ПЪЛНОЛУНИЕ УТРЕ", font=_font(70, True), fill="white", anchor="mm")
    if supermoon:
        d.text((W / 2, 185), "суперлуна", font=_font(40, True), fill=(255, 224, 140), anchor="mm")
    d.text((W / 2, 960), f"{when.day} {MONTHS[when.month - 1]} {when.year}", font=_font(58, True), fill="white", anchor="mm")
    d.text((W / 2, 1040), f"в {when:%H:%M} ч. българско време", font=_font(40), fill=(210, 220, 255), anchor="mm")
    d.text((W / 2, 1180), "Лунен календар по месеци на сайта", font=_font(30), fill=(200, 205, 240), anchor="mm")
    d.text((W / 2, 1275), site_label, font=_font(44, True), fill="white", anchor="mm")
    img.save(out_path, "JPEG", quality=92)
    return Path(out_path)
