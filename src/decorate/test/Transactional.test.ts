import { PropagationType, Transactional } from "../src/Transactional";
import { appendString, readString } from "../util/utils";

describe("Transactional Test", () => {

  test('添加订单', () => {
    const a = new A();
    a.addAnOrder();
    expect(readString("a.txt")).toEqual(
      "------开始事务------\n" +
      "买家买了一斤苹果\n" +
      "卖家库存里减少一斤苹果\n" +
      "------结束事务------\n"
    );
  });

  test('读取商品库存', () => {
    const a = new A();
    a.findGoods();
    expect(readString("a.txt")).toEqual(
      "------开始只读事务------\n" +
      "读取商品A的库存\n" +
      "读取商品B的库存\n" +
      "------结束只读事务------\n"
    );
  });

  test('添加订单，带日志', () => {
    const a = new A();
    a.addAnOrderTwo();
    expect(readString("a.txt")).toEqual(
      "------开始事务------\n" +
      "买家买了一斤苹果\n" +
      "卖家库存里减少一斤苹果\n" +
      `------以非事务方式执行------\n` +
      `写一条日志: 卖出一斤苹果\n` +
      "------结束事务------\n"
    );
  });
});

class A {
  @Transactional()
  addAnOrder() {
    appendString("买家买了一斤苹果\n", "a.txt");
    appendString("卖家库存里减少一斤苹果\n", "a.txt");
  }

  @Transactional({ readOnly: true })
  findGoods() {
    appendString("读取商品A的库存\n", "a.txt");
    appendString("读取商品B的库存\n", "a.txt");
  }

  @Transactional()
  addAnOrderTwo() {
    appendString("买家买了一斤苹果\n", "a.txt");
    appendString("卖家库存里减少一斤苹果\n", "a.txt");
    this.addLog("卖出一斤苹果");
  }

  @Transactional({ propagation: PropagationType.PROPAGATION_NOT_SUPPORTED })
  addLog(log: string) {
    appendString(`写一条日志: ${log}\n`, "a.txt");
  }
}

