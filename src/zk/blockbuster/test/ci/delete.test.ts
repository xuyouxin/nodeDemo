import { Express } from 'express-serve-static-core'
import * as http from "http";
import * as supertest from 'supertest'
import { connectToDbAndCreateApp } from "../util";
import { ZKUtil } from "../../src/zkUtil";

let appTest: Express;
let serverTest: http.Server;

beforeAll(async () => {
  ZKUtil.init();
});

afterAll(async () => {
  ZKUtil.destroy();
});

beforeEach(async () => {

  const { app, server } = await connectToDbAndCreateApp();

  appTest = app;
  serverTest = server;

  await ZKUtil.clearAllData();
});

afterEach(async () => {

  serverTest.close();
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

it('delete one', async () => {
  await supertest(appTest)
    .post(`/ci`)
    .send(data1)
    .expect(200);

  await supertest(appTest)
    .post(`/ci`)
    .send(data2)
    .expect(200);

  await supertest(appTest)
    .delete(`/ci`)
    .send({ uri: data1.uri })
    .expect(200);

  const result = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/mac", "scope": 1 })
    .expect(200);

  console.log("result.body>> ", result.body);
  expect(result.body.length).toBe(1);

  const x101 = result.body[0];
  expect(x101.data).toEqual(data2.data);
  expect(x101.maxLease).toEqual(data2.maxLease);
});

it('id no exists', async () => {
  await supertest(appTest)
    .delete(`/ci`)
    .send({ uri: data1.uri })
    .expect(404);
});

it('can not delete the ci that have children cis', async () => {
  await supertest(appTest)
    .post(`/ci`)
    .send(data1)
    .expect(200);

  await supertest(appTest)
    .post(`/ci`)
    .send(data2)
    .expect(200);

  await supertest(appTest)
    .delete(`/ci`)
    .send({ uri: "/jupiter/desktop/mac" })
    .expect(400);
});
