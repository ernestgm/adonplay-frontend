FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install

COPY . .

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "run", "dev"]