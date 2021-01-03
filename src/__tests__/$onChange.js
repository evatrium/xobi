import { until } from './_util';
import { createXobi } from '../createXobi';
const xobi = createXobi();


it('$onChange notifies only when branch level properties are changed. changes are debounced by promise', async () => {

  const state = xobi({ count: 0, nested: { nestedCount: 0 } });

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