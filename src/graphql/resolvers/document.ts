import {IResolverObject} from 'graphql-tools';
import {Document, Element, NodeType} from '../../dom';

export const resolver: IResolverObject = {
  head: async (document: Document): Promise<Element | null> => {
    return await document.head();
  },
  body: async (document: Document): Promise<Element | null> => {
    return await document.body();
  },
  nodeType: (document: Document): string => {
    const {nodeType} = document;
    return NodeType[nodeType];
  },
  getElementById: async (document: Document, args: { id: string }): Promise<Element | null> => {
    const {id} = args;
    return await document.getElementById(id);
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
    return await document.querySelector(selector);
  },
  querySelectorAll: async (document: Document, args: { selector: string }): Promise<Array<Element>> => {
    const {selector} = args;
    return await document.querySelectorAll(selector);
  },
};
