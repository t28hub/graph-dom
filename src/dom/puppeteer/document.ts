import {ElementHandle, Page} from 'puppeteer';
import {DOMElement} from '../browser';
import {Document as IDocument, SerializableDocument} from '../document';
import {Element} from './element';
import {Element as IElement} from '../element';
import {Optional} from '../../util';
import {NodeType, Visitor} from '../node';

export class Document implements IDocument {
  private readonly page: Page;
  private readonly properties: SerializableDocument;

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

  get title(): string {
    return this.properties.title;
  }

  public static async create(page: Page): Promise<Document> {
    const properties = await page.evaluate((): SerializableDocument => {
      const {title, baseURI, nodeName, nodeType, nodeValue, textContent} = window.document;
      return {
        title, baseURI, nodeName, nodeType, nodeValue, textContent,
      };
    });
    return new Document(page, properties);
  }

  private constructor(page: Page, properties: SerializableDocument) {
    this.page = page;
    this.properties = properties;
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitDocument(this);
  }

  public async querySelector(selector: string): Promise<IElement | null> {
    return await Optional.ofNullable<ElementHandle<DOMElement>>(await this.page.$(selector))
      .map(async (value: ElementHandle): Promise<Element> => {
        return await Element.create(this.page, value);
      })
      .orElseThrow(() => new Error(`Could not find a element by ${selector}`));
  }

  public async querySelectorAll(selector: string): Promise<Array<IElement>> {
    const found: ElementHandle<DOMElement>[] = await this.page.$$(selector);
    const promises: Promise<Element>[] = found.map(async (element: ElementHandle): Promise<Element> => await Element.create(this.page, element));
    return Promise.all(promises);
  }
}
