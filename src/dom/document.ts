import { Element } from './element';
import { Node, SerializableNode } from './node';

export interface Document extends Node {
  readonly title: string;

  head(): Promise<Element | null>;

  body(): Promise<Element | null>;

  getElementById(id: string): Promise<Element | null>;

  getElementsByClassName(name: string): Promise<Array<Element>>;

  getElementsByTagName(name: string): Promise<Array<Element>>;

  querySelector(selector: string): Promise<Element | null>;

  querySelectorAll(selector: string): Promise<Array<Element>>;
}

export type SerializableDocument = Pick<Document, 'title' | keyof SerializableNode>;
