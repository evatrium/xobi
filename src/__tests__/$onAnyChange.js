import { until } from './_util';
import { createXobi } from '../createXobi';
const xobi = createXobi();


it('$onAnyChange notifies when any level properties changes. changes are debounced by promise', async () => {

  const state = xobi({ count: 0, nested: { nestedCount: 0, superNested: { superNestedCount: 0 } } });

  let cb = jest.fn();

  state.$onAnyChange(cb);

  const { nested } = state;

  const { superNested } = nested;

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
