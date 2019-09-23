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

export function validate(condition: boolean, message: string): void {
  if (condition) {
    return;
  }
  throw new UserInputError(message);
}

export function validateUrl(input: string, allowedProtocols: string[] = ['http:', 'https:']): void {
  let parsed!: Url;
  try {
    parsed = parse(input);
  } catch (e) {
    throw new UserInputError(`URL is invalid: ${input}`);
  }

  validate(parsed.protocol !== null, `URL must contain protocol: ${input}`);
  validate(allowedProtocols.includes(`${parsed.protocol}`), `URL contains disallowed protocol: ${input}`);
}

// https://www.w3.org/TR/2011/WD-html5-20110525/elements.html#the-id-attribute
export function validateId(input: string): void {
  validate(input.length !== 0, `ID must contain at least 1 char`);

  // https://www.w3.org/TR/2011/WD-html5-20110525/common-microsyntaxes.html#space-character
  validate(!/\s/.test(input), `ID must not contain any space chars: ${input}`);
}

// https://www.w3.org/TR/2011/WD-html5-20110525/elements.html#classes
export function validateClassName(input: string): void {
  validate(input.length !== 0, `Class name must contain at least 1 char`);

  const found = input.split(/\s/).find((className: string): boolean => {
    const trimmed = className.trim();
    return trimmed.length === 0;
  });
  validate(found === undefined, `Class name ${input} contains invalid class name: ${found}`);
}

export function validateTagName(input: string): void {
  validate(input.length !== 0, `Tag name must contain at least 1 char`);
}

export function validateSelector(input: string): void {
  validate(input.length !== 0, `Selector must contain at least 1 char`);
}

export function validateAttributeName(input: string): void {
  validate(input.length !== 0, `Attribute name must contain at least 1 char`);
}
