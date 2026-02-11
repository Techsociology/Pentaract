![pentaract-github-logo](https://github.com/Dominux/Pentaract/assets/55978340/db39e76f-4119-41c1-bbfd-9b59f40ab626)

[<img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/Dominux/Pentaract/docker-image.yml?style=plastic&logo=github">](https://github.com/Dominux/Pentaract/actions)
[<img alt="Dockerhub latest" src="https://img.shields.io/badge/dockerhub-latest-blue?logo=docker&style=plastic">](https://hub.docker.com/r/thedominux/pentaract)
[<img alt="Docker Image Size (tag)" src="https://img.shields.io/docker/image-size/thedominux/pentaract/latest?style=plastic&logo=docker&color=gold">](https://hub.docker.com/r/thedominux/pentaract/tags?page=1&name=latest)
[<img alt="Any platform" src="https://img.shields.io/badge/platform-any-green?style=plastic&logo=linux&logoColor=white">](https://github.com/Dominux/Pentaract)

##NOTE : this is a fork of https://github.com/Dominux/Pentaract & https://github.com/Hirogava/Pentaract

_Cloud storage system based on using Telegram as a storage so it doesn't use your server filesystem or any other paid cloud storage system underneath the hood._


Pentaract is aimed to take as small disk space as possible. So it does not need any code interpreter/platform to run. The whole app is just several megabytes in size. It also uses Postgres as a database and we try our best to economy space by not creating unneeded fields and tables and to wisely pick proper datatypes.

The platform itself can be used differently, like as a personal (on your own server or a local machine) platform or a platform for many users with multiple storages and so on. Since it provides Rest API, you can also use it as a file system in your backend like [NextCloud](https://nextcloud.com/) or [AWS S3](https://aws.amazon.com/s3/) or S3 compatable services (like [MinIO](https://min.io/)), but for now it's so early so I don't recommend to use it in production ready apps.

# Installation & Useage 
Docker Compose with pre-built image (recommended)

1. Clone this repo 
```git
git clone https://github.com/Techsociology/Pentaract
cd Pentaract 
```
2. Add an `.env` file like the next one. **Don't forget to set your superuser email, password and secret key**:

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

DATABASE_USER=pentaract
DATABASE_PASSWORD=pentaract
DATABASE_NAME=pentaract
DATABASE_HOST=db
DATABASE_PORT=5432
```
check .env.example for guidence  

Secret key can be set by your hand, but I strongly recommend to use long randomly generated sequences. So you either can generate it via some free websites that provide such funcionallity or by running something like this in the terminal:

```sh
openssl rand -hex 32
```
3. For now everything is set up so we can run our app:

```sh
docker compose up -d
```

To check if everything works fine you can go to http://localhost:8000 or to `http://<YOUR-PUBLIC-IP>:8000` if you run it on a server.

If there are troubles, you can check the logs, there may be some errors:

```sh
docker logs -f pentaract
```

## Telegram API limitations

Telegram has its policy to limit some access to their platform. For us the main limitations are:

- Requests per a period for one bot (RPM)
- File size

Pentaract has ways to workaround them:

### RPM

To workaround RPM users can create additional storage workers. For now one user can create up to 20 bots. You can also create additional accounts to create extra bots or ask your nearest for example to do so. This way from up to Telegram limitations it becomes up to you on how fast you can upload/download in Pentaract storage.

I should notice that current RPM (20 requests per minute) is completely fine to work with a single storage worker if you need the storage to be your own and don't need to upload/download big files fast.

### File size

Currently Telegram API limits file download to 20 MB, hence we can't upload files more than that limit too.

Pentaract divides uploaded files into chunks and save them to Telegram separately and on downloading a file it fetches all the file chunks from the Telegram API and combine them into one in the order it was divided in. That grants ability to upload and download files with almost unlimited size (it's like you've ever downloaded a file with size >10 GB).

## Current in storage features

- [x] Upload file
- [x] Download file
- [x] Create folder
- [x] Get file/folder info
- [x] Delete file/folder

## Access

You can manage access to your storages by granting access to other users. For now, there are 3 possible roles:
- Viewer
- Can edit(editor)
- Admin
So you can grant access, change it or restrict (delete access) for other users.

# Contributing

Is highly welcoming ❤️ ! Create issues or take existing ones and create PRs!