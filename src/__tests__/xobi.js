import { createXobi } from '../createXobi.js';

const xobi = createXobi();


it('non enumerable properties are hidden', () => {

  const expected = { a: 1, b: 2, c: 3 };
  const state = xobi(expected);

  expect(Object.keys(state).length).toBe(Object.keys(expected).length);

  let copy = {};

  for (let k in state) {
    copy[k] = state[k];
  }

  expect(copy).toMatchObject(state);
});


