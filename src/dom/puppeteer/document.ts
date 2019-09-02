import {ElementHandle, JSHandle, Page} from 'puppeteer';
import {DOMDocument, DOMElement} from '../web';
import {Document as IDocument, SerializableDocument} from '../document';
import {Element as IElement} from '../element';
import {Visitor} from '../node';
import {Node} from './node';
import {Element} from './element';

export class Document extends Node<SerializableDocument> implements IDocument {
  public get title(): string {
    return this.properties.title;
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
    super(page, element, properties);
  }

  public async head(): Promise<IElement | null> {
    const {page, element} = this;
    const handle = await page.evaluateHandle((document: DOMDocument): DOMElement | null => {
      return document.head;
    }, element);
    const head = handle.asElement();
    return head !== null ? await Element.create(page, head) : null;
  }

  public async body(): Promise<IElement | null> {
    const {page, element} = this;
    const handle = await page.evaluateHandle((document: DOMDocument): DOMElement | null => {
      return document.body;
    }, element);
    const body = handle.asElement();
    return body !== null ? await Element.create(page, body) : null;
  }

  public async getElementById(id: string): Promise<IElement | null> {
    const {page, element} = this;
    const handle = await page.evaluateHandle((document: DOMDocument, id: string): HTMLElement | null => {
      return document.getElementById(id);
    }, element, id);
    if (handle === null) {
      return null;
    }

    const found = handle.asElement();
    return found === null ? null : await Element.create(page, found);
  }

  public async getElementsByClassName(name: string): Promise<Array<IElement>> {
    return super.getElementsByClassName(name);
  }

  public async getElementsByTagName(name: string): Promise<Array<IElement>> {
    return super.getElementsByTagName(name);
  }

  public async querySelector(selector: string): Promise<IElement | null> {
    return super.querySelector(selector);
  }

  public async querySelectorAll(selector: string): Promise<Array<IElement>> {
    return super.querySelectorAll(selector);
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitDocument(this);
  }

  protected async createElement(page: Page, element: ElementHandle): Promise<Element> {
    return Element.create(page, element);
  }
}
