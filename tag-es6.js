//TODO: parseSelector RegEx needs to account for URLs and other 'periods' in the selector that aren't classes

const SELF_CLOSING_TAGS = /area|base|basefont|br|hr|input|img|link|meta/;

let tokenizeAttributes = (attrs = []) => {
  var attributes = {},
      split;

  if(!attrs || attrs.length < 1) {
    return attributes;
  }

  attrs.forEach(attr => {
    split = attr.replace(/['\"\[\]]/g, '').split('=');
    attributes[split[0]] = split[1];
  });

  return attributes;
}

let parseSelector = (selector = '') => {
  const characterEncoding = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+',
    whitespace = '[\\x20\\t\\r\\n\\f]',
    identifier = characterEncoding.replace('w', 'w#'),
    tag = selector.match(new RegExp(`(${characterEncoding.replace('w', 'w*')})`));

  let classes = selector.match(new RegExp('\\.(' + characterEncoding + ')', 'g')),
    id = selector.match(new RegExp(`#(${characterEncoding})`)),
    attributes = selector.match(new RegExp("\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace + "*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]", 'g'));

    if(!tag) {
      throw 'The selector provided does not supply a valid tag';
    }

    attributes = tokenizeAttributes(attributes);
    classes = (!classes || classes.length < 1) ? '' : classes.join(' ').replace(/\./g, '');
    attributes['class'] = classes;
    id = !id ? undefined : id[0].replace('#', '');
    attributes['id'] = id;

  return {
    tag : tag[0],
    classes : classes.split(' '),
    id : id,
    attributes: attributes
  };
}

let setElementAttributes = (element, tag) => {
  const attributes = tag.attributes;

  for(let attr in attributes) {
    let value = attributes[attr];

    if(value) {
      element.setAttribute(attr, value);
    }
  }

  return element;
}

let renderDOMFragment = (tag) => {
  let container = document.createElement(tag.name);
  let fragment = document.createDocumentFragment();


  tag.children.forEach(child =>  {
    fragment.appendChild(renderDOMFragment(child));
  });

  container.appendChild(fragment);
  return setElementAttributes(container, tag);
}

class Tag {
  constructor(selector) {
    var elementTokens = parseSelector(selector);

    this.name = elementTokens.tag;
    this.classes = elementTokens.classes;
    this.id = elementTokens.id;
    this.attributes = elementTokens.attributes;
    this.innerText = '';
    this.children = [];
    this.isSelfClosing = SELF_CLOSING_TAGS.test(this.name);
  }

  add(...children){
    if(children.length) {
      children.forEach(child => {
        this.children.push(child);
      });
    }

    return this;
  }

  addIf(condition, selector) {
    return condition ? this.add(selector) : this;
  }

  text(text) {
    this.innerText = String(text);
    return this;
  }

  addClass(className) {
    const classAttr = this.attributes['class'];

    if(this.classes.indexOf(className) === -1) {
      this.classes.push(className);

      if(classAttr && classAttr.indexOf(className) === -1) {
        this.attributes['class'] += [' ', className].join('');
      }
    }

    return this;
  }

  removeClass(className) {
    let classAttr = this.attributes['class'],
      classIndex = this.classes.indexOf(className),
      classAttrIndex = classAttr.indexOf(className);

    if(classIndex === -1 || (classAttr && classAttrIndex === -1)) {
      return this;
    }

    this.classes.splice(classIndex, 1);
    classAttr = classAttr.replace(className, '');

    this.attributes['class'] = classAttrIndex === 0
      ? classAttr.replace(' ', '')
      : classAttr.slice(0, classAttrIndex - 1);

    return this;
  }

  removeClassIf(condition, className) {
    return condition
      ? this.removeClass(className)
      : this;
  }

  removeAttr(attribute) {
    delete this.attributes[attribute];
    return this;
  }

  removeAttrIf(condition, attribute) {
    return condition
      ? this.removeAttr(attribute)
      : this;
  }

  addAttr(attribute, value) {
    let attr;

    if(typeof attribute === 'object') {
      for(attr in attribute) {
        if (attribute.hasOwnProperty(attr) && !this.attributes[attr]) {
          this.attributes[attr] = attribute[attr];
        }
      }

      return this;
    }

    this.attributes[attribute] = value;

    return this;
  }

  addAttrIf(condition, attribute, value) {
    return condition
      ? this.addAttr(attribute, value)
      : this;
  }

  addClassIf(condition, className) {
    return condition
      ? this.addClass(className)
      : this;
  }

  render() {
    if(window && window.document) {
      return renderDOMFragment(this);
    }

    let innerHtml = '';
    let attributes = this.attributes;
    let markup = ['<', this.name];
    let children = this.children;
    let attribute;

    if(attributes) {
      for (attribute in attributes) {
        if(attributes.hasOwnProperty(attribute) && attributes[attribute]) {
          markup.push(' ', attribute, '="', attributes[attribute], '"');
        }
      }
    }

    if(this.isSelfClosing) {
      markup.push(' />');

      if(children.length) {
        throw `Nested content was provided for a "${this.name}", a self-closing tag`;
      }

    } else {
      markup.push('>');

      this.children.forEach(child =>  {
        innerHtml += typeof children[i] === 'string'
          ? children[i]
          : children[i].render();
      });

      if(this.innerText.length > 0) {
        markup.push(this.innerText);
      }

      if(innerHtml.length > 0) {
        markup.push(innerHtml);
      }

      markup.push(`</${this.name}>`);
    }

    return markup.join('');
  }
}

export default (selector) => {
  return new Tag(selector);
}
