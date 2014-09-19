#!bin/sh

export NODE_PATH=/usr/local/lib/node_modules:/usr/local/lib/node &&
export NODE_CONFIG=/home/campus/configHome/guaita/config-pre.json &&
export NODE_ENV=pre &&
export PORT=3040 &&
nodemon app.js