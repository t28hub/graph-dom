import {ElementHandle, JSHandle, Page} from 'puppeteer';
import {DOMDocument, DOMElement} from '../browser';
import {Document as IDocument, SerializableDocument} from '../document';
import {Element} from './element';
import {Element as IElement} from '../element';
import {NodeType, Visitor} from '../node';

export class Document implements IDocument {
  private readonly page: Page;
  private readonly element: ElementHandle;
  private readonly properties: SerializableDocument;

  get title(): string {
    return this.properties.title;
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

  public static async create(page: Page): Promise<Document> {
    const document: ElementHandle | null = await page.evaluateHandle((): DOMDocument => window.document)
      .then((document: JSHandle) => document.asElement());
    if (document === null) {
      throw new TypeError('window.document does not exist');
    }

    const properties = await page.evaluate((document: DOMDocument): SerializableDocument => {
      const {title, baseURI, nodeName, nodeType, nodeValue, textContent} = document;
      return {title, baseURI, nodeName, nodeType, nodeValue, textContent,};
    }, document);
    return new Document(page, document, properties);
  }

  private constructor(page: Page, element: ElementHandle, properties: SerializableDocument) {
    this.page = page;
    this.element = element;
    this.properties = properties;
  }

  public async head(): Promise<IElement | null> {
    const found = await this.page.evaluateHandle((document: DOMDocument): DOMElement => document.head, this.element);
    const element = found.asElement();
    return element !== null ? await Element.create(this.page, element) : null;
  }

  public async body(): Promise<IElement | null> {
    const found = await this.page.evaluateHandle((document: DOMDocument): DOMElement => document.body, this.element);
    const element = found.asElement();
    return element !== null ? await Element.create(this.page, element) : null;
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitDocument(this);
  }

  public async getElementById(id: string): Promise<IElement | null> {
    return await this.querySelector(`#${id}`);
  }

  public async getElementsByClassName(name: string): Promise<Array<IElement>> {
    // https://github.com/GoogleChrome/puppeteer/issues/461
    return await this.querySelectorAll(`.${name}`);
  }

  public async getElementsByTagName(name: string): Promise<Array<IElement>> {
    return await this.querySelectorAll(`${name}`);
  }

  public async querySelector(selector: string): Promise<IElement | null> {
    const found = await this.page.$(selector);
    return found === null ? null : await Element.create(this.page, found);
  }

  public async querySelectorAll(selector: string): Promise<Array<IElement>> {
    const found: ElementHandle<DOMElement>[] = await this.page.$$(selector);
    const promises: Promise<Element>[] = found.map(async (element: ElementHandle): Promise<Element> => await Element.create(this.page, element));
    return Promise.all(promises);
  }
}
