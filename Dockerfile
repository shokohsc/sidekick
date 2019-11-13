FROM shokohsc/alpine-node

WORKDIR /app

ADD ./root/etc/services.d/node-consumer /etc/services.d/node-consumer
ADD . /app

RUN npm install

EXPOSE 3000
