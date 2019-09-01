import {IResolverObject} from 'graphql-tools';
import {Element, NodeType} from '../../dom';
import {Attribute} from '../../dom/attribute';
import {Context} from '../context';
import {Data} from '../../dom/data';

export const resolver: IResolverObject = {
  attributes: async (element: Element): Promise<Array<Attribute>> => {
    return element.attributes();
  },
  dataset: async (element: Element): Promise<Array<Data>> => {
    return element.dataset();
  },
  innerHTML: async (element: Element): Promise<string> => {
    return element.innerHTML();
  },
  outerHTML: async (element: Element): Promise<string> => {
    return element.outerHTML();
  },
  nodeType: (element: Element): string => {
    const {nodeType} = element;
    return NodeType[nodeType];
  },
  getAttribute: async (element: Element, args: { attributeName: string }, context: Context): Promise<string | null> => {
    const {attributeName} = args;
    return element.getAttribute(attributeName);
  },
  getElementsByClassName: async (element: Element, args: { name: string }): Promise<Array<Element>> => {
    const {name} = args;
    return element.getElementsByClassName(name);
  },
  getElementsByTagName: async (element: Element, args: { name: string }): Promise<Array<Element>> => {
    const {name} = args;
    return element.getElementsByTagName(name);
  },
  querySelector: async (element: Element, args: { selector: string }): Promise<Element | null> => {
    const {selector} = args;
    return await element.querySelector(selector);
  },
  querySelectorAll: async (element: Element, args: { selector: string }): Promise<Array<Element>> => {
    const {selector} = args;
    return await element.querySelectorAll(selector);
  },
};
