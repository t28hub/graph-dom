import { IResolverObject } from 'graphql-tools';
import { parse } from 'url';
import { Context } from '../context';
import { Document } from '../../dom';

export const resolver: IResolverObject = {
  page: async (parent: any, args: { url: string }, context: Context): Promise<Document> => {
    const { url } = args;
    const parsed = parse(url);
    return await context.browser.fetch(parsed);
  },
};
