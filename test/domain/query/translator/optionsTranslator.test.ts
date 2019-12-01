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
import each from 'jest-each';
import { GeoSetting, ViewportSetting } from '../../../../src/domain/browserDataSource';
import { Location, Viewport } from '../../../../src/domain/query/options';
import { OptionsTranslator } from '../../../../src/domain/query/translator';

describe('OptionsTranslator', () => {
  const translator = new OptionsTranslator();
  describe('translate', () => {
    describe('cookies', () => {
      test('should translate cookie array to cookies', () => {
        // Act
        const actual = translator.translate({
          cookies: [
            { name: 'FOO', value: 'alice', domain: 'example.com' },
            { name: 'BAR', value: 'bob', domain: 'example.com', sameSite: 'LAX' },
            { name: 'BAZ', value: 'charlie', domain: 'example.org', sameSite: 'STRICT' },
            { name: 'QUX', value: 'dave', url: 'https://example.com' },
          ]
        });

        // Assert
        expect(actual.cookies).toBeDefined();
        expect(actual.cookies).toEqual([
          { name: 'FOO', value: 'alice', domain: 'example.com', sameSite: undefined },
          { name: 'BAR', value: 'bob', domain: 'example.com', sameSite: 'Lax' },
          { name: 'BAZ', value: 'charlie', domain: 'example.org', sameSite: 'Strict' },
          { name: 'QUX', value: 'dave', url: 'https://example.com', sameSite: undefined },
        ]);
      });

      test('should throw an UserInputError when both url and domain attributes are missing', () => {
        // Assert
        expect(() => {
          // Act
          translator.translate({
            cookies: [
              { name: 'FOO', value: 'alice' }
            ]
          });
        }).toThrowError('Either cookie URL or domain must be specified: name=FOO');
      });

      test('should not translate cookie array when cookies is missing', () => {
        // Act
        const actual = translator.translate({});

        // Assert
        expect(actual.cookies).toBeDefined();
        expect(actual.cookies).toEqual([]);
      });
    });

    describe('headers', () => {
      test('should translate header array to headers', () => {
        // Act
        const actual = translator.translate({
          headers: [
            { name: 'Referer', value: 'https://example.com/' },
            { name: 'User-Agent', value: 'OptionsTranslatorTest/1.0.0' },
          ]
        });

        // Assert
        expect(actual.headers).toBeDefined();
        expect(actual.headers).toEqual({
          'Referer': 'https://example.com/',
          'User-Agent': 'OptionsTranslatorTest/1.0.0'
        });
      });

      test('should not translate header array when headers is missing', () => {
        // Act
        const actual = translator.translate({});

        // Assert
        expect(actual.headers).toBeDefined();
        expect(actual.headers).toEqual({});
      });
    });

    describe('device', () => {
      test('should set UserAgent and Viewport', () => {
        // Act
        const actual = translator.translate({ device: 'iPhone XR' });

        // Assert
        expect(actual.userAgent).toMatch(/iPhone OS 12_0/);
        expect(actual.viewport).toMatchObject({
          width: 414,
          height: 896,
          deviceScaleFactor: 3,
          isLandscape: false,
          isMobile: true,
          hasTouch: true
        });
      });

      test('should override UserAgent and Viewport', () => {
        // Act
        const actual = translator.translate({
          userAgent: 'GraphDOM/1.0.0',
          viewport: {
            width: 900,
            height: 1600
          },
          device: 'iPhone XR'
        });

        // Assert
        expect(actual.userAgent).not.toEqual('GraphDOM/1.0.0');
        expect(actual.viewport).not.toMatchObject({
          width: 900,
          height: 1600
        });
      });

      test('should not set UserAgent and Viewport when name is not found', () => {
        // Act
        const actual = translator.translate({ device: 'unknown device' });

        // Assert
        expect(actual.userAgent).toBeFalsy();
        expect(actual.viewport).toBeFalsy();
      });
    });

    describe('viewport', () => {
      each([
        [
          { width: 768, height: 1024 },
          {
            width: 768,
            height: 1024,
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false,
            isLandscape: false
          }
        ],
        [
          { width: 768, height: 1024, scale: 2 },
          {
            width: 768,
            height: 1024,
            deviceScaleFactor: 2,
            isMobile: false,
            hasTouch: false,
            isLandscape: false
          }
        ],
        [
          { width: 768, height: 1024, mobile: true },
          {
            width: 768,
            height: 1024,
            deviceScaleFactor: 1,
            isMobile: true,
            hasTouch: false,
            isLandscape: false
          }
        ],
        [
          { width: 768, height: 1024, touch: true },
          {
            width: 768,
            height: 1024,
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: true,
            isLandscape: false
          }
        ],
        [
          { width: 768, height: 1024, orientation: 'LANDSCAPE' },
          {
            width: 768,
            height: 1024,
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false,
            isLandscape: true
          }
        ],
      ]).test('should translate viewport to viewport: viewport=%s', (input: Viewport, expected: ViewportSetting) => {
        // Act
        const actual = translator.translate({ viewport: input });

        // Assert
        expect(actual.viewport).toBeDefined();
        expect(actual.viewport).toEqual(expected);
      });

      each([
        [{ width: 0, height: 1024 }, 'Viewport width and height must be positive: width=0, height=1024'],
        [{ width: 768, height: 0 }, 'Viewport width and height must be positive: width=768, height=0'],
        [{ width: 768, height: 1024, scale: 0 }, 'Viewport scale must be positive: scale=0'],
      ]).test('should throw an UserInputError: viewport=%p', (input: Viewport, expected: string) => {
        // Assert
        expect(() => {
          // Act
          translator.translate({ viewport: input });
        }).toThrowError(new UserInputError(expected));
      });

      test('should not translate viewport when viewport is missing', () => {
        // Act
        const actual = translator.translate({});

        // Assert
        expect(actual.viewport).toBeUndefined();
      });
    });

    describe('location', () => {
      each([
        [{ latitude: 37.774929, longitude: -122.419416 }, { latitude: 37.774929, longitude: -122.419416 }],
        [{ latitude: 35.689487, longitude: 139.691706 }, { latitude: 35.689487, longitude: 139.691706 }],
        [{ latitude: -23.55052, longitude: -46.633309 }, { latitude: -23.55052, longitude: -46.633309 }],
        [{ latitude: 37.774929, longitude: -122.419416, accuracy: 2000 }, { latitude: 37.774929, longitude: -122.419416 , accuracy: 2000}],
      ]).test('should translate location to geolocation: location=%p', (input: Location, expected: GeoSetting) => {
        // Act
        const actual = translator.translate({ location: input });

        // Assert
        expect(actual.geolocation).toBeDefined();
        expect(actual.geolocation).toEqual(expected);
      });

      each([
        [{ latitude: 91, longitude: 180 }, 'Latitude must be in the range -90 to 90: latitude=91'],
        [{ latitude: -91, longitude: -180 }, 'Latitude must be in the range -90 to 90: latitude=-91'],
        [{ latitude: 90, longitude: 181 }, 'Longitude must be in the range -180 to 180: longitude=181'],
        [{ latitude: -90, longitude: -181 }, 'Longitude must be in the range -180 to 180: longitude=-181'],
        [{ latitude: 90, longitude: 180, accuracy: -1 }, 'Location accuracy must be positive: accuracy=-1'],
        [{ latitude: -90, longitude: -180, accuracy: -1 }, 'Location accuracy must be positive: accuracy=-1'],
      ]).test('should throw an UserInputError: location=%p', (input: Location, expected: string) => {
        // Assert
        expect(() => {
          // Act
          translator.translate({ location: input });
        }).toThrowError(new UserInputError(expected));
      });

      test('should not translate location when location is missing', () => {
        // Act
        const actual = translator.translate({});

        // Assert
        expect(actual.geolocation).toBeUndefined();
      });
    });

    describe('credentials', () => {
      test('should translate credentials', () => {
        // Act
        const actual = translator.translate({
          credentials: {
            username: 'Alice',
            password: 'P@ssw0rd'
          }
        });

        // Assert
        expect(actual.credentials).toBeDefined();
        expect(actual.credentials).toEqual({
          username: 'Alice',
          password: 'P@ssw0rd'
        });
      });

      test('should not translate credentials when credentials is missing', () => {
        // Act
        const actual = translator.translate({});

        // Assert
        expect(actual.credentials).toBeUndefined();
      });
    });

    describe('javaScriptEnabled', () => {
      each([
        [true, true],
        [false, false],
        [undefined, true],
      ]).test('should translate javaScriptEnabled: javaScriptEnabled=%b', (enabled: boolean | undefined, expected: boolean) => {
        // Act
        const actual = translator.translate({ javaScriptEnabled: enabled });

        // Assert
        expect(actual.javaScriptEnabled).toBeDefined();
        expect(actual.javaScriptEnabled).toEqual(expected);
      });
    });
  });
});
