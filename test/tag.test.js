describe('Tag.js at construction', () => {
  const INNER_TEXT = 'Test';

  let tag = Tag('div.container');
  tag.setText(INNER_TEXT);

  it('Can create an instance', () => {
    expect(tag).toEqual(jasmine.any(Object));
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

describe('Adding child tags to a container tag', () => {});

describe('Tag helper methods', () => {
  describe('Tag.prototype.add', () => {});
  describe('Tag.prototype.getAttr', () => {});
  describe('Tag.prototype.setAttr', () => {});
  describe('Tag.prototype.addIf', () => {});
  describe('Tag.prototype.setText', () => {});
  describe('Tag.prototype.addClass', () => {});
  describe('Tag.prototype.removeClass', () => {});
  describe('Tag.prototype.removeClassIf', () => {});
  describe('Tag.prototype.removeAttr', () => {});
  describe('Tag.prototype.removeAttrIf', () => {});
  describe('Tag.prototype.addAttr', () => {});
  describe('Tag.prototype.addAttrIf', () => {});
  describe('Tag.prototype.addClassIf', () => {});
});

describe('Rendering a tag and its children as a string', () => {});
describe('Rendering a tag and its children as a DOMFragment', () => {});
