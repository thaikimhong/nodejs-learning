FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

USER node

EXPOSE 3011

ENV NODE_ENV=production

CMD ["node", "src/main.js"]
