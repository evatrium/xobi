import { render, fireEvent, waitFor, act, screen } from '@testing-library/react';
import { xobi } from '../xobi-react';

fit('$use hook updates the component when state changes, batching multiple subsequent updates together', async () => {

  const state = xobi({ count: 0 });

  const multiState = xobi({ a: 0, b: 0, c: 0 }, { batch: false });

  const rendered = jest.fn();

  const Counter = () => {

    let { a, b, c } = multiState.$use();
    const { count } = state.$use();
    const updateCount = () => state.count++;
    const updateMultiState = () =>
      multiState.$merge({
        a: a + 1,
        b: b + 1,
        c: c + 1
      });

    rendered();

    return (
      <>
        <button data-testid={'count-button'} onClick={updateCount}>
          inc
        </button>
        <h1 data-testid={'count'}>{count}</h1>
        <button data-testid={'multi-count-button'} onClick={updateMultiState}>
          multi inc
        </button>
        <h2 data-testid={'multi'}>{`${a}${b}${c}`}</h2>
      </>
    );
  };

  render(<Counter/>);

  expect(rendered).toBeCalledTimes(1);

  const clickCountButton = () => fireEvent.click(screen.getByTestId('count-button'));
  const getCount = () => screen.getByTestId('count').textContent;

  const clickMultiCountButton = () => fireEvent.click(screen.getByTestId('multi-count-button'));
  const getMultiCount = () => screen.getByTestId('multi').textContent;

  //initial
  expect(getCount()).toBe('0');
  expect(getMultiCount()).toBe('000');

  // click count and inc count by 1
  await act(async () => {
    clickCountButton();
  });
  expect(rendered).toBeCalledTimes(2);
  expect(getCount()).toBe('1');
  expect(getMultiCount()).toBe('000');

  // click multi count and update many by 1
  await act(async () => {
    clickMultiCountButton();
  });
  expect(rendered).toBeCalledTimes(3);
  expect(getCount()).toBe('1');
  expect(getMultiCount()).toBe('111');


  // update state outside of component many times and expect 1 update
  await act(async () => {
    state.count++;
    state.count++;
    state.count++;
    state.count++;
    state.count++;
  });
  expect(rendered).toBeCalledTimes(4);
  expect(getCount()).toBe('6');
  expect(getMultiCount()).toBe('111');


  const updateMulti = () => {
    const updatedState = Object.keys(multiState).reduce((acc, curr) => {
      acc[curr] = multiState[curr] + 1;
      return acc;
    }, {});
    multiState.$merge(updatedState);
  };

  // update state outside of component many times and expect 1 update
  await act(async () => {
    updateMulti();
    updateMulti();
    updateMulti();
    updateMulti();
    updateMulti();
  });
  expect(rendered).toBeCalledTimes(5);
  expect(getCount()).toBe('6');
  expect(getMultiCount()).toBe('666');


});