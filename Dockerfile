FROM node:20-alpine as development

WORKDIR /usr/src/app

COPY . .

RUN npm install && npm run build

FROM node:20-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i --only=production

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["dist/main"]
