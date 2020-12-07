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

it('update the cis', async () => {
  await supertest(appTest)
    .post(`/ci`)
    .send(data1)
    .expect(200);

  await supertest(appTest)
    .post(`/ci`)
    .send(data2)
    .expect(200);

  await supertest(appTest)
    .put(`/ci`)
    .send({
      uri: "/jupiter/desktop/mac/100",
      data: {
        "ip": "10.32.35.110",
        "sys": "mac",
        "name": "rcadmin"
      },
      maxLease: 10
    })
    .expect(200);

  console.log("after put")
  const result = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/mac", "scope": 1 })
    .expect(200);

  console.log("result.body>> ", result.body);
  expect(result.body.length).toBe(2);

  const x100 = result.body[0];
  expect(x100.data).toEqual({
    "ip": "10.32.35.110",
    "sys": "mac",
    "name": "rcadmin"
  });
  expect(x100.maxLease).toEqual(10);

  const x101 = result.body[1];
  expect(x101.data).toEqual(data2.data);
  expect(x101.maxLease).toEqual(data2.maxLease);
}, 200e3);

it('uri no exists', async () => {
  await supertest(appTest)
    .put(`/ci`)
    .send({
      uri: "/jupiter/desktop/mac/100",
      data: {
        "ip": "10.32.35.110",
        "sys": "mac",
        "name": "rcadmin"
      },
      maxLease: 10
    })
    .expect(404);
});

