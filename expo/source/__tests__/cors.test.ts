// https://github.com/expressjs/cors

import { describe, it, expect } from '@jest/globals';
import { middleware as cors } from '../cors/cors';
import { fakeRequest, fakeResponse } from './utils';

const defaultHeaders = {
  origin: 'http://example.com',
  'access-control-request-headers': 'x-header-1, x-header-2',
};
describe('cors', function () {
  it('does not alter `options` configuration object', async function () {
    const options = Object.freeze({ origin: 'custom-origin' });
    const req = fakeRequest();
    const res = fakeResponse();
    let error;
    try {
      await cors(options)({ req, res, type: 'route' }, async () => {});
    } catch (e) {
      error = e;
    }
    expect(error).toBeUndefined();
  });

  it('passes control to next middleware', async function () {
    // arrange
    const req = fakeRequest({ method: 'GET' });
    const res = fakeResponse();
    let called = false;
    await cors()({ req, res, type: 'route' }, async () => {
      called = true;
    });
    expect(called).toBe(true);
  });

  it('shortcircuits preflight requests', async function () {
    const req = fakeRequest({ method: 'OPTIONS' });
    const res = fakeResponse();
    await cors()({ req, res, type: 'route' }, async () => {
      expect(0).toBe(1);
    });
    expect(res.statusCode).toBe(204);
  });

  it('can configure preflight success response status code', async function () {
    const req = fakeRequest({ method: 'OPTIONS' });
    const res = fakeResponse();
    await cors({ optionsSuccessStatus: 200 })(
      { req, res, type: 'route' },
      async () => {
        expect(0).toBe(1);
      },
    );
    expect(res.statusCode).toBe(200);
  });

  it("doesn't shortcircuit preflight requests with preflightContinue option", async function () {
    const req = fakeRequest({ method: 'OPTIONS' });
    const res = fakeResponse();
    let called = false;
    await cors({ preflightContinue: true })(
      { req, res, type: 'route' },
      async () => {
        called = true;
      },
    );
    expect(called).toBe(true);
  });

  it('normalizes method names', async function () {
    const req = fakeRequest({ method: 'options' });
    const res = fakeResponse();
    await cors()({ req, res, type: 'route' }, async () => {
      expect(0).toBe(1);
    });
    expect(res.statusCode).toBe(204);
  });

  it('includes content-length response header', async function () {
    const req = fakeRequest({ method: 'OPTIONS' });
    const res = fakeResponse();
    await cors()({ req, res, type: 'route' }, async () => {});
    expect(res.getHeader('content-length')).toBe('0');
  });

  it('no options enables default CORS to all origins', async function () {
    const req = fakeRequest({ method: 'GET' });
    const res = fakeResponse();
    await cors()({ req, res, type: 'route' }, async () => {});
    expect(res.getHeader('Access-Control-Allow-Origin')).toBe('*');
    expect(res.getHeader('Access-Control-Allow-Methods')).toBeUndefined();
  });

  it('OPTION call with no options enables default CORS to all origins and methods', async function () {
    const req = fakeRequest({ method: 'OPTIONS' });
    const res = fakeResponse();
    await cors()({ req, res, type: 'route' }, async () => {
      expect(0).toBe(1);
    });
    expect(res.statusCode).toBe(204);
    expect(res.getHeader('Access-Control-Allow-Origin')).toBe('*');
    expect(res.getHeader('Access-Control-Allow-Methods')).toBe(
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    );
  });

  describe('passing static options', function () {
    it('overrides defaults', async function () {
      const req = fakeRequest({ method: 'OPTIONS', headers: defaultHeaders });
      const res = fakeResponse();
      var options = {
        origin: 'http://example.com',
        methods: ['FOO', 'bar'],
        headers: ['FIZZ', 'buzz'],
        credentials: true,
        maxAge: 123,
      };

      await cors(options)({ req, res, type: 'route' }, async () => {
        expect(0).toBe(1);
      });
      expect(res.statusCode).toBe(204);
      expect(res.getHeader('Access-Control-Allow-Origin')).toBe(
        'http://example.com',
      );
      expect(res.getHeader('Access-Control-Allow-Methods')).toBe('FOO,bar');
      expect(res.getHeader('Access-Control-Allow-Headers')).toBe('FIZZ,buzz');
      expect(res.getHeader('Access-Control-Allow-Credentials')).toBe('true');
      expect(res.getHeader('Access-Control-Max-Age')).toBe('123');
    });

    it('matches request origin against regexp', async function () {
      var req = fakeRequest({
        method: 'get',
        headers: defaultHeaders,
      });
      var res = fakeResponse();
      var options = { origin: /:\/\/(.+\.)?example.com$/ };
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Origin')).toBe(
        req.headers.origin,
      );
      expect(res.getHeader('vary')).toBe('Origin');
    });

    it('matches request origin against array of origin checks', async function () {
      var req = fakeRequest({
        method: 'get',
        headers: defaultHeaders,
      });
      var res = fakeResponse();
      var options = { origin: [/foo\.com$/, 'http://example.com'] };
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Origin')).toBe(
        req.headers.origin,
      );
      expect(res.getHeader('vary')).toBe('Origin');
    });

    it("doesn't match request origin against array of invalid origin checks", async function () {
      var req = fakeRequest({
        method: 'GET',
        headers: defaultHeaders,
      });
      var res = fakeResponse();
      var options = { origin: [/foo\.com$/, 'bar.com'] };
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Origin')).toBeUndefined();
      expect(res.getHeader('vary')).toBe('Origin');
    });

    it('origin of false disables cors', async function () {
      // arrange
      var req = fakeRequest({
        method: 'GET',
        headers: defaultHeaders,
      });
      var res = fakeResponse();
      var options = {
        origin: false,
        methods: ['FOO', 'bar'],
        headers: ['FIZZ', 'buzz'],
        credentials: true,
        maxAge: 123,
      };
      let called = 0;
      var next = async function () {
        called = 1;
        expect(res.getHeader('Access-Control-Allow-Origin')).toBeUndefined();
        expect(res.getHeader('Access-Control-Allow-Methods')).toBeUndefined();
        expect(res.getHeader('Access-Control-Allow-Headers')).toBeUndefined();
        expect(
          res.getHeader('Access-Control-Allow-Credentials'),
        ).toBeUndefined();
        expect(res.getHeader('Access-Control-Max-Age')).toBeUndefined();
      };

      // act
      await cors(options)({ req, res, type: 'route' }, next);
      expect(called).toBe(1);
    });

    it('can override origin', async function () {
      const options = { origin: 'http://example.com' };
      const req = fakeRequest({ method: 'GET', headers: defaultHeaders });
      const res = fakeResponse();
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Origin')).toBe(
        'http://example.com',
      );
    });

    it('includes vary header for specific origins', async function () {
      const options = { origin: 'http://example.com' };
      const req = fakeRequest({ method: 'GET', headers: defaultHeaders });
      const res = fakeResponse();
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('vary')).toBe('Origin');
    });

    it('appends to an existing vary header', async function () {
      const options = { origin: 'http://example.com' };
      const req = fakeRequest({ method: 'GET', headers: defaultHeaders });
      const res = fakeResponse();
      res.setHeader('vary', 'Foo');
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('vary')).toBe('Foo, Origin');
    });

    it('origin defaults to *', async function () {
      const req = fakeRequest({ method: 'GET' });
      const res = fakeResponse();
      await cors()({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Origin')).toBe('*');
    });

    it('specifying true for origin reflects requesting origin', async function () {
      const options = { origin: true };
      const req = fakeRequest({
        method: 'GET',
        headers: { origin: 'http://example.com' },
      });
      const res = fakeResponse();
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Origin')).toBe(
        'http://example.com',
      );
    });

    it('should allow origin when callback returns true', async function () {
      const options = {
        origin: (origin?: string) => true,
      };
      const req = fakeRequest({
        method: 'GET',
        headers: { origin: 'http://example.com' },
      });
      const res = fakeResponse();
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Origin')).toBe(
        'http://example.com',
      );
    });

    it('should not allow origin when callback returns false', async function () {
      const options = {
        origin: (origin?: string) => false,
      };
      const req = fakeRequest({
        method: 'GET',
        headers: { origin: 'http://example.com' },
      });
      const res = fakeResponse();
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Origin')).toBeUndefined();
      expect(res.getHeader('Access-Control-Allow-Methods')).toBeUndefined();
      expect(res.getHeader('Access-Control-Allow-Headers')).toBeUndefined();
      expect(res.getHeader('Access-Control-Allow-Credentials')).toBeUndefined();
      expect(res.getHeader('Access-Control-Max-Age')).toBeUndefined();
    });

    it('should not override options.origin callback', async function () {
      const options = {
        origin: (origin?: string) => origin === 'http://example.com',
      };
      let req = fakeRequest({
        method: 'GET',
        headers: { origin: 'http://example.com' },
      });
      let res = fakeResponse();
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Origin')).toBe(
        'http://example.com',
      );

      req = fakeRequest({
        method: 'GET',
        headers: { origin: 'http://localhost' },
      });
      res = fakeResponse();
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Origin')).toBeUndefined();
      expect(res.getHeader('Access-Control-Allow-Methods')).toBeUndefined();
      expect(res.getHeader('Access-Control-Allow-Headers')).toBeUndefined();
      expect(res.getHeader('Access-Control-Allow-Credentials')).toBeUndefined();
      expect(res.getHeader('Access-Control-Max-Age')).toBeUndefined();
    });

    it('can override methods', async function () {
      const req = fakeRequest({ method: 'OPTIONS', headers: defaultHeaders });
      const res = fakeResponse();
      const options = {
        methods: ['method1', 'method2'],
      };
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Methods')).toBe(
        'method1,method2',
      );
      expect(res.statusCode).toBe(204);
    });

    it('methods defaults to GET, HEAD, PUT, PATCH, POST, DELETE', async function () {
      const req = fakeRequest({ method: 'OPTIONS', headers: defaultHeaders });
      const res = fakeResponse();
      await cors()({ req, res, type: 'route' }, async () => {});
      expect(res.statusCode).toBe(204);
      expect(res.getHeader('Access-Control-Allow-Methods')).toBe(
        'GET,HEAD,PUT,PATCH,POST,DELETE',
      );
    });

    it('can specify allowed headers as array', async function () {
      const req = fakeRequest({ method: 'OPTIONS', headers: defaultHeaders });
      const res = fakeResponse();
      await cors({ allowedHeaders: ['header1', 'header2'] })(
        { req, res, type: 'route' },
        async () => {},
      );
      expect(res.getHeader('Access-Control-Allow-Headers')).toBe(
        'header1,header2',
      );
      expect(res.getHeader('vary')).toBeUndefined();
    });

    it('can specify allowed headers as string', async function () {
      const req = fakeRequest({ method: 'OPTIONS', headers: defaultHeaders });
      const res = fakeResponse();
      await cors({ allowedHeaders: 'header1,header2' })(
        { req, res, type: 'route' },
        async () => {},
      );
      expect(res.getHeader('Access-Control-Allow-Headers')).toBe(
        'header1,header2',
      );
      expect(res.getHeader('vary')).toBeUndefined();
    });

    it('specifying an empty list or string of allowed headers will result in no response header for allowed headers', async function () {
      const options = { allowedHeaders: [] };
      const req = fakeRequest({ method: 'OPTIONS', headers: defaultHeaders });
      const res = fakeResponse();
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Headers')).toBeUndefined();
      expect(res.getHeader('vary')).toBeUndefined();
    });

    it('if no allowed headers are specified, defaults to requested allowed headers', async function () {
      const req = fakeRequest({ method: 'OPTIONS', headers: defaultHeaders });
      const res = fakeResponse();
      await cors()({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Headers')).toBe(
        'x-header-1, x-header-2',
      );
      expect(res.getHeader('vary')).toBe('Access-Control-Request-Headers');
    });

    it('can specify exposed headers as array', async function () {
      const options = { exposedHeaders: ['custom-header1', 'custom-header2'] };
      const req = fakeRequest({ method: 'GET', headers: defaultHeaders });
      const res = fakeResponse();
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Expose-Headers')).toBe(
        'custom-header1,custom-header2',
      );
    });

    it('can specify exposed headers as string', async function () {
      const options = { exposedHeaders: 'custom-header1,custom-header2' };
      const req = fakeRequest({ method: 'GET', headers: defaultHeaders });
      const res = fakeResponse();
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Expose-Headers')).toBe(
        'custom-header1,custom-header2',
      );
    });

    it('specifying an empty list or string of exposed headers will result in no response header for exposed headers', async function () {
      // arrange
      const options = {
        exposedHeaders: [],
      };
      const req = fakeRequest({ method: 'GET', headers: defaultHeaders });
      const res = fakeResponse();
      await cors(options)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Expose-Headers')).toBeUndefined();
    });

    it('includes credentials if explicitly enabled', async function () {
      const req = fakeRequest({ method: 'OPTIONS', headers: defaultHeaders });
      const res = fakeResponse();
      await cors({ credentials: true })(
        { req, res, type: 'route' },
        async () => {},
      );
      expect(res.getHeader('Access-Control-Allow-Credentials')).toBe('true');
    });

    it('does not includes credentials unless explicitly enabled', async function () {
      const req = fakeRequest({ method: 'GET', headers: defaultHeaders });
      const res = fakeResponse();
      await cors()({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Credentials')).toBeUndefined();
    });

    it('includes maxAge when specified', async function () {
      const req = fakeRequest({ method: 'OPTIONS', headers: defaultHeaders });
      const res = fakeResponse();
      await cors({ maxAge: 456 })({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Max-Age')).toBe('456');
    });

    it('includes maxAge when specified and equals to zero', async function () {
      const req = fakeRequest({ method: 'OPTIONS', headers: defaultHeaders });
      const res = fakeResponse();
      await cors({ maxAge: 0 })({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Max-Age')).toBe('0');
    });

    it('does not includes maxAge unless specified', async function () {
      const req = fakeRequest({ method: 'OPTIONS', headers: defaultHeaders });
      const res = fakeResponse();
      await cors()({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Max-Age')).toBeUndefined();
    });
  });

  describe('passing a function to build options', function () {
    it('handles options specified via async function', async function () {
      const delegate = async (_req: any) => ({ origin: 'delegate.com' });
      const req = fakeRequest({ method: 'GET', headers: defaultHeaders });
      const res = fakeResponse();
      await cors(delegate)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Origin')).toBe('delegate.com');
    });

    it('handles options specified via async function for preflight', async function () {
      const delegate = async (_req: any) => ({
        origin: 'delegate.com',
        maxAge: 1000,
      });
      const req = fakeRequest({ method: 'OPTIONS', headers: defaultHeaders });
      const res = fakeResponse();
      await cors(delegate)({ req, res, type: 'route' }, async () => {});
      expect(res.getHeader('Access-Control-Allow-Origin')).toBe('delegate.com');
      expect(res.getHeader('Access-Control-Max-Age')).toBe('1000');
    });

    it('handles error specified via async function', async function () {
      const delegate = async (_req: any) => {
        throw 'some error';
      };
      const req = fakeRequest({ method: 'GET', headers: defaultHeaders });
      const res = fakeResponse();
      let error;
      try {
        await cors(delegate)({ req, res, type: 'route' }, async () => {});
      } catch (e) {
        error = e;
      }
      expect(error).toBe('some error');
    });
  });
});
