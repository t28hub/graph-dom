import {ElementHandle, Page} from 'puppeteer';
import {Attribute} from '../attribute';
import {DOMElement} from '../browser';
import {Element as IElement, SerializableElement} from '../element';
import {NodeType, Visitor} from '../node';

export class Element implements IElement {
  private readonly page: Page;
  private readonly element: ElementHandle;
  private readonly properties: SerializableElement;

  get id(): string {
    return this.properties.id;
  }

  get baseURI(): string {
    return this.properties.baseURI;
  }

  get nodeName(): string {
    return this.properties.nodeName;
  }

  get nodeType(): NodeType {
    return this.properties.nodeType;
  }

  get nodeValue(): string | null {
    return this.properties.nodeValue;
  }

  get textContent(): string | null {
    return this.properties.textContent;
  }

  get attributes(): Array<Attribute> {
    return this.properties.attributes;
  }

  static async create(page: Page, element: ElementHandle): Promise<Element> {
    const properties = await page.evaluate((element: DOMElement): SerializableElement => {
      const attributes = element.attributes;
      const attributeSize = attributes.length;
      const attributeList: Array<Attribute> = [];
      for (let index = 0; index < attributeSize; index++) {
        const attribute: Attr | null = attributes.item(index);
        if (attribute === null) {
          continue;
        }

        const {name, value} = attribute;
        attributeList.push({name, value});
      }

      const {id, baseURI, nodeName, nodeType, nodeValue, textContent} = element;
      return {
        id, baseURI, nodeName, nodeType, nodeValue, textContent,
        attributes: attributeList,
      };
    }, element);
    return new Element(page, element, properties);
  }

  private constructor(page: Page, element: ElementHandle, properties: SerializableElement) {
    this.page = page;
    this.element = element;
    this.properties = properties;
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitElement(this);
  }

  public async getAttribute(attributeName: string): Promise<string | null> {
    return await this.page.evaluate((element: DOMElement, attributeName: string): string | null => {
      return element.getAttribute(attributeName);
    }, this.element, attributeName);
  }

  public async getElementsByClassName(name: string): Promise<Array<IElement>> {
    // https://github.com/GoogleChrome/puppeteer/issues/461
    return await this.querySelectorAll(`.${name}`);
  }

  public async getElementsByTagName(name: string): Promise<Array<IElement>> {
    return await this.querySelectorAll(`${name}`);
  }

  public async querySelector(selector: string): Promise<IElement | null> {
    const found = await this.element.$(selector);
    return found === null ? null : await Element.create(this.page, found);
  }

  public async querySelectorAll(selector: string): Promise<Array<IElement>> {
    const found: ElementHandle<DOMElement>[] = await this.element.$$(selector);
    const promises: Promise<Element>[] = found.map(async (element: ElementHandle): Promise<Element> => await Element.create(this.page, element));
    return Promise.all(promises);
  }
}
