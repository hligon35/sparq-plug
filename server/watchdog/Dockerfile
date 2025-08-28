FROM node:20-alpine

WORKDIR /app

COPY index.js ./

RUN adduser -D appuser && chown -R appuser /app
USER appuser

CMD ["node", "index.js"]
