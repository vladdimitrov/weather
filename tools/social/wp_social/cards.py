"""Share cards (1200x630) for the pages of passes, magnetic storms and air quality.

The pages point their og:image at /images/cards/<name>.png. This job redraws a card with today's values
(the same rules as js/passes.js on the pages) and writes it only when its text changed, so the
repository does not grow with every run. Without data (--static) it draws a neutral card without numbers,
which is what a page shows until the first live run.

  python main.py cards            live data from Open-Meteo and NOAA
  python main.py cards --sample   invented data, no network (to look at the design)
  python main.py cards --static   neutral cards without numbers
"""
import hashlib
import json
import logging
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests
from PIL import Image, ImageDraw, ImageFont

from .config import ROOT

log = logging.getLogger(__name__)

REPO = ROOT.parent.parent
OUT = REPO / "images" / "cards"
STATE = REPO / "data" / "cards-state.json"
W, H = 1200, 630
TZ = ZoneInfo("Europe/Sofia")
FONT = ROOT / "fonts" / "DejaVuSans.ttf"
FONT_BOLD = ROOT / "fonts" / "DejaVuSans-Bold.ttf"

FORECAST = "https://api.open-meteo.com/v1/forecast"
AIR = "https://air-quality-api.open-meteo.com/v1/air-quality"
NOAA_1M = "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json"
NOAA_FC = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json"
HOURLY = "temperature_2m,precipitation,snowfall,weather_code,wind_speed_10m,wind_gusts_10m,visibility"

# level colours as on the site: calm, attention, bad
COLORS = {0: "#a5d6a7", 1: "#ffd54f", 2: "#ff8a65"}
INK = "#1a1a2e"
FREEZING = {56, 57, 66, 67}
LEVEL_TEXT = ["Нормални условия", "Внимание", "Трудни условия"]
KIND_NAMES = {"snow": "сняг", "ice": "поледица", "wind": "силен вятър", "fog": "мъгла"}
WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "нд"]

CITIES = [("София", 42.6977, 23.3219), ("Пловдив", 42.1354, 24.7453), ("Варна", 43.2141, 27.9147),
          ("Бургас", 42.5048, 27.4626), ("Русе", 43.8356, 25.9657), ("Стара Загора", 42.4258, 25.6345),
          ("Плевен", 43.417, 24.6067), ("Перник", 42.6052, 23.0378), ("Видин", 43.9962, 22.8679),
          ("Благоевград", 42.0209, 23.0943)]
AIR_STEPS = [(20, "добро", 0), (40, "задоволително", 0), (60, "умерено", 1), (80, "лошо", 2),
             (100, "много лошо", 2), (float("inf"), "изключително лошо", 2)]


# ---------------- the rules of the pass pages (js/passes.js), in Python ----------------
def hazards(h, start, count):
    out = []
    for i in range(start, min(start + count, len(h["time"]))):
        kinds = set()
        temp = h["temperature_2m"][i]
        wet = sum((h["precipitation"][j] or 0) for j in range(max(0, i - 6), i + 1))
        if (h["snowfall"][i] or 0) >= 0.2:
            kinds.add("snow")
        if h["weather_code"][i] in FREEZING or (-4 <= temp <= 1 and wet >= 0.2):
            kinds.add("ice")
        if (h["wind_gusts_10m"][i] or 0) >= 60:
            kinds.add("wind")
        vis = h["visibility"][i]
        if isinstance(vis, (int, float)) and vis < 300:
            kinds.add("fog")
        out.append({"time": h["time"][i], "kinds": kinds, "gust": h["wind_gusts_10m"][i] or 0,
                    "snow": h["snowfall"][i] or 0, "freezing": h["weather_code"][i] in FREEZING})
    return out


def _local(unix):
    return datetime.fromtimestamp(unix, TZ)


def _hhmm(unix):
    return _local(unix).strftime("%H:%M")


def _day_key(unix):
    return _local(unix).date()


def _day_name(unix):
    d = _local(unix)
    return f"{WEEKDAYS[d.weekday()]}, {d.day}.{d.month}"


