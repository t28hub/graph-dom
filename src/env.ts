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

import dotenv from 'dotenv';

/**
 * When application is running on the ZEIT Now, loading `.env` file is skipped.
 * Environment variable `NOW_REGION` is set, application is running on the ZEIT Now.
 * The ZEIT Now uses env properties declared in `now.json` for could development.
 * And it uses `.env` for local development.
 * https://zeit.co/docs/v2/environment-variables-and-secrets/
 */
if (process.env.NOW_REGION === undefined && process.env.CI === undefined) {
  const path = `.env.${process.env.NODE_ENV || 'development'}`;
  const { error } = dotenv.config({
    path,
    encoding: 'utf8',
  });

  if (error) {
    throw new Error(`Failed to load '${path}': ${error.message}`);
  }
}
