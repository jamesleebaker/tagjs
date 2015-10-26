describe('Tag.js at construction', () => {
  const INNER_TEXT = 'Test';

  let tag = Tag('div.container');
  tag.setText(INNER_TEXT);

  it('Can create an instance', () => {
    expect(tag).toEqual(jasmine.any(Object));
    expect(function() { Tag() }).toThrow('The selector provided does not supply a valid tag');
  });

  it('Has a "name" property called "div"', () => {
    expect(tag.name).toEqual('div');
  });

  it('Has an "attributes" property that is an object with a single property called "class"', () => {
    expect(tag.attributes).toEqual(jasmine.any(Object));
    expect(tag.attributes).toEqual({ 'class': 'container' });
  });

  it(`Has an innerText property with a value of "${INNER_TEXT}"`, () => {
    expect(tag.innerText).toEqual(INNER_TEXT);
  });

  it('Has a property called "children" that is an empty array', () => {
    expect(tag.children).toEqual(jasmine.any(Array));
  });
});

describe('Adding attributes to an existing tag', () => {
  let tag = Tag('div.container');

  it('Can add a class to the tag', () => {
    tag.addClass('test-class');
    expect(tag.attributes['class']).toEqual('container test-class');
  });
});

describe('Adding child tags to a container tag', () => {
  let tag = Tag('div.container');
  let child = Tag('span.child');

  tag.add(child);

  it('Should have a single child tag', () => {
    expect(tag.children.length).toEqual(1);
    expect(tag.children[0]).toEqual(child);
    expect(tag.children[0].name).toEqual('span');
    expect(tag.children[0].attributes['class']).toEqual('child');
  });
});

describe('Tag helper methods', () => {
  let tag = Tag('div.container[data-foo="bar"]');

  it('Tag.prototype.getAttr', () => {
    expect(tag.getAttr('data-foo')).toEqual('bar');
  });

  it('Tag.prototype.setAttr', () => {
    tag.setAttr('data-biz', 'bar');
    tag.setAttr('data-biz-foo', 'bar');
    tag.setAttr('data-biz-yo', '');

    expect(tag.getAttr('data-biz')).toEqual('bar');
    expect(tag.getAttr('data-biz-foo')).toEqual('bar');
    expect(tag.getAttr('data-biz-yo')).toBe(undefined);

    tag.removeAttr('data-biz');
    tag.removeAttr('data-biz-foo');
    tag.removeAttr('data-biz-yo');
  });

  it('Tag.prototype.addIf', () => {
    const condition1 = false;
    const condition2 = true;
    const child1 = Tag('span.child');
    const child2 = Tag('span.child-two');

    tag.addIf(condition1, child1);
    tag.addIf(condition2, child2);

    expect(tag.children.length).toEqual(1);
    expect(tag.children[0]).toEqual(child2);
  });

  it('Tag.prototype.setText', () => {
    tag.setText('Test');
    expect(tag.innerText).toEqual('Test');

    tag.setText(42);
    expect(tag.innerText).toEqual('42');
  });

  it('Tag.prototype.addClass', () => {
    tag.addClass('foobar');
    tag.addClass('container');

    expect(tag.attributes['class']).toEqual('container foobar');
  });

  it('Tag.prototype.removeClass', () => {
    tag.removeClass('foobar');

    expect(tag.attributes['class']).toEqual('container');
  });

  it('Tag.prototype.removeClassIf', () => {
    tag.addClass('foobar');

    const condition1 = false;
    const condition2 = true;

    tag.removeClassIf(condition1, 'container');
    tag.removeClassIf(condition2, 'foobar');

    expect(tag.attributes['class']).toEqual('container');
  });

  it('Tag.prototype.addAttr', () => {
    tag.addAttr('data-biz', 'bar');
    tag.addAttr({
      id: 'main',
      href: 'http://www.google.com'
    });
    tag.addAttr('', 'foo');
    tag.addAttr('bar', '');

    expect(tag.attributes['data-biz']).toEqual('bar');
    expect(tag.attributes['id']).toEqual('main');
    expect(tag.attributes['href']).toEqual('http://www.google.com');
    expect(Object.keys(tag.attributes).length).toEqual(5);
  });

  it('Tag.prototype.addAttrIf', () => {
    const condition1 = false;
    const condition2 = true;

    tag.addAttrIf(condition1, 'data-test-one', 'some-value');
    tag.addAttrIf(condition2, 'data-test-two', 'some-value');

    expect(Object.keys(tag.attributes).length).toEqual(6);
    expect(tag.attributes['data-test-one']).toBeUndefined();
  });

  it('Tag.prototype.removeAttr', () => {
    tag.removeAttr('data-biz');
    tag.removeAttr('id');
    tag.removeAttr('href');

    expect(Object.keys(tag.attributes).length).toEqual(3);
  });

  it('Tag.prototype.removeAttrIf', () => {
    const condition1 = false;
    const condition2 = true;

    tag.removeAttrIf(condition1, 'class');
    tag.removeAttrIf(condition2, 'data-test-two');

    expect(tag.attributes['class']).not.toBeUndefined();
    expect(tag.attributes['data-test-two']).toBeUndefined();
  });

  it('Tag.prototype.addClassIf', () => {
    const condition1 = false;
    const condition2 = true;

    tag.addClassIf(condition1, 'wont-be-added');
    tag.addClassIf(condition2, 'will-be-added');

    expect(tag.attributes['class'].split(' ').length).toEqual(2);
    expect(tag.attributes['class'].indexOf('wont-be-added')).toEqual(-1);
    expect(tag.attributes['class'].indexOf('will-be-added')).toBeGreaterThan(-1);
  });
});

describe('Rendering a tag and its children as a string', () => {
  let tag = Tag('div.container');
  let child = Tag('span.child');

  tag.add(child);
  const result = tag.render();

  it('Renders a string of HTML', () => {
    if(!window) {
      expect(typeof result).toEqual('string');
      expect(result).toEqual('<div class="container"><span class="child"></span></div>');
    }
  });
});

describe('Rendering a tag and its children as a DOMFragment', () => {
  let tag = Tag('div.container');
  let child = Tag('span.child');

  tag.add(child);
  const result = tag.render();

  it('Renders an HTMLElement that contains one child element', () => {
    if(window && window.document) {
      expect(result instanceof HTMLElement).toBe(true);
      expect(result.children.length).toEqual(1);
      expect(result.children[0].classList.length).toEqual(1);
    }
  });
});
