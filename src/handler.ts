import {format, parse, Url} from 'url';
import {ApolloServer, Config, IResolvers} from 'apollo-server-lambda';
import {GraphQLResponse} from 'apollo-server-types';
import {APIGatewayEvent, APIGatewayProxyResult, Handler} from 'aws-lambda';
import Chromium from 'chrome-aws-lambda';
import {Browser, LaunchOptions, NavigationOptions, Page, Response} from 'puppeteer-core';
import {install} from 'source-map-support';
import {Document, Element, Node, NodeType, PuppeteerDocument} from './dom';
import schema from './graphql/schema.graphql';
import {Optional} from './util';
import {Attribute} from './dom/attribute';

install();

interface Context {
  browser: BrowserService;
}

interface BrowserService {
  fetch(url: Url, options?: { [name: string]: any }): Promise<Document>

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

  public async fetch(url: Url, options: { [name: string]: any } = {}): Promise<Document> {
    const page: Page = await this.browser.newPage();
    const navigationOptions: NavigationOptions = {waitUntil: 'networkidle2'};
    const response: Response = Optional.ofNullable<Response>(await page.goto(format(url), navigationOptions))
      .orElseThrow(() => new Error(`Received no response from ${url}`));
    console.info(`Received ${response.status()} from ${format(url)}`);
    return PuppeteerDocument.create(page);
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

const fetch = async (url: Url, browser: BrowserService): Promise<Document> => {
  console.info(url);
  return await browser.fetch(url);
};

const resolvers: IResolvers = {
  Query: {
    page: async (parent: any, args: { url: string }, context: Context): Promise<Document> => {
      const url = parse(args['url']);
      return await fetch(url, context.browser);
    }
  },
  Node: {
    // noinspection JSUnusedLocalSymbols
    __resolveType: (node: Node): string | null => {
      return node.accept<string>({
        visitDocument(document: Document): string {
          return 'Document';
        },
        visitElement(element: Element): string {
          return 'Element';
        },
        defaultAction(node: Node): string {
          return '';
        }
      });
    },
  },
  Document: {
    head: async (document: Document): Promise<Element | null> => {
      return await document.head();
    },
    body: async (document: Document): Promise<Element | null> => {
      return await document.body();
    },
    nodeType: (document: Document): string => {
      const {nodeType} = document;
      return NodeType[nodeType];
    },
    getElementById: async (document: Document, args: { id: string }): Promise<Element | null> => {
      const {id} = args;
      return await document.getElementById(id);
    },
    getElementsByClassName: async (document: Document, args: { name: string }): Promise<Array<Element>> => {
      const {name} = args;
      return document.getElementsByClassName(name);
    },
    getElementsByTagName: async (document: Document, args: { name: string }): Promise<Array<Element>> => {
      const {name} = args;
      return document.getElementsByTagName(name);
    },
    querySelector: async (document: Document, args: { selector: string }): Promise<Element | null> => {
      const {selector} = args;
      return await document.querySelector(selector);
    },
    querySelectorAll: async (document: Document, args: { selector: string }): Promise<Array<Element>> => {
      const {selector} = args;
      return await document.querySelectorAll(selector);
    },
  },
  Element: {
    attributes: async (element: Element): Promise<Array<Attribute>> => {
      return element.attributes();
    },
    innerHTML: async (element: Element): Promise<string> => {
      return element.innerHTML();
    },
    outerHTML: async (element: Element): Promise<string> => {
      return element.outerHTML();
    },
    nodeType: (element: Element): string => {
      const {nodeType} = element;
      return NodeType[nodeType];
    },
    getAttribute: async (element: Element, args: { attributeName: string }, context: Context): Promise<string | null> => {
      const {attributeName} = args;
      return element.getAttribute(attributeName);
    },
    getElementsByClassName: async (element: Element, args: { name: string }): Promise<Array<Element>> => {
      const {name} = args;
      return element.getElementsByClassName(name);
    },
    getElementsByTagName: async (element: Element, args: { name: string }): Promise<Array<Element>> => {
      const {name} = args;
      return element.getElementsByTagName(name);
    },
    querySelector: async (element: Element, args: { selector: string }): Promise<Element | null> => {
      const {selector} = args;
      return await element.querySelector(selector);
    },
    querySelectorAll: async (element: Element, args: { selector: string }): Promise<Array<Element>> => {
      const {selector} = args;
      return await element.querySelectorAll(selector);
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
