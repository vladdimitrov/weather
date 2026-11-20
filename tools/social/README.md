# WeatherPulse Social

Python услуга, която:

1. **Всяка сутрин прави картинка с прогнозата** за 8 града (данни от Open-Meteo, безплатно, без ключ) и я публикува във Facebook страницата и в Instagram с текст и линк към weatherpulse.eu.
2. **Публикува по график снимки и клипове от папка** `queue/`. Пускате файловете, а услугата ги качва един по един в зададените часове.

```
main.py forecast [--dry-run] [--sample] [--tomorrow]   прогноза → FB + IG
main.py queue    [--dry-run]                            следващият файл от queue/ → FB + IG
main.py check                                           проверка на токена, страницата и IG
main.py serve                                           работи постоянно по графика в config.yaml
```

3. **Чернови за предупреждения** (`main.py warnings`): за оранжев или червен код на НИМХ прави картинка и текст в `queue/drafts/` и отваря GitHub issue. **Нищо не се публикува, докато не го одобрите** (workflow „Social draft“: `publish`, `publish-now` или `delete`). Най-много 2 нови чернови на ден, без повторения (`state/warnings.json`). Магнитните бури (Kp 5+) са отделните автоматични известия на `alerts`.

```
main.py warnings [--dry-run] [--sample]   чернови за оранжев/червен код (--dry-run: само картинките в output/)
main.py warnings --notify                 issue за всяка чернова, която още няма (иска GITHUB_TOKEN)
```

4. **Постоянна публика – Viber и Telegram канал** (`wp_social/channel.py`): същите съобщения като във Facebook – прогнозата сутрин, магнитна буря (Kp 5+), пълнолуние утре и одобрените предупреждения на НИМХ – отиват и в канал. Каналът без токен се пропуска, а грешка в канал не спира публикацията във Facebook. Съобщението е текст с връзка (Viber показва картата на страницата като преглед), в Telegram има и картинка.

```
main.py channel                 кои канали са настроени
main.py channel --test          тестово съобщение във всеки настроен канал
main.py channel --viber-info    име и членове на Viber канала (id-то на супер администратора е WP_VIBER_FROM)
```

Secrets в GitHub (Settings → Secrets → Actions): `WP_VIBER_TOKEN`, `WP_VIBER_FROM`, `WP_TG_TOKEN`, `WP_TG_CHAT`. Проверка: Actions → „Channel“ → Run workflow (`check`, после `test`).
- **Viber:** създайте канал (приложението, версия 17.7+), в информацията на канала → „Developer Tools“ → копирайте токена. Каналите са безплатни; платеният е ботът (около 100 € на месец), който не ни трябва.
- **Telegram:** @BotFather → `/newbot` → токен; създайте публичен канал, добавете бота като администратор; `WP_TG_CHAT` е `@името_на_канала`.

## 1. Инсталация

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp config.example.yaml config.yaml
python main.py forecast --dry-run  # прави картинката в output/ и показва текста, без да публикува
```

## 2. Достъп до Facebook и Instagram (еднократно)

1. Instagram акаунтът трябва да е **професионален** (Business или Creator) и **свързан с Facebook страницата**.
2. Отидете на developers.facebook.com → **Create App** → тип **Business**.
3. Отворете **Graph API Explorer**, изберете приложението и вземете **User Token** със следните права:
   `pages_show_list, pages_read_engagement, pages_manage_posts, instagram_basic, instagram_content_publish, business_management`
4. Разменете го за дълготраен токен (App ID и App Secret са в Settings → Basic):
   ```
   https://graph.facebook.com/v23.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=КРАТКИЯ_ТОКЕН
   ```
5. С дълготрайния токен извикайте `https://graph.facebook.com/v23.0/me/accounts?access_token=...`.
   Там са `id` на страницата (**WP_PAGE_ID**) и нейният `access_token` (**WP_PAGE_TOKEN**). Токенът на страница, получен от дълготраен токен, обикновено не изтича.
6. Instagram ID: `https://graph.facebook.com/v23.0/WP_PAGE_ID?fields=instagram_business_account&access_token=WP_PAGE_TOKEN` → **WP_IG_USER_ID**.
7. Задайте ги като променливи на средата, без да ги записвате в config.yaml:
   ```bash
   export WP_PAGE_ID=...  WP_PAGE_TOKEN=...  WP_IG_USER_ID=...
   export WP_FTP_USER=...  WP_FTP_PASSWORD=...
   python main.py check     # трябва да покаже името на страницата и IG профила
   ```

