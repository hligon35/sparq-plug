FROM node:20-alpine

RUN apk add --no-cache bash git openssh-client curl && \
    addgroup -S app && adduser -S -G app app

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY index.js ./
COPY runner.sh ./
RUN chmod +x runner.sh

USER app
EXPOSE 8787
CMD ["node", "index.js"]
