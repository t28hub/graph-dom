import {Document} from './document';
import {Element} from './element';

export interface Node {
  readonly baseURI: string;
  readonly nodeName: string;
  readonly nodeType: NodeType;
  readonly nodeValue: string | null;
  readonly textContent: string | null;

  accept<R>(visitor: Visitor<R>): R

  children(): Promise<Array<Node>>
}

export type SerializableNode = Pick<Node, 'baseURI' | 'nodeName' | 'nodeType' | 'textContent' | 'nodeValue'>

export enum NodeType {
  // noinspection JSUnusedGlobalSymbols
  ELEMENT_NODE = 1,
  ATTRIBUTE_NODE,
  TEXT_NODE,
  CDATA_SECTION_NODE,
  ENTITY_REFERENCE_NODE,
  ENTITY_NODE,
  PROCESSING_INSTRUCTION_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_TYPE_NODE,
  DOCUMENT_FRAGMENT_NODE,
  NOTATION_NODE,
}

export interface Visitor<T> {
  visitElement(element: Element): T;

  visitDocument(document: Document): T;

  defaultAction(node: Node): T;
}
