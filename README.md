# xobi

> all-in-on mini observable object, state management and (p)react hook

Obi extends the functionality of Objects to provide change detection.

Exports include preact and react integrations with $use hook.

## Installation 
```sh
npm install xobi --save
```

## Usage
To create state who's properties you want to observe, pass an object to xobi and store the returned value to a variable.
This adds non enumerable properties to the object, and its nested objects, which can be used to subscribe to changes.

#### Vanilla JavaScript example
```js
import {xobi} from 'xobi';

const initialState = {
    foo: 'bar',
    arr: ['a', 'b', 'c'],
    $i: 'props starting with "$" will not trigger updates when value changes', 
    count:0,
    some: {
        nested: 'value',
        other: 'nested value',
        count:0,
    },
};

let $state = xobi(initialState);

$state.$onAnyChange((paths)=>{
    console.log('state updated!', paths)
});

$state.count++;
$state.some.count++;
// updates are batched. console logs once: 'state updated!', ['count','some.count']
```

### With (p)react
```js
import {h, Component} from 'preact';
import {xobi} from 'xobi/preact'; // also default exports available: (import xobi from 'xobi/preact'
//import {xobi} from 'xobi/react'

const initialState = {
    hello: '', 
    count: 0,
    helloArray: ['hello-0'], 
    nested: { // nested branch
        count:0, 
        foo: 'bar',
        baz: 'bang' 
    } 
};

const state = xobi(initialState);

const {nested} = state;
 
const Counter = () => {

    const {count} = nested.$use(); // will rerender when changes happen on the "nested" branch only

    return (
        <div>
            <h1>{count}</h1>
            <button 
                onClick={() => nested.count++}
                 // rule of thumb: "dot-walk" out from the object that the value belongs to
                 // (nested.count++ not count++)
                //  so the component can re-render when changes are detected
                >
                inc
            </button>
        </div>
    )
};

let helloCount = 0; 
// to listen to any change on any nested branch, pass true to $use
const AllState = () => {
    const {helloArray} = state.$use(true);
    return(
        <div>
            <button onClick={() => {
                // mutating arrays will not trigger updates (ex: state.helloArray.push(`hello-${helloCount++}`)
                // instead, assign a copy of the array to a new array with the included value
                state.helloArray = [...helloArray, `hello-${helloCount++}`]
            }}>
                add hello
            </button>
            <pre>
                {JSON.stringify(state.$getState(), null, '\t')}
            </pre>
        </div>
    )
};

// select specific property paths to listen to 
const Selected = () => {                                       // string dot notation
    const {count, nested: {count: nestedCount}} = state.$use(['count', 'nested.count']);
    // component will rerender only when state.count or state.nested.count values change
    return(
        <div>
            <h1>Count : {count}</h1>
            <h1>Nested Count : {nestedCount}</h1>
        </div>
    )
}

```
#### Root level changes
$onChange is a property that exists on all objects nested within the state tree.
To subscribe to changes on the root properties of an object, pass a callback to $onChange. 
```js
const unsubscribe = $state.$onChange((paths) => {
    console.log('state changed: ', paths)
});
$state.foo = 'baz';
//logs: state changed: ['foo']
$state.some.nested = '*'; // does not trigger callback - see: Nested object property changes
//unsubscribe() //option to cancel subscription
```

#### Nested object property changes
To subscribe to a specific object branch within a state tree, utilize its dedicated $onChange property.
```js
$state.some.$onChange((paths) => {
    console.log('state changed: ', paths)
});
$state.some.nested = 'update';
//logs: state changed: ['some.nested']
$state.foo = 'hello';
//value is updated but does not trigger change on the 'some' branch
```
To subscribe to changes on values nested any layer deep within the state tree, pass a callback to $onAnyChange.
```js
$state.$onAnyChange((paths) => {
    console.log('state changed: ', paths)
});
// *note* destructuring works here because the 'nested' property is still dot-walked out to.
// see 'Notes to be mindfu'l of section
let {some} = $state;
some.nested = 'newValue'; 
//logs: state changed: ['some.nested']
```
#### Selecting specific properties to detect changes on
pass a string or an array of strings containing values that represent the property paths you want to be notified about, 
'dot-walking' out to any nested value if need be;
```js
const selected = $state.$select(['foo','some.nested']);
// for a single value, you can do: $state.$select('foo');
selected.$onChange((paths) => {
    console.log('state changed: ', paths)
});
$state.foo = 'bang';
//logs: state changed: ['foo']
$state.some.nested = 'I also trigger the update!'; 
//logs: state changed: ['some.nested']
```

