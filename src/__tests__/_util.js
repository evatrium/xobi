export const until = time => new Promise(r => setTimeout(r, time || 1));

// TODO: have jest ignore this file
it('test util "until" returns a promise', () => {
  expect(until() instanceof Promise).toBe(true);
});