Докато публикувате само в своята страница и своя профил и сте администратор на приложението, обикновено не е нужен App Review. Ако Meta поиска, следвайте указанията в панела на приложението. Ако `v23.0` спре да се поддържа, сменете `graph_version` в config.yaml с текущата версия.

## 3. Защо Instagram иска „hosting“

Facebook приема файла директно. Instagram изтегля снимката или клипа от **публичен https адрес**, затова услугата първо ги качва на сайта:

- `mode: ftp`: качва в `/public_html/social` на хостинга (или друга папка). Адресът става `https://weatherpulse.eu/social/...`.
- `mode: local`: ако услугата работи на същия сървър като сайта, просто копира файла в публичната папка.
- `mode: none`: само Facebook (сложете `post_to_instagram: false`).

Папката `social/` може периодично да се чисти, защото Instagram пази собствено копие.

## 4. Папката за снимки и клипове

```
queue/
  001-zalez-vitosha.jpg
  001-zalez-vitosha.txt     ← текстът на поста (по желание)
  002-burya-varna.mp4
  002-burya-varna.txt
```

- Публикува се файлът с най-малкото име, затова номерирайте файловете.
- Снимки: jpg/png/webp (за Instagram се превръщат в JPEG). Видео: mp4/mov. В Instagram отиват като **Reels** (H.264, вертикално 9:16, до 90 сек. е най-сигурно).
- Без .txt се използва `default_caption`. Хаштаговете от config.yaml се добавят автоматично.
- След публикуване файлът се мести в `queue/posted/`. Ако едната мрежа успее, а другата се провали, при следващия опит се публикува само там, където липсва, без двойни постове.

## 5. Автоматично стартиране

**Препоръчано: GitHub Actions (безплатно, не е нужен включен компютър)**
1. Направете **частно** хранилище в GitHub и качете цялата папка (заедно с `.github/workflows/social.yml` и `config.yaml`, в който няма пароли).
2. Settings → Secrets and variables → Actions → **New repository secret**: добавете `WP_PAGE_ID`, `WP_PAGE_TOKEN`, `WP_IG_USER_ID`, `WP_FTP_USER`, `WP_FTP_PASSWORD`.
3. Таб **Actions** → „Social posts“ → **Run workflow** → `forecast`, за да пробвате веднага.
4. Снимки и клипове: качвате ги в `queue/` на хранилището (през сайта на GitHub с Add file → Upload files). След публикуване GitHub сам ги мести в `queue/posted/`.
5. Часовете в `social.yml` са в UTC. При лятно време (от края на март) извадете по 1 час, за да остане 07:30 българско време.

GitHub понякога пуска планираните задачи с няколко до 15–20 минути закъснение, което за такива постове е без значение.

**Вариант А: вграден график** (`schedule:` в config.yaml) с systemd на Linux сървър:

```ini
# /etc/systemd/system/weatherpulse-social.service
[Unit]
Description=WeatherPulse social posting
After=network-online.target

[Service]
WorkingDirectory=/opt/weatherpulse_social
EnvironmentFile=/opt/weatherpulse_social/.env
ExecStart=/opt/weatherpulse_social/.venv/bin/python main.py serve
Restart=always

[Install]
WantedBy=multi-user.target
```
`.env` съдържа редове `WP_PAGE_TOKEN=...` и т.н. След това: `sudo systemctl enable --now weatherpulse-social`.

**Вариант Б: cron** (без `serve`):
```
30 7 * * *        cd /opt/weatherpulse_social && .venv/bin/python main.py forecast
30 12,18 * * *    cd /opt/weatherpulse_social && .venv/bin/python main.py queue
```
(Сървърът трябва да е в часова зона Europe/Sofia, иначе изместете часовете.)

**Windows:** в Task Scheduler задача, която стартира `.venv\Scripts\python.exe main.py serve` при стартиране на компютъра. Компютърът трябва да е включен.

Логове: `logs/social.log`.

## Настройки, които може да искате да промените

- `cities`: градовете и координатите (до 8 на картинка).
- `forecast.link_path`: към коя страница на сайта води линкът.
- `schedule.forecast_tomorrow: true` + `forecast_time: "19:00"`: вечерен пост „утре“ вместо сутрешен.
- Цветове и оформление: `wp_social/render.py`.
