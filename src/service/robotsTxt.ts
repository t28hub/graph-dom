import { format, Url } from 'url';
import parse, { Robots } from 'robots-parser';

export class RobotsTxt {
  private constructor(private readonly source: Robots) {}

  public static parse(url: Url, content: string): RobotsTxt {
    const urlString = format(url);
    const parsed: Robots = parse(urlString, content);
    return new RobotsTxt(parsed);
  }

  public isAllowed(url: Url, userAgent?: string): boolean {
    const urlString = format(url);
    return this.source.isAllowed(urlString, userAgent) || false;
  }
}
