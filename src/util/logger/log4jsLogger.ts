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

import log4js, { Levels, Logger } from 'log4js';
import { Logger as ILogger } from './logger';
import { Level } from './level';

/* eslint-disable  @typescript-eslint/no-explicit-any */
export class Log4jsLogger implements ILogger {
  public constructor(private readonly logger: Logger) {}

  public setLevel(level: Level): void {
    this.logger.level = Log4jsLogger.toLevelString(level);
  }

  public debug(message: string, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }

  public info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    this.logger.error(message, ...args);
  }

  public trace(message: string, ...args: any[]): void {
    this.logger.trace(message, ...args);
  }

  private static toLevelString(level: Level): string {
    const levels: Levels = log4js.levels;
    switch (level) {
      case Level.DEBUG:
        return levels.DEBUG.levelStr;
      case Level.INFO:
        return levels.INFO.levelStr;
      case Level.WARN:
        return levels.WARN.levelStr;
      case Level.ERROR:
        return levels.ERROR.levelStr;
      case Level.TRACE:
        return levels.TRACE.levelStr;
    }
  }
}
