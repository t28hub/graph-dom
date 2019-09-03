import {IResolverObject} from 'graphql-tools';
import {Element, Node, NodeType} from '../../dom';
import {Attribute} from '../../dom/attribute';
import {Data} from '../../dom/data';

// noinspection JSUnusedGlobalSymbols
export const resolver: IResolverObject = {
  attributes: async (element: Element): Promise<Array<Attribute>> => {
    return element.attributes();
  },
  children: async (element: Element): Promise<Array<Node>> => {
    return element.children();
  },
  childNodes: async (element: Element): Promise<Array<Node>> => {
    return element.childNodes();
  },
  firstChild: async (element: Element): Promise<Node | null> => {
    return element.firstChild();
  },
  lastChild: async (element: Element): Promise<Node | null> => {
    return element.lastChild();
  },
  nextSibling: async (element: Element): Promise<Node | null> => {
    return element.nextSibling();
  },
  previousSibling: async (element: Element): Promise<Node | null> => {
    return element.previousSibling();
  },
  parentElement: async (element: Element): Promise<Element | null> => {
    return element.parentElement();
  },
  parentNode: async (element: Element): Promise<Node | null> => {
    return element.parentNode();
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
  getAttribute: async (element: Element, args: { name: string }): Promise<string | null> => {
    const {name} = args;
    return element.getAttribute(name);
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
