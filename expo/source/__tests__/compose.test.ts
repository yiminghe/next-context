import { compose } from '../compose';
import { describe, expect, it } from '@jest/globals';

describe('compose', () => {
  it('works', () => {
    const middleware = [
      async (context: any, next: Function) => {
        context.arr.push(1);
        await next();
        context.arr.push(6);
      },
      async (context: any, next: Function) => {
        context.arr.push(2);
        await next();
        context.arr.push(5);
      },
      async (context: any, next: Function) => {
        context.arr.push(3);
        await next();
        context.arr.push(4);
      },
    ];
    const context = { arr: [] };
    compose(middleware, context).then(() => {
      expect(context.arr).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  it('share works', async () => {
    const context = {};
    const ret: number[] = [];
    let first = true;
    const m1 = async (context: any, next: Function) => {
      ret.push(1);
      await sleep(first ? 100 : 200);
      await next();
    };

    const m2 = async (context: any, next: Function) => {
      ret.push(2);
    };

    const m3 = async (context: any, next: Function) => {
      ret.push(3);
    };

    await Promise.all([
      compose([m1, m2, m3], context),
      compose([m1, m2, m3], context),
    ]);

    expect(ret).toEqual([1, 2]);
  });
});
