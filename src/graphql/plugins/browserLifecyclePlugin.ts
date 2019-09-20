/*
 * Copyright 2019 Tatsuya Maki
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ApolloServerPlugin, GraphQLRequestContext } from 'apollo-server-plugin-base';
import { Context } from '../context';
import { GraphQLRequestListener } from 'apollo-server-plugin-base/src/index';
import { getLogger, Logger } from '../../util/logging';

export class BrowserLifecyclePlugin implements ApolloServerPlugin {
  private static readonly logger: Logger = getLogger(BrowserLifecyclePlugin.name);

  public requestDidStart<T = Context>(requestContext: GraphQLRequestContext<T>): GraphQLRequestListener<T> {
    return {
      willSendResponse: async (requestContext: GraphQLRequestContext<T>): Promise<void> => {
        // TODO: Not to use 'Double assertion'
        /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
        const context = (requestContext.context as any) as Context;
        const { logger } = BrowserLifecyclePlugin;
        const { browser } = context;
        try {
          await browser.dispose();
          logger.info('Disposed browser instance');
        } catch (e) {
          logger.warn('Failed to dispose browser instance: %s', e.message);
        }
      },
    };
  }
}