def verdict(hours):
    snow = sum(x["snow"] for x in hours)
    gust = max([0] + [x["gust"] for x in hours])
    bad = [x for x in hours if x["kinds"]]
    if not bad:
        return {"level": 0, "text": LEVEL_TEXT[0], "snow": snow, "gust": gust}
    level = 2 if snow >= 10 or gust >= 90 or any(x["freezing"] for x in hours) else 1
    kinds = [KIND_NAMES[k] for k in ("snow", "ice", "wind", "fog") if any(k in x["kinds"] for x in bad)]
    lst = f"{', '.join(kinds[:-1])} и {kinds[-1]}" if len(kinds) > 1 else kinds[0]
    first, now = bad[0]["time"], hours[0]["time"]
    if first == now:
        when = "още сега"
    elif _day_key(first) == _day_key(now):
        when = f"след {_hhmm(first)}"
    elif (_day_key(first) - _day_key(now)).days == 1:
        when = f"от утре {_hhmm(first)}"
    else:
        when = f"от {_day_name(first)} {_hhmm(first)}"
    return {"level": level, "text": f"{LEVEL_TEXT[level]} – {lst} {when}", "snow": snow, "gust": gust}


def now_index(h, now=None):
    now = now or time.time()
    for i, t in enumerate(h["time"]):
        if t + 3600 > now:
            return i
    return 0


def best_time(hours):
    """The longest run of hours in daylight (06-20) without a hazard in the next 24 hours, or None."""
    day = hours[:24]
    if not any(x["kinds"] for x in day):
        return None
    light = [x for x in day if 6 <= _local(x["time"]).hour <= 20]
    best = run = None
    for k, x in enumerate(light):
        nxt = light[k + 1] if k + 1 < len(light) else None
        if not x["kinds"]:
            run = run or {"from": x["time"], "to": x["time"], "n": 0}
            run["to"] = x["time"]
            run["n"] += 1
        if run and (x["kinds"] or not nxt or nxt["time"] - x["time"] > 3600):
            if not best or run["n"] > best["n"]:
                best = run
            run = None
    if not best:
        return "През деня няма час без опасни условия – по възможност отложете."
    today = _day_key(hours[0]["time"])
    word = "днес" if _day_key(best["from"]) == today else "утре" if (_day_key(best["from"]) - today).days == 1 else _day_name(best["from"])
    if best["n"] == 1:
        return f"Най-подходящо време: {word} около {_hhmm(best['from'])}"
    return f"Най-подходящо време: {word} {_hhmm(best['from'])}–{_hhmm(best['to'] + 3600)}"


# ---------------- data ----------------
def _get(url, params, tries=4):
    for attempt in range(1, tries + 1):
        try:
            r = requests.get(url, params=params, timeout=60)
            r.raise_for_status()
            return r.json()
        except requests.RequestException as e:
            if attempt == tries:
                raise
            log.warning("%s attempt %d failed (%s)", url, attempt, e)
            time.sleep(10 * attempt)


def fetch_passes(passes):
    data = _get(FORECAST, {
        "latitude": ",".join(str(p["lat"]) for p in passes), "longitude": ",".join(str(p["lon"]) for p in passes),
        "elevation": ",".join(str(p["elevation"]) for p in passes), "hourly": HOURLY,
        "timezone": "Europe/Sofia", "timeformat": "unixtime", "forecast_days": 3})
    return data if isinstance(data, list) else [data]


def sample_passes(passes):
    base = int(time.time() // 3600 * 3600)
    out = []
    for n, _ in enumerate(passes):
        hours = [base + 3600 * i for i in range(72)]
        out.append({"hourly": {
            "time": hours,
            "temperature_2m": [-1 - (n % 3) for _ in hours],
            "precipitation": [0.4 if (n % 3 and 10 <= i < 20) else 0 for i in range(72)],
            "snowfall": [0.5 if (n % 3 == 1 and 10 <= i < 20) else 0 for i in range(72)],
            "weather_code": [71 if (n % 3 == 1 and 10 <= i < 20) else 1 for i in range(72)],
            "wind_speed_10m": [20] * 72,
            "wind_gusts_10m": [65 if (n % 3 == 2 and i > 6) else 35 for i in range(72)],
            "visibility": [20000] * 72}})
    return out


def fetch_kp():
    """(now, highest expected in the next 24 hours): the 1-minute estimate is 'now', the forecast file is only ahead."""
    one = _get(NOAA_1M, None)
    last = one[-1]
    kp_now = float(last.get("estimated_kp") if last.get("estimated_kp") is not None else last.get("kp_index"))
    peak = kp_now
    try:
        fc = _get(NOAA_FC, None)
        rows = fc[1:] if fc and isinstance(fc[0], list) else fc
        now = datetime.utcnow()
        for row in rows:
            tag, kp = (row[0], row[1]) if isinstance(row, list) else (row.get("time_tag"), row.get("kp"))
            t = datetime.fromisoformat(str(tag).replace("Z", "").replace(" ", "T")[:19])
            if 0 <= (t - now).total_seconds() <= 24 * 3600:
                peak = max(peak, float(kp))
    except Exception as e:  # the current value alone is still a fine card
        log.warning("NOAA forecast not used: %s", e)
    return kp_now, peak


def fetch_air():
    data = _get(AIR, {"latitude": ",".join(str(c[1]) for c in CITIES), "longitude": ",".join(str(c[2]) for c in CITIES),
                      "current": "european_aqi"})
    data = data if isinstance(data, list) else [data]
    rows = [(CITIES[n][0], a["current"]["european_aqi"]) for n, a in enumerate(data)
            if a.get("current") and isinstance(a["current"].get("european_aqi"), (int, float))]
    return sorted(rows, key=lambda r: -r[1])


# ---------------- drawing ----------------
def _font(size, bold=False):
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT), size)


