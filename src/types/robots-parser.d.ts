declare module 'robots-parser' {
  export interface Robots {
    isAllowed(url: string, userAgent?: string): boolean | undefined;

    isDisallowed(url: string, userAgent?: string): boolean | undefined;

    getCrawlDelay(userAgent: string): number | undefined;

    getMatchingLineNumber(url: string, userAgent?: string): number | undefined;

    getPreferredHost(): string | null | undefined;

    getSitemaps(): Array<string>;
  }

  function parse(url: string, contents: string): Robots;

  export default parse;
}
