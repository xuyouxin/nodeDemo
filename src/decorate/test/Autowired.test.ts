import { IndexController, UserController } from "../src/Autowired";

describe("Autowired Test", () => {

  test('UserController自动注入', () => {

    const userController = new UserController();

    expect(userController.userService.addUser()).toEqual("add a user");
  });

  test('IndexController自动注入', () => {

    const indexController = new IndexController();

    expect(indexController.userService.addUser()).toEqual("add a user");

    expect(indexController.goodsService.sellGoods()).toEqual("sell some goods");
  });
});




// const userController = new UserController();
//
// console.log(userController.userService.addUser())
