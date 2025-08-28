FROM node:20-alpine

# Tools: bash, git/ssh, curl, and Docker CLI + Compose (both plugin and legacy as fallback)
RUN apk add --no-cache \
	bash git openssh-client curl \
	docker-cli docker-cli-compose docker-compose || \
	apk add --no-cache bash git openssh-client curl docker docker-compose

WORKDIR /app

COPY package.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY index.js ./
COPY runner.sh ./
RUN chmod +x runner.sh

EXPOSE 8787
CMD ["node", "index.js"]
