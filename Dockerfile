# syntax=docker/dockerfile:1

FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY . .

CMD ["node", "src/index.js"]
EXPOSE 3000
