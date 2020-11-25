export default class Util {

  public static matches(source: any) {
    return (obj: any) => {
      let flag = true;
      for (const key in source) {
        if (obj[key] != source[key]) {
          flag = false;
        }
      }
      return flag;
    }
  }
}
