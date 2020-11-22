import "reflect-metadata";

const entityMap = new Map<string, any>();

export function Entity<T>(ctor: { new(): T }) {

  const entity = new ctor();

  entityMap.set(entity.constructor.name, entity);
}


export function Autowired(entityClass: string) {
  return (target: any, propertyKey: string) => {
    target[propertyKey] = entityMap.get(entityClass);
  }
}

@Entity
export class UserService {

  public addUser() {
    return "add a user";
  }
}

@Entity
export class GoodsService {

  public sellGoods() {
    return "sell some goods";
  }
}

export class UserController {

  @Autowired("UserService")
  userService: UserService;
}

export class IndexController {

  @Autowired("UserService")
  userService: UserService;

  @Autowired("GoodsService")
  goodsService: GoodsService;
}
