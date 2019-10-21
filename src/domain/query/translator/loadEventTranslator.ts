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

import { UserInputError } from 'apollo-server-errors';
import { Translator } from './translator';
import { LoadEvent } from '../../browserDataSource';

export class LoadEventTranslator implements Translator<string, LoadEvent> {
  public translate(input: string): LoadEvent {
    switch (input) {
      case 'LOAD':
      case 'NETWORK_IDLE0':
      case 'NETWORK_IDLE2':
      case 'DOM_CONTENT_LOADED':
        return LoadEvent[input];
      default:
        throw new UserInputError(`Unknown load event: input=${input}`);
    }
  }
}
