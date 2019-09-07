import { BrowserService } from '../service/browserService';
import { RobotsFetcher } from '../service/robotsFetcher';

export interface Context {
  readonly browserService: BrowserService;
  readonly robotsFetcher: RobotsFetcher;
}
