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

install();

const DEFAULT_PORT = 8081;
app.listen(app.get('port') || DEFAULT_PORT, () => {
  console.info(`Application is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
});

export default app;
