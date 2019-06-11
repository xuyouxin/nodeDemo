import UserService from "../db/UserService";

export default class UserController {

    userService;

    constructor(readonly router, readonly connection) {
        this.userService = new UserService(connection);
    }

    load() {
        this.router.get("/hello/:name", async (ctx, next) => {
            const {name} = ctx.params;
            ctx.response.body = `<h1>Hello, ${name}!</h1>`;
        });

        this.router.post("/login", async (ctx, next) => {
            const {name = '', password = ''} = ctx.request.body || {};
            if (!name || !password) {
                ctx.response.body = 'xx name and password can not empty';
                return;
            }
            if (name === "travis" && password === "123456") {
                ctx.response.body = `xx Welcome, ${name}`;
            } else {
                ctx.response.body = `xx name or password is wrong`;
            }
        });

        this.router.get("/user/list", async (ctx, next) => {

            ctx.response.body = await this.userService.findAllUsers();
        });

        this.router.get("/user/promiseTest", async (ctx, next) => {
            ctx.response.body = await this.userService.promiseTest();
        });

        this.router.post("/user/add", async (ctx, next) => {
            const {name = '', age = undefined} = ctx.request.body || {};
            if (!name || !age) {
                ctx.response.body = 'xx name and password can not empty';
                return;
            }
            ctx.response.body = await this.userService.addUser({name, age})
        });

        this.router.post("/user/update", async (ctx, next) => {
            const {id = undefined, name = '', age = undefined} = ctx.request.body || {};
            if (!id || !name || !age) {
                ctx.response.body = 'id, name and password can not empty';
                return;
            }
            ctx.response.body = await this.userService.updateUser({id, name, age})
        });

        this.router.post("/user/delete", async (ctx, next) => {
            const {id = undefined} = ctx.request.body || {};
            if (!id) {
                ctx.response.body = 'id can not empty';
                return;
            }
            ctx.response.body = await this.userService.deleteUser(id)
        });
    }
}