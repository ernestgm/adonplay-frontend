FROM node:24-alpine

ARG NODE_ENV=production
ARG NEXT_PUBLIC_RAILS_ACTION_CABLE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_UPLOAD_BASE_URL

ENV NEXT_PUBLIC_RAILS_ACTION_CABLE_URL $NEXT_PUBLIC_RAILS_ACTION_CABLE_URL
ENV NEXT_PUBLIC_API_URL $NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_UPLOAD_BASE_URL $NEXT_PUBLIC_UPLOAD_BASE_URL

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install

COPY . .

RUN if [ "$NODE_ENV" = "production" ]; then npm build; fi

EXPOSE 3000

ENV PORT=3000

ENV NODE_ENV $NODE_ENV

CMD if [ "$NODE_ENV" = "production" ]; then npm run start; else npm run dev; fi