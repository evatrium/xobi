import { until } from './_util';
import { createXobi } from '../createXobi';

const xobi = createXobi();


it('disables batch updates with option { batch: false }', async () => {

  // with batching
  const stateBatched = xobi({
    count: 0,
  });

  let cb1 = jest.fn();
  stateBatched.$onChange(cb1);


  stateBatched.count++;
  stateBatched.count++;
  stateBatched.count++;
  await until();
  expect(cb1).toBeCalledTimes(1);
  expect(stateBatched.count).toBe(3);


  // with batching disabled
  const state = xobi({
    count: 0,
  }, { batch: false });

  let cb2 = jest.fn();
  state.$onChange(cb2);


  state.count++;
  state.count++;
  state.count++;
  expect(cb2).toBeCalledTimes(3);
  expect(state.count).toBe(3);
});