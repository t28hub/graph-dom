import {ElementHandle, Page} from 'puppeteer';
import {Attribute} from '../attribute';
import {DOMElement} from '../web';
import {Data} from '../data';
import {Element as IElement, SerializableElement} from '../element';
import {NodeType, Visitor} from '../node';
import {Delegation} from './delegation';

export class Element implements IElement {
  private readonly delegation: Delegation;
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
    const delegation = new Delegation(page, element);
    const properties = await page.evaluate((element: DOMElement): SerializableElement => {
      const {id, className, classList, baseURI, nodeName, nodeType, nodeValue, textContent} = element;
      return {id, className, classList: Array.from(classList), baseURI, nodeName, nodeType, nodeValue, textContent};
    }, element);
    return new Element(delegation, properties);
  }

  private constructor(delegation: Delegation, properties: SerializableElement) {
    this.delegation = delegation;
    this.properties = properties;
  }

  public accept<T>(visitor: Visitor<T>): T {
    return visitor.visitElement(this);
  }

  public async attributes(): Promise<Array<Attribute>> {
    return this.delegation.attributes();
  }

  public async children(): Promise<Array<IElement>> {
    return this.delegation.children();
  }

  public async dataset(): Promise<Array<Data>> {
    return this.delegation.dataset();
  }

  public async innerHTML(): Promise<string> {
    return this.delegation.innerHTML();
  }

  public async outerHTML(): Promise<string> {
    return this.delegation.outerHTML();
  }

  public async getAttribute(attributeName: string): Promise<string | null> {
    return this.delegation.getAttribute(attributeName);
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