def _wrap(text, font, width):
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if font.getlength(trial) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_card(path, kicker, title, level=None, verdict_text=None, lines=(), foot="weatherpulse.eu",
              credit="Данни: Open-Meteo.com", stamp=None):
    top, bottom = (22, 36, 71), (31, 64, 104)
    img = Image.new("RGB", (W, H), top)
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        d.line([(0, y), (W, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    pad = 64
    d.rounded_rectangle([0, 0, 18, H], radius=0, fill=COLORS.get(level, "#4fc3f7"))
    d.text((pad, 48), "Weather Pulse", font=_font(34, True), fill="white")
    if stamp:  # the day of the values: a shared card can be looked at days later
        sf = _font(26)
        d.text((W - pad - sf.getlength(stamp), 54), stamp, font=sf, fill="#9fb0d0")
    d.text((pad, 104), kicker.upper(), font=_font(26, True), fill="#8ecae6")
    y = 150
    tf = _font(76, True)
    for line in _wrap(title, tf, W - 2 * pad)[:2]:
        d.text((pad, y), line, font=tf, fill="white")
        y += 92
    y += 14
    if verdict_text:
        vf = _font(42, True)
        vlines = _wrap(verdict_text, vf, W - 2 * pad - 56)[:2]
        box_h = 28 + 54 * len(vlines)
        d.rounded_rectangle([pad, y, W - pad, y + box_h], radius=22, fill=COLORS.get(level, "#4fc3f7"))
        ty = y + 14
        for line in vlines:
            d.text((pad + 28, ty), line, font=vf, fill=INK)
            ty += 54
        y += box_h + 22
    lf = _font(32)
    for text in lines:
        for line in _wrap(text, lf, W - 2 * pad)[:2]:
            d.text((pad, y), line, font=lf, fill="#e6ecf8")
            y += 44
    d.text((pad, H - 70), foot, font=_font(30, True), fill="#8ecae6")
    cf = _font(24)
    d.text((W - pad - cf.getlength(credit), H - 64), credit, font=cf, fill="#9fb0d0")
    path.parent.mkdir(parents=True, exist_ok=True)
    # few flat colours: a palette PNG is several times smaller than a JPEG and the text stays sharp
    img.quantize(colors=48, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(path, "PNG", optimize=True)


# ---------------- the jobs ----------------
def _fmt(x):
    return f"{x:.1f}".replace(".", ",")


def build_cards(mode="live"):
    passes = json.loads((REPO / "data" / "passes.json").read_text(encoding="utf-8"))
    cards = {}  # name -> kwargs of draw_card

    # --- passes ---
    answers = None
    if mode == "live" and passes:
        answers = fetch_passes(passes)
    elif mode == "sample" and passes:
        answers = sample_passes(passes)
    rated = []
    for n, p in enumerate(passes):
        name = p["name"].split(" (")[0]
        base = dict(kicker=f"Проход · {p['elevation']} м", title=name)
        if answers:
            h = answers[n]["hourly"]
            start = now_index(h)
            hrs = hazards(h, start, 48)
            v = verdict(hrs)
            facts = f"Следващите 48 часа: {'до ' + str(round(v['snow'])) + ' см нов сняг' if round(v['snow']) >= 1 else 'без нов сняг'}, пориви до {round(v['gust'])} км/ч."
            best = best_time(hrs)
            cards[f"pass-{p['slug']}"] = dict(base, level=v["level"], verdict_text=v["text"], lines=[facts] + ([best] if best else []))
            rated.append((v["level"] * 1000 + v["snow"] + v["gust"] / 100, name, v))
        else:
            cards[f"pass-{p['slug']}"] = dict(base, lines=["Прогноза по часове за височината на пътя: сняг, поледица, вятър и най-подходящо време за минаване."])
    if rated:
        rated.sort(key=lambda r: -r[0])
        worst = rated[0]
        affected = sum(1 for r in rated if r[2]["level"])
        if not worst[2]["level"]:
            hub = dict(kicker="Проходи", title="Времето по проходите", level=0, verdict_text="Нормални условия навсякъде",
                       lines=[f"Проверени са {len(rated)} прохода за следващите 48 часа."])
        else:
            what = worst[2]["text"].split("– ", 1)[-1]
            hub = dict(kicker="Проходи", title="Времето по проходите", level=worst[2]["level"],
                       verdict_text=f"{worst[1]}: {what}",
                       lines=[f"Още {affected - 1} с внимание или трудни условия." if affected > 1 else "Останалите са нормални."])
        cards["pass-all"] = hub
    elif passes:
        cards["pass-all"] = dict(kicker="Проходи", title="Времето по проходите",
                                 lines=["Сняг, поледица, вятър и мъгла на 11 прохода – по часове, на български."])

    # --- magnetic storms ---
    if mode == "live":
        kp_now, peak = fetch_kp()
    elif mode == "sample":
        kp_now, peak = 2.7, 4.3
    else:
        kp_now = peak = None
    if kp_now is not None:
        lvl = 2 if peak >= 5 else 1 if peak >= 4 else 0
        word = "Магнитна буря" if peak >= 5 else "Неспокойно" if peak >= 4 else "Спокойно"
        cards["storm"] = dict(kicker="Магнитни бури", title=f"Kp {_fmt(kp_now)} сега", level=lvl,
                              verdict_text=f"{word}: до Kp {_fmt(peak)} в следващите 24 часа",
                              lines=["Индексът Kp на NOAA в реално време и прогноза за 3 дни."], foot="weatherpulse.eu/magnitni-buri/",
                              credit="Данни: NOAA SWPC")
    else:
        cards["storm"] = dict(kicker="Магнитни бури", title="Магнитни бури днес и утре",
                              lines=["Kp в реално време, прогноза за 3 дни и какво да очаквате."], foot="weatherpulse.eu/magnitni-buri/",
                              credit="Данни: NOAA SWPC")

    # --- air ---
    if mode == "live":
        rows = fetch_air()
    elif mode == "sample":
        rows = [("Перник", 72), ("София", 58), ("Пловдив", 41), ("Варна", 22)]
    else:
        rows = []
    if rows:
        name, aqi = rows[0]
        text, lvl = next((t, l) for lim, t, l in AIR_STEPS if aqi <= lim)
        bad = sum(1 for r in rows if r[1] > 60)
        cards["air"] = dict(kicker="Качество на въздуха", title="Въздухът в големите градове", level=lvl,
                            verdict_text=f"Най-лошо: {name} – {text} ({round(aqi)})",
                            lines=[f"{bad} от {len(rows)} града са над умереното." if bad else "Европейски индекс по модела CAMS, на всеки час."],
                            foot="weatherpulse.eu/vremeto/kachestvo-na-vazduha/")
    else:
        cards["air"] = dict(kicker="Качество на въздуха", title="Въздухът в големите градове",
                            lines=["Европейски индекс на 10 града по модела CAMS, на всеки час."],
                            foot="weatherpulse.eu/vremeto/kachestvo-na-vazduha/")
    if mode != "static":
        now = datetime.now(TZ)
        for kw in cards.values():
            kw["stamp"] = f"Към {now.day}.{now.month}.{now.year}"
    return cards


def run_cards(mode="live", force=False):
    cards = build_cards(mode)
    state = json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {}
    written = 0
    for name, kw in cards.items():
        digest = hashlib.sha1(json.dumps(kw, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:12]
        target = OUT / f"{name}.png"
        if not force and mode == "live" and state.get(name) == digest and target.exists():
            continue
        draw_card(target, **kw)
        state[name] = digest
        written += 1
    if mode == "live":
        STATE.parent.mkdir(parents=True, exist_ok=True)
        STATE.write_text(json.dumps(state, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")
    log.info("Cards: %d of %d redrawn.", written, len(cards))
    return written
