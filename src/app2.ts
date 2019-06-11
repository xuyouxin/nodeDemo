// const Koa = require('koa');

import * as Koa from 'koa'
import UserController from "./controller/UserController";

const app2 = new Koa();

const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');

app2.use(bodyParser());

new UserController(router).load();

app2.use(router.routes());
app2.listen(3000);