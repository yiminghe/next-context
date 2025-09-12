import type { CookieAttributes } from './types';
import * as cookie from 'cookie';

const assign = Object.assign;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function encodeRFC3986URIComponent(str: string) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

const converter = {
  read: function (value: string) {
    if (value[0] === '"') {
      value = value.slice(1, -1);
    }
    return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
  },
  write: function (value: any) {
    return encodeRFC3986URIComponent(value).replace(
      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
      decodeURIComponent,
    );
  },
};

const defaultAttributes = { path: '/' };

export function set(name: string, value: any, attributes_: CookieAttributes) {
  if (typeof document === 'undefined') {
    return;
  }

  const attributes: any = assign({}, defaultAttributes, attributes_);

  if (typeof attributes.expires === 'number') {
    attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
  }
  if (attributes.expires) {
    attributes.expires = attributes.expires.toUTCString();
  }

  name = encodeURIComponent(name)
    .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
    .replace(/[()]/g, escape);

  var stringifiedAttributes = '';
  for (var attributeName in attributes) {
    if (!attributes[attributeName]) {
      continue;
    }

    stringifiedAttributes += '; ' + attributeName;

    if (attributes[attributeName] === true) {
      continue;
    }

    // Considers RFC 6265 section 5.2:
    // ...
    // 3.  If the remaining unparsed-attributes contains a %x3B (";")
    //     character:
    // Consume the characters of the unparsed-attributes up to,
    // not including, the first %x3B (";") character.
    // ...
    stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
  }

  return (document.cookie =
    name + '=' + converter.write(value) + stringifiedAttributes);
}

export function get(name: string) {
  if (typeof document === 'undefined' || (arguments.length && !name)) {
    return;
  }

  // To prevent the for loop in the first place assign an empty array
  // in case there are no cookies at all.
  var cookies = document.cookie ? document.cookie.split('; ') : [];
  var jar: any = {};
  for (var i = 0; i < cookies.length; i++) {
    var parts = cookies[i].split('=');
    var value = parts.slice(1).join('=');

    try {
      var found = decodeURIComponent(parts[0]);
      if (!(found in jar)) jar[found] = converter.read(value);
      if (name === found) {
        break;
      }
    } catch {
      // Do nothing...
    }
  }

  return name ? jar[name] : jar;
}

export function remove(name: string, attributes: CookieAttributes) {
  set(
    name,
    '',
    assign({}, attributes, {
      expires: -1,
    }),
  );
}

const cookieOptions = {
  encode: converter.write,
  decode: converter.read,
};

export function correctCookieString(
  cookieString: string,
  values: Record<string, string>,
) {
  const parsed = { ...cookie.parse(cookieString, cookieOptions), ...values };
  return Object.entries(parsed)
    .map(([k, v]) => cookie.serialize(k, v || '', cookieOptions))
    .join('; ');
}
