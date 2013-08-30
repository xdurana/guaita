#!bin/sh

export NODE_PATH=/usr/local/lib/node_modules:/usr/local/lib/node &&
export NODE_CONFIG=/home/xdurana/github.uoc.es/guaita/config/config-test.json &&
export NODE_ENV=test &&
export PORT=3060 &&
nodemon app.js