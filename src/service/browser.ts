import { format, Url } from 'url';
import { Document, PuppeteerDocument } from '../dom';
import { Browser, LaunchOptions, NavigationOptions, Page, Response } from 'puppeteer';
import Chromium from 'chrome-aws-lambda';
import { Optional } from '../util';

export interface BrowserService {
  fetch(url: Url, options?: { [name: string]: any }): Promise<Document>;

  close(): Promise<void>;
}

export class ChromiumBrowserService implements BrowserService {
  private readonly browser: Browser;

  static async create(options: { [name: string]: any } = {}): Promise<ChromiumBrowserService> {
    const defaultOptions: LaunchOptions = {
      args: Chromium.args,
      defaultViewport: Chromium.defaultViewport,
      executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'] || (await Chromium.executablePath),
      headless: Chromium.headless,
    };
    const launchOptions: LaunchOptions = { ...defaultOptions, ...options };
    const browser: Browser = await Chromium.puppeteer.launch(launchOptions);
    return new ChromiumBrowserService(browser);
  }

  constructor(browser: Browser) {
    this.browser = browser;
  }

  public async fetch(url: Url, options: { [name: string]: any } = {}): Promise<Document> {
    const page: Page = await this.browser.newPage();
    const navigationOptions: NavigationOptions = { waitUntil: 'networkidle2' };
    const response: Response = Optional.ofNullable<Response>(
      await page.goto(format(url), navigationOptions)
    ).orElseThrow(() => new Error(`Received no response from ${url}`));
    console.info(`Received ${response.status()} from ${format(url)}`);
    return PuppeteerDocument.create(page);
  }

  public async close(): Promise<void> {
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
