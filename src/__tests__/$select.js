import { until } from './_util';
import { createXobi } from '../createXobi';

const xobi = createXobi();


it('$select only notifies changes for property paths that are passed to it', async () => {

  const state = xobi({
    count: 0,
    count2: 0,
    nested: {
      nestedCount: 0,
      superNested: {
        superNestedCount: 0
      }
    }
  });

  //listen for changes on root level count prop
  let countCb = jest.fn();
  state.$select('count').$onChange(countCb);

  //listen for changes on root level count2 prop
  let count2Cb = jest.fn();
  state.$select('count2').$onChange(count2Cb);

  //listen for changes on the nestedCount prop of the nested object
  let nestedCountCb = jest.fn();
  state.$select('nested.nestedCount').$onChange(nestedCountCb);

  //listen for changes on a single prop that is deeply nested
  // while using an optional array as an argument
  let superNestedCountCb = jest.fn();
  state.$select([
    'nested.superNested.superNestedCount'
  ]).$onChange(superNestedCountCb);

  //listen for changes on two properties that are nested on different branches
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