import {APIGatewayEvent, Context, Callback, Handler} from 'aws-lambda';
import Chromium from 'chrome-aws-lambda';
import {Browser, LaunchOptions, NavigationOptions, Page} from 'puppeteer-core';
import {install} from 'source-map-support';

install();

const requireNotNull = <T>(arg: T | null, name: string = 'arg'): T => {
  if (arg == null) {
    throw new TypeError(`${name} == null`);
  }
  return arg!;
};

// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
export const handler: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  let browser: Browser | null = null;
  let page: Page | null = null;
  try {
    const launchOptions: LaunchOptions = {
      args: Chromium.args,
      defaultViewport: Chromium.defaultViewport,
      executablePath: await Chromium.executablePath,
      headless: Chromium.headless,
    };
    browser = await Chromium.puppeteer.launch(launchOptions);

    page = await browser.newPage();

    const url = 'https://speakerdeck.com/pirosikick/puppeteerdeiranaicsswoxiao-su';
    const navigationOptions: NavigationOptions = {
      waitUntil: 'networkidle2'
    };
    await page.goto(url, navigationOptions);

    const title = await page.$('meta[property="og:title"]')
      .then(element => {
        const found = requireNotNull(element, 'element');
        return found.getProperty('content')
      })
      .then(js => js.jsonValue());
    context.succeed({
      statusCode: 200,
      body: JSON.stringify({title}),
    });
  } catch (error) {
    context.fail(error);
  } finally {
    if (page !== null) {
      await page.close();
    }
    if (browser !== null) {
      browser.disconnect();
    }
  }
};
