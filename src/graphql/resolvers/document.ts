import {IResolverObject} from 'graphql-tools';
import {Document, Element, Node, NodeType} from '../../dom';

export const resolver: IResolverObject = {
  head: async (document: Document): Promise<Element | null> => {
    return document.head();
  },
  body: async (document: Document): Promise<Element | null> => {
    return document.body();
  },
  children: async (document: Document): Promise<Array<Node>> => {
    return document.children();
  },
  childNodes: async (document: Document): Promise<Array<Node>> => {
    return document.childNodes();
  },
  firstChild: async (document: Document): Promise<Node | null> => {
    return document.firstChild();
  },
  lastChild: async (document: Document): Promise<Node | null> => {
    return document.lastChild();
  },
  nextSibling: async (document: Document): Promise<Node | null> => {
    return document.nextSibling();
  },
  previousSibling: async (document: Document): Promise<Node | null> => {
    return document.previousSibling();
  },
  parentElement: async (document: Document): Promise<Element | null> => {
    return document.parentElement();
  },
  parentNode: async (document: Document): Promise<Node | null> => {
    return document.parentNode();
  },
  nodeType: (document: Document): string => {
    const {nodeType} = document;
    return NodeType[nodeType];
  },
  getElementById: async (document: Document, args: { id: string }): Promise<Element | null> => {
    const {id} = args;
    return document.getElementById(id);
  },
  getElementsByClassName: async (document: Document, args: { name: string }): Promise<Array<Element>> => {
    const {name} = args;
    return document.getElementsByClassName(name);
  },
  getElementsByTagName: async (document: Document, args: { name: string }): Promise<Array<Element>> => {
    const {name} = args;
    return document.getElementsByTagName(name);
  },
  querySelector: async (document: Document, args: { selector: string }): Promise<Element | null> => {
    const {selector} = args;
    return document.querySelector(selector);
  },
  querySelectorAll: async (document: Document, args: { selector: string }): Promise<Array<Element>> => {
    const {selector} = args;
    return document.querySelectorAll(selector);
  },
};
