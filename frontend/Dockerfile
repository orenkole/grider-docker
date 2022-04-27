# build phase
FROM node:16-alpine as builder
WORKDIR '/app'
COPY package.json .
RUN npm install
COPY . .
# path will be: app / build 
RUN npm run build

FROM nginx
EXPOSE 80
# copy from _builder_ phase
COPY --from=builder /app/build  /usr/share/nginx/html