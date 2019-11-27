FROM node:12.13.1-alpine AS build-stage

WORKDIR /graphdom

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

FROM node:12.13.1-slim AS release-stage

# https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker
RUN apt-get update \
    && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y \
      google-chrome-unstable \
      fonts-ipafont-gothic \
      fonts-wqy-zenhei \
      fonts-thai-tlwg \
      fonts-kacst fonts-freefont-ttf \
      --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN yarn install --production

USER node
WORKDIR /graphdom

COPY --from=build-stage --chown=node:node /graphdom /graphdom

EXPOSE 8080

CMD ["node", "dist/src/server.js"]
