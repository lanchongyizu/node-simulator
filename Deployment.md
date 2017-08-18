# Deployment of 1000 nodes for [RackHD](https://github.com/rackhd)

## Deploy Node Simulator Master on a VM

* Install MongoDB, Redis, RabbitMQ
* Install and start Node Simulator Master
```
git clone https://github.com/lanchongyizu/node-simulator.git
cd node-simulator
npm install
node index.js
```

##  Deploy [ipmisim](https://github.com/lanchongyizu/ipmisim) and Node Simulator Workers on less than 20 VMs(Since ipmisim can only support 63 concurrent requests)

* Install ipmisim
```
echo "deb https://dl.bintray.com/rackhd/debian trusty main" | sudo tee -a /etc/apt/sources.list
sudo apt-get update
sudo apt-get install ipmisim
```

* Installl Node Simulator Worker
```
git clone https://github.com/lanchongyizu/node-simulator.git
cd node-simulator
npm install
```

* Config Node Simulator Worker
```
# config.js, $MASTER_IP is the IP address of the Node Simulator Master
    tftpHost: '172.31.128.1',
    tftpPort: 69,
    redisHost: process.env.REDIS_HOST || '$MASTER_IP',
    redisPort: 6379,
    mongoUri: process.env.MONGODB_URI || 'mongodb://$MASTER_IP/ns',
    amqpUri: process.env.AMQP_URI || 'amqp://$MASTER_IP',
#data/catalogs/bmc.ejs, $BMC_IP is the IP of the Node Simulator Worker
    Replace '172.31.128.28' to '$BMC_IP'
```

* Start Node Simulator Worker
```
node app.js
```
