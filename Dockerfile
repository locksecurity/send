FROM node:16-alpine AS builder
WORKDIR /app
COPY . .
ENV PORT=80
RUN yarn install
RUN yarn run build

FROM node:16-alpine
RUN yarn global add serve
WORKDIR /app
COPY --from=builder /app/dist .

EXPOSE 80

CMD ["serve", "-p", "80", "-s", "."]
