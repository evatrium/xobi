import { until } from './_util';
import { createXobi } from '../createXobi';
const xobi = createXobi();


it('using $merge allows multiple properties to be set with one change update per branch, and ignores when no value changes',
  async () => {

    const initialState = {
      x: 0,
      y: 0,
      z: 0,
      b: {
        x: 0,
        y: 0,
        z: 0,
        c: {
          x: 0,
          y: 0,
          z: 0
        }
      }
    };

    const a = xobi({ ...initialState });

    const { b, b: { c } } = a;

    let aChange = jest.fn();

    a.$onChange(aChange);

    let bChange = jest.fn();

    b.$onChange(bChange);

    let cChange = jest.fn();

    c.$onChange(cChange);

    let count = 0;

    count++;

    await a.$merge({
      x: count,
      y: count,
      z: count
    });


    expect(aChange).toBeCalledTimes(1);
    expect(bChange).toBeCalledTimes(0);
    expect(cChange).toBeCalledTimes(0);


    count++;

    await b.$merge({
      x: count,
      y: count,
      z: count
    });

    expect(aChange).toBeCalledTimes(1);
    expect(bChange).toBeCalledTimes(1);
    expect(cChange).toBeCalledTimes(0);


    count++;

    await c.$merge({
      x: count,
      y: count,
      z: count
    });

    expect(aChange).toBeCalledTimes(1);
    expect(bChange).toBeCalledTimes(1);
    expect(cChange).toBeCalledTimes(1);


    count = 'asdf';

    await a.$merge({
      x: count,
      y: count,
      z: count,
      b: {
        x: count,
        y: count,
        z: count,
        c: {
          x: count,
          y: count,
          z: count
        }
      }
    });


    expect(aChange).toBeCalledTimes(2);
    expect(bChange).toBeCalledTimes(2);
    expect(cChange).toBeCalledTimes(2);

    expect(a).toMatchObject({
      x: count,
      y: count,
      z: count,
      b: {
        x: count,
        y: count,
        z: count,
        c: {
          x: count,
          y: count,
          z: count
        }
      }
    });
    //
    // // test if change detection is still intact
    a.x = 'xyz';
    b.x = 'xyz';
    c.x = 'xyz';

    await until();

    expect(aChange).toBeCalledTimes(3);
    expect(bChange).toBeCalledTimes(3);
    expect(cChange).toBeCalledTimes(3);

    expect(a).toMatchObject({
      x: 'xyz',
      y: count,
      z: count,
      b: {
        x: 'xyz',
        y: count,
        z: count,
        c: {
          x: 'xyz',
          y: count,
          z: count
        }
      }
    });

    b.y = 'xyz';

    await until();
    expect(aChange).toBeCalledTimes(3);
    expect(bChange).toBeCalledTimes(4);
    expect(cChange).toBeCalledTimes(3);

    expect(a).toMatchObject({
      x: 'xyz',
      y: count,
      z: count,
      b: {
        x: 'xyz',
        y: 'xyz',
        z: count,
        c: {
          x: 'xyz',
          y: count,
          z: count
        }
      }
    });

    c.y = 'xyz';
    await until();
    expect(aChange).toBeCalledTimes(3);
    expect(bChange).toBeCalledTimes(4);
    expect(cChange).toBeCalledTimes(4);

    expect(a).toMatchObject({
      x: 'xyz',
      y: count,
      z: count,
      b: {
        x: 'xyz',
        y: 'xyz',
        z: count,
        c: {
          x: 'xyz',
          y: 'xyz',
          z: count
        }
      }
    });

    await a.$merge({
      y: 'xyz',
      z: 'xyz'
    });


    expect(aChange).toBeCalledTimes(4);
    expect(bChange).toBeCalledTimes(4);
    expect(cChange).toBeCalledTimes(4);

    expect(a).toMatchObject({
      x: 'xyz',
      y: 'xyz',
      z: 'xyz',
      b: {
        x: 'xyz',
        y: 'xyz',
        z: count,
        c: {
          x: 'xyz',
          y: 'xyz',
          z: count
        }
      }
    });


    await a.$merge({
      b: {
        z: 'xyz',
        c: {
          z: 'xyz'
        }
      }
    });


    expect(aChange).toBeCalledTimes(4);
    expect(bChange).toBeCalledTimes(5);
    expect(cChange).toBeCalledTimes(5);

    expect(a).toMatchObject({
      x: 'xyz',
      y: 'xyz',
      z: 'xyz',
      b: {
        x: 'xyz',
        y: 'xyz',
        z: 'xyz',
        c: {
          x: 'xyz',
          y: 'xyz',
          z: 'xyz'
        }
      }
    });

    await a.$merge({
      x: 0,
      y: 0,
      z: 0,
      b: {
        x: 0,
        y: 0,
        z: 0,
        c: {
          x: 0,
          y: 0,
          z: 0
        }
      }
    });


    expect(aChange).toBeCalledTimes(5);
    expect(bChange).toBeCalledTimes(6);
    expect(cChange).toBeCalledTimes(6);

    expect(a).toMatchObject({
      x: 0,
      y: 0,
      z: 0,
      b: {
        x: 0,
        y: 0,
        z: 0,
        c: {
          x: 0,
          y: 0,
          z: 0
        }
      }
    });

    // do same thing again to check that it ignores same value updates
    await a.$merge({
      x: 0,
      y: 0,
      z: 0,
      b: {
        x: 0,
        y: 0,
        z: 0,
        c: {
          x: 0,
          y: 0,
          z: 0
        }
      }
    });

    expect(aChange).toBeCalledTimes(5);
    expect(bChange).toBeCalledTimes(6);
    expect(cChange).toBeCalledTimes(6);

    expect(a).toMatchObject({
      x: 0,
      y: 0,
      z: 0,
      b: {
        x: 0,
        y: 0,
        z: 0,
        c: {
          x: 0,
          y: 0,
          z: 0
        }
      }
    });

  });



