var Tag = (function(){
  var SELF_CLOSING_TAGS = /area|base|basefont|br|hr|input|img|link|meta/,
  Tag;

  /**
   * Determines if an argument is of type string and has a valid length
   * @private
   * @param  {String}  str A string of text
   * @return {Boolean}
   */
  function isString(str) {
    return typeof str === 'string' && str.trim().length > 0;
  }

  /**
   * @private
   * Transforms an array of DOM-style attributes(e.g. class="foo") to a hash table
   * @param  {String[]} attrs An array of DOM-style attributes
   * @return {Object}
   */
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

  /**
   * @private
   * Meticulously parses the CSS-style selector provided and produces an Object
   * consisting of a tag name and the provided attributes
   * @param  {String} selector The original CSS-style (Sizzle-style) selector
   * @return {Object}          The transformed meta object for the selector
   */
  function parseSelector(selector) {
    var characterEncoding = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+',
      whitespace = '[\\x20\\t\\r\\n\\f]',
      identifier = characterEncoding.replace('w', 'w#'),
      tag = selector.match(new RegExp('(' + characterEncoding.replace('w', 'w*' ) + ')')),
      //TODO: Classes RegEx needs to account for URLs and other 'periods' in the selector that aren't classes
      classes = selector.match(new RegExp('\\.(' + characterEncoding + ')', 'g')),
      id = selector.match(new RegExp( '#(' + characterEncoding + ')')),
      attributes = selector.match(new RegExp( "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace + "*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]", "g"));

    attributes = tokenizeAttributes(attributes);
    classes = !classes || classes.length < 1 ? '' : classes.join(' ').replace(/\./g, '');
    id = !id ? undefined : id[0].replace('#', '');

    if(classes) {
      attributes['class'] = classes;
    }

    if(id) {
      attributes.id = id;
    }

    return {
      tag : tag[0],
      attributes: attributes
    };
  }

  /**
   * Adds the provided DOM attributes to the element from the provided tag's meta information
   * @private
   * @param {HTMLElement} element
   * @param {HTMLElement} tag
   */
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

  /**
   * Renders an HTMLELement-version of the tag and any children, recursively.
   * @private
   * @param  {tag} tag An instance of the Tag object
   * @return {HTMLElement}     The resulting HTMLElement
   */
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

  /**
   * C'tor
   @constructor
   * @param  {String} selector The CSS-style selector that defines the tag to be
   * created
   * @return {Object}          The meta object representing the tag
   */
  Tag = function(selector){
    var elementTokens = parseSelector(selector);

    this.name = elementTokens.tag;
    this.attributes = elementTokens.attributes;
    this.innerText = '';
    this.children = [];
  };

  /**
   * Adds a child tag to the tag
   * @return {Tag} This tag instance
   */
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

  /**
   * Returns the current value of the provided attribute
   * @param  {String} attr The attribute key
   * @return {String}      The value of the attribute
   */
  Tag.prototype.getAttr = function(attr) {
    if(isString(attr)) {
      return this.attributes[attr];
    }
  };

  /**
   * Sets the value of the provided attribute. Unlike Tag.prototype.addAttr,
   * This method is destructive.
   * @param  {String} attr  The attribute key to add to the Tag
   * @param  {String} value The value of the attribute to add to the Tag
   * @return {tag}       This instance of the tag
   */
  Tag.prototype.setAttr = function(attr, value) {
    if(isString(attr) && isString(value)) {
      this.attributes[attr] = value;
    }

    return this;
  };

  /**
   * If the provided condition is true, add the child tag
   * @param  {Boolean} condition  The condition
   * @param  {Tag} tag            The instance of the child tag
   * @return {Tag}                This current tag instance
   */
  Tag.prototype.addIf = function(condition, tag) {
    if(tag instanceof Tag) {
      return condition ? this.add(tag) : this;
    }
  };

  /**
   * Sets the innerText of the tag. Useful for elements with no children
   * who have a text value
   * @param  {String} text The text value of the tag
   * @return {Tag}      This instance of the tag
   */
  Tag.prototype.setText = function(text) {
    this.innerText = String(text);
    return this;
  };

  /**
   * Add a CSS class to the tag
   * @param  {String} className The CSS class name
   * @return {Tag}           This instance of the tag
   */
  Tag.prototype.addClass = function(className) {
    var classAttr = this.attributes['class'];

    if(classAttr.indexOf(className) === -1) {
      this.attributes['class'] += [' ', className].join('');
    }

    return this;
  };

  /**
   * Removes a CSS class from the tag
   * @param  {String} className The CSS class name
   * @return {Tag}           This instance of the tag
   */
  Tag.prototype.removeClass = function(className) {
    var classes = this.attributes['class'],
      attrIndex;

    if(!isString(className)) {
      return this;
    }

    if(isString(classes)) {
      classes = classes.split(' ');
      attrIndex = classes.indexOf(className);

       if(attrIndex > -1) {
         classes.splice(attrIndex, 1);
         this.attributes['class'] = classes.join(' ');
       }
    }

    return this;
  };

  /**
   * Remove the CSS class if the provided condition is true
   * @param  {Boolean} condition The condition
   * @param  {String} className The class name to remove from the tag
   * @return {Tag}           This instance of the class
   */
  Tag.prototype.removeClassIf = function(condition, className) {
    return condition && isString(className) ? this.removeClass(className) : this;
  };

  /**
   * Remove the provided attribute from the tag
   * @param  {String} attribute The attribute key
   * @return {Tag}           This tag instance
   */
  Tag.prototype.removeAttr = function(attribute) {
    delete this.attributes[attribute];
    return this;
  };

  /**
   * Remove the provided attribute if the provided condition is true
   * @param  {Boolean} condition The condition
   * @param  {String} attribute The key of the attribute to remove
   * @return {Tag}           This tag instance
   */
  Tag.prototype.removeAttrIf = function(condition, attribute) {
    return condition && isString(attribute) ? this.removeAttr(attribute) : this;
  };

  /**
   * Add an attribute to the tag
   * @param  {String} attribute The attribute key
   * @param  {String} value     The attribute value
   * @return {Tag}           This tag instance
   */
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

    if(isString(attribute) && isString(value)) {
      if(!this.attributes[attr]) {
        this.attributes[attribute] = value;
      }
    }

    return this;
  };

  /**
   * Add an attribute to the tag if the provided condition is true
   * @param  {Boolean} condition The condition
   * @param  {String} attribute The attribute key
   * @param  {String} value     The attribute value
   * @return {Tag}           This tag instance
   */
  Tag.prototype.addAttrIf = function(condition, attribute, value) {
    return condition ? this.addAttr(attribute, value) : this;
  };

  /**
   * Adds the provided class if the provided condition is true
   * @param  {Boolean} condition The condition
   * @param  {String} className The class to add to the tag
   * @return {Tag}           This tag instance
   */
  Tag.prototype.addClassIf = function(condition, className) {
    return condition ? this.addClass(className) : this;
  };

  /**
   * Renders the tag and its children recursively into either a string of text
   * or an HTMLElement composed through a DOMFragment.
   * @param  {Object} config An object of params for customizing how the tag
   * will render. Currently, only one param is supported:
   *   options: {
   *   	 format: 'String | HTMLElement'
   *   }
   * @return {String|HTMLElement}        The resulting string || HTMLElement
   */
  Tag.prototype.render = function(config){
    var innerHtml = '',
      options = config || {
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
        innerHtml += typeof children[i] === 'string' ? children[i] : children[i].render();
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
    if(!isString(selector)) {
      throw 'The selector provided does not supply a valid tag';
    }

    return new Tag(selector);
  };
}());
