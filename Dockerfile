FROM nodesource/wheezy:4.4.6

COPY . /node-simulator
WORKDIR /node-simulator

RUN npm install --ignore-scripts --production

CMD [ "node", "/node-simulator/index.js" ]
