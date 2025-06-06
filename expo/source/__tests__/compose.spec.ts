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
});
