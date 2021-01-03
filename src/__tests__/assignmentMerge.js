import { createXobi } from '../createXobi.js';
import { until } from './_util';

const xobi = createXobi();

it('can merge nested objects by assignment', async () => {

  const myFunc = () => {
  };

  myFunc.prop = 0;

  const state = xobi({
    x: 0,
    y: 0,
    z: 0,
    b: {
      x: 0,
      y: 0,
      z: 0,
      myFunc,
      c: {
        x: 0,
        y: 0,
        z: 0
      }
    }
  });

  let anyChange = jest.fn();

  state.$onAnyChange(anyChange);

  state.b = {
    x: 'updated',
    myFunc: {
      prop: 'updated'
    },
    c: {
      x: 'updated'
    }
  };

  await until();

  expect(anyChange).toBeCalledTimes(1);

  expect(state.$getState()).toMatchObject({
    x: 0,
    y: 0,
    z: 0,
    b: {
      x: 'updated',
      y: 0,
      z: 0,
      myFunc: { prop: 'updated' },
      c: {
        x: 'updated',
        y: 0,
        z: 0
      }
    }
  });


});
