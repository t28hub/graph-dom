import {parse} from 'url';
import {APIGatewayEvent, Context, Callback, Handler} from 'aws-lambda';
import Chromium from 'chrome-aws-lambda';
import {Browser, LaunchOptions, NavigationOptions, Page} from 'puppeteer-core';
import {install} from 'source-map-support';
import {requireNotNull} from './utils';

install();

// noinspection JSUnusedGlobalSymbols
export const handler: Handler = async (event: APIGatewayEvent) => {
  const method = event.httpMethod;
  if (method !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: `HTTP method is not allowed: ${method}`
      }),
    };
  }

  const queries = event.queryStringParameters || {};
  const urlString = queries['url'];
  if (!urlString) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Required parameter \'url\' is missing'
      }),
    };
  }
  try {
    parse(urlString, true);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Given URL is invalid: ${urlString}`
      }),
    };
  }

  let browser: Browser | null = null;
  let page: Page | null = null;
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
    await page.goto(urlString, navigationOptions);

    const title = await page.$('meta[property="og:title"]')
      .then(element => {
        const found = requireNotNull(element, 'element');
        return found.getProperty('content')
      })
      .then(js => js.jsonValue());
    console.log({title});

    return {
      statusCode: 200,
      body: JSON.stringify({title}),
    };
  } catch (error) {
    // TODO: Respond 5xx with error message
  } finally {
    if (page !== null) {
      await page.close();
    }
    if (browser !== null) {
      browser.disconnect();
      await browser.close();
    }
  }
};
