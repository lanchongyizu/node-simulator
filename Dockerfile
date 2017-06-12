FROM nodesource/wheezy:4.4.6

WORKDIR /node-simulator
COPY . /node-simulator

RUN npm install --ignore-scripts --production

EXPOSE 9000

CMD [ "node", "/node-simulator/index.js" ]
