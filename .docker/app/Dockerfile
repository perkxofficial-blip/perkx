FROM node:24

WORKDIR /app

RUN npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm --yes

EXPOSE 3000

CMD if [ ! -d "node_modules" ]; then npm install; fi && npm run dev -- --hostname 0.0.0.0
