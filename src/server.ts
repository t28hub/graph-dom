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

import { install } from 'source-map-support';
import app from './app';
import { getLogger } from './util/logging';
import { getConfig } from './config';

install();

const logger = getLogger();
const config = getConfig();

const mode = config.mode;
const port = config.server.port;
app.listen(port, () => {
  logger.info('Application is running at http://localhost:%d in %s mode', port, mode);
});
