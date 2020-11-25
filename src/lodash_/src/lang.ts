export default class Lang {

  /**
   * shallow copy
   * @param source
   */
  public static clone(source: any) {

    if (source.constructor.name === "Array") {
      return [...source];
    } else {
      return { ...source };
    }
  }
}
