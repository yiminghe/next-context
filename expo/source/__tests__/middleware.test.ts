import { describe, it, expect } from '@jest/globals';
import {
  NextContext,
  NextFunction,
  withActionMiddlewares,
  withPageMiddlewares,
  withRouteMiddlewares,
} from '../common';
import {
  FORWARDED_HOST_HEADER,
  FORWARDED_URI_HEADER,
  NEXT_BASE_PATH_HEADER,
  NEXT_URL_HEADER,
} from '../constants';

describe('withPageMiddlewares', () => {
  const g: any = globalThis;
  g.__next_context_cookies = () => ({});
  g.__next_context_headers = () => ({
    [FORWARDED_HOST_HEADER]: 'http://x.com',
    [FORWARDED_URI_HEADER]: '/x',
    [NEXT_URL_HEADER]: 'http://x.com/x',
    [NEXT_BASE_PATH_HEADER]: '',
  });
  it('should apply middlewares to the page', async () => {
    let ret: any[] = [];
    const middlewares = [
      async (context: NextContext, next: NextFunction) => {
        ret.push('1');
        await next();
      },
      async (context: NextContext, next: NextFunction) => {
        ret.push('2');
        await next();
      },
      async (context: NextContext, next: NextFunction) => {
        ret.push('4');
        await next();
      },
    ];
    const handler: any = async () => {
      ret.push('3');
    };

    const wrappedHandler: any = withPageMiddlewares(middlewares)(handler);

    await wrappedHandler({} as any);
    expect(ret).toEqual(['1', '2', '4', '3']);
  });

  it('should apply middlewares to the action', async () => {
    let ret: any[] = [];
    const middlewares = [
      async (context: NextContext, next: NextFunction) => {
        ret.push('1');
        await next();
      },
      async (context: NextContext, next: NextFunction) => {
        ret.push('2');
        await next();
      },
    ];
    const handler: any = async () => {
      ret.push('3');
    };

    const wrappedHandler: any = withActionMiddlewares(middlewares)(handler);

    await wrappedHandler({} as any);
    expect(ret).toEqual(['1', '2', '3']);
  });

  it('can skip middleware page', async () => {
    let ret: any[] = [];
    const middlewares = [
      async (context: NextContext, next: NextFunction) => {
        ret.push('1');
        await next();
      },
      async (context: NextContext, next: NextFunction) => {
        ret.push('2');
      },
      async (context: NextContext, next: NextFunction) => {
        ret.push('4');
        await next();
      },
    ];
    const handler: any = async () => {
      ret.push('3');
    };

    const wrappedHandler: any = withPageMiddlewares(middlewares)(handler);

    await wrappedHandler({} as any);
    expect(ret).toEqual(['1', '2']);
  });

  it('should apply middlewares to the route', async () => {
    let ret: any[] = [];
    const middlewares = [
      async (context: NextContext, next: NextFunction) => {
        ret.push('1');
        await next();
      },
      async (context: NextContext, next: NextFunction) => {
        ret.push('2');
        await next();
      },
    ];
    const handler: any = async () => {
      ret.push('3');
    };

    const wrappedHandler: any = withRouteMiddlewares(middlewares)(handler);

    await wrappedHandler({} as any);
    expect(ret).toEqual(['1', '2', '3']);
  });

  it('can skip middleware route', async () => {
    let ret: any[] = [];
    const middlewares = [
      async (context: NextContext, next: NextFunction) => {
        ret.push('1');
        await next();
      },
      async (context: NextContext, next: NextFunction) => {
        ret.push('2');
      },
    ];
    const handler: any = async () => {
      ret.push('3');
    };

    const wrappedHandler: any = withRouteMiddlewares(middlewares)(handler);

    await wrappedHandler({} as any);
    expect(ret).toEqual(['1', '2']);
  });

  it('can skip middleware action', async () => {
    let ret: any[] = [];
    const middlewares = [
      async (context: NextContext, next: NextFunction) => {
        ret.push('1');
        await next();
      },
      async (context: NextContext, next: NextFunction) => {
        ret.push('2');
      },
    ];
    const handler: any = async () => {
      ret.push('3');
    };

    const wrappedHandler: any = withActionMiddlewares(middlewares)(handler);

    await wrappedHandler({} as any);
    expect(ret).toEqual(['1', '2']);
  });
});
