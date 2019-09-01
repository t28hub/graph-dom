import {Attribute} from './attribute';
import {Node, SerializableNode} from './node';

export interface Element extends Node {
  readonly id: string;

  attributes(): Promise<Array<Attribute>>

  getAttribute(attributeName: string): Promise<string | null>

  getElementsByClassName(name: string): Promise<Array<Element>>

  getElementsByTagName(name: string): Promise<Array<Element>>

  querySelector(selector: string): Promise<Element | null>

  querySelectorAll(selector: string): Promise<Array<Element>>
}

export type SerializableElement = Pick<Element, 'id' | keyof SerializableNode>
