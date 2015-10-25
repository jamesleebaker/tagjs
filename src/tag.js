/*jslint sloppy: true, todo: true, white: true */
var Tag = (function(){
  var SELF_CLOSING_TAGS = /area|base|basefont|br|hr|input|img|link|meta/,
  Tag;

  function tokenizeAttributes(attrs) {
    var attributes = {},
      split,
      i,
      j;

    if(!attrs || attrs.length < 1) {
      return attributes;
    }

    for (i = 0, j = attrs.length; i < j; i += 1) {
      split = attrs[i].replace(/['\"\[\]]/g, '').split('=');
      attributes[split[0]] = split[1];
    }

    return attributes;
  }

  function parseSelector(selector) {
    var characterEncoding = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+',
      whitespace = '[\\x20\\t\\r\\n\\f]',
      identifier = characterEncoding.replace('w', 'w#'),
      tag = selector.match(new RegExp('(' + characterEncoding.replace('w', 'w*' ) + ')')),
      //TODO: Classes RegEx needs to account for URLs and other 'periods' in the selector that aren't classes
      classes = selector.match(new RegExp('\\.(' + characterEncoding + ')', 'g')),
      id = selector.match(new RegExp( '#(' + characterEncoding + ')')),
      attributes = selector.match(new RegExp( "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace + "*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]", "g"));

    if(!tag) {
      throw 'The selector provided does not supply a valid tag';
    }

    attributes = tokenizeAttributes(attributes);
    classes = !classes || classes.length < 1 ? '' : classes.join(' ').replace(/\./g, '');
    id = !id ? undefined : id[0].replace('#', '');

    if(classes) {
      attributes['class'] = classes;
    }

    if(id) {
      attributes['id'] = id;
    }

    return {
      tag : tag[0],
      attributes: attributes
    };
  }

  function setElementAttributes(element, tag) {
    var attributes = tag.attributes;

    for(var attr in attributes) {
      var value = attributes[attr];

      if(value) {
        element.setAttribute(attr, value);
      }
    }

    return element;
  }

  function renderDOMFragment(tag) {
    var container = document.createElement(tag.name),
      fragment = document.createDocumentFragment();

    if(!tag.children.length) {
      container.innerText = tag.innerText;
    } else {
      tag.children.forEach(function(child) {
        fragment.appendChild(renderDOMFragment(child));
      });

      container.appendChild(fragment);
    }

    return setElementAttributes(container, tag);
  }

  Tag = function(selector){
    var elementTokens = parseSelector(selector);

    this.name = elementTokens.tag;
    this.attributes = elementTokens.attributes;
    this.innerText = '';
    this.children = [];
  };

  //TODO: Provide a way to pass in attributes as params
  Tag.prototype.add = function(){
    var args = Array.prototype.slice.call(arguments),
      i, j;

    if(args.length) {
      for (i = 0, j = args.length; i < j; i += 1) {
        this.children.push(args[i]);
      }
    }

    return this;
  };

  Tag.prototype.getAttr = function(attr) {
    return this.attributes[attr];
  };

  Tag.prototype.setAttr = function(attr) {
    if(attr) {
      this.attributes[attr] = attr;
    }

    return this;
  };

  Tag.prototype.addIf = function(condition, selector) {
    return condition
      ? this.add(selector)
      : this;
  };

  Tag.prototype.setText = function(text) {
    this.innerText = String(text);
    return this;
  };

  Tag.prototype.addClass = function(className) {
    var classAttr = this.attributes['class'];

    if(classAttr.indexOf(className) === -1) {
      this.attributes['class'] += [' ', className].join('');
    }

    return this;
  };

  Tag.prototype.removeClass = function(className) {
    var classes = this.attributes['class'],
      attrIndex = classes.indexOf(className);

    if(attrIndex > -1) {
      classes = classes.split(' ');
      classes.splice(attrIndex, 1);
      this.attributes['class'] = classes.join(' ');
    }

    return this;
  };

  Tag.prototype.removeClassIf = function(condition, className) {
    return condition
      ? this.removeClass(className)
      : this;
  };

  Tag.prototype.removeAttr = function(attribute) {
    delete this.attributes[attribute];
    return this;
  };

  Tag.prototype.removeAttrIf = function(condition, attribute) {
    return condition
      ? this.removeAttr(attribute)
      : this;
  };

  Tag.prototype.addAttr = function(attribute, value) {
    var attr;

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
  };

  Tag.prototype.addAttrIf = function(condition, attribute, value) {
    return condition
      ? this.addAttr(attribute, value)
      : this;
  };

  Tag.prototype.addClassIf = function(condition, className) {
    return condition
      ? this.addClass(className)
      : this;
  };

  Tag.prototype.render = function(options){
    var innerHtml = '',
      options = options || {
        format: 'HTMLElement'
      },
      i,
      j,
      attributes = this.attributes,
      markup = ['<', this.name],
      children = this.children,
      attribute,
      isSelfClosing = SELF_CLOSING_TAGS.test(this.name);

    if((window && window.document) && options.format === 'HTMLElement') {
      return renderDOMFragment(this);
    }

    if(attributes) {
      for (attribute in attributes) {
        if(attributes.hasOwnProperty(attribute) && attributes[attribute]) {
          markup.push(' ', attribute, '="', attributes[attribute], '"');
        }
      }
    }

    if(isSelfClosing) {
      markup.push(' />');

      if(children.length) {
        throw ['Nested content was provided for the tag name: ', this.name].join('');
      }

    } else {
      markup.push('>');

      for (i = 0, j = children.length; i < j; i += 1) {
        // Accounting for already rendered tags
        innerHtml += typeof children[i] === 'string'
          ? children[i]
          : children[i].render();
      }

      if(this.innerText.length > 0) {
        markup.push(this.innerText);
      }

      if(innerHtml.length > 0) {
        markup.push(innerHtml);
      }

      markup.push(['</', this.name, '>'].join(''));
    }

    return markup.join('');
  };

  return function(selector) {
    return new Tag(selector);
  };
}());
