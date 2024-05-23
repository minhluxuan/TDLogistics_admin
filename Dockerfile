FROM node:21

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm i -g pm2

EXPOSE 5000


CMD ["pm2-runtime", "start", "./bin/www"]