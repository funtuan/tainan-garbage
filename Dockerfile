FROM node:alpine

WORKDIR /app

# Install base packages
RUN apk update
RUN apk upgrade
RUN apk add ca-certificates && update-ca-certificates
# Change TimeZone
RUN apk add --update tzdata
ENV TZ=Asia/Taipei
# Clean APK cache
RUN rm -rf /var/cache/apk/*

COPY package.json /app/
RUN npm install
COPY . /app

EXPOSE 80
CMD [ "node", "main.js" ]