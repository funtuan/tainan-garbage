FROM node:alpine

WORKDIR /app

RUN apk --update add \
   	tzdata \
   && cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
   && apk del tzdata
ENV TZ=Asia/Taipei

COPY package.json /app/
RUN npm install
COPY . /app

EXPOSE 80
CMD [ "node", "main.js" ]