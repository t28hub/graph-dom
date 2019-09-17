# GraphDOM [![CircleCI Build Status](https://circleci.com/gh/t28hub/graph-dom/tree/master.svg?style=shield&circle-token=af937781f52f3988d85743c0c65dac4602660765)](https://circleci.com/gh/t28hub/graph-dom/tree/master)
Web scraping and DOM traversing API with GraphQL.

## Environment Variables
| Name | Description | Value |
|:---|:---|:---|
| `NODE_ENV` | Application mode. | `development` or `production` |
| `GRAPH_DOM_SERVER_PORT` | Port listened by application. | `8081` |
| `GRAPH_DOM_LOGGING_LEVEL` | Log level to be output. | One of `debug`, `info`, `warn`, `error` and `trace` |
| `GRAPH_DOM_LOGGING_PATTERN` | Pattern of log message to be output. | `[%r] [%p] %c - %m%n` |
| `GRAPH_DOM_BROWSER_PATH` | Path to browser executable. | \- |
| `GRAPH_DOM_BROWSER_HEADLESS` | Whether to run browser in headless mode or not. | `true` or `false` |


## License
```
Copyright 2019 Tatsuya Maki

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
