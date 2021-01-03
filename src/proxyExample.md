```js
// example from https://github.com/GoogleChrome/proxy-polyfill
function observe(o, callback) {
  function buildProxy(prefix, o) {
    return new Proxy(o, {
      set(target, property, value) {
        // same as above, but add prefix
        callback(prefix + property, value);
        target[property] = value;
      },
      get(target, property) {
        // return a new proxy if possible, add to prefix
        const out = target[property];
        if (out instanceof Object) {
          return buildProxy(prefix + property + '.', out);
        }
        return out;  // primitive, ignore
      },
    });
  }

  return buildProxy('', o);
}

const x = {model: {name: 'LEAF'}};
const p = observe(x, (property, value) => console.info(property, value));
p.model.name = 'Tesla';
// model.name Tesla
```
