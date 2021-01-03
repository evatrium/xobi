import { until } from './_util';
import { createXobi } from '../createXobi';

const xobi = createXobi();


it('$getState returns the state properties from the observed object or function', async () => {

  const myFunc = () => {
  };

  myFunc.count = 0;

  class MyClass {
    constructor(props = {}) {
      Object.assign(this, props);
    }

    static count = 0;
  }

  const state = xobi({
    count: 0,
    myFunc,
    MyClass,
    classInstance: new MyClass({ prop: 0 }) // hmmmm...
  });


  expect(state.$getState()).toMatchObject({
    count: 0,
    myFunc: { count: 0 },
    MyClass: { count: 0 },
    classInstance: { prop: 0 }
  });


  state.count++;
  state.myFunc.count++;
  state.MyClass.count++;
  state.classInstance.prop++;
  await until();

  expect(state.$getState()).toMatchObject({
    count: 1,
    myFunc: { count: 1 },
    MyClass: { count: 1 },
    classInstance: { prop: 1 }
  });


});