FROM node:24-alpine

ARG NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install

COPY . .

RUN if [ "$NODE_ENV" = "production" ]; then yarn build; fi

EXPOSE 3000

ENV PORT=3000

ENV NODE_ENV $NODE_ENV

CMD if [ "$NODE_ENV" = "production" ]; then npm run start; else npm run dev; fi