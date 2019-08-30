import {Element} from './element';
import {Node, SerializableNode} from './node';

export interface Document extends Node {
  readonly title: string;

  querySelector(selector: string): Promise<Element | null>

  querySelectorAll(selector: string): Promise<Array<Element>>
}

export type SerializableDocument = Pick<Document, 'title' | keyof SerializableNode>
