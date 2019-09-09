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

declare module 'robots-parser' {
  export interface Robots {
    isAllowed(url: string, userAgent?: string): boolean | undefined;

    isDisallowed(url: string, userAgent?: string): boolean | undefined;

    getCrawlDelay(userAgent: string): number | undefined;

    getMatchingLineNumber(url: string, userAgent?: string): number | undefined;

    getPreferredHost(): string | null | undefined;

    getSitemaps(): Array<string>;
  }

  function parse(url: string, contents: string): Robots;

  export default parse;
}
