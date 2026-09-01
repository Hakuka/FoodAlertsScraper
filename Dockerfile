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

RUN printf '%s\n' \
  'SHELL=/bin/sh' \
  'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin' \
  '' \
  '0 12 * * * root . /etc/environment; cd /app && npm run start >> /proc/1/fd/1 2>> /proc/1/fd/2' \
  > /etc/cron.d/alerts-cron \
  && chmod 0644 /etc/cron.d/alerts-cron

CMD ["sh", "-c", "printenv > /etc/environment && cron -f"]