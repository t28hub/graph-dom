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

import gql from 'graphql-tag';
import { queryComplexity } from '../../src/plugins';

describe('queryComplexity', () => {
  test('should instantiate plugin that has requestDidStart method', () => {
    // Arrange
    // language=graphql
    const schema = gql`
      schema {
        query: Query
      }
      
      type Query {
        ping: String!
      }
    `;

    // Act
    const plugin = queryComplexity(schema, 2);

    // Assert
    expect(plugin).toHaveProperty('requestDidStart');
    expect(plugin).not.toHaveProperty('serverWillStart');
  });
});
