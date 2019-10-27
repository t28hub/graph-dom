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

import { Translator } from '../../translator';
import { Cookie, Header, Location, Options, SameSite, Viewport } from '../options';
import {
  AuthSetting,
  CookieSetting,
  GeoSetting,
  Headers,
  Options as RequestOptions,
  SameSiteSetting,
  ViewportSetting,
} from '../../browserDataSource';
import { check } from '../../../util';
import { Credentials } from '../options/credentials';

const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;
const DEFAULT_SCALE = 1;

export class OptionsTranslator implements Translator<Options, RequestOptions> {
  public translate(input: Options): RequestOptions {
    return {
      cookies: OptionsTranslator.translateCookies(input.cookies),
      headers: OptionsTranslator.translateHeaders(input.headers),
      viewport: OptionsTranslator.translateViewport(input.viewport),
      userAgent: input.userAgent,
      geolocation: OptionsTranslator.translateLocation(input.location),
      credentials: OptionsTranslator.translateCredentials(input.credentials),
      javaScriptEnabled: input.javaScriptEnabled !== false,
    };
  }

  private static translateSameSite(input?: SameSite): SameSiteSetting | undefined {
    switch (input) {
      case 'LAX':
        return 'Lax';
      case 'STRICT':
        return 'Strict';
      default:
        return undefined;
    }
  }

  private static translateCookies(input: Cookie[] = []): CookieSetting[] {
    return input.map(
      (cookie: Cookie): CookieSetting => {
        const { url, domain } = cookie;
        check(
          url !== undefined || domain !== undefined,
          `Either cookie URL or domain must be specified: name=${cookie.name}`
        );
        const sameSite = this.translateSameSite(cookie.sameSite);
        return { ...cookie, sameSite };
      }
    );
  }

  private static translateHeaders(input: Header[] = []): Headers {
    return input.reduce((previous: Headers, { name, value }: { name: string; value: string }): Headers => {
      previous[name] = value;
      return previous;
    }, {});
  }

  private static translateViewport(input?: Viewport): ViewportSetting | undefined {
    if (input === undefined) {
      return undefined;
    }

    const { width, height, scale, mobile, touch, orientation } = input;
    check(width > 0 && height > 0, `Viewport width and height must be positive: width=${width}, height=${height}`);
    check(scale === undefined || scale > 0, `Viewport scale must be positive: scale=${scale}`);
    return {
      width,
      height,
      deviceScaleFactor: scale || DEFAULT_SCALE,
      isMobile: mobile || false,
      hasTouch: touch || false,
      isLandscape: orientation === 'LANDSCAPE',
    };
  }

  private static translateLocation(input?: Location): GeoSetting | undefined {
    if (input === undefined) {
      return undefined;
    }

    const { latitude, longitude, accuracy } = input;
    check(
      latitude >= MIN_LATITUDE && latitude <= MAX_LATITUDE,
      `Latitude must be in the range -90 to 90: latitude=${latitude}`
    );
    check(
      longitude >= MIN_LONGITUDE && longitude <= MAX_LONGITUDE,
      `Longitude must be in the range -180 to 180: longitude=${longitude}`
    );
    check(accuracy === undefined || accuracy > 0, `Location accuracy must be positive: accuracy=${accuracy}`);
    return { latitude, longitude, accuracy };
  }

  private static translateCredentials(input?: Credentials): AuthSetting | undefined {
    if (input === undefined) {
      return undefined;
    }
    return { ...input };
  }
}
