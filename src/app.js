const Koa = require('koa');
const app = new Koa();

const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');

app.use(bodyParser());

// app.use(async ctx => {
//     ctx.body = 'Hello World';
// });

router.get("/hello/:name", async (ctx, next) => {
    const {name} = ctx.params;
    ctx.response.body = `<h1>Hello, ${name}!</h1>`;
});

router.post("/login", async (ctx, next) => {
    const {name, password} = ctx.request.body || {};
    if (!name || !password) {
        ctx.response.body = 'name and password can not empty';
        return;
    }
    if (name === "travis" && password === "123456") {
        ctx.response.body = `Welcome, ${name}`;
    } else {
        ctx.response.body = `name or password is wrong`;
    }
});

app.use(router.routes());
app.listen(3000);