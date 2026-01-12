FROM node:24-alpine

WORKDIR /app

EXPOSE 3000

CMD if [ ! -d "node_modules" ]; then npm install; fi && npm run dev -- --hostname 0.0.0.0
