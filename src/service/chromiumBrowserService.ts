import { Browser, LaunchOptions, NavigationOptions, Page, Response } from 'puppeteer';
import Chromium from 'chrome-aws-lambda';
import { format, Url } from 'url';
import { Document, PuppeteerDocument } from '../dom';
import { Optional } from '../util';
import { BrowserService, Options } from './browserService';

export class ChromiumBrowserService implements BrowserService {
  /* eslint-disable-next-line */
  public static async create(options: { [name: string]: any } = {}): Promise<ChromiumBrowserService> {
    // TODO: Remove temporary implementation
    const browserPath =
      process.env.NODE_ENV === 'development'
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : await Chromium.executablePath;
    const defaultOptions: LaunchOptions = {
      args: Chromium.args,
      defaultViewport: Chromium.defaultViewport,
      executablePath: browserPath,
      headless: Chromium.headless,
    };
    const launchOptions: LaunchOptions = { ...defaultOptions, ...options };
    const browser: Browser = await Chromium.puppeteer.launch(launchOptions);
    return new ChromiumBrowserService(browser);
  }

  public constructor(private readonly browser: Browser) {}

  public async fetch(url: Url, options: Options = {}): Promise<Document> {
    const page: Page = await this.browser.newPage();
    const { timeout, userAgent } = options;
    if (timeout !== undefined) {
      page.setDefaultTimeout(timeout);
    }
    if (userAgent !== undefined) {
      await page.setUserAgent(userAgent);
    }

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
