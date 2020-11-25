import Util from "./util";
import Lang from "./lang";

export default class ObjectUtil {

  public static assign(object: any, ...sources: any) {

    const newObj = Lang.clone(object);

    return Object.assign(newObj, ...sources);
  }

  public static keys(object: any) {
    const keys = [];
    for (const key in object) {
      keys.push(key);
    }

    return keys;
  }

  public static values(object: any) {
    const keys = [];
    for (const key in object) {
      keys.push(object[key]);
    }

    return keys;
  }

  public static findKey(object: any, filterObject: Function | object | string) {

    for (const key in object) {

      const subObj = object[key];

      if (filterObject.constructor.name == "Function") {
        if ((filterObject as Function)(subObj)) {
          return key;
        }
      } else if (filterObject.constructor.name == "String") {
        if (this.keys(subObj).includes(filterObject as string)) {
          return key;
        }
      } else {
        if (Util.matches(filterObject)(subObj)) {
          return key;
        }
      }
    }
  }

  public static mapKeys(object: any, iteratee: (value: any, key: string) => string) {

    const target: any = {};

    for (const key in object) {
      const value = object[key];
      target[iteratee(value, key)] = value;
    }

    return target;
  }

  public static mapValues(object: any, iteratee: (value: any, key: string) => string) {

    const target: any = {};

    for (const key in object) {
      const value = object[key];
      target[key] = iteratee(value, key);
    }

    return target;
  }

  public static get(object: any, path: string | string[]) {
    if (path.constructor.name === "String") {
      path = (path as string).replace(/\[/g, ".").replace(/]/g, "").split(".");
    }
    let subObj = object;
    for (let i = 0; i < path.length - 1; i++) {
      subObj = subObj[path[i]];
      if (subObj == undefined) {
        return undefined;
      }
    }
    return subObj[path[path.length - 1]]
  }

  public static set(object: any, path: string | string[], value: any) {
    if (path.constructor.name === "String") {
      path = (path as string).replace(/\[/g, ".").replace(/]/g, "").split(".");
    }

    let subObj = object;
    for (let i = 0; i < path.length - 1; i++) {
      const preSubObj = subObj;
      subObj = subObj[path[i]];
      if (subObj == undefined) {
        if (/^\d+$/.test(path[i + 1])) {
          subObj = [];
        } else {
          subObj = {};
        }
        preSubObj[path[i]] = subObj;
      }
    }
    subObj[path[path.length - 1]] = value;
  }
}

