import {Attribute} from './attribute';

export interface Node {
  readonly baseURI: string;
  readonly nodeName: string;
  readonly nodeType: NodeType;
  readonly nodeValue: string | null;
  readonly textContent: string | null;
  readonly attributes: Array<Attribute>

  getAttribute(attributeName: string): Promise<string | null>
}

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

export type SerializableNode = Pick<Node, 'baseURI' | 'nodeName' | 'nodeType' | 'textContent' | 'nodeValue' | 'attributes'>
