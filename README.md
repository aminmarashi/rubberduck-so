# rubberduck-so

A code that is injected to the rubberduck.so pages and turns a piece of plain-text code into an interactive environment running via RunKit.

# How to create a notebook

A RunKit notebook is a simple coding environment which runs the code on RunKit servers.

## embed

Any element that has an `embed` class is turned into a RunKit notebook. The notebook will replace the element in the DOM and will be served from RunKit.

```html
<pre class="embed">
var x = 1;
</pre>
```

### Attributes

- `name` set this attribute if you want to refer to the code later (see `depends-on`)
- `depends-on` set this attribute to a comma separated list of other notebooks this notebook depends on, the other notebooks are loaded into the notebook as dependency but they will not be visible in the code itself. The dependency resolution is done recursively, please make sure there are no circular dependencies.
- `hidden` creates a notebook but hides it from the page (note that in this case the notebook doesn't load with RunKit), this is mostly useful for defining dependencies for other notebooks, for example, code that we want to run before each notebook, etc.

**A dependency:**

```html
<pre class="embed" hidden="true" name="function-definition">
function sayHello() {
  console.log('Hello world!');
}
</pre>
```

**Usage:**

```html
<pre class="embed" depends-on="function-definition">
sayHello();
</pre>
```

The end result (the hidden notebook is, well... hidden :) ):

<img width="702" alt="Screenshot 2021-12-17 at 5 33 51 PM" src="https://user-images.githubusercontent.com/6560964/146577364-ff64d1f6-62da-47db-b118-cc86f09b9e98.png">

