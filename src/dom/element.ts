import {Attribute} from './attribute';
import {Node, SerializableNode} from './node';

export interface Element extends Node {
  readonly id: string;
  readonly attributes: Array<Attribute>

  getAttribute(attributeName: string): Promise<string | null>
}

export type SerializableElement = Pick<Element, 'id' | 'attributes' | keyof SerializableNode>
