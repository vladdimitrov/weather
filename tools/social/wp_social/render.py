"""Draws the daily forecast card (1080x1350, Instagram 4:5) with Pillow."""
import math
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .config import ROOT

W, H = 1080, 1350
FONT = ROOT / "fonts" / "DejaVuSans.ttf"
FONT_BOLD = ROOT / "fonts" / "DejaVuSans-Bold.ttf"

WEEKDAYS = ["понеделник", "вторник", "сряда", "четвъртък", "петък", "събота", "неделя"]
MONTHS = ["януари", "февруари", "март", "април", "май", "юни", "юли",
          "август", "септември", "октомври", "ноември", "декември"]


def bg_date(d: date) -> str:
    return f"{WEEKDAYS[d.weekday()]}, {d.day} {MONTHS[d.month - 1]} {d.year}"


def _font(size, bold=False):
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT), size)


def _gradient(top, bottom):
    img = Image.new("RGB", (W, H), top)
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        d.line([(0, y), (W, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return img


# ---------- icons ----------
def _sun(d, cx, cy, r):
    for k in range(8):
        a = k * math.pi / 4
        d.line([(cx + math.cos(a) * r * 1.35, cy + math.sin(a) * r * 1.35),
                (cx + math.cos(a) * r * 1.75, cy + math.sin(a) * r * 1.75)], fill="#FFC83D", width=max(3, r // 6))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill="#FFC83D")


def _cloud(d, cx, cy, s, color="#ECEFF4"):
    d.ellipse([cx - s * 0.95, cy - s * 0.15, cx - s * 0.25, cy + s * 0.5], fill=color)
    d.ellipse([cx - s * 0.55, cy - s * 0.55, cx + s * 0.25, cy + s * 0.35], fill=color)
    d.ellipse([cx - s * 0.05, cy - s * 0.35, cx + s * 0.75, cy + s * 0.5], fill=color)
    d.rounded_rectangle([cx - s * 0.6, cy + s * 0.05, cx + s * 0.55, cy + s * 0.5], radius=int(s * 0.2), fill=color)


def draw_icon(d, kind, cx, cy, s):
    """s ~ half the icon size."""
    if kind == "sun":
        _sun(d, cx, cy, int(s * 0.5))
    elif kind == "partly":
        _sun(d, cx - s * 0.3, cy - s * 0.3, int(s * 0.38))
        _cloud(d, cx + s * 0.1, cy + s * 0.1, s * 0.8)
    elif kind == "cloud":
        _cloud(d, cx, cy, s)
    elif kind == "rain":
        _cloud(d, cx, cy - s * 0.2, s * 0.9, "#D8DEE9")
        for k in range(3):
            x = cx - s * 0.45 + k * s * 0.4
            d.line([(x, cy + s * 0.45), (x - s * 0.15, cy + s * 0.85)], fill="#64B5F6", width=max(3, int(s / 10)))
    elif kind == "snow":
        _cloud(d, cx, cy - s * 0.2, s * 0.9)
        for k in range(3):
            x, y, r = cx - s * 0.45 + k * s * 0.4, cy + s * 0.7, s * 0.09
            d.ellipse([x - r, y - r, x + r, y + r], fill="white")
    elif kind == "storm":
        _cloud(d, cx, cy - s * 0.2, s * 0.9, "#9AA5B8")
        d.polygon([(cx, cy + s * 0.25), (cx - s * 0.25, cy + s * 0.65), (cx - s * 0.02, cy + s * 0.65),
                   (cx - s * 0.18, cy + s), (cx + s * 0.25, cy + s * 0.5), (cx + s * 0.02, cy + s * 0.5),
                   (cx + s * 0.15, cy + s * 0.25)], fill="#FFD54F")
    elif kind == "fog":
        for k in range(4):
            y = cy - s * 0.45 + k * s * 0.3
            d.rounded_rectangle([cx - s * 0.8 + (k % 2) * s * 0.2, y, cx + s * 0.8 - ((k + 1) % 2) * s * 0.2, y + s * 0.13],
                                radius=int(s * 0.06), fill="#D8DEE9")


# ---------- card ----------
def render_forecast(forecasts, day: date, site_label: str, out_path: Path, title="ВРЕМЕТО В БЪЛГАРИЯ"):
    forecasts = forecasts[:8]
    img = _gradient((13, 59, 122), (30, 136, 229)).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)

    margin, gap, top, bottom = 50, 26, 235, 1235
    cols = 2 if len(forecasts) > 3 else 1
    rows = math.ceil(len(forecasts) / cols)
    cw = (W - 2 * margin - gap * (cols - 1)) / cols
    ch = min(260, (bottom - top - gap * (rows - 1)) / rows)
    boxes = []
    for i, _ in enumerate(forecasts):
        r, c = divmod(i, cols)
        x, y = margin + c * (cw + gap), top + r * (ch + gap)
        boxes.append((x, y))
        od.rounded_rectangle([x, y, x + cw, y + ch], radius=28, fill=(255, 255, 255, 38))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    d.text((W / 2, 95), title, font=_font(62, True), fill="white", anchor="mm")
    d.text((W / 2, 165), bg_date(day), font=_font(36), fill=(220, 235, 255), anchor="mm")

    f_city, f_max, f_min = _font(38, True), _font(64, True), _font(40)
    f_desc, f_rain = _font(28), _font(28, True)
    for f, (x, y) in zip(forecasts, boxes):
        d.text((x + 28, y + 24), f.name, font=f_city, fill="white")
        isz = ch * 0.24
        draw_icon(d, f.icon, x + cw - isz - 34, y + ch * 0.53, isz)
        tx = x + 28
        d.text((tx, y + ch * 0.36), f"{f.tmax}°", font=f_max, fill="white")
        mx_w = d.textlength(f"{f.tmax}°", font=f_max)
        d.text((tx + mx_w + 14, y + ch * 0.36 + 20), f"/ {f.tmin}°", font=f_min, fill=(200, 222, 255))
        rain = f"☂ {f.rain_pct}%" if f.rain_pct >= 10 else ""
        rain_w = d.textlength(rain, font=f_rain) + 20 if rain else 0
        fd, size = f_desc, 28
        while d.textlength(f.description, font=fd) > cw - 56 - rain_w and size > 20:
            size -= 2
            fd = _font(size)
        d.text((tx, y + ch - 50), f.description, font=fd, fill=(225, 238, 255))
        if rain:
            d.text((x + cw - 28, y + ch - 50), rain, font=f_rain, fill=(160, 210, 255), anchor="ra")

    d.text((W / 2, 1290), site_label, font=_font(42, True), fill="white", anchor="mm")
    out_path = Path(out_path)
    img.convert("RGB").save(out_path, "JPEG", quality=92)
    return out_path


def build_caption(forecasts, day: date, site_url: str, hashtags: str = "", template: str = ""):
    lines = [f"{f.name}: {f.tmax}°/{f.tmin}°, {f.description.lower()}"
             + (f", ☂ {f.rain_pct}%" if f.rain_pct >= 30 else "") for f in forecasts]
    body = "\n".join(lines)
    tpl = template or "☀️ Времето днес – {date}\n\n{lines}\n\nПодробна прогноза по часове: {site}\n\n{hashtags}"
    return tpl.format(date=bg_date(day), lines=body, site=site_url, hashtags=hashtags).strip()
