import {ElementHandle, JSHandle, Page} from 'puppeteer';
import {DOMDocument} from '../web';
import {Delegation} from './delegation';
import {Document as IDocument, SerializableDocument} from '../document';
import {Element as IElement} from '../element';
import {NodeType, Visitor} from '../node';

export class Document implements IDocument {
  private readonly delegation: Delegation;
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

    const delegation = new Delegation(page, document);
    const properties = await page.evaluate((document: DOMDocument): SerializableDocument => {
      const {title, baseURI, nodeName, nodeType, nodeValue, textContent} = document;
      return {title, baseURI, nodeName, nodeType, nodeValue, textContent,};
    }, document);
    return new Document(delegation, properties);
  }

  private constructor(delegation: Delegation, properties: SerializableDocument) {
    this.delegation = delegation;
    this.properties = properties;
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitDocument(this);
  }

  public async head(): Promise<IElement | null> {
    return this.delegation.head();
  }

  public async body(): Promise<IElement | null> {
    return this.delegation.body();
  }

  public async children(): Promise<Array<IElement>> {
    return this.delegation.children();
  }

  public async getElementById(id: string): Promise<IElement | null> {
    return this.delegation.getElementById(id);
  }

  public async getElementsByClassName(name: string): Promise<Array<IElement>> {
    return this.delegation.getElementsByClassName(name);
  }

  public async getElementsByTagName(name: string): Promise<Array<IElement>> {
    return this.delegation.getElementsByTagName(name);
  }

  public async querySelector(selector: string): Promise<IElement | null> {
    return this.delegation.querySelector(selector);
  }

  public async querySelectorAll(selector: string): Promise<Array<IElement>> {
    return this.delegation.querySelectorAll(selector);
  }
}
