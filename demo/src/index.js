import {h, render} from 'preact';
// import {xobi} from "../../preact";
import {xobi} from "../../src/preact";

let count = 0;

const initialState = (count = 0) => ({
    a1: count,
    a2: count,
    a3: count,
    b: {
        b1: count,
        b2: count,
        b3: count,
        c: {
            c1: count,
            c2: count,
            c3: count
        }
    }
});

let a = xobi({...initialState()});


// a.$connect()()

// console.log(Object.keys(a))

// for (let k in a) {
//     console.log(k)
// }

a.$onAnyChange((paths) => {
    // console.log('any change', [...paths]);
});

a.$onChange((paths) => {
    // console.log('a changed', [...paths])

});


a.b.$onChange((paths) => {
    // console.log('b changed', [...paths])

});


a.b.c.$onChange((paths) => {
    // console.log('c changed', [...paths])
});




let rendered = 0;

const state = xobi({
    count: 0,
    addTen: () => {
        state.count += 10;
        state.nested.count += 10;
    },
    nested: {
        count: 0
    }
});

const Counter = () => {
    const {count, nested} = state.$use(true);
    return (
        <div>

            <h1>Shared State. Count!!: {count}</h1>

            <h1>Nested Count!!: {nested.count}</h1>

            <button onClick={() => state.count++}>
                Inc Count
            </button>

            <button onClick={state.addTen}>
                Add 10
            </button>

            <button onClick={() => nested.count++}>
                Inc nested Count
            </button>

        </div>
    );
};

const App = () => {

    const {a1} = a.$use(true);

    rendered++;
    console.log('rendered', rendered);

    return (
        <div>
            <h1>App</h1>

            <h1>Count: {a1}</h1>
            <button onClick={() => {
                count++;
                a.$merge(initialState(count)).then(() => {
                    console.log('promise works?',)
                });
            }}>
                inc
            </button>

            <button onClick={() => {
                a.b = {b1: 'i was merged!', c: {c3: 'i was merged too!!'}}
            }}>
                Merge somethign
            </button>
            <pre>
             {JSON.stringify(a.$getState(), null, '\t')}
             </pre>
            <Counter/>
            <Counter/>
            <Counter/>
        </div>
    )

};

render(<App/>, document.body);
