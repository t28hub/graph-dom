import {ElementHandle, JSHandle, Page} from 'puppeteer';
import {DOMDocument, DOMElement, DOMNode} from '../web';
import {Element} from './element';
import {Element as IElement} from '../element';
import {Attribute} from '../attribute';
import {Data} from '../data';
import {NodeType} from '../node';

export class Delegation {
  protected readonly page: Page;
  protected readonly element: ElementHandle;

  constructor(page: Page, element: ElementHandle) {
    this.page = page;
    this.element = element;
  }

  public async attributes(): Promise<Array<Attribute>> {
    const {page, element} = this;
    return await page.evaluate((element: DOMElement): Array<Attribute> => {
      const items = element.attributes;
      const itemSize = items.length;
      const attributes: Array<Attribute> = [];
      for (let index = 0; index < itemSize; index++) {
        const item: Attr | null = items.item(index);
        if (item === null) {
          continue;
        }

        const {name, value} = item;
        attributes.push({name, value});
      }
      return attributes;
    }, element);
  }

  public async children(): Promise<Array<IElement>> {
    const {page, element} = this;
    const collection = await page.evaluateHandle((element: DOMElement): HTMLCollection => {
      return element.children
    }, element);
    return this.collectElements(collection);
  }

  public async dataset(): Promise<Array<Data>> {
    const {page, element} = this;
    return await page.evaluate((element: DOMElement): Array<Data> => {
      if (!(element instanceof HTMLElement)) {
        return [];
      }

      const {dataset} = (element as HTMLElement);
      return Object.keys(dataset).map((name: string): Data => {
        const value = dataset[name];
        return {name, value};
      });
    }, element);
  }

  public async head(): Promise<IElement | null> {
    const {page, element} = this;
    const handle = await page.evaluateHandle((node: DOMNode): DOMElement | null => {
      function isDocument(node: DOMNode): node is DOMDocument {
        return node.nodeType === NodeType.DOCUMENT_NODE;
      }

      return isDocument(node) ? node.head : null;
    }, element);
    const head = handle.asElement();
    return head !== null ? await Element.create(page, head) : null;
  }

  public async body(): Promise<IElement | null> {
    const {page, element} = this;
    const handle = await page.evaluateHandle((node: DOMNode): DOMElement | null => {
      function isDocument(node: DOMNode): node is DOMDocument {
        return node.nodeType === NodeType.DOCUMENT_NODE;
      }

      return isDocument(node) ? node.body : null;
    }, element);
    const body = handle.asElement();
    return body !== null ? await Element.create(page, body) : null;
  }

  public async innerHTML(): Promise<string> {
    const {page, element} = this;
    return await page.evaluate((element: DOMElement): string => element.innerHTML, element);
  }

  public async outerHTML(): Promise<string> {
    const {page, element} = this;
    return await page.evaluate((element: DOMElement): string => element.outerHTML, element);
  }

  public async getAttribute(attributeName: string): Promise<string | null> {
    const {page, element} = this;
    return page.evaluate((element: DOMElement, attributeName: string): string | null => {
      return element.getAttribute(attributeName);
    }, element, attributeName);
  }

  public async getElementById(id: string): Promise<IElement | null> {
    const {page, element} = this;
    const handle = await page.evaluateHandle((node: DOMNode, id: string): HTMLElement | null => {
      function isDocument(node: DOMNode): node is DOMDocument {
        return node.nodeType === NodeType.DOCUMENT_NODE;
      }
      return isDocument(node) ? node.getElementById(id) : null;
    }, element, id);
    if (handle === null) {
      return null;
    }

    const found = handle.asElement();
    return found === null ? null : await Element.create(page, found);
  }

  public async getElementsByClassName(name: string): Promise<Array<IElement>> {
    const {page, element} = this;
    const collection = await page.evaluateHandle((element: DOMElement, name: string): HTMLCollection => {
      return element.getElementsByClassName(name);
    }, element, name);
    return this.collectElements(collection);
  }

  public async getElementsByTagName(name: string): Promise<Array<IElement>> {
    const {page, element} = this;
    const collection = await page.evaluateHandle((element: DOMElement, name: string): HTMLCollection => {
      return element.getElementsByTagName(name);
    }, element, name);
    return this.collectElements(collection);
  }

  public async querySelector(selector: string): Promise<IElement | null> {
    const {page, element} = this;
    const found = await element.$(selector);
    return found === null ? null : await Element.create(page, found);
  }

  public async querySelectorAll(selector: string): Promise<Array<IElement>> {
    const {page, element} = this;
    const found: ElementHandle<DOMElement>[] = await element.$$(selector);
    const promises: Promise<IElement>[] = found.map(async (element: ElementHandle): Promise<IElement> => await Element.create(page, element));
    return Promise.all(promises);
  }

  async collectElements(collection: JSHandle): Promise<Array<IElement>> {
    const properties = await collection.getProperties();
    const promises = Array.from(properties.values())
      .map((handle: JSHandle): ElementHandle | null => handle.asElement())
      .filter((element: ElementHandle | null): boolean => element !== null)
      .map(async (element: ElementHandle | null): Promise<IElement> => {
        if (element === null) {
          throw new Error();
        }
        return await Element.create(this.page, element)
      });
    return Promise.all(promises);
  }
}
