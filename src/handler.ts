import {format, parse, Url} from 'url';
import {ApolloServer, Config, gql, IResolvers} from 'apollo-server-lambda';
import {APIGatewayEvent, APIGatewayProxyResult, Handler} from 'aws-lambda';
import Chromium from 'chrome-aws-lambda';
import {Browser, LaunchOptions, NavigationOptions, Page} from 'puppeteer-core';
import {install} from 'source-map-support';
import {requireNotNull} from './utils';

install();

const schema = gql`
    type Query {
        page(url: String!): Response!
    }

    type Response {
        title: String
    }
`;

interface Response {
  title: String,
}

const fetch = async (url: Url): Promise<Response> => {
  console.info(url);
  let response: Response | undefined;
  let browser: Browser | undefined;
  let page: Page | undefined;
  try {
    const launchOptions: LaunchOptions = {
      args: Chromium.args,
      defaultViewport: Chromium.defaultViewport,
      executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'] || await Chromium.executablePath,
      headless: Chromium.headless,
    };
    browser = await Chromium.puppeteer.launch(launchOptions);

    page = await browser.newPage();

    const navigationOptions: NavigationOptions = {
      waitUntil: 'networkidle2'
    };
    await page.goto(format(url), navigationOptions);

    const title = await page.$('meta[property="og:title"]')
      .then(element => {
        const found = requireNotNull(element, 'element');
        return found.getProperty('content')
      })
      .then(js => js.jsonValue());

    response = {
      title,
    };
    console.info(response);
  } catch (e) {
    console.warn('Unexpected error occurred', e);
  } finally {
    if (page) {
      await page.close();
    }
    if (browser) {
      browser.disconnect();
      await browser.close();
    }
  }

  if (!response) {
    throw new Error();
  }
  return response;
};

const resolvers: IResolvers = {
  Query: {
    page: async (source: any, args: { [name: string]: any }): Promise<Response> => {
      const url = parse(args['url'] || '');
      console.info(url);
      return await fetch(url);
    }
  }
};

const config: Config = {
  typeDefs: schema,
  resolvers,
  playground: true,
  tracing: true,
};
const server = new ApolloServer(config);

// noinspection JSUnusedGlobalSymbols
export const handler: Handler<APIGatewayEvent, APIGatewayProxyResult> = server.createHandler({
  cors: {origin: '*'},
});
