import {h, Component} from 'preact';
import {shallow, mount, render} from 'enzyme';
import {xobi} from "../src/react";

const until = time => new Promise(r => setTimeout(r, time || 1));

describe('xobi', () => {

    it('non enumerable properties are hidden', () => {

        const expected = {a: 1, b: 2, c: 3};
        const state = xobi(expected);

        expect(Object.keys(state).length).toBe(Object.keys(expected).length);

        let copy = {};

        for (let k in state) {
            copy[k] = state[k];
        }

        expect(copy).toMatchObject(state);
    });

    it('$onChange notifies only when branch level properties are changed. changes are debounced by promise', async () => {

        const state = xobi({count: 0, nested: {nestedCount: 0}});

        let changeCallback = jest.fn();

        state.$onChange(changeCallback);

        let cb2 = jest.fn();

        state.nested.$onChange(cb2);

        state.count++;

        state.nested.nestedCount++;

        state.nested.nestedCount++;

        state.count++;

        await until();

        expect(cb2).toBeCalledTimes(1);

        expect(changeCallback).toBeCalledTimes(1);

        state.count++;

        state.nested.nestedCount++;

        state.nested.nestedCount++;

        state.count++;

        await until();

        expect(cb2).toBeCalledTimes(2);

        expect(changeCallback).toBeCalledTimes(2);

    });

    it('$onAnyChange notifies when any level properties changes. changes are debounced by promise', async () => {

        const state = xobi({count: 0, nested: {nestedCount: 0, superNested: {superNestedCount: 0}}});

        let cb = jest.fn();

        state.$onAnyChange(cb);

        const {nested} = state;

        const {superNested} = nested;

        state.count++;

        await until();

        expect(cb).toBeCalledTimes(1);

        nested.nestedCount++;
        await until();

        expect(cb).toBeCalledTimes(2);

        superNested.superNestedCount++;

        await until();

        expect(cb).toBeCalledTimes(3);

        state.count++;
        nested.nestedCount++;
        superNested.superNestedCount++;
        await until();

        expect(cb).toBeCalledTimes(4);

    });


    it('using $merge allows multiple properties to be set with one change update per branch, and ignores when no value changes',
        async () => {

            const initialState = {
                x: 0,
                y: 0,
                z: 0,
                b: {
                    x: 0,
                    y: 0,
                    z: 0,
                    c: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }
            };

            const a = xobi({...initialState});

            const {b, b: {c}} = a;

            let aChange = jest.fn();

            a.$onChange(aChange);

            let bChange = jest.fn();

            b.$onChange(bChange);

            let cChange = jest.fn();

            c.$onChange(cChange);

            let count = 0;

            count++;

            await a.$merge({
                x: count,
                y: count,
                z: count
            });

            // await until();
            expect(aChange).toBeCalledTimes(1);
            expect(bChange).toBeCalledTimes(0);
            expect(cChange).toBeCalledTimes(0);


            count++;

            await b.$merge({
                x: count,
                y: count,
                z: count
            });

            expect(aChange).toBeCalledTimes(1);
            expect(bChange).toBeCalledTimes(1);
            expect(cChange).toBeCalledTimes(0);


            count++;

            await c.$merge({
                x: count,
                y: count,
                z: count
            });

            expect(aChange).toBeCalledTimes(1);
            expect(bChange).toBeCalledTimes(1);
            expect(cChange).toBeCalledTimes(1);


            count = 'asdf';

            await a.$merge({
                x: count,
                y: count,
                z: count,
                b: {
                    x: count,
                    y: count,
                    z: count,
                    c: {
                        x: count,
                        y: count,
                        z: count,
                    }
                }
            });



            expect(aChange).toBeCalledTimes(2);
            expect(bChange).toBeCalledTimes(2);
            expect(cChange).toBeCalledTimes(2);

            expect(a).toMatchObject({
                x: count,
                y: count,
                z: count,
                b: {
                    x: count,
                    y: count,
                    z: count,
                    c: {
                        x: count,
                        y: count,
                        z: count,
                    }
                }
            });
            //
            // // test if change detection is still intact
            a.x = 'xyz';
            b.x = 'xyz';
            c.x = 'xyz';

            await until();

            expect(aChange).toBeCalledTimes(3);
            expect(bChange).toBeCalledTimes(3);
            expect(cChange).toBeCalledTimes(3);

            expect(a).toMatchObject({
                x: 'xyz',
                y: count,
                z: count,
                b: {
                    x: 'xyz',
                    y: count,
                    z: count,
                    c: {
                        x: 'xyz',
                        y: count,
                        z: count,
                    }
                }
            });

            b.y = 'xyz';

            await until();
            expect(aChange).toBeCalledTimes(3);
            expect(bChange).toBeCalledTimes(4);
            expect(cChange).toBeCalledTimes(3);

            expect(a).toMatchObject({
                x: 'xyz',
                y: count,
                z: count,
                b: {
                    x: 'xyz',
                    y: 'xyz',
                    z: count,
                    c: {
                        x: 'xyz',
                        y: count,
                        z: count,
                    }
                }
            });

            c.y = 'xyz';
            await until();
            expect(aChange).toBeCalledTimes(3);
            expect(bChange).toBeCalledTimes(4);
            expect(cChange).toBeCalledTimes(4);

            expect(a).toMatchObject({
                x: 'xyz',
                y: count,
                z: count,
                b: {
                    x: 'xyz',
                    y: 'xyz',
                    z: count,
                    c: {
                        x: 'xyz',
                        y: 'xyz',
                        z: count,
                    }
                }
            });

           await a.$merge({
                y: 'xyz',
                z: 'xyz'
            });


            expect(aChange).toBeCalledTimes(4);
            expect(bChange).toBeCalledTimes(4);
            expect(cChange).toBeCalledTimes(4);

            expect(a).toMatchObject({
                x: 'xyz',
                y: 'xyz',
                z: 'xyz',
                b: {
                    x: 'xyz',
                    y: 'xyz',
                    z: count,
                    c: {
                        x: 'xyz',
                        y: 'xyz',
                        z: count,
                    }
                }
            });


            await a.$merge({
                b: {
                    z: 'xyz',
                    c: {
                        z: 'xyz'
                    }
                }
            });


            expect(aChange).toBeCalledTimes(4);
            expect(bChange).toBeCalledTimes(5);
            expect(cChange).toBeCalledTimes(5);

            expect(a).toMatchObject({
                x: 'xyz',
                y: 'xyz',
                z: 'xyz',
                b: {
                    x: 'xyz',
                    y: 'xyz',
                    z: 'xyz',
                    c: {
                        x: 'xyz',
                        y: 'xyz',
                        z: 'xyz',
                    }
                }
            });

            await a.$merge({
                x: 0,
                y: 0,
                z: 0,
                b: {
                    x: 0,
                    y: 0,
                    z: 0,
                    c: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }
            });


            expect(aChange).toBeCalledTimes(5);
            expect(bChange).toBeCalledTimes(6);
            expect(cChange).toBeCalledTimes(6);

            expect(a).toMatchObject({
                x: 0,
                y: 0,
                z: 0,
                b: {
                    x: 0,
                    y: 0,
                    z: 0,
                    c: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }
            });

            // do same thing again to check that it ignores same value updates
           await a.$merge({
                x: 0,
                y: 0,
                z: 0,
                b: {
                    x: 0,
                    y: 0,
                    z: 0,
                    c: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }
            });

            expect(aChange).toBeCalledTimes(5);
            expect(bChange).toBeCalledTimes(6);
            expect(cChange).toBeCalledTimes(6);

            expect(a).toMatchObject({
                x: 0,
                y: 0,
                z: 0,
                b: {
                    x: 0,
                    y: 0,
                    z: 0,
                    c: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }
            });

        });

    it('can merge nested objects by assignment', async ()=>{

        const state = xobi({
            x: 0,
            y: 0,
            z: 0,
            b: {
                x: 0,
                y: 0,
                z: 0,
                c: {
                    x: 0,
                    y: 0,
                    z: 0
                }
            }
        });

        let anyChange = jest.fn();

        state.$onAnyChange(anyChange);

        state.b = {x:'updated', c:{x: 'updated'}};

        await until();

        expect(anyChange).toBeCalledTimes(1);

        expect(state).toMatchObject({
            x: 0,
            y: 0,
            z: 0,
            b: {
                x: 'updated',
                y: 0,
                z: 0,
                c: {
                    x: 'updated',
                    y: 0,
                    z: 0
                }
            }
        })


    });


    it('$select only notifies changes for property paths that are passed to it', async () => {

        const state = xobi({count: 0, count2: 0, nested: {nestedCount: 0, superNested: {superNestedCount: 0}}});

        let countCb = jest.fn();

        state.$select('count').$onChange(countCb);

        let count2Cb = jest.fn();

        state.$select('count2').$onChange(count2Cb);

        let nestedCountCb = jest.fn();

        state.$select('nested.nestedCount').$onChange(nestedCountCb);

        let superNestedCountCb = jest.fn();

        state.$select([
            'nested.superNested.superNestedCount'
        ]).$onChange(superNestedCountCb);

        let nestedAndSuperNestedCountCallback = jest.fn();

        state.$select([
            'nested.nestedCount',
            'nested.superNested.superNestedCount'
        ]).$onChange(nestedAndSuperNestedCountCallback);


        state.count++;
        await until();
        expect(countCb).toBeCalledTimes(1);
        expect(count2Cb).toBeCalledTimes(0);
        expect(nestedCountCb).toBeCalledTimes(0);
        expect(superNestedCountCb).toBeCalledTimes(0);
        expect(nestedAndSuperNestedCountCallback).toBeCalledTimes(0);

        state.count2++;
        await until();
        expect(countCb).toBeCalledTimes(1);
        expect(count2Cb).toBeCalledTimes(1);
        expect(nestedCountCb).toBeCalledTimes(0);
        expect(superNestedCountCb).toBeCalledTimes(0);
        expect(nestedAndSuperNestedCountCallback).toBeCalledTimes(0);

        state.nested.nestedCount++;
        await until();
        expect(countCb).toBeCalledTimes(1);
        expect(count2Cb).toBeCalledTimes(1);
        expect(nestedCountCb).toBeCalledTimes(1);
        expect(superNestedCountCb).toBeCalledTimes(0);
        expect(nestedAndSuperNestedCountCallback).toBeCalledTimes(1);

        state.nested.superNested.superNestedCount++;
        await until();
        expect(countCb).toBeCalledTimes(1);
        expect(count2Cb).toBeCalledTimes(1);
        expect(nestedCountCb).toBeCalledTimes(1);
        expect(superNestedCountCb).toBeCalledTimes(1);
        expect(nestedAndSuperNestedCountCallback).toBeCalledTimes(2);


        state.nested.nestedCount++;
        state.nested.nestedCount++;
        state.nested.superNested.superNestedCount++;
        state.nested.superNested.superNestedCount++;
        state.count2++;
        state.count2++;
        state.count++;
        state.count++;
        await until();
        expect(countCb).toBeCalledTimes(2);
        expect(count2Cb).toBeCalledTimes(2);
        expect(nestedCountCb).toBeCalledTimes(2);
        expect(superNestedCountCb).toBeCalledTimes(2);
        expect(nestedAndSuperNestedCountCallback).toBeCalledTimes(3);//only 3 because nest and super nest were batched together

    });


    it('unsubscribes from change notifications', async () => {

        const state = xobi({count: 0, nested: {nestedCount: 0}});

        let onChange = jest.fn();

        let onAnyChange = jest.fn();

        let selected = jest.fn();

        let onChangeUnsub = state.$onChange(onChange);

        let onAnyChangeUnsub = state.$onAnyChange(onAnyChange);

        let selectUnsub = state.$select('nested.nestedCount').$onChange(selected);

        state.count++;
        await until();
        expect(onChange).toBeCalledTimes(1);
        expect(onAnyChange).toBeCalledTimes(1);
        expect(selected).toBeCalledTimes(0);

        state.nested.nestedCount++;
        await until();
        expect(onChange).toBeCalledTimes(1);
        expect(onAnyChange).toBeCalledTimes(2);
        expect(selected).toBeCalledTimes(1);

        onChangeUnsub();
        onAnyChangeUnsub();
        selectUnsub();

        state.count++;
        state.nested.nestedCount++;
        await until();
        expect(onChange).toBeCalledTimes(1);
        expect(onAnyChange).toBeCalledTimes(2);
        expect(selected).toBeCalledTimes(1);

    });


    it('$use hook updates the component when state changes, batching multiple subsequent updates together', async () => {


        const state = xobi({count: 0});

        const rendered = jest.fn();

        const Counter = () => {

            state.$use();

            rendered();

            return (
                <div>
                    <h1>{state.count}</h1>
                    <button onClick={() => state.count++}>inc</button>
                </div>
            )
        };

        const context = shallow(<Counter/>);

        const h1 = () => context.find('h1'), button = () => context.find('button');

        expect(rendered).toBeCalledTimes(1);

        expect(h1().text()).toBe('0');

        button().simulate('click');
        button().simulate('click');
        button().simulate('click');
        button().simulate('click');
        button().simulate('click');

        await until();

        expect(h1().text()).toBe('5');
        expect(rendered).toBeCalledTimes(2);

        state.count++;
        state.count++;
        state.count++;
        state.count++;
        state.count++;

        await until();

        expect(h1().text()).toBe('10');
        expect(rendered).toBeCalledTimes(3);

    });

    it('$connect throws depreciation error', async () => {

        const state = xobi({count: 0});
        expect(()=>{
            state.$connect()(()=>{

            })
        }).toThrow();

    })


});