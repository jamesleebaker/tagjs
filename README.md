Tag.js
=====
A markup generator written in JS. Can be used both server-side and client-side for creating markup. Tag.js is incredibly lightweight (2Kb when minified) and fast.

Usage
=====
The use of is intended to be somewhat loose to allow developers to generate markup, preferably HTML. Currently tags in HTML5 that are self-closing will close automatically, though a future option to force self-closing will be implemented. 

You can use jQuery-style selectors (attributes, classes, and IDs only) to generate a Tag.

<strong>Input</strong>
```javascript
var module = Tag("div.container#site-wrapper[data-id=foo-bar]").add(
  Tag("ul.mario-characters").add(
    Tag("li").text("Mario"),
    Tag("li").text("Princess Peach"),
    Tag("li").text("Luigi").addAttrIf(hasLessPoints, "class", "hidden"),
    Tag("li").text("Bowser").addClassIf(isEnemy, "red")
  )
);

module.render(); //produces a string of HTML
```

<strong>Output</strong>
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

To Do
=====
- [ ] Document available methods and their signatures
- [ ] Include support for being able to self-close any tag
- [ ] Optimize for performance
- [ ] Fix issue when passing a URL in the initial selector
- [ ] Consider an option to render DOM fragments instead of string concatenation
- [ ] Make asynchronous
