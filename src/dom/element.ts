import {Attribute} from './attribute';
import {Data} from './data';
import {Node, SerializableNode} from './node';

export interface Element extends Node {
  readonly id: string;
  readonly className: string;
  readonly classList: Array<string>;

  attributes(): Promise<Array<Attribute>>;

  children(): Promise<Array<Element>>;

  dataset(): Promise<Array<Data>>;

  innerHTML(): Promise<string>;

  outerHTML(): Promise<string>;

  getAttribute(attributeName: string): Promise<string | null>;

  getElementsByClassName(name: string): Promise<Array<Element>>;

  getElementsByTagName(name: string): Promise<Array<Element>>;

  querySelector(selector: string): Promise<Element | null>;

  querySelectorAll(selector: string): Promise<Array<Element>>;
}

export type SerializableElement = Pick<Element, 'id' | 'className' | 'classList' | keyof SerializableNode>
