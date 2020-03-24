# xobi

> all-in-on mini observable object, state management, hook and connect function

Obi extends the functionality of objects to provide change detection.

Exports include optional preact integration with hook and connect function.

## Installation 
```sh
npm install xobi --save
```

## Usage
To create state who's properties you want to observe, pass an object to xobi and store the returned value to a variable.
This adds non enumerable properties to the object, and its nested objects, which can be used to subscribe to changes.
```js
import {xobi} from 'xobi';

let $state = xobi({
    foo: 'bar',
    arr: ['a', 'b', 'c'],
    $i: 'will not trigger update when i change', 
    count:0,
    some: {
        count:0,
        nested: 'value',
        other: 'nested value'
    },
});

$state.$onAnyChange((paths)=>{
    console.log('state updated!', paths)
});

$state.count++;
$state.some.count++;
// updates are batched. logs once: 'state updated', ['count','some.count']
```

### With Preact

```js
import {h,Component} from 'preact';
import {xobi} from 'xobi/preact'; // some bundlers have the option to alias this ('xobi': 'xobi/preact')

const state = xobi({
    hello: '', 
    count:0, 
    nested: { 
        count:0, 
        foo: 'bar',
        baz: 'bang' 
    } 
});

const {nested} = state;
 
const Counter = () => {

    nested.$use(); // will rerender when changes happen on the "nested" branch only

    // or to listen to any change on any branch, pass true to $use
    // state.$use(true)

    // or select specific property paths to listen to
    // state.$use(['nested.foo', 'nested.bar'])

    return (
        <div>
            <h1>{nested.count}</h1>
            <button onClick={() => nested.count++}>
                inc
            </button>
        </div>
    )
};

//connect class component with $connect. 
const ConnectedCounter = state.$connect('count')(class extends Component{
    render(){
     return (
            <div>
                <h1>{state.count}</h1>
                <button onClick={() => state.count++}>inc</button>
            </div>
        )
    }
})
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
let $state = xobi({
    foo: 'bar',
    getSetFoo: () =>{
        api.getFoo().then(data=>{
            $state.foo = data
        })
    }
});
```

Call $getState to retrieve only the object state properties (for example: console logging or form submission purposes) 
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
