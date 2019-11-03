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
import { AssertionError } from 'assert';
import puppeteer, { context as mockContext, page as mockPage } from '../../../src/__mocks__/puppeteer-core';
import { create } from '../../../src/domain/document';
import { DocumentImpl, NodeType } from '../../../src/domain';

jest.mock('chrome-aws-lambda', () => {
  return { puppeteer };
});

describe('create', () => {
  beforeEach(async () => {
    jest.resetAllMocks();

    mockContext.newPage.mockReturnValue(Promise.resolve(mockPage));
  });

  test('should instantiate Document from page', async () => {
    // Arrange
    mockPage.evaluate.mockReturnValue({
      title: 'Wikipedia',
      nodeName: '#document',
      nodeType: NodeType.DOCUMENT_NODE,
      nodeValue: null
    });
    mockPage.evaluateHandle.mockReturnValue({
      asElement: jest.fn().mockReturnValue({})
    });
    const page = await mockContext.newPage();

    // Act
    const actual = await create(page);

    // Assert
    expect(actual).toBeInstanceOf(DocumentImpl);
    expect(actual.title).toEqual('Wikipedia');
    expect(actual.nodeName).toEqual('#document');
    expect(actual.nodeType).toEqual(NodeType.DOCUMENT_NODE);
    expect(actual.nodeValue).toBeNull();
  });

  test('should instantiate Document from page and element', async () => {
    // Arrange
    mockPage.evaluate.mockReturnValue({
      title: 'Wikipedia',
      nodeName: '#document',
      nodeType: NodeType.DOCUMENT_NODE,
      nodeValue: null
    });
    mockPage.evaluateHandle.mockReturnValue(Promise.resolve({
      asElement: jest.fn().mockReturnValue({})
    }));
    mockPage.$.mockReturnValue(Promise.resolve({}));

    const page = await mockContext.newPage();
    const element = await page.$('');

    // Act
    const actual = await create(page, element);

    // Assert
    expect(actual).toBeInstanceOf(DocumentImpl);
    expect(actual.title).toEqual('Wikipedia');
    expect(actual.nodeName).toEqual('#document');
    expect(actual.nodeType).toEqual(NodeType.DOCUMENT_NODE);
    expect(actual.nodeValue).toBeNull();
  });

  test('should throw an Error when window.document is missing', async () => {
    // Arrange
    mockPage.evaluateHandle.mockReturnValue(Promise.resolve(null));
    const page = await mockContext.newPage();

    // Act
    const actual = create(page);

    // Assert
    await expect(actual).rejects.toThrow(AssertionError);
  });

  test('should throw an Error when converted element is missing', async () => {
    // Arrange
    mockPage.evaluateHandle.mockReturnValue(Promise.resolve({
      asElement: jest.fn().mockReturnValue(null)
    }));
    const page = await mockContext.newPage();

    // Act
    const actual = create(page);

    // Assert
    await expect(actual).rejects.toThrow(AssertionError);
  });
});
