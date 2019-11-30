# GraphDOM
[![CircleCI Build Status](https://circleci.com/gh/t28hub/graph-dom/tree/master.svg?style=shield&circle-token=af937781f52f3988d85743c0c65dac4602660765)](https://circleci.com/gh/t28hub/graph-dom/tree/master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=t28hub/graph-dom&identifier=202957325)](https://app.dependabot.com/accounts/t28hub/repos/202957325)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ft28hub%2Fgraph-dom.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ft28hub%2Fgraph-dom?ref=badge_shield)

Extract web data by GraphQL and DOM API.
![GraphDOM Logo](logo.png)

## Environment Variables
Environment variables are the follows and every variable is optional.
* `NODE_ENV`: `development` or `production`.(Defaults to `development`)
* `SERVER_PORT`: Port listened by the GraphDOM.(Defaults to `8080`)
* `LOG_LEVEL`: `DEBUG`, `INFO`, `WARN`, `ERROR` or `TRACE`.(Defaults to `INFO`)
* `APOLLO_API_KEY`: API key for the Apollo [GraphManager](https://engine.apollographql.com/).
* `APOLLO_SCHEMA_TAG`: Tag name of a GraphQL schema.
* `BROWSER_PATH`: Path to a browser.(Defaults to detect automatically)
* `BROWSER_HEADLESS`: Whether to launch browser in headless mode.(Defaults to `true`) 
* `REDIS_URL`: URL used to connect to Redis. If the environment variable is not set, the GraphDOM uses in-memory as a cache.

See [.env.example](./.env.example).

## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ft28hub%2Fgraph-dom.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ft28hub%2Fgraph-dom?ref=badge_large)
