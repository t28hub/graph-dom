import {Node, NodeType, SerializableNode} from '../node';
import {ElementHandle, Page} from 'puppeteer';
import {Attribute} from '../attribute';

export class PuppeteerNode implements Node {
  private readonly page: Page;
  private readonly element: ElementHandle;
  private readonly properties: SerializableNode;

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

  static async create(page: Page, element: ElementHandle): Promise<PuppeteerNode> {
    const properties = await page.evaluate((element: Element): SerializableNode => {
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

      const {baseURI, nodeName, nodeType, nodeValue, textContent} = element;
      return {
        baseURI, nodeName, nodeType, nodeValue, textContent,
        attributes: attributeList,
      };
    }, element);
    return new PuppeteerNode(page, element, properties);
  }

  private constructor(page: Page, element: ElementHandle, properties: SerializableNode) {
    this.page = page;
    this.element = element;
    this.properties = properties;
  }

  async getAttribute(attributeName: string): Promise<string | null> {
    return await this.page.evaluate((element: Element, attributeName: string): string | null => {
      return element.getAttribute(attributeName);
    }, this.element, attributeName);
  }
}
