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

import {
  validate,
  validateAttributeName,
  validateClassName,
  validateId,
  validateSelector,
  validateTagName,
  validateUrl
} from '../src/validator';
import { UserInputError } from 'apollo-server-errors';

describe('Validator', () => {
  describe('validate', () => {
    test('should not throw an UserInputError when condition is true', () => {
      // Assert
      expect(() => {
        // Act
        validate(true, 'condition === false');
      }).not.toThrowError();
    });

    test('should throw an UserInputError when condition is false', () => {
      // Assert
      expect(() => {
        // Act
        validate(false, 'condition === false');
      }).toThrowError(new UserInputError('condition === false'));
    });
  });

  describe('validateUrl', () => {
    test('should not throw an Error when URL is valid', () => {
      // Assert
      expect(() => {
        // Act
        validateUrl('https://example.com/');
      }).not.toThrowError();
    });

    test('should throw an UserInputError when URL is empty', () => {
      // Assert
      expect(() => {
        // Act
        validateUrl('');
      }).toThrowError(new UserInputError('URL must not be empty'));
    });

    test('should throw an UserInputError when URL is invalid', () => {
      // Assert
      expect(() => {
        // Act
        validateUrl('https://user:p@ssw0rd%@example.com/');
      }).toThrowError(new UserInputError('URL is invalid: https://user:p@ssw0rd%@example.com/'));
    });

    test('should throw an UserInputError when protocol is not defined', () => {
      // Assert
      expect(() => {
        // Act
        validateUrl('//example.com/');
      }).toThrowError(new UserInputError('URL must contain protocol: //example.com/'));
    });

    test('should throw an UserInputError when protocol is not allowed', () => {
      // Assert
      expect(() => {
        // Act
        validateUrl('ftp://user:p@ssw0rd@example.com:21/path');
      }).toThrowError(new UserInputError('URL contains disallowed protocol: ftp://user:p@ssw0rd@example.com:21/path'));
    });
  });

  describe('validateId', () => {
    test('should not throw an Error when ID is valid', () => {
      // Assert
      expect(() => {
        // Act
        validateId('valid-id');
      }).not.toThrowError();
    });

    test('should throw an UserInputError when ID is empty', () => {
      // Assert
      expect(() => {
        // Act
        validateId('');
      }).toThrowError(new UserInputError('ID must contain at least 1 char'));
    });

    test('should throw an UserInputError when ID contains space chars', () => {
      // Assert
      expect(() => {
        // Act
        validateId('invalid id');
      }).toThrowError(new UserInputError('ID must not contain any space chars: invalid id'));
    });
  });

  describe('validateClassName', () => {
    test('should not throw an Error when class name is valid', () => {
      // Assert
      expect(() => {
        // Act
        validateClassName('valid-class-name');
      }).not.toThrowError();
    });

    test('should throw an UserInputError when class name is empty', () => {
      // Assert
      expect(() => {
        // Act
        validateClassName('');
      }).toThrowError(new UserInputError('Class name must contain at least 1 char'));
    });
  });

  describe('validateTagName', () => {
    test('should not throw an Error when tag name is valid', () => {
      // Assert
      expect(() => {
        // Act
        validateTagName('valid-tag-name');
      }).not.toThrowError();
    });

    test('should throw an UserInputError when tag name is empty', () => {
      // Assert
      expect(() => {
        // Act
        validateTagName('');
      }).toThrowError(new UserInputError('Tag name must contain at least 1 char'));
    });
  });

  describe('validateSelector', () => {
    test('should not throw an Error when selector is valid', () => {
      // Assert
      expect(() => {
        // Act
        validateSelector('li.item');
      }).not.toThrowError();
    });

    test('should throw an UserInputError when selector is empty', () => {
      // Assert
      expect(() => {
        // Act
        validateSelector('');
      }).toThrowError(new UserInputError('Selector must contain at least 1 char'));
    });
  });

  describe('validateAttributeName', () => {
    test('should not throw an Error when attribute is valid', () => {
      // Assert
      expect(() => {
        // Act
        validateAttributeName('content');
      }).not.toThrowError();
    });

    test('should throw an UserInputError when selector is empty', () => {
      // Assert
      expect(() => {
        // Act
        validateAttributeName('');
      }).toThrowError(new UserInputError('Attribute name must contain at least 1 char'));
    });
  });
});
