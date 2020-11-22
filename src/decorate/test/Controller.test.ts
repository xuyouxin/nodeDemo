import { Controller, parseUrl, RequestMapping } from "../src/Controller";

describe("Controller Test", () => {

  test('添加用户', () => {

    const method = parseUrl("https://localhost/user/add");

    expect(method()).toEqual("add user");
  });

  test('查询商品', () => {

    const method = parseUrl("https://localhost/goods/find");

    expect(method()).toEqual("find goods");
  });

  test('找不到接口', () => {
    const method = parseUrl("https://localhost/abc/123");

    expect(method).toBeUndefined();
  });
});

@Controller("/user")
class UserController {

  @RequestMapping("/add")
  add() {
    return "add user";
  }

  @RequestMapping("/update")
  update() {
    return "update user";
  }
}

@Controller("/goods")
class GoodsController {

  @RequestMapping("/add")
  add() {
    return "add goods";
  }

  @RequestMapping("/find")
  find() {
    return "find goods";
  }

  @RequestMapping("/delete")
  delete() {
    return "delete goods";
  }
}
