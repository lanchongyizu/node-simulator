# node-simulator

The node-simulator is an application to create lightweight nodes to execute sequence tasks, such as `HTTP` or `TFTP` requests.
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
npm start
```

## Configuration

The global parameters are configured in [config.js](config.js).

### Configuration Parameters

| parameter       | description                                                                                                                                                                              |
| :-------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  |
| httpRequestBase | the http request base **(reserved)**                                                                                                                                                     |
| tftpHost        | the global tftp host IP, such as `172.31.128.1`                                                                                                                                          |
| tftpPort        | the global tftp port, such as `69`                                                                                                                                                       |
| headers         | the global headers for http requests                                                                                                                                                     |
| fakeIpStart     | an four-tuple array which indicates the starting fake IP address, such as [188, 1, 1, 2]                                                                                                 |
| fakeMacStart    | an six-tuple array which indicates the starting fake MAC address, such as [0xF1, 0xF2, 1, 1, 1, 1]                                                                                       |
| outputDirectory | **(optional)** the output directory for temporary downloaded files, the default value is 'tmp/'                                                                                          |
| tasksTemplate   | the tasks configuration file, such as `data/tasks.ejs`                                                                                                                                   |
| logConsoleLevel | **(optional)** the log level for console, the default value is `info`                                                                                                                    |
| logFileLevel    | **(optional)** the log level for logFile, the default value is `info`                                                                                                                    |
| logFileMaxSize  | **(optional)** Max size in bytes of the logFile, if the size is exceeded then a new file is created, a counter will become a suffix of the log file, the default value is `1048576 (1M)` |
| logFile         | **(optional)** the log file, the default value is `node-simulator.log`                                                                                                                   |


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

The node-simulator uses `ejs` template engine to render the data, and it has two passes.
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

| parameter   | description                                       |
| :---------- | :------------------------------------------------ |
| protocol    | the protocol to execute the job(`http` or `tftp`) |
| delayBefore | the delay before the job                          |
| log         | **(optional)** the log info for the job           |

* **HTTP parameters**

| parameter                  | description                                                                                                         |
| :------------------------- | :-----------------------------------------------------------------------------------------------------------------  |
| method                     | the method for http request(`GET`,`POST`..)                                                                         |
| headers                    | the headers for the request, which overrides the global configuration                                               |
| uri                        | the uri for http request                                                                                            |
| regularExpressionExtractor | **(optional)** an object includes the extracting parameters, please refer to the `regularExpressionExtractor` table |
| body                       | **(optional)** the body for `POST` request                                                                          |


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

