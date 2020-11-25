export default class ArrayUtil {

  public static chunk<T>(array: T[], num: number): T[][] {

    const result: T[][] = [];

    let temp: T[];
    for (let i = 0; i < array.length; i++) {
      if (i % num == 0) {
        temp = [];
      }

      temp.push(array[i]);

      if (i % num == num - 1 || i == array.length - 1) {
        result.push(temp);
      }
    }

    return result;
  }

  public static compact<T>(array: T[]): T[] {

    return array.filter(obj => {
      if (obj) {
        return true;
      } else {
        return false;
      }
    })
  }

  public static fill<T>(array: T[], value: any, start: number = 0, end: number = array.length): T[] {
    for (let i = start; i < end; i++) {
      array[i] = value;
    }

    return array;
  }

  public static flatten(array: any[]) {

    const result = [];

    for (const obj of array) {
      if (obj.constructor.name == "Array") {
        result.push(...obj);
      } else {
        result.push(obj);
      }
    }

    return result;
  }

  public static flattenDeep(array: any[]): any[] {

    let result = [];

    for (const obj of array) {
      if (obj.constructor.name == "Array") {
        result.push(...this.flattenDeep(obj));
      } else {
        result.push(obj);
      }
    }

    return result;
  }

  public static without(array: any[], ...exclude: any[]): any[] {

    const result = [];

    for (const obj of array) {
      if (!exclude.includes(obj)) {
        result.push(obj);
      }
    }

    return result;
  }

  public static remove(array: any[], removeFunc: (ojb: any) => boolean): any[] {

    return array.filter(obj => {
      return !removeFunc(obj);
    })
  }

  public static take(array: any[], n: number) {
    return array.slice(0, n);
  }

  public static uniq(array: any[]) {
    const result: any[] = [];

    for (const obj of array) {
      if (!result.includes(obj)) {
        result.push(obj);
      }
    }

    return result;
  }

  public static uniqBy(array: any[], funcOrKey: Function | string) {
    const result: any[] = [];
    const temp: any[] = [];


    for (const obj of array) {
      let pObj;
      switch (funcOrKey.constructor.name) {
        case "String":
          pObj = obj[funcOrKey as string];
          break;
        case "Function":
          pObj = (funcOrKey as Function)(obj);
          break;
      }

      if (!temp.includes(pObj)) {
        temp.push(pObj);
        result.push(obj);
      }
    }

    return result;
  }

  public static zip(...arrays: any[][]) {

    const maxLength = Math.max(...arrays.map(array => array.length));

    const result = [];

    for (let i = 0; i < maxLength; i++) {
      const temp = [];
      for (const array of arrays) {
        temp.push(array[i]);
      }
      result.push(temp);
    }

    return result;
  }

  public static zipWith(arrays: any[][], func: Function) {

    const maxLength = Math.max(...arrays.map(array => array.length));

    const result = [];

    for (let i = 0; i < maxLength; i++) {
      const temp = [];
      for (const array of arrays) {
        temp.push(array[i]);
      }
      result.push(func(...temp));
    }

    return result;
  }
}
