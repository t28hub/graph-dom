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

import { puppeteer } from 'chrome-aws-lambda';
import { config } from 'dotenv';

export enum Mode {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}

export interface Config {
  readonly mode: Mode;
  readonly browser: {
    readonly path: string;
    readonly headless: boolean;
  };
}

const loaded: Set<string> = new Set<string>();

function load(path: string, force: boolean): void {
  if (!force && loaded.has(path)) {
    return;
  }

  const { error } = config({
    path,
    encoding: 'utf8',
  });

  if (error) {
    throw new Error(`Failed to load '${path}': ${error}`);
  }
  loaded.add(path);
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed === true;
  } catch (e) {
    throw new TypeError(`Invalid boolean value: ${value}`);
  }
}

function parseMode(value: string | undefined, defaultValue: Mode = Mode.DEVELOPMENT): Mode {
  switch (value) {
    case 'development':
      return Mode.DEVELOPMENT;
    case 'production':
      return Mode.PRODUCTION;
    default:
      return defaultValue;
  }
}

export function getConfig(reload: boolean = false): Config {
  const mode: Mode = parseMode(process.env.NODE_ENV);
  /**
   * When application is running on the ZEIT Now, loading `.env` file is skipped.
   * Environment variable `NOW_REGION` is set, application is running on the ZEIT Now.
   * The ZEIT Now uses env properties declared in `now.json` for could development.
   * And it uses `.env` for local development.
   * https://zeit.co/docs/v2/environment-variables-and-secrets/
   */
  if (process.env.NOW_REGION === undefined) {
    load(`.env.${mode.toString()}`, reload);
  }

  return {
    mode,
    browser: {
      path: process.env.GRAPH_DOM_BROWSER_PATH || puppeteer.executablePath(),
      headless: parseBoolean(process.env.GRAPH_DOM_BROWSER_HEADLESS, false),
    },
  };
}
