import {format, parse, Url} from 'url';
import {ApolloServer, Config, IResolvers} from 'apollo-server-lambda';
import {GraphQLResponse} from 'apollo-server-types';
import {APIGatewayEvent, APIGatewayProxyResult, Handler} from 'aws-lambda';
import Chromium from 'chrome-aws-lambda';
import {Browser, ElementHandle, LaunchOptions, NavigationOptions, Page, Response} from 'puppeteer-core';
import {install} from 'source-map-support';
import schema from './graphql/schema.graphql';

install();

class PageObject {
  page: Page;
  title: string;

  constructor(page: Page, title: string) {
    this.page = page;
    this.title = title;
  }

  public async queryAll(selector: string): Promise<Array<Node>> {
    const found: ElementHandle<Element>[] = await this.page.$$(selector);
    const promises: Promise<Node>[] = found.map(async (element: ElementHandle): Promise<Node> => await this.extractProperties(element));
    return Promise.all(promises);
  }

  public async query(selector: string): Promise<Node> {
    const found: ElementHandle | null = await this.page.$(selector);
    if (found === null) {
      throw new Error(`Could not find a element by ${selector}`);
    }
    return await this.extractProperties(found);
  }

  private async extractProperties(element: ElementHandle): Promise<Node> {
    const node = await this.page.evaluate((element: Element): SerializableNode => {
      return {
        name: element.nodeName,
        type: element.nodeType,
        text: element.textContent,
        value: element.nodeValue,
      };
    }, element);

    return {
      name: node.name,
      type: node.type,
      text: node.text,
      value: node.value,
    };
  }
}

interface Node {
  name: string;
  type: NodeType;
  text: string | null;
  value: string | null;
}

enum NodeType {
  ELEMENT_NODE = 1,
  ATTRIBUTE_NODE,
  TEXT_NODE,
  CDATA_SECTION_NODE,
  ENTITY_REFERENCE_NODE,
  ENTITY_NODE,
  PROCESSING_INSTRUCTION_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_TYPE_NODE,
  DOCUMENT_FRAGMENT_NODE,
  NOTATION_NODE,
}

interface SerializableNode {
  name: string;
  type: NodeType;
  text: string | null;
  value: string | null;
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

    return new PageObject(page, await page.title());
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
  },
  PageObject: {
    query: async (parent: PageObject, args: { selector: string }, context: Context): Promise<Node> => {
      const {selector} = args;
      return await parent.query(selector);
    },
    queryAll: async (parent: PageObject, args: { selector: string }, context: Context): Promise<Array<Node>> => {
      const {selector} = args;
      return await parent.queryAll(selector);
    },
  },
  Node: {
    type: (values: { type: NodeType }) => {
      const {type} = values;
      return NodeType[type];
    },
  },
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
