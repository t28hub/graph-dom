import { Url } from 'url';
import { Document } from '../dom';

export type Options = Partial<{
  timeout: number;
  userAgent: string;
}>;

export interface BrowserService {
  fetch(url: Url, options?: Options): Promise<Document>;

  close(): Promise<void>;
}
