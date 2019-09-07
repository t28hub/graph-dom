import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { format, Url, UrlObject } from 'url';
import { RobotsTxt } from './robotsTxt';

const STATUS_CODE_OK = 200;

export class RobotsFetcher {
  public constructor(private readonly axios: AxiosInstance) {}

  public async fetch(url: Url): Promise<RobotsTxt> {
    const robotsUrl: string = RobotsFetcher.buildRobotsUrl(url);
    console.info(`Fetching robots.txt file from ${robotsUrl}`);

    const response: AxiosResponse<string> = await this.fetchText(robotsUrl);
    const { status, statusText } = response;
    console.info(`Received response '${status} ${statusText}' from ${robotsUrl}`);

    if (status !== STATUS_CODE_OK) {
      throw new Error(`Received unexpected status '${status} ${statusText}' from ${robotsUrl}`);
    }
    return RobotsTxt.parse(url, response.data);
  }

  private async fetchText(urlString: string): Promise<AxiosResponse<string>> {
    try {
      const config: AxiosRequestConfig = {
        responseType: 'text',
      };
      return await this.axios.get<string>(urlString, config);
    } catch (e) {
      console.warn(`Failed to fetch text from ${urlString}`, e);
      throw new Error(`Failed to fetch text from ${urlString}`);
    }
  }

  private static buildRobotsUrl(url: Url): string {
    const { protocol, host } = url;
    const parts: UrlObject = {
      protocol,
      host,
      pathname: '/robots.txt',
    };
    return format(parts);
  }
}
