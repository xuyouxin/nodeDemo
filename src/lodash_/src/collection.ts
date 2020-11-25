export default class CollectionUtil {

  public static groupBy(array: any[], func: Function) {

    return array.reduce((previousValue, currentValue) => {
      const cc = func(currentValue);
      if (!previousValue[cc]) {
        previousValue[cc] = []
      }
      previousValue[cc].push(currentValue);

      return previousValue;
    }, {})
  }

  public static includes(array: any[], ...values: any) {

    let flag = true;

    for (const value of values) {
      if (!array.includes(value)) {
        flag = false;
      }
    }

    return flag;
  }

  public static keyBy(array: any[], funcOrObj: Function | string) {

    return array.reduce((previousValue, currentValue) => {
      let cc;

      switch (funcOrObj.constructor.name) {
        case 'String':
          cc = currentValue[funcOrObj as string];
          break;
        case 'Function':
          cc = (funcOrObj as Function)(currentValue);
          break;
      }

      previousValue[cc] = currentValue;

      return previousValue;
    }, {})
  }

  public static orderBy(array: any[], keys: string[], orders: ("asc" | "desc")[]): any[] {

    return array.sort((a: any, b: any) => {
      for (let i = 0; i < keys.length; i++) {
        const aSubObj = a[keys[i]];
        const bSubObj = b[keys[i]];

        let compareValue;
        if (aSubObj.constructor.name === "Number") {
          compareValue = aSubObj - bSubObj;
        } else if (aSubObj.constructor.name === "String") {
          compareValue = aSubObj.localeCompare(bSubObj);
        } else if (aSubObj.compareTo) {
          compareValue = aSubObj.compareTo(bSubObj);
        }

        if (compareValue != 0) {
          if (orders[i] === "asc") {
            return compareValue;
          } else {
            return -compareValue;
          }
        }
      }

      return 0;
    })
  }

  public static partition(array: any[], funcOrObj: Function | Object): any[][] {
    if (funcOrObj.constructor.name == "Function") {
      const trueArr = array.filter(o => (funcOrObj as Function)(o));
      const falseArr = array.filter(o => !(funcOrObj as Function)(o));
      return [trueArr, falseArr];
    } else {
      const filter = (o: any) => {
        let flag = true;
        for (let key in funcOrObj) {
          if (o[key] != (funcOrObj as any)[key]) {
            flag = false
          }
        }
        return flag;
      };
      const trueArr = array.filter(filter);
      const falseArr = array.filter(o => !filter(o));
      return [trueArr, falseArr];
    }
  }

  public static shuffle(array: any[]): any[] {

    const removeOneIndex = (array: any[], index: number) => {
      const newArray = [];
      for (let i = 0; i < array.length; i++) {
        if (i != index) {
          newArray.push(array[i]);
        }
      }
      return newArray;
    };

    let indexArray = array.map((o, i) => i);

    const result = [];
    for (let i = 0; i < array.length; i++) {
      const randomIndex = Math.floor(Math.random() * indexArray.length);
      result.push(array[indexArray[randomIndex]]);
      indexArray = removeOneIndex(indexArray, randomIndex);
    }

    return result;
  }
}

