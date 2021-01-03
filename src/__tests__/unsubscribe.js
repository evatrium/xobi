import { until } from './_util';
import { createXobi } from '../createXobi';

const xobi = createXobi();

it('unsubscribes from change notifications', async () => {

  const state = xobi({ count: 0, nested: { nestedCount: 0 } });

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