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

import { GraphQLModule } from '@graphql-modules/core';
import { DocumentDataSource } from './document/documentDataSource';
import { LoadEventTranslator, OptionsTranslator, UrlTranslator } from './query/translator';
import { InfrastructureModule } from '../infrastructure';
import { RobotsTxtTranslator } from './robots/translator/robotsTxtTranslator';
import { RobotsService } from './robots/robotsService';

export * from './attribute/attribute';
export * from './data/data';
export * from './node/node';
export * from './document/document';
export * from './element/element';
export * from './node/nodeImpl';
export * from './document/documentImpl';
export * from './element/elementImpl';

export const DomainModule = new GraphQLModule({
  providers: [
    RobotsTxtTranslator,
    RobotsService,
    DocumentDataSource,
    LoadEventTranslator,
    OptionsTranslator,
    UrlTranslator,
  ],
  imports: [InfrastructureModule],
});
