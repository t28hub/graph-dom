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
import { ElementHandle, JSHandle, Page, SerializableOrJSHandle } from 'puppeteer';
import { browser, element, page } from '../../../src/__mocks__/puppeteer-core';
import { NodeImpl, NodeType, SerializableNode } from '../../../src/domain';
import { Optional } from '../../../src/util';

jest.unmock('puppeteer-core');

class Node extends NodeImpl<SerializableNode> {
  public constructor(page: Page, element: ElementHandle, properties: SerializableNode) {
    super(page, element, properties);
  }
}

async function createNode(properties: SerializableNode): Promise<NodeImpl<SerializableNode>> {
  const created = await browser.newPage();
  const found = await created.$('#root');
  return new Node(created, found, properties);
}

describe('NodeImpl', () => {
  let node!: NodeImpl<SerializableNode>;
  beforeEach(async () => {
    jest.clearAllMocks();

    page.$.mockReturnValue(Promise.resolve(element));
    browser.newPage.mockReturnValue(Promise.resolve(page));

    node = await createNode({ nodeName: 'P', nodeType: NodeType.ELEMENT_NODE, nodeValue: null });
  });

  describe('properties', () => {
    test('should return node name', async () => {
      // Act
      const actual = node.nodeName;

      // Assert
      expect(actual).toEqual('P');
    });

    test('should return node type', async () => {
      // Act
      const actual = node.nodeType;

      // Assert
      expect(actual).toEqual(NodeType.ELEMENT_NODE);
    });

    test('should return node value', async () => {
      // Act
      const actual = node.nodeValue;

      // Assert
      expect(actual).toEqual(null);
    });
  });

  describe('textContent', () => {
    test('should return text content ', async () => {
      // Arrange
      page.evaluate.mockReturnValue(Promise.resolve('This is a text content'));

      // Act
      const actual = await node.textContent();

      // Assert
      expect(page.evaluate).toBeCalledTimes(1);
      expect(actual).toEqual('This is a text content');
    });
  });

  describe('innerText', () => {
    test('should return rendered text content ', async () => {
      // Arrange
      page.evaluate.mockReturnValue(Promise.resolve('This is an inner text'));

      // Act
      const actual = await node.innerText();

      // Assert
      expect(page.evaluate).toBeCalledTimes(1);
      expect(actual).toEqual('This is an inner text');
    });
  });

  describe('children', () => {
    test('should return children nodes', async () => {
      // Arrange
      const node1st = await createNode({ nodeName: 'H1', nodeType: NodeType.ELEMENT_NODE, nodeValue: null });
      const node2nd = await createNode({ nodeName: 'H2', nodeType: NodeType.ELEMENT_NODE, nodeValue: null });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        getProperties: () => [
          { asElement: () => node1st },
          { asElement: () => node2nd }
        ]
      }));

      // Act
      const actual = await node.children();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual).toHaveLength(2);
    });
  });

  describe('childNodes', () => {
    test('should return child nodes', async () => {
      // Arrange
      const node1st = await createNode({ nodeName: '#text', nodeType: NodeType.TEXT_NODE, nodeValue: null });
      const node2nd = await createNode({ nodeName: 'H1', nodeType: NodeType.ELEMENT_NODE, nodeValue: null });
      const node3rd = await createNode({ nodeName: '#text', nodeType: NodeType.TEXT_NODE, nodeValue: null });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        getProperties: () => [
          { asElement: () => node1st },
          { asElement: () => node2nd },
          { asElement: () => node3rd }
        ]
      }));

      // Act
      const actual = await node.childNodes();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual).toHaveLength(3);
    });
  });

  describe('firstChild', () => {
    test('should return first child node', async () => {
      // Arrange
      const childNode = await createNode({ nodeName: '#text', nodeType: NodeType.TEXT_NODE, nodeValue: null });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        asElement: () => childNode
      }));

      // Act
      const actual = await node.firstChild();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeTruthy();
    });

    test('should return empty when child node does not exist', async () => {
      // Arrange
      page.evaluateHandle.mockReturnValue(Promise.resolve(null));

      // Act
      const actual = await node.firstChild();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('lastChild', () => {
    test('should return last child node', async () => {
      // Arrange
      const childNode = await createNode({ nodeName: '#text', nodeType: NodeType.TEXT_NODE, nodeValue: null });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        asElement: () => childNode
      }));

      // Act
      const actual = await node.lastChild();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeTruthy();
    });

    test('should return empty when child node does not exist', async () => {
      // Arrange
      page.evaluateHandle.mockReturnValue(Promise.resolve(null));

      // Act
      const actual = await node.lastChild();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('nextSibling', () => {
    test('should return next node of the node in parent node', async () => {
      // Arrange
      const nextNode = await createNode({ nodeName: '#text', nodeType: NodeType.TEXT_NODE, nodeValue: null });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        asElement: () => nextNode
      }));

      // Act
      const actual = await node.nextSibling();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeTruthy();
    });

    test('should return empty when the node is last node', async () => {
      // Arrange
      page.evaluateHandle.mockReturnValue(Promise.resolve(null));

      // Act
      const actual = await node.nextSibling();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('previousSibling', () => {
    test('should return previous node of the node in parent node', async () => {
      // Arrange
      const previousNode = await createNode({ nodeName: '#text', nodeType: NodeType.TEXT_NODE, nodeValue: null });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        asElement: () => previousNode
      }));

      // Act
      const actual = await node.previousSibling();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeTruthy();
    });

    test('should return empty when the node is first node', async () => {
      // Arrange
      page.evaluateHandle.mockReturnValue(Promise.resolve(null));

      // Act
      const actual = await node.previousSibling();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('parentElement', () => {
    test('should return parent element', async () => {
      // Arrange
      const parentElement = await createNode({ nodeName: 'DIV', nodeType: NodeType.ELEMENT_NODE, nodeValue: null });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        asElement: () => parentElement
      }));
      const parentNode = await createNode({ nodeName: 'DIV', nodeType: NodeType.ELEMENT_NODE, nodeValue: null });
      jest.spyOn(node as any, 'toNode').mockReturnValue(Promise.resolve(
        Optional.of(parentNode)
      ));

      // Act
      const actual = await node.parentElement();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeTruthy();
    });

    test('should return empty when node does not have parent element', async () => {
      // Arrange
      page.evaluateHandle.mockReturnValue(Promise.resolve(null));

      // Act
      const actual = await node.parentElement();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeFalsy();
    });
  });

  describe('parentNode', () => {
    test('should return parent node', async () => {
      // Arrange
      const parentNode = await createNode({ nodeName: 'DIV', nodeType: NodeType.TEXT_NODE, nodeValue: null });
      page.evaluateHandle.mockReturnValue(Promise.resolve({
        asElement: () => parentNode
      }));

      // Act
      const actual = await node.parentNode();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeTruthy();
    });

    test('should return empty when node does not have parent node', async () => {
      // Arrange
      page.evaluateHandle.mockReturnValue(Promise.resolve(null));

      // Act
      const actual = await node.parentNode();

      // Assert
      expect(page.evaluateHandle).toBeCalledTimes(1);
      expect(actual.isPresent()).toBeFalsy();
    });
  });
});
