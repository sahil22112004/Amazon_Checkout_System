FROM node:22 AS base
WORKDIR /app
COPY package.json package-lock.json ./

FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3002
CMD ["npm", "run", "start:dev"]

FROM base AS production
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["node", "dist/main.js"]