import { Connection } from "typeorm";
import { Express } from 'express-serve-static-core'
import * as http from "http";
import * as supertest from 'supertest'
import { connectToDbAndCreateApp, deleteDbIfExists } from "./util";
import test from "ava";

let connectionTest: Connection;
let appTest: Express;
let serverTest: http.Server;

test.beforeEach(async () => {

  deleteDbIfExists();

  const { connection, app, server } = await connectToDbAndCreateApp();

  connectionTest = connection;
  appTest = app;
  serverTest = server;
});

test.afterEach(async () => {

  serverTest.close();

  await connectionTest.close();

  deleteDbIfExists();
});


const data1 = {
  uri: "/jupiter/desktop/mac/100",
  data: {
    "ip": "10.32.35.100",
    "sys": "mac",
    "name": "rcadmin"
  },
  maxLease: 1
};
const data2 = {
  uri: "/jupiter/desktop/mac/101",
  data: {
    "ip": "10.32.35.101",
    "sys": "mac",
    "name": "rcadmin"
  },
  maxLease: 2
};

async function createSomeData() {
  await supertest(appTest)
    .post(`/ci`)
    .send(data1)
    .expect(200);

  await supertest(appTest)
    .post(`/ci`)
    .send(data2)
    .expect(200);
}

test('uri exists, and scope is 0', async t => {

  await createSomeData();

  const res1 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": data1.uri, "scope": 0 })
    .expect(200);

  console.log("res.body>>", res1.body);

  t.is(res1.body.length, 1);
  t.deepEqual(res1.body[0].data, data1.data);
  t.is(res1.body[0].maxLease, data1.maxLease);

  const res2 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": data2.uri, "scope": 0 })
    .expect(200);

  console.log("res.body>>", res2.body);
  t.is(res2.body.length, 1);
  t.is(res2.body[0].name, "101");
  t.deepEqual(res2.body[0].data, data2.data);
  t.is(res2.body[0].maxLease, data2.maxLease);

  t.pass();
});

test('uri exists, and scope is 1', async t => {

  await createSomeData();

  const res1 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/mac", "scope": 1 })
    .expect(200);

  console.log("res.body>>", res1.body);

  t.is(res1.body.length, 2);

  t.deepEqual(res1.body[0].data, data1.data);
  t.is(res1.body[0].maxLease, data1.maxLease);

  t.deepEqual(res1.body[1].data, data2.data);
  t.is(res1.body[1].maxLease, data2.maxLease);

  t.pass();
});

test('uri no exists', async t => {

  await createSomeData();

  const res1 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/mac/xxx", "scope": 0 })
    .expect(404);

  t.pass();
});
