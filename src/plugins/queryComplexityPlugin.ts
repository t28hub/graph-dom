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

import { ApolloError } from 'apollo-server-errors';
import { GraphQLSchema, separateOperations } from 'graphql';
import { fieldExtensionsEstimator, getComplexity, simpleEstimator } from 'graphql-query-complexity';
import {
  ApolloServerPlugin,
  GraphQLRequestContext,
  GraphQLRequestListener,
  WithRequired,
} from 'apollo-server-plugin-base';

type RequestContext<T> = WithRequired<
  GraphQLRequestContext<T>,
  'metrics' | 'source' | 'document' | 'operationName' | 'operation'
>;

class QueryTooComplexError extends ApolloError {
  public constructor(message: string) {
    super(message, 'QUERY_TOO_COMPLEX');

    Object.defineProperty(this, 'name', { value: 'QueryTooComplexError' });
  }
}

export const queryComplexity = (schema: GraphQLSchema, limit: number): ApolloServerPlugin => ({
  requestDidStart<T>(_: GraphQLRequestContext<T>): GraphQLRequestListener<T> {
    return {
      didResolveOperation({ request, document }: RequestContext<T>): void {
        const { operationName, variables } = request;
        if (operationName === 'IntrospectionQuery') {
          return;
        }

        const query = operationName ? separateOperations(document)[operationName] : document;
        const complexity = getComplexity({
          query,
          schema,
          variables,
          estimators: [fieldExtensionsEstimator(), simpleEstimator({ defaultComplexity: 1 })],
        });

        if (complexity > limit) {
          throw new QueryTooComplexError(`Query complexity is exceeded limit(${limit}): Complexity=${complexity}`);
        }
      },
    };
  },
});
