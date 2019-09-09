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

import {Optional} from '../../src/util';

describe('Optional', () => {
  describe('empty', () => {
    it('should return empty instance', () => {
      // Act
      const actual = Optional.empty<string>();

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('of', () => {
    it('should instantiate from non-null value', () => {
      // Act
      const actual = Optional.of('Alice');

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get()).toBe('Alice');
    });

    it('should throw an Error when value is null', () => {
      // Assert
      expect(() => {
        // Act
        Optional.of(null);
      }).toThrowError('Value must not be null or undefined');
    });

    it('should throw an Error when value is undefined', () => {
      // Assert
      expect(() => {
        // Act
        Optional.of(undefined);
      }).toThrowError('Value must not be null or undefined');
    });
  });

  describe('ofNullable', () => {
    it('should instantiate from non-null value', () => {
      // Act
      const actual = Optional.ofNullable('Alice');

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get()).toBe('Alice');
    });

    it('should instantiate from null', () => {
      // Act
      const actual = Optional.ofNullable(null);

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });

    it('should instantiate from undefined', () => {
      // Act
      const actual = Optional.ofNullable(undefined);

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('get', () => {
    it('should return value', () => {
      // Act
      const optional = Optional.of('Alice');
      const actual = optional.get();

      // Assert
      expect(actual).toBe('Alice');
    });

    it('should throw an Error when value is not present', () => {
      // Assert
      expect(() => {
        // Act
        const optional = Optional.empty<string>();
        optional.get();
      }).toThrowError('Value is not present');
    });
  });

  describe('isPresent', () => {
    it('should return true when value is present', () => {
      // Act
      const optional = Optional.of('Alice');
      const actual = optional.isPresent();

      // Assert
      expect(actual).toBeTruthy();
    });

    it('should return false when value is not present', () => {
      // Act
      const optional = Optional.empty<string>();
      const actual = optional.isPresent();

      // Assert
      expect(actual).toBeFalsy();
    });
  });

  describe('ifPresent', () => {
    it('should call consumer function when value is present', () => {
      // Arrange
      const consumer = jest.fn();

      // Act
      const optional = Optional.of('Alice');
      optional.ifPresent(consumer);

      // Assert
      const {mock} = consumer;
      expect(mock.calls[0]).toEqual(['Alice']);
      expect(mock.calls).toHaveLength(1);
    });

    it('should not call consumer function when value is not present', () => {
      // Arrange
      const consumer = jest.fn();

      // Act
      const optional = Optional.empty<string>();
      optional.ifPresent(consumer);

      // Assert
      const {mock} = consumer;
      expect(mock.calls).toHaveLength(0);
    });
  });

  describe('map', () => {
    it('should return Optional that has mapped value', () => {
      // Act
      const optional = Optional.of('Alice');
      const actual = optional.map((value: string): number => value.length);

      // Assert
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get()).toBe(5);
    });

    it('should return empty when value is not present', () => {
      // Act
      const optional = Optional.empty<string>();
      const actual = optional.map((value: string): number => value.length);

      // Assert
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('orElse', () => {
    it('should return value', () => {
      // Act
      const optional = Optional.of('Alice');
      const actual = optional.orElse('Bob');

      // Assert
      expect(actual).toBe('Alice');
    });

    it('should return other value when value is not present', () => {
      // Act
      const optional = Optional.empty<string>();
      const actual = optional.orElse('Bob');

      // Assert
      expect(actual).toBe('Bob');
    });
  });

  describe('orElseGet', () => {
    it('should return value', () => {
      // Arrange
      const supplier = jest.fn((): string => 'Bob');

      // Act
      const optional = Optional.of('Alice');
      const actual = optional.orElseGet(supplier);

      // Assert
      const {mock} = supplier;
      expect(mock.calls).toHaveLength(0);
      expect(actual).toBe('Alice');
    });

    it('should return value provided by supplier when value is not present', () => {
      // Arrange
      const supplier = jest.fn((): string => 'Bob');

      // Act
      const optional = Optional.empty<string>();
      const actual = optional.orElseGet(supplier);

      // Assert
      const {mock} = supplier;
      expect(mock.calls).toHaveLength(1);
      expect(actual).toBe('Bob');
    });
  });

  describe('orElseThrow', () => {
    it('should return value', () => {
      // Arrange
      const supplier = jest.fn((): Error => new Error('Value does not found'));

      // Act
      const optional = Optional.of('Alice');
      const actual = optional.orElseThrow(supplier);

      // Assert
      const {mock} = supplier;
      expect(mock.calls).toHaveLength(0);
      expect(actual).toBe('Alice');
    });

    it('should throw an Error provided by supplier when value is not present', () => {
      // Arrange
      const supplier = jest.fn((): Error => new Error('Value does not found'));

      // Assert
      expect(() => {
        // Act
        const optional = Optional.empty<string>();
        optional.orElseThrow(supplier);
      }).toThrowError('Value does not found');

      // Assert
      const {mock} = supplier;
      expect(mock.calls).toHaveLength(1);
    });
  });
});
