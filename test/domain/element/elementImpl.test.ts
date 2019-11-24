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

import 'reflect-metadata';
import { browser, element as mockElement, page } from '../../../src/__mocks__/puppeteer-core';
import { ElementImpl, NodeType, SerializableElement } from '../../../src/domain';
import { Optional } from '../../../src/util';

jest.unmock('puppeteer-core');

async function createElement(properties: SerializableElement): Promise<ElementImpl> {
  const created = await browser.newPage();
  const found = await created.$('#root');
  return new ElementImpl(created, found, properties);
}

describe('ElementImpl', () => {
  let element!: ElementImpl;
  beforeEach(async () => {
    jest.clearAllMocks();

    page.$.mockReturnValue(Promise.resolve(mockElement));
    browser.newPage.mockReturnValue(Promise.resolve(page));

    element = await createElement({
      id: 'feedItem',
      className: 'new first',
      classList: ['new', 'first'],
      nodeName: 'LI',
      nodeType: NodeType.ELEMENT_NODE,
      nodeValue: null
    });
  });

  describe('id', () => {
    test('should return id', async () => {
      // Act
      const actual = element.id;

      // Assert
      expect(actual).toEqual('feedItem');
    });
  });

  describe('className', () => {
    test('should return class name', async () => {
      // Act
      const actual = element.className;

      // Assert
      expect(actual).toEqual('new first');
    });
  });

  describe('classList', () => {
    test('should return list of class name', async () => {
      // Act
      const actual = element.classList;

      // Assert
      expect(actual).toHaveLength(2);
      expect(actual[0]).toEqual('new');
      expect(actual[1]).toEqual('first');
    });
  });

  describe('attributes', () => {
    test('should return list of attributes', async () => {
      // Arrange
      page.evaluate.mockReturnValue(Promise.resolve([
        { name: 'property', value: 'og:title' },
        { name: 'content', value: 'This is title' },
      ]));

      // Act
      const actual = await element.attributes();

      // Assert
      expect(page.evaluate).toBeCalledTimes(1);
      expect(actual).toHaveLength(2);
      expect(actual[0]).toMatchObject({
        name: 'property',
        value: 'og:title'
      });
      expect(actual[1]).toMatchObject({
        name: 'content',
        value: 'This is title'
      });
    });

    test('should return empty list when element has no attributes', async () => {
      // Arrange
      page.evaluate.mockReturnValue(Promise.resolve([]));
      // Act
      const actual = await element.attributes();

      // Assert
      expect(page.evaluate).toBeCalledTimes(1);
      expect(actual).toHaveLength(0);
    });
  });

  describe('dataset', () => {
    test('should return list of dataset', async () => {
      // Arrange
      page.evaluate.mockReturnValue(Promise.resolve([
        { name: 'type', value: 'This is type' },
        { name: 'name', value: 'This is name' },
      ]));

      // Act
      const actual = await element.dataset();

      // Assert
      expect(page.evaluate).toBeCalledTimes(1);
      expect(actual).toHaveLength(2);
      expect(actual[0]).toMatchObject({
        name: 'type',
        value: 'This is type'
      });
      expect(actual[1]).toMatchObject({
        name: 'name',
        value: 'This is name'
      });
    });

    test('should return empty list when element has no data attributes', async () => {
      // Arrange
      page.evaluate.mockReturnValue(Promise.resolve([]));

      // Act
      const actual = await element.dataset();

      // Assert
      expect(page.evaluate).toBeCalledTimes(1);
      expect(actual).toHaveLength(0);
    });
  });

  describe('innerHTML', () => {
    test('should return inner HTML', async () => {
      // Arrange
      const innerHTML = `
        <p>This is 1st paragraph</p>
        <p>This is 2nd paragraph</p>
      `;
      page.evaluate.mockReturnValue(Promise.resolve(innerHTML));

      // Act
      const actual = await element.innerHTML();

      // Assert
      expect(page.evaluate).toBeCalledTimes(1);
      expect(actual).toEqual(innerHTML);
    });
  });

  describe('outerHTML', () => {
    test('should return inner HTML', async () => {
      // Arrange
      const outerHTML = `
        <div>
          <p>This is 1st paragraph</p>
          <p>This is 2nd paragraph</p>
        </div>
      `;
      page.evaluate.mockReturnValue(Promise.resolve(outerHTML));

      // Act
      const actual = await element.outerHTML();

      // Assert
      expect(page.evaluate).toBeCalledTimes(1);
      expect(actual).toEqual(outerHTML);
    });
  });

  describe('getAttribute', () => {
    test('should return attribute matching specified name', async () => {
      // Arrange
      page.evaluate.mockReturnValue(Promise.resolve('UTF-8'));

      // Act
      const actual = await element.getAttribute('charset');

      // Assert
      expect(page.evaluate).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get()).toEqual('UTF-8');
    });

    test('should return empty when element does not have attribute', async () => {
      // Arrange
      page.evaluate.mockReturnValue(Promise.resolve(null));

      // Act
      const actual = await element.getAttribute('charset');

      // Assert
      expect(page.evaluate).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('getElementsByClassName', () => {
    test('should return elements matching specified class name', async () => {
      // Arrange
      const paragraph1st = await createElement({
        id: '',
        className: 'paragraph',
        classList: ['paragraph'],
        nodeName: 'P',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      const paragraph2nd = await createElement({
        id: '',
        className: 'paragraph',
        classList: ['paragraph'],
        nodeName: 'P',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        getProperties: () => [
          { asElement: () => paragraph1st },
          { asElement: () => paragraph2nd },
        ]
      }));
      jest.spyOn(element as any, 'toElement').mockImplementation(() => {
        const value: Pick<ElementImpl, 'nodeType' | 'nodeName' | 'classList'> = {
          nodeName: 'P',
          nodeType: NodeType.ELEMENT_NODE,
          classList: ['paragraph']
        };
        return Promise.resolve(Optional.of(value));
      });

      // Act
      const actual = await element.getElementsByClassName('paragraph');

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual).toHaveLength(2);
      expect(actual[0].classList).toContain('paragraph');
      expect(actual[1].classList).toContain('paragraph');
    });

    test('should return empty array when class name does not match any element', async () => {
      // Arrange
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        getProperties: () => []
      }));

      // Act
      const actual = await element.getElementsByClassName('header');

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual).toHaveLength(0);
    });
  });

  describe('getElementsByTagName', () => {
    test('should return elements matching specified tag name', async () => {
      // Arrange
      const meta1st = await createElement({
        id: '',
        className: '',
        classList: [],
        nodeName: 'META',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      const meta2nd = await createElement({
        id: '',
        className: '',
        classList: [],
        nodeName: 'META',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        getProperties: () => [
          { asElement: () => meta1st },
          { asElement: () => meta2nd },
        ]
      }));
      jest.spyOn(element as any, 'toElement').mockImplementation(() => {
        const value: Pick<ElementImpl, 'nodeType' | 'nodeName'> = {
          nodeName: 'META',
          nodeType: NodeType.ELEMENT_NODE
        };
        return Promise.resolve(Optional.of(value));
      });

      // Act
      const actual = await element.getElementsByTagName('meta');

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual).toHaveLength(2);
      expect(actual[0].nodeName).toEqual('META');
      expect(actual[1].nodeName).toEqual('META');
    });

    test('should return empty array when tag name does not match any element', async () => {
      // Arrange
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        getProperties: () => []
      }));

      // Act
      const actual = await element.getElementsByTagName('style');

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual).toHaveLength(0);
    });
  });

  describe('querySelector', () => {
    test('should return element matching specified selector', async () => {
      // Arrange
      const paragraph = await createElement({
        id: '',
        className: 'paragraph',
        classList: ['paragraph'],
        nodeName: 'P',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      mockElement.$.mockReturnValue(Promise.resolve(paragraph));
      jest.spyOn(element as any, 'toElement').mockImplementation(() => {
        const value: Pick<ElementImpl, 'nodeType' | 'nodeName' | 'classList'> = {
          nodeName: 'P',
          nodeType: NodeType.ELEMENT_NODE,
          classList: ['paragraph']
        };
        return Promise.resolve(Optional.of(value));
      });

      // Act
      const actual = await element.querySelector('p.paragraph');

      // Assert
      expect(mockElement.$).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('P');
      expect(actual.get().classList).toContain('paragraph');
    });

    test('should return empty when selector does not match any element', async () => {
      // Arrange
      mockElement.$.mockReturnValue(Promise.resolve(null));

      // Act
      const actual = await element.querySelector('p.paragraph');

      // Assert
      expect(page.$).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('querySelectorAll', () => {
    test('should return elements matching specified selector', async () => {
      // Arrange
      const paragraph1st = await createElement({
        id: '',
        className: 'paragraph',
        classList: ['paragraph'],
        nodeName: 'P',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      const paragraph2nd = await createElement({
        id: '',
        className: 'paragraph',
        classList: ['paragraph'],
        nodeName: 'P',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      mockElement.$$.mockReturnValue(Promise.resolve([paragraph1st, paragraph2nd]));
      jest.spyOn(element as any, 'toElement').mockImplementation(() => {
        const value: Pick<ElementImpl, 'nodeType' | 'nodeName' | 'classList'> = {
          nodeName: 'P',
          nodeType: NodeType.ELEMENT_NODE,
          classList: ['paragraph']
        };
        return Promise.resolve(Optional.of(value));
      });

      // Act
      const actual = await element.querySelectorAll('p.paragraph');

      // Assert
      expect(mockElement.$$).toBeCalledTimes(1);
      expect(actual).toHaveLength(2);
      expect(actual[0].classList).toContain('paragraph');
      expect(actual[1].classList).toContain('paragraph');
    });

    test('should return empty when selector does not match any element', async () => {
      // Arrange
      mockElement.$$.mockReturnValue(Promise.resolve([]));

      // Act
      const actual = await element.querySelectorAll('.paragraph');

      // Assert
      expect(mockElement.$$).toBeCalledTimes(1);
      expect(actual).toHaveLength(0);
    });
  });
});
