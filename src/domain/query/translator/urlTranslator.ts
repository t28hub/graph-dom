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
import { parse, Url } from 'url';
import { Translator } from '../../translator';
import { check } from '../../../util';

const ALLOWED_PROTOCOLS = ['http:', 'https:'];

export class UrlTranslator implements Translator<string, Url> {
  public translate(input: string): Url {
    check(input.length !== 0, `URL must not be empty`);

    let parsed!: Url;
    try {
      parsed = parse(input);
    } catch (e) {
      throw new UserInputError(`URL is invalid: URL=${input}`);
    }

    const { protocol } = parsed;
    check(protocol !== null, `URL must contain protocol: URL=${input}`);
    check(ALLOWED_PROTOCOLS.includes(`${protocol}`), `URL contains disallowed protocol: protocol=${protocol}`);
    return parsed;
  }
}
