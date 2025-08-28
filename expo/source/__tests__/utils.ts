import { NextContextRequest } from '../types';
import type { NextContextResponse, NextUrl } from '../types';

export function fakeRequest({
  headers = {},
  method = 'GET',
  url = '/',
  params = {},
  host = 'localhost',
  protocol = 'http',
  secure = false,
  nextUrl = {} as NextUrl,
  ip = '127.0.0.1',
  path = '/',
  query = {},
  cookies = {},
}: Partial<NextContextRequest> = {}): NextContextRequest {
  return {
    params,
    host,
    protocol,
    secure,
    url,
    nextUrl,
    ip,
    get: (k: string) => headers[k] ?? query[k] ?? cookies[k],
    header: (k: string) => headers[k] || headers[k.toLowerCase()],
    text: async () => '',
    json: async () => ({}),
    method,
    path,
    query,
    cookies,
    headers,
  };
}

export function fakeResponse(): NextContextResponse {
  const headers: Record<string, string | undefined> = {};
  let statusCode = 200;
  let body: any = undefined;
  return {
    getHeader: (key: string) => headers[key.toLowerCase()],
    setHeader: (key: string, value: string) => {
      headers[key.toLowerCase()] = value;
    },
    statusCode,
    end: (data?: any) => {
      body = data;
    },
    json: (data: any) => {
      body = JSON.stringify(data);
      headers['content-type'] = 'application/json';
    },
    // For test inspection
    _getMockHeaders: () => headers,
    _getMockBody: () => body,
    _setMockStatus: (code: number) => {
      statusCode = code;
    },
  } as NextContextResponse & {
    _getMockHeaders: () => Record<string, string | undefined>;
    _getMockBody: () => any;
    _setMockStatus: (code: number) => void;
  };
}
