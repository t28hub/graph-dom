import {format, parse, Url} from 'url';
import {ApolloServer, Config, gql, IResolvers} from 'apollo-server-lambda';
import {GraphQLResponse} from 'apollo-server-types';
import {APIGatewayEvent, APIGatewayProxyResult, Handler} from 'aws-lambda';
import Chromium from 'chrome-aws-lambda';
import {Browser, LaunchOptions, NavigationOptions, Page, Response} from 'puppeteer-core';
import {install} from 'source-map-support';

install();

const schema = gql`
    type Query {
        page(url: String!): PageObject!
    }

    type PageObject {
        title: String!
    }
`;

interface PageObject {
  title: String;
}

interface Context {
  browser: BrowserService;
}

interface BrowserService {
  fetch(url: Url, options?: { [name: string]: any }): Promise<PageObject>

  close(): Promise<void>
}

class ChromiumBrowserService implements BrowserService {
  browser: Browser;

  static async create(options: { [name: string]: any } = {}): Promise<ChromiumBrowserService> {
    const defaultOptions: LaunchOptions = {
      args: Chromium.args,
      defaultViewport: Chromium.defaultViewport,
      executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'] || await Chromium.executablePath,
      headless: Chromium.headless,
    };
    const launchOptions: LaunchOptions = {...defaultOptions, ...options};
    const browser: Browser = await Chromium.puppeteer.launch(launchOptions);
    return new ChromiumBrowserService(browser);
  }

  constructor(browser: Browser) {
    this.browser = browser;
  }

  async fetch(url: Url, options: { [name: string]: any } = {}): Promise<PageObject> {
    const page: Page = await this.browser.newPage();
    const navigationOptions: NavigationOptions = {waitUntil: 'networkidle2'};
    const response: Response | null = await page.goto(format(url), navigationOptions);
    if (response === null) {
      throw new Error(`Received no response from ${url}`);
    }
    console.info(`Received ${response.status()} from ${format(url)}`);

    return {
      title: await page.title(),
    };
  }

  async close(): Promise<void> {
    const pages: Page[] = await this.browser.pages();
    for (const page of pages) {
      const url: string = page.url();
      try {
        await page.close();
      } catch (e) {
        console.warn(`Failed to close a page ${url}`);
      }
    }

    try {
      await this.browser.close();
    } catch (e) {
      console.warn(`Failed to close a browser`);
    }
    this.browser.disconnect();
  }
}

const fetch = async (url: Url, browser: BrowserService): Promise<PageObject> => {
  console.info(url);
  return await browser.fetch(url);
};

const resolvers: IResolvers = {
  Query: {
    page: async (parent: any, args: { url: string }, context: Context): Promise<PageObject> => {
      const url = parse(args['url']);
      return await fetch(url, context.browser);
    }
  }
};

const config: Config = {
  typeDefs: schema,
  resolvers,
  context: async (): Promise<Context> => {
    return {
      browser: await ChromiumBrowserService.create(),
    }
  },
  formatResponse: (response: GraphQLResponse, options: { context: Context }): GraphQLResponse => {
    options.context.browser.close()
      .then(() => console.info('Browser service is closed'))
      .catch((cause: Error) => console.warn('Failed to close BrowserService', cause));
    return response;
  },
  playground: true,
  tracing: true,
};
const server = new ApolloServer(config);

// noinspection JSUnusedGlobalSymbols
export const handler: Handler<APIGatewayEvent, APIGatewayProxyResult> = server.createHandler({
  cors: {origin: '*'},
});
