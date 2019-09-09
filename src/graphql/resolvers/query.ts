import { IResolverObject } from 'graphql-tools';
import { parse } from 'url';
import { Context } from '../context';
import { Document } from '../../dom';

export const resolver: IResolverObject = {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  page: async (parent: any, args: { url: string }, context: Context): Promise<Document> => {
    const { url } = args;
    const parsed = parse(url);
    const { robotsFetcher, browserService } = context;
    const robotsTxt = await robotsFetcher.fetch(parsed);
    if (!robotsTxt.isAllowed(parsed)) {
      throw new Error('Specified URL is not allowed to fetch');
    }
    return await browserService.fetch(parsed);
  },
};
