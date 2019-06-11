import {UserService} from "../db/UserService";

export default class UserController {

    userService;
    constructor(readonly router) {
        this.userService = new UserService();
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
            ctx.response.body = "no data";
            await this.userService.findAllUsers((result) => {
                ctx.response.body = result;
            })
        });

        this.router.post("/user/add", async (ctx, next) => {
            const {name = '', password = ''} = ctx.request.body || {};
            if (!name || !password) {
                ctx.response.body = 'xx name and password can not empty';
                return;
            }
            this.userService.addUser({name, password}, (err, result) => {
                if (err) {
                    ctx.response.body = 'save fail';
                } else {
                    ctx.response.body = 'save success';
                }
            })
        })
    }
}