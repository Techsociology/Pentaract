![pentaract-github-logo](https://github.com/Dominux/Pentaract/assets/55978340/db39e76f-4119-41c1-bbfd-9b59f40ab626)

[<img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/Techsociology/Pentaract/ci.yml?style=plastic&logo=github">](https://github.com/Techsociology/Pentaract/actions)
[<img alt="Any platform" src="https://img.shields.io/badge/platform-any-green?style=plastic&logo=linux&logoColor=white">](https://github.com/Techsociology/Pentaract)

> This is a fork of [Dominux/Pentaract](https://github.com/Dominux/Pentaract) and [Hirogava/Pentaract](https://github.com/Hirogava/Pentaract).

_Cloud storage system based on using Telegram as a storage so it doesn't use your server filesystem or any other paid cloud storage system underneath the hood._

Pentaract is aimed to take as small disk space as possible. So it does not need any code interpreter/platform to run. The whole app is just several megabytes in size. It also uses Postgres as a database and we try our best to economy space by not creating unneeded fields and tables and to wisely pick proper datatypes.

The platform itself can be used differently, like as a personal (on your own server or a local machine) platform or a platform for many users with multiple storages and so on. Since it provides a REST API, you can also use it as a file system in your backend like [NextCloud](https://nextcloud.com/) or [AWS S3](https://aws.amazon.com/s3/) or S3 compatible services (like [MinIO](https://min.io/)), but for now it's early, so it's not recommended for production-ready apps.

## Installation & Usage

Docker Compose with pre-built image (recommended)

1. Clone this repo

```sh
git clone https://github.com/Techsociology/Pentaract
cd Pentaract
```

2. Add an `.env` file. **Don't forget to set your superuser email, password and secret key**. See `.env.exmple` for the full list, including optional Telegram tuning knobs:

```env
PORT=8000
WORKERS=4
CHANNEL_CAPACITY=32
SUPERUSER_EMAIL=<YOUR-EMAIL>
SUPERUSER_PASS=<YOUR-PASSWORD>
ACCESS_TOKEN_EXPIRE_IN_SECS=1800
REFRESH_TOKEN_EXPIRE_IN_DAYS=14
SECRET_KEY=<YOUR-SECRET-KEY>
TELEGRAM_API_BASE_URL=https://api.telegram.org
# Optional, both have sane defaults:
# TELEGRAM_RATE_LIMIT=18
# TELEGRAM_MAX_RETRIES=3

DATABASE_USER=pentaract
DATABASE_PASSWORD=pentaract
DATABASE_NAME=pentaract
DATABASE_HOST=db
DATABASE_PORT=5432
```

Secret key can be set by your hand, but it's strongly recommended to use a long, randomly generated sequence. You can generate one with:

```sh
openssl rand -hex 32
```

3. Run the app:

```sh
docker compose up -d
```

To check if everything works fine you can go to http://localhost:8000 or to `http://<YOUR-PUBLIC-IP>:8000` if you run it on a server.

If there are troubles, you can check the logs:

```sh
docker logs -f pentaract
```

### Running the UI separately (development)

The `ui/` directory is a standalone Solid.js app (see `ui/README.md`). During development you'll typically run the Rust API via `docker compose` (or `cargo run`) and the UI via:

```sh
cd ui
npm install
npm run dev
```

Point it at your API with a `VITE_API_BASE` env var if it's not running on `http://localhost:8000/api`.

## Telegram API limitations

Telegram has its own policy limiting access to their platform. For us the main limitations are:

- Requests per period for one bot (RPM)
- File size

Pentaract has ways to work around them:

### RPM

To work around RPM, users can create additional storage workers. For now, one user can create up to 20 bots. You can also create additional accounts to create extra bots, or ask someone you trust to do so. This way it becomes up to you (not Telegram) how fast you can upload/download from a Pentaract storage.

The default RPM (18 requests/minute, configurable via `TELEGRAM_RATE_LIMIT`) is fine for a single storage worker if you don't need to upload/download large files fast.

Pentaract also retries failed Telegram API calls with backoff (configurable via `TELEGRAM_MAX_RETRIES`, default 3), so transient Telegram-side hiccups don't fail your upload/download outright.

### File size

Telegram API limits file download to 20 MB, so uploads are limited to that too, per chunk.

Pentaract divides uploaded files into chunks and saves them to Telegram separately; on download it fetches all the file's chunks from the Telegram API and combines them in order. That grants the ability to upload and download files of almost unlimited size.

## Authentication

Login (`POST /api/auth/login`) returns both a short-lived **access token** and a longer-lived **refresh token**. When the access token expires, exchange the refresh token for a new access token via `POST /api/auth/refresh` instead of logging in again. Access token lifetime is controlled by `ACCESS_TOKEN_EXPIRE_IN_SECS`, refresh token lifetime by `REFRESH_TOKEN_EXPIRE_IN_DAYS`.

## Current in-storage features

- [x] Upload file
- [x] Download file
- [x] Create folder
- [x] Get file/folder info
- [x] Delete file/folder

## Access

You can manage access to your storages by granting access to other users. There are 3 possible roles:

- Viewer
- Can edit (editor)
- Admin

You can grant access, change it, or restrict (delete) access for other users.

# Contributing

Highly welcome ❤️ ! Create issues or pick up existing ones and open PRs.
