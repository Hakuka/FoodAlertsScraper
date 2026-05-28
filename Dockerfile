FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Warsaw

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends cron tzdata \
  && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
  && echo $TZ > /etc/timezone \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

RUN npx playwright install chromium --with-deps

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

COPY docker/alerts-cron /etc/cron.d/alerts-cron

RUN chmod 0644 /etc/cron.d/alerts-cron \
  && crontab /etc/cron.d/alerts-cron

CMD ["cron", "-f"]