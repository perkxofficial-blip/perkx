FROM node:24

WORKDIR /app

RUN npm i -g @nestjs/cli

RUN nest new . --package-manager npm --skip-git --skip-install && npm install

EXPOSE 3000

CMD ["npm", "run", "start:dev", "--", "--hostname", "0.0.0.0"]
