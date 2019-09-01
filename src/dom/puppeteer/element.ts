import {ElementHandle, Page} from 'puppeteer';
import {Attribute} from '../attribute';
import {DOMElement} from '../browser';
import {Element as IElement, SerializableElement} from '../element';
import {NodeType, Visitor} from '../node';
import {Data} from '../data';

export class Element implements IElement {
  private readonly page: Page;
  private readonly element: ElementHandle;
  private readonly properties: SerializableElement;

  get id(): string {
    return this.properties.id;
  }

  get className(): string {
    return this.properties.className;
  }

  get classList(): Array<string> {
    return this.properties.classList;
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

  static async create(page: Page, element: ElementHandle): Promise<Element> {
    const properties = await page.evaluate((element: DOMElement): SerializableElement => {
      const {id, className, classList, baseURI, nodeName, nodeType, nodeValue, textContent} = element;
      return {id, className, classList: Array.from(classList), baseURI, nodeName, nodeType, nodeValue, textContent};
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

  public async attributes(): Promise<Array<Attribute>> {
    return await this.page.evaluate((element: DOMElement): Array<Attribute> => {
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
    }, this.element);
  }

  public async dataset(): Promise<Array<Data>> {
    return await this.page.evaluate((element: DOMElement): Array<Data> => {
      if (!(element instanceof HTMLElement)) {
        return [];
      }

      const {dataset} = (element as HTMLElement);
      return Object.keys(dataset).map((key: string): Data => {
        const value = dataset[key];
        return {name: key, value};
      });
    }, this.element);
  }

  public async innerHTML(): Promise<string> {
    return await this.page.evaluate((element: DOMElement): string => element.innerHTML, this.element);
  }

  public async outerHTML(): Promise<string> {
    return await this.page.evaluate((element: DOMElement): string => element.outerHTML, this.element);
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
