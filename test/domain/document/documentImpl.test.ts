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
import { browser, element as mockElement, element, page } from '../../../src/__mocks__/puppeteer-core';
import { DocumentImpl, ElementImpl, NodeType, SerializableDocument, SerializableElement } from '../../../src/domain';
import { create } from '../../../src/domain/document';
import { Optional } from '../../../src/util';
import { InvalidSelectorError } from '../../../src/domain/errors';

jest.unmock('puppeteer-core');

async function createDocument(properties: SerializableDocument): Promise<DocumentImpl> {
  const created = await browser.newPage();
  const found = await created.$('#document');
  return new DocumentImpl(created, found, properties);
}

async function createElement(properties: SerializableElement): Promise<ElementImpl> {
  const created = await browser.newPage();
  const found = await created.$('#element');
  return new ElementImpl(created, found, properties);
}

describe('DocumentImpl', () => {
  let document!: DocumentImpl;
  beforeEach(async () => {
    jest.clearAllMocks();

    page.$.mockReturnValue(Promise.resolve(element));
    browser.newPage.mockReturnValue(Promise.resolve(page));

    document = await createDocument({
      title: 'This is title',
      nodeName: '#document',
      nodeType: NodeType.DOCUMENT_NODE,
      nodeValue: null
    });
  });

  describe('title', () => {
    test('should return title of document', async () => {
      // Act
      const actual = document.title;

      // Assert
      expect(actual).toEqual('This is title');
    });
  });

  describe('head', () => {
    test('should return "head" element of document', async () => {
      // Arrange
      const head = createElement({
        id: '',
        className: '',
        classList: [],
        nodeName: 'HEAD',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        getProperties: () => [
          { asElement: () => head }
        ]
      }));
      jest.spyOn(document as any, 'toElement').mockImplementation(() => {
        const value: Pick<ElementImpl, 'nodeType' | 'nodeName'> = {
          nodeName: 'HEAD',
          nodeType: NodeType.ELEMENT_NODE
        };
        return Promise.resolve(Optional.of(value));
      });

      // Act
      const actual = await document.head();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get()).toMatchObject({
        nodeName: 'HEAD',
        nodeType: NodeType.ELEMENT_NODE
      });
    });
  });

  describe('body', () => {
    test('should return "body" element of document', async () => {
      // Arrange
      const body = createElement({
        id: '',
        className: '',
        classList: [],
        nodeName: 'BODY',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        getProperties: () => [
          { asElement: () => body }
        ]
      }));
      jest.spyOn(document as any, 'toElement').mockImplementation(() => {
        const value: Pick<ElementImpl, 'nodeType' | 'nodeName'> = {
          nodeName: 'BODY',
          nodeType: NodeType.ELEMENT_NODE
        };
        return Promise.resolve(Optional.of(value));
      });

      // Act
      const actual = await document.body();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get()).toMatchObject({
        nodeName: 'BODY',
        nodeType: NodeType.ELEMENT_NODE
      });
    });
  });

  describe('getElementById', () => {
    test('should return element matching specified ID', async () => {
      // Arrange
      const content = createElement({
        id: 'content',
        className: '',
        classList: [],
        nodeName: 'DIV',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        getProperties: () => [
          { asElement: () => content }
        ]
      }));
      jest.spyOn(document as any, 'toElement').mockImplementation(() => {
        const value: Pick<ElementImpl, 'id' | 'nodeType' | 'nodeName'> = {
          id: 'content',
          nodeName: 'DIV',
          nodeType: NodeType.ELEMENT_NODE
        };
        return Promise.resolve(Optional.of(value));
      });

      // Act
      const actual = await document.getElementById('content');

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get()).toMatchObject({
        id: 'content',
        nodeName: 'DIV',
        nodeType: NodeType.ELEMENT_NODE
      });
    });

    test('should return empty when id does not match any element', async () => {
      // Arrange
      page.evaluateHandle.mockReturnValue(Promise.resolve(null));

      // Act
      const actual = await document.getElementById('content');

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
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
          { asElement: () => paragraph2nd }
        ]
      }));
      jest.spyOn(document as any, 'toElement').mockImplementation(() => {
        const value: Pick<ElementImpl, 'className' | 'classList' | 'nodeType' | 'nodeName'> = {
          className: 'paragraph',
          classList: ['paragraph'],
          nodeName: 'P',
          nodeType: NodeType.ELEMENT_NODE
        };
        return Promise.resolve(Optional.of(value));
      });

      // Act
      const actual = await document.getElementsByClassName('paragraph');

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual).toHaveLength(2);
      expect(actual[0]).toMatchObject({
        className: 'paragraph',
        classList: ['paragraph'],
        nodeName: 'P',
        nodeType: NodeType.ELEMENT_NODE
      });
      expect(actual[1]).toMatchObject({
        className: 'paragraph',
        classList: ['paragraph'],
        nodeName: 'P',
        nodeType: NodeType.ELEMENT_NODE
      });
    });

    test('should return empty array when class name does not match any element', async () => {
      // Arrange
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        getProperties: () => []
      }));

      // Act
      const actual = await document.getElementsByClassName('paragraph');

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual).toHaveLength(0);
    });
  });

  describe('getElementsByTagName', () => {
    test('should return elements matching specified tag name', async () => {
      // Arrange
      const image1st = await createElement({
        id: '',
        className: '',
        classList: [],
        nodeName: 'IMG',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      const image2nd = await createElement({
        id: '',
        className: '',
        classList: [],
        nodeName: 'IMG',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        getProperties: () => [
          { asElement: () => image1st },
          { asElement: () => image2nd }
        ]
      }));
      jest.spyOn(document as any, 'toElement').mockImplementation(() => {
        const value: Pick<ElementImpl, 'nodeType' | 'nodeName'> = {
          nodeName: 'IMG',
          nodeType: NodeType.ELEMENT_NODE
        };
        return Promise.resolve(Optional.of(value));
      });

      // Act
      const actual = await document.getElementsByTagName('img');

      // Assert
      expect(actual).toHaveLength(2);
      expect(actual[0]).toMatchObject({
        nodeName: 'IMG',
        nodeType: NodeType.ELEMENT_NODE
      });
      expect(actual[1]).toMatchObject({
        nodeName: 'IMG',
        nodeType: NodeType.ELEMENT_NODE
      });
    });

    test('should return empty array when tag name does not match any element', async () => {
      // Arrange
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        getProperties: () => []
      }));

      // Act
      const actual = await document.getElementsByTagName('img');

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
        className: 'new',
        classList: ['new'],
        nodeName: 'P',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      element.$.mockReturnValue(Promise.resolve(paragraph));
      jest.spyOn(document as any, 'toElement').mockImplementation(() => {
        const value: Pick<ElementImpl, 'className' | 'classList' | 'nodeType' | 'nodeName'> = {
          className: 'new',
          classList: ['new'],
          nodeName: 'P',
          nodeType: NodeType.ELEMENT_NODE
        };
        return Promise.resolve(Optional.of(value));
      });

      // Act
      const actual = await document.querySelector('p.new');

      // Assert
      expect(element.$).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeTruthy();
      expect(actual.get().nodeName).toEqual('P');
      expect(actual.get().classList).toContain('new');
    });

    test('should return empty when selector does not match any element', async () => {
      // Arrange
      element.$.mockReturnValue(Promise.resolve(null));

      // Act
      const actual = await document.querySelector('p.new');

      // Assert
      expect(element.$).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeFalsy();
    });

    test('should throw InvalidSelectorError when selector is invalid', async () => {
      // Arrange
      mockElement.$.mockRejectedValue(new Error("Failed to execute 'querySelector' on 'Document': '.S3%$' is not a valid selector."));

      // Act
      const actual = document.querySelector('.S3%$');

      // Assert
      expect(mockElement.$).toBeCalledTimes(1);
      await expect(actual).rejects.toThrowError(InvalidSelectorError);
    });
  });

  describe('querySelectorAll', () => {
    test('should return elements matching specified selector', async () => {
      // Arrange
      const paragraph1st = await createElement({
        id: '',
        className: 'new',
        classList: ['new'],
        nodeName: 'P',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      const paragraph2nd = await createElement({
        id: '',
        className: 'new',
        classList: ['new'],
        nodeName: 'P',
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: null
      });
      element.$$.mockReturnValue(Promise.resolve([paragraph1st, paragraph2nd]));
      jest.spyOn(document as any, 'toElement').mockImplementation(() => {
        const value: Pick<ElementImpl, 'className' | 'classList' | 'nodeType' | 'nodeName'> = {
          className: 'new',
          classList: ['new'],
          nodeName: 'P',
          nodeType: NodeType.ELEMENT_NODE
        };
        return Promise.resolve(Optional.of(value));
      });

      // Act
      const actual = await document.querySelectorAll('p.new');

      // Assert
      expect(element.$$).toBeCalledTimes(1);
      expect(actual).toHaveLength(2);
      expect(actual[0]).toMatchObject({
        className: 'new',
        classList: ['new'],
        nodeName: 'P',
        nodeType: NodeType.ELEMENT_NODE
      });
      expect(actual[1]).toMatchObject({
        className: 'new',
        classList: ['new'],
        nodeName: 'P',
        nodeType: NodeType.ELEMENT_NODE
      });
    });

    test('should return empty array when selector does not match any element', async () => {
      // Arrange
      element.$$.mockReturnValue(Promise.resolve([]));

      // Act
      const actual = await document.querySelectorAll('p.new');

      // Assert
      expect(element.$$).toBeCalledTimes(1);
      expect(actual).toHaveLength(0);
    });

    test('should throw InvalidSelectorError when selector is invalid', async () => {
      // Arrange
      mockElement.$$.mockRejectedValue(new Error("Failed to execute 'querySelectorAll' on 'Document': '.S3%$' is not a valid selector."));

      // Act
      const actual = document.querySelectorAll('.S3%$');

      // Assert
      expect(mockElement.$$).toBeCalledTimes(1);
      await expect(actual).rejects.toThrowError(InvalidSelectorError);
    });
  });
});
