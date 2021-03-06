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

import { Robots } from 'robots-parser';
import { format, Url } from 'url';
import { RobotsTxt } from './robotsTxt';

export class RobotsTxtImpl implements RobotsTxt {
  public constructor(private readonly robots: Robots) {}

  public isAllowed(url: Url, userAgent?: string): boolean {
    const urlString = format(url);
    return this.robots.isAllowed(urlString, userAgent) || false;
  }
}
