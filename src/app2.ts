
import * as Koa from 'koa'
import UserController from "./controller/UserController";
import DbManager from "./db/DbManager";
import GoodsController from "./controller/GoodsController";

const app2 = new Koa();

const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');


const dbManager = new DbManager();
dbManager.connect();
new UserController(router, dbManager.connection).load();
new GoodsController(router, dbManager.connection).load();

app2.use(bodyParser());
app2.use(router.routes());
app2.listen(3000);