#### Batching multiple updates at once
By default, the latest release of this package automatically batches multiple subsequent updates, but you may still 
use $merge to declaratively make multiple updates.

```js
$state.some.$onChange((paths) => {
    console.log('state changed: ', paths)
});
//pass an object to merge into the nested branch
$state.some.$merge({
    nested: 'updated',
    other: 'updated'
});
//will only trigger one update
//logs: state changed: ['some.nested', 'some.other']

const {some} = $state;

some.nested = 'update 2';
some.other = 'update 2';

//will also only trigger one update
//logs: state changed: ['some.nested', 'some.other']

```

If the value being updated was originally created as an object, making an assignment to it with an object as a value 
will automatically merge in the new properties while preserving other properties not being updated.

```js
/*remember to dot.walk when making assignments*/
$state.some = {nested: 'heyyo', other: 'value'};
console.log($state.some.$getState()); // logs {nested: 'heyyo', other: 'value', count: 0} <- count value untouched.
```

#### Notes to be mindful of
In order to ensure the callback is triggered, you must 'dot-walk' out at least once to a property when making assignments.

**DON'T DO THIS**
```js
// destructuring down to a single property will *not* trigger the $onChange callback when assigning a new value.
let {foo} = $state; 
foo = 'baz'; // value is updated but no callback triggered;
````
**DO THIS**
```js
$state.foo = 'baz'; // this will trigger change detection
const {some} = $state;
some.nested = 'heyyo'; // this will work too
```
Updating arrays 
```js
$state.arr.push('d'); // mutations on arrays will not trigger updates!
$state.arr = [...$state.arr, 'd']; //use the spread operator to trigger the update.
```
If for some reason you'd like properties on your state to not trigger updates, use a property name that starts with '$'. 
Properties that start with '$' will not trigger change callbacks when updated.
```js
$state.$i = 'updated';
//value is updated but does not trigger change callback.
```
Functions may be included on the state object.
```js
import {xobi} from 'xobi/preact';
import {api} from './api';
let $ = xobi({
    foo: null,
    fetching: false,
    errorMessage: '',
    getSetFoo: () => {
        $.fetching = true
        api.getFoo().then(data => {
            $.$merge({ foo: data, fetching: false, errorMessage:'' })
        }).catch((error)=>{
             $.$merge({ foo: null, fetching: false, errorMessage: error })
        })
    }
});
export {$ as $fooApi}
```

Call $getState to retrieve only a copy of the object state properties (for example: console logging or form submission purposes) 
while excluding any non stateful properties like functions.  
```js
console.log($state.$getState());
/*
    logs: 
{
    foo: 'bar',
    arr: ['a', 'b', 'c'],
    $i: 'will not trigger update when i change', 
    some: {
        nested: 'value',
        other: 'nested value'
    },
}
*/
```

#### Under the hood
xobi uses Object.defineProperty over Proxy for a few reasons. Given that Proxy provides suitable functionality, 
there are still some small nuances that exist with it that end up not setting its benefits far apart from what 
Object.defineProperty provides when solely detecting object property changes. Not to mention, if you're worried about 
browser support, there is only a partial polyfill for Proxy that does not cover all bases for legacy browsers. 

Here is the polyfill for proxy in case you're interested in messing around with it :) https://github.com/GoogleChrome/proxy-polyfill
### License

[MIT]

[MIT]: https://choosealicense.com/licenses/mit/
