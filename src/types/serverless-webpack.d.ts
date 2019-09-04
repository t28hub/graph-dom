declare module 'serverless-webpack' {
  import { Entry, EntryFunc } from 'webpack';

  export const lib: {
    entries: string | string[] | Entry | EntryFunc;
    webpack: {
      isLocal: boolean;
    };
  };
}
