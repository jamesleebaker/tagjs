# Tag.js
=====
The use of is intended to be somewhat loose to allow developers to generate markup, preferably HTML. Currently tags in HTML5 that are self-closing will close automatically, though a future option to force self-closing will be implemented.

You can use jQuery-style selectors (attributes, classes, and IDs only) to generate a Tag.

### Usage
=====

`Tag(selector)`

#### Example
```javascript
var module = Tag("div.container#site-wrapper[data-id=foo-bar]").add(
  Tag("ul.mario-characters").add(
    Tag("li").setText("Mario"),
    Tag("li").setText("Princess Peach"),
    Tag("li").setText("Luigi").addAttrIf(hasLessPoints, "class", "hidden"),
    Tag("li").setText("Bowser").addClassIf(isEnemy, "red")
  )
);

module.render(); //produces an HTMLElement
```

#### Output
```html
<div data-id="foo-bar" class="container" id="site-wrapper">
  <ul class="mario-characters">
    <li>Mario</li>
    <li>Princess Peach</li>
    <li class="hidden">Luigi</li>
    <li>Bowser</li>
  </ul>
</div>
```

### API
The following methods are provided to add/manipulate tags and render output:

##### `Tag.add(child1, child2, ... , child_n)`
Adds a child tag to the tag

```javascript
var icon = Tag('i.checkmark');
var button = Tag('button[type=submit]');

button.add(icon);
```

**Result from `button.render()` :**
```html
<button type="submit">
  <i class="checkmark"></i>
</button>
```

##### `Tag.getAttr(attr)`
Returns the current value of the provided attribute

```javascript
var div = Tag('div.foo');

div.getAttr('class'); // "foo"
```

##### `Tag.setAttr(setAttr)`
Sets the value of the provided attribute. Unlike Tag.prototype.addAttr, this method is destructive.

```javascript
var div = Tag('div.foo');

div.setAttr('id', 'main-wrapper');
```
**Result from `div.render()` :**
```html
<div class="foo" id="wrapper"></div>
```

##### `Tag.addIf(condition, child)`
If the provided condition is true, add the child tag

```javascript

var div = Tag('div.foo');

div.addIf(true, Tag('span.child'));

```

##### `Tag.setText(text)`
Sets the innerText of the tag. Useful for elements with no children who have a text value
```javascript
var div = Tag('div.foo');

div.setText('Hello World!');
```

**Result from `div.render()` :**
```html
<div class="foo">Hello World!</div>
```

##### `Tag.addClass(className)`
Add a CSS class to the tag

```javascript
var div = Tag('div.foo');

div.addClass('bar');
```

**Result from `div.render()` :**
```html
<div class="foo bar"></div>
```

##### `Tag.removeClass(className)`
Removes a CSS class from the tag

```javascript
var div = Tag('div.foo');

div.removeClass('foo');
```

**Result from `div.render()` :**
```html
<div></div>
```

##### `Tag.removeClassIf(condition, className)`
Remove the CSS class if the provided condition is true

```javascript
var div = Tag('div.foo');

div.removeClassIf(true, 'foo');
```

**Result from `div.render()` :**
```html
<div></div>
```

##### `Tag.removeAttr(attribute)`
Remove the provided attribute from the tag
```javascript
var div = Tag('div.foo#main');

div.removeAttr('class');
```

**Result from `div.render()` :**
```html
<div id="main"></div>
```

##### `Tag.removeAttrIf(condition, attribute)`
Remove the provided attribute if the provided condition is true
```javascript
var div = Tag('div.foo#main');

div.removeAttrIf(true, 'class');
```

**Result from `div.render()` :**
```html
<div id="main"></div>
```

##### `Tag.addAttr(attribute, value)`
Add an attribute to the tag

```javascript
var div = Tag('div.foo');

div.addAttr('id', 'main');
```

**Result from `div.render()` :**
```html
<div class="foo" id="main"></div>
```

##### `Tag.addAttrIf(condition, attribute)`
Add an attribute to the tag if the provided condition is true

```javascript
var div = Tag('div.foo');

div.addAttrIf(true, 'id', 'main');
```

**Result from `div.render()` :**
```html
<div class="foo" id="main"></div>
```

##### `Tag.addClassIf(condition, className)`
Adds the provided class if the provided condition is true
```javascript
var div = Tag('div.foo');

div.addClassIf(true, 'bar');
```

**Result from `div.render()` :**
```html
<div class="foo bar"></div>
```

##### `Tag.render(config)`
Renders the tag and its children recursively into either a string of text or an HTMLElement composed through a DOMFragment.

```javascript
var module = Tag("div.container#site-wrapper[data-id=foo-bar]").add(
  Tag("ul.mario-characters").add(
    Tag("li").setText("Mario"),
    Tag("li").setText("Princess Peach"),
    Tag("li").setText("Luigi").addAttrIf(hasLessPoints, "class", "hidden"),
    Tag("li").setText("Bowser").addClassIf(isEnemy, "red")
  )
);

var result = module.render(); //produces an HTMLElement

document.body.appendChild(result);
```

**Output**
```html
<div data-id="foo-bar" class="container" id="site-wrapper">
  <ul class="mario-characters">
    <li>Mario</li>
    <li>Princess Peach</li>
    <li class="hidden">Luigi</li>
    <li>Bowser</li>
  </ul>
</div>
```

## To Do
=====
- [ ] Document available methods and their signatures
- [ ] Include support for being able to self-close any tag
- [ ] Optimize for performance
- [ ] Fix issue when passing a URL in the initial selector
- [x] Consider an option to render DOM fragments instead of string concatenation
