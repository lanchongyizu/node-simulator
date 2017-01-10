# node-simulator

The node-simulator is an utility to create lightweight nodes to execute sequence tasks, such as `HTTP` or `TFTP` requests.
It can be used to quickly setup large scale testing environment, which is faster than setting up hundreds of VMs.

**Features:**
* http request
* tftp request
* sequence tasks
* variable runtime extracting and rendering
* summary report(TODO)

## Quick start

```
git clone https://github.com/lanchongyizu/node-simulator.git
cd node-simulator
npm install
node index.js
```

## Configuration

The global parameters are configured in [config.js](config.js).

### Configuration Parameters

| parameter | description |
| --------- | ----------- |
| httpRequestBase | the http request base **(reserved)** |
| tftpServer | the global tftp server IP, such as `172.31.128.1` |
| tftpPort | the global tftp port, such as `69` |
| headers | the global headers for http requests |
| fakeIpStart | an four-tuple array which indicates the starting fake IP address, such as [188, 1, 1, 2] |
| fakeMacStart | an six-tuple array which indicates the starting fake MAC address, such as [0xF1, 0xF2, 1, 1, 1, 1] |
| outputDirectory | **(optional)** the output directory for temporary downloaded files, the default value is 'tmp/' |
| nodesTemplate | the nodes configuration file, such as `data/nodes.ejs` |
| tasksTemplate | the tasks configuration file, such as `data/tasks.ejs` |
| logLevel | **(optional)** the log level, the default value is `info` |
| logFile | **(optional)** the log file, the default value is `node-simulator.log` |


Example:

```javascript
'use strict';

module.exports = {
    httpRequestBase: 'http://172.31.128.1:9080/api/current',
    tftpServer: '172.31.128.1',
    tftpPort: 69,
    headers: {
        'X-Real-IP': '<?=node.ip?>',
        'X-RackHD-API-proxy-ip': '127.0.0.1',
        'X-RackHD-API-proxy-port': '7180'
    },
    fakeIpStart: [188, 1, 1, 2],
    fakeMacStart: [0xF1, 0xF2, 1, 1, 1, 1],
    outputDirectory: 'tmp/',
    nodesTemplate: "data/nodes.ejs",
    tasksTemplate: "data/tasks.ejs",
    logLevel: "info",
    logFile: "node-simulator.log"
};
```

## Data

The node-simulator uses `ejs` template engine to render the data, and it has two passes.
The first pass renders `<%= %>`, and the second pass renders `<?= ?>` which works at the runtime.

### Nodes

The parameters in nodes array:

| parameter | description |
| --------- | ----------- |
| task | the task name to run on this group of nodes |
| count | the number of the nodes in the group |
| startDelay | the delay for the nodes in the group |
| delay | the delay between nodes |

Example:

[data/nodes.ejs](data/nodes.ejs)

```
{
    "nodes": [
        {
            "task": "discovery",
            "count": 50,
            "delay": 1000
        },
        {
            "startDelay": 10000,
            "task": "os intall",
            "count": 0,
            "delay": 2000
        }]
}
```

### Tasks

| parameter | description |
| --------- | ----------- |
| tasks | the task array |

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

| parameter | description |
| --------- | ----------- |
| name | the `unique` task name |
| jobs | the sequence jobs array |

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

| parameter | description |
| --------- | ----------- |
| protocol | the protocol to execute the job(`http` or `tftp`) |
| time | the delay before the job |
| log | **(optional)** the log info for the job |

* **HTTP parameters**

| parameter | description |
| --------- | ----------- |
| method | the method for http request(`GET`,`POST`..) |
| headers | the headers for the request, which overrides the global configuration |
| uri | the uri for http request |
| regularExpressionExtractor | **(optional)** an object includes the extracting parameters, please refer to the `regularExpressionExtractor` table |
| body | **(optional)** the body for `POST` request |


**regularExpressionExtractor:**

| parameter | description |
| --------- | ----------- |
| regularExpression | the regular expression, such as `tasksPath = '\/api\/current\/tasks\/([a-z0-9]*)'` |
| referenceName | the variable name to be assigned the match value, such as `nodeId` |
| matchNumber | the index number in the matches array, the default value is `0` |

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
"time": 1000
```

* **TFTP parameters**

Currently, only support getting file from tftp server.

| parameter | description |
| --------- | ----------- |
| tftpServer | the tftp server IP, which overrides the global configuration |
| tftpPort | the tftp port, which overrides the global configuration |
| fileName | the file name |

Example:

```
"log": "Tftp get profile",
"protocol": "tftp",
"tftpServer": "172.31.128.1",
"tftpPort": 69,
"fileName": "monorail.ipxe",
"time": 1000
```
