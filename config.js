'use strict';

module.exports = {
    httpRequestBase: 'http://172.31.128.1:9080/api/current',
    tftpHost: '172.31.128.1',
    tftpPort: 69,
    redisHost: process.env.REDIS_HOST || '127.0.0.1',
    redisPort: 6379,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost/ns',
    amqpUri: process.env.AMQP_URI || 'amqp://localhost',
    servicePort: 9000,
    headers: {
        'X-Real-IP': '<?=node.ip?>',
        'X-RackHD-API-proxy-ip': '127.0.0.1',
        'X-RackHD-API-proxy-port': '7180'
    },
    fakeIpStart: [188, 1, 1, 2],
    fakeMacStart: [0xF1, 0xF2, 1, 1, 1, 1],
    outputDirectory: 'tmp/',
    tasksTemplate: "data/tasks.ejs",
    logConsoleLevel: "info",
    logFileLevel: "info",
    logFileMaxSize: 1048576,
    logFile: "node-simulator.log"
};
