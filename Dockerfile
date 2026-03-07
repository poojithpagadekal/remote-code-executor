FROM node:20-alpine AS BUILDER
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine as runner
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=BUILDER /app/dist ./dist
EXPOSE 3000
CMD [ "node", "dist/server.js"]