FROM node:20-alpine AS development
WORKDIR /usr/src/app
COPY . .
RUN npm ci --ignore-scripts && npm run build

FROM node:20-alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --ignore-scripts --only=production
COPY --from=development /usr/src/app/dist ./dist
EXPOSE 3000
CMD ["dist/main"]
