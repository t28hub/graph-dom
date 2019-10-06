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

import { Injectable, ProviderScope } from '@graphql-modules/di';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

@Injectable({
  scope: ProviderScope.Application,
  overwrite: false,
})
export class AxiosProvider {
  private readonly instance: AxiosInstance;

  public constructor() {
    const config: AxiosRequestConfig = {
      timeout: 5000,
    };
    this.instance = axios.create(config);
  }

  public provideInstance(): AxiosInstance {
    return this.instance;
  }
}
