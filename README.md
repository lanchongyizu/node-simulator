# Node Simulator

[![Build Status](https://travis-ci.org/lanchongyizu/node-simulator.svg?branch=master)](https://travis-ci.org/lanchongyizu/node-simulator)

Node Simulator is an application to create virtual lightweight node clusters to execute sequence tasks, such as `HTTP` or `TFTP` requests.
It can be used to quickly setup large scale testing environment, which is faster than setting up hundreds of VMs or Physical Machines.

![Design Diagram](/img/design_diagram.png)

* Tasks are evenly distributed on workers.
* Taskrunner is a node instance.

**Features:**
* http request
* tftp request
* sequence tasks
* variable runtime extracting and rendering
* result query

## Prequisites

* MongoDB
* Redis
* RabbitMQ

## Quick start

```
# Start master
git clone https://github.com/lanchongyizu/node-simulator.git
cd node-simulator
npm install
npm start
# Or use pm2 to start Node Simulator
pm2 start node-simulator.yml

# Start workers
git clone https://github.com/lanchongyizu/node-simulator.git
cd node-simulator
npm install
node app.js

# Check the code quality:
npm run lint
```

Visit the swagger UI on http://{host}:{port}/docs.

* use `POST /nodegroups` to create a group of nodes
* use `POST /nodegroups/{nodegroupId}/tasks/{taskName}` to run `taskName` on Node Group `nodegroupId`

## Use Docker to run Node Simulator

[Docker Engine 1.13.0+](https://www.docker.com/community-edition) and [Docker Compose 1.10+](https://docs.docker.com/compose) are required.

```
cd node-simulator

# Use Docker Compose
docker-compose up

# Or use the swarm mode
docker swarm init
docker stack deploy -c docker-compose.yml node-simulator
```

## Configuration

The global parameters are configured in [config.js](config.js).

### Configuration Parameters

| parameter       | description                                                                                                                                                                              |
| :-------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  |
| httpRequestBase | the http request base **(reserved)**                                                                                                                                                     |
| tftpHost        | the global tftp host IP, such as `172.31.128.1`                                                                                                                                          |
| tftpPort        | the global tftp port, such as `69`                                                                                                                                                       |
| redisHost       | the global redis host IP, such as `127.0.0.1`                                                                                                                                            |
| redisPort       | the global redis port, such as `6379`                                                                                                                                                    |
| mongoUri        | the URI of MongoDB, such as `mongodb://localhost/ns`                                                                                                                                     |
| servicePort     | the port of Node Simulator, such as `9000`                                                                                                                                               |
| headers         | the global headers for http requests                                                                                                                                                     |
| webhook         | the third party webhook config                                                                                                                                                           |
| fakeIpStart     | an four-tuple array which indicates the starting fake IP address, such as [188, 1, 1, 2]                                                                                                 |
| fakeMacStart    | an six-tuple array which indicates the starting fake MAC address, such as [0xF1, 0xF2, 1, 1, 1, 1]                                                                                       |
| outputDirectory | **(optional)** the output directory for temporary downloaded files, the default value is 'tmp/'                                                                                          |
| tasksTemplate   | the tasks configuration file, such as `data/tasks.ejs`                                                                                                                                   |
| logConsoleLevel | **(optional)** the log level for console, the default value is `info`                                                                                                                    |
| logFileLevel    | **(optional)** the log level for logFile, the default value is `info`                                                                                                                    |
| logFileMaxSize  | **(optional)** Max size in bytes of the logFile, if the size is exceeded then a new file is created, a counter will become a suffix of the log file, the default value is `1048576 (1M)` |
| logFile         | **(optional)** the log file, the default value is `node-simulator.log`                                                                                                                   |

###  Third Party Webhook Config

| parameter     | description                                      |
| :-----------  | :----------------------------------------------- |
| contextNodeId | the path of contextNodeId in the payload         |
| taskName      | the path of taskName in the payload              |
| taskMappings  | the mappings of taskName in the payload to Task  |

Example:

```javascript
'use strict';

module.exports = {
    httpRequestBase: 'http://172.31.128.1:9080/api/current',
    tftpHost: '172.31.128.1',
    tftpPort: 69,
    headers: {
        'X-Real-IP': '<?=node.ip?>',
        'X-RackHD-API-proxy-ip': '127.0.0.1',
        'X-RackHD-API-proxy-port': '7180'
    },
    webhook: {
        contextNodeId: 'nodeId',
        taskName: 'data.graphName',
        taskMappings: {
            'Install ESXi': 'install-esxi',
            'Install CentOS': 'install-centos-6'
        },
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
```

## Data

The Node Simulator uses `ejs` template engine to render the data, and it has two passes.
The first pass renders `<%= %>`, and the second pass renders `<?= ?>` which works at the runtime.

### Tasks

| parameter  | description    |
| :--------- | :------------- |
| tasks      | the task array |

Example:

[data/tasks.ejs](data/tasks.ejs)

```
{
    "tasks": [
        {
            <%- include("tasks/discovery.ejs") %>
        },
        {
            <%- include("tasks/os-install.ejs") %>
        }]
}
```

### Task

| parameter  | description             |
| :--------- | :---------------------  |
| name       | the `unique` task name  |
| jobs       | the sequence jobs array |

Example:

```
"name": "discovery",
"jobs": [
    {
        <%- include("../jobs/http/get-profile.ejs") %>
    }]
```

### Job

* **Common parameters**

`randomDelay*` has priority over `delay*`.
If `ignoreFailure` is set to `true`, `retry` and `retryDelay` don't work.

| parameter         | description                                                                                     |
| :---------------- | :-------------------------------------------------------------------------------------------    |
| protocol          | the protocol to execute the job(`http` or `tftp`)                                               |
| delayBefore       | **(optional)** the delay before the job                                                         |
| delayAfter        | **(optional)** the delay after the job                                                          |
| randomDelayBefore | **(optional)** the random range of the delay before the job, e.g.`[500, 600]`                   |
| randomDelayAfter  | **(optional)** the random range of the delay after the job, e.g.`[500, 600]`                    |
| retry             | **(optional)** the times to retry the job when it fails, and `-1` means that it retries forever |
| retryDelay        | **(optional)** the delay between the retries                                                    |
| log               | **(optional)** the log info for the job                                                         |
| ignoreFailure     | **(optional)** whether to ignore the failure of the job, the default value is `false`           |

* **Batch jobs parameters**

Batch jobs have the same `Common parameters`. And we also provide below parameters to override some parameters of the first and last job.

| parameter              | description                                                                          |
| :--------------------  | :----------------------------------------------------------------------------------- |
| firstDelayBefore       | **(optional)** the delay before the first job                                        |
| lastDelayAfter         | **(optional)** the delay after the last job                                          |
| firstRandomDelayBefore | **(optional)** the random range of the delay before the first job, e.g.`[500, 600]`  |
| lastRandomDelayAfter   | **(optional)** the random range of the delay after the last job, e.g.`[500, 600]`    |

* **HTTP parameters**

| parameter                  | description                                                                                                         |
| :------------------------- | :-----------------------------------------------------------------------------------------------------------------  |
| method                     | the method for http request(`GET`,`POST`..)                                                                         |
| headers                    | the headers for the request, which overrides the global configuration                                               |
| uri                        | the uri for http request                                                                                            |
| basePath                   | the basePath for http batch request, used together with baseNames which disables `uri`                              |
| baseNames                  | the baseNames for http batch request                                                                                |
| regularExpressionExtractor | **(optional)** an object includes the extracting parameters, please refer to the `regularExpressionExtractor` table |
| body                       | **(optional)** the body for `POST` request                                                                          |
| saveFile                   | **(optional)** whether to save the response, the default value is `false`                                           |


**regularExpressionExtractor:**

| parameter         | description                                                                        |
| :---------------- | :--------------------------------------------------------------------------------- |
| regularExpression | the regular expression, such as `tasksPath = '\/api\/current\/tasks\/([a-z0-9]*)'` |
| referenceName     | the variable name to be assigned the match value, such as `nodeId`                 |
| matchNumber       | the index number in the matches array, the default value is `0`                    |

Example:

```
"protocol": "http",
"method": "GET",
"headers": {
    "X-Real-IP": "<?=node.ip?>",
    "X-RackHD-API-proxy-ip": "127.0.0.1",
    "X-RackHD-API-proxy-port": "7180"
},
"uri": "http://172.31.128.1:9080/api/current/tasks/bootstrap.js?macAddress=<?=node.mac?>",
"regularExpressionExtractor": {
    "regularExpression": "tasksPath = '\/api\/current\/tasks\/([a-z0-9]*)'",
    "referenceName": "nodeId",
    "matchNumber": 1
},
"delayBefore": 1000
```

* **TFTP parameters**

Currently, only support getting file from tftp server.

| parameter  | description                                                |
| :--------- | :--------------------------------------------------------- |
| tftpHost   | the tftp host IP, which overrides the global configuration |
| tftpPort   | the tftp port, which overrides the global configuration    |
| fileName   | the file name                                              |

Example:

```
"log": "Tftp get profile",
"protocol": "tftp",
"tftpHost": "172.31.128.1",
"tftpPort": 69,
"fileName": "monorail.ipxe",
"delayBefore": 1000
```

