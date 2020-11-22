import * as URL from "url";

export const allApiMap = new Map<string, Function>();

export function Controller(path: string) {

  return function (constructor: Function) {
    const apiMap = constructor.prototype.apiMap;

    apiMap.forEach((value: Function, key: string) => {
      const fullPath = path + key;
      if (allApiMap.has(fullPath)) {
        throw new Error(`${fullPath} is already exists`);
      }

      allApiMap.set(fullPath, value);
    })
  }
}

export function RequestMapping(path: string) {

  return (target: any, name: string, descriptor: PropertyDescriptor) => {

    const method = descriptor.value;

    const apiMap = target.constructor.prototype.apiMap || new Map<string, Function>();
    apiMap.set(path, method);
    target.constructor.prototype.apiMap = apiMap;
  }
}

export function parseUrl(url: string): Function {
  const { pathname } = URL.parse(url);

  const entries = Array.from(allApiMap.entries()).filter((entry) => {
    return entry[0] == pathname;
  });

  if (entries.length > 0) {
    const entry = entries[0];
    return entry[1];
  }
}
