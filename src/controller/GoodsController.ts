import GoodsService from "../db/GoodsService";

export default class UserController {

    goodsService;

    constructor(readonly router, readonly connection) {
        this.goodsService = new GoodsService(connection);
    }

    load() {
        this.router.get("/goods/list", async (ctx, next) => {

            ctx.response.body = await this.goodsService.findAllGoods();
        });

        this.router.post("/goods/add", async (ctx, next) => {
            const {name = undefined, price = undefined, num = undefined} = ctx.request.body || {};
            if (!name || !price || !num) {
                ctx.response.body = 'param can not empty';
                return;
            }
            ctx.response.body = await this.goodsService.addGoods(ctx.request.body)
        });

        this.router.post("/goods/update", async (ctx, next) => {
            const {id = undefined, name = undefined, price = undefined, num = undefined} = ctx.request.body || {};
            if (!id || !name || !price || !num) {
                ctx.response.body = 'param can not empty';
                return;
            }
            ctx.response.body = await this.goodsService.updateGoods(ctx.request.body)
        });

        this.router.post("/goods/delete", async (ctx, next) => {
            const {id = undefined} = ctx.request.body || {};
            if (!id) {
                ctx.response.body = 'id can not empty';
                return;
            }
            ctx.response.body = await this.goodsService.deleteGoods(id)
        });
    }
}