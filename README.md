# GraphDOM
[![CircleCI Build Status](https://circleci.com/gh/t28hub/graph-dom/tree/master.svg?style=shield&circle-token=af937781f52f3988d85743c0c65dac4602660765)](https://circleci.com/gh/t28hub/graph-dom/tree/master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=t28hub/graph-dom&identifier=202957325)](https://app.dependabot.com/accounts/t28hub/repos/202957325)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ft28hub%2Fgraph-dom.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ft28hub%2Fgraph-dom?ref=badge_shield)

Extract web data by GraphQL and DOM API.
![GraphDOM Logo](logo.png)

## Environment Variables
| Name | Description | Value |
|:---|:---|:---|
| `NODE_ENV` | Application mode. | `development` or `production` |
| `GRAPH_DOM_SERVER_PORT` | Port listened by application. | `8081` |
| `GRAPH_DOM_LOGGING_LEVEL` | Log level to be output. | One of `debug`, `info`, `warn`, `error` and `trace` |
| `GRAPH_DOM_LOGGING_PATTERN` | Pattern of log message to be output. | `[%r] [%p] %c - %m%n` |
| `GRAPH_DOM_BROWSER_PATH` | Path to browser executable. | \- |
| `GRAPH_DOM_BROWSER_HEADLESS` | Whether to run browser in headless mode or not. Defaults to `true`. | `true` or `false` |

## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ft28hub%2Fgraph-dom.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ft28hub%2Fgraph-dom?ref=badge_large)
