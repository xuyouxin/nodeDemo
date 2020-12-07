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

const ci1 = {
  uri: "/jupiter/desktop/mac/158",
  data: {
    "ip": "10.32.35.158",
    "sys": "mac",
    "name": "rcadmin"
  },
  maxLease: 5
};

it('post lease successfully with scope is 0', async done => {
  await supertest(appTest)
    .post(`/ci`)
    .send(ci1)
    .expect(200);

  // post lease one
  await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": ci1.uri,
      "scope": 0,
    })
    .expect(200);

  const res1 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": ci1.uri, "scope": 0 })
    .expect(200);

  expect(res1.body[0].leases.length).toEqual(1);

  // post lease two
  await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac/158",
      "scope": 0,
    })
    .expect(200);

  const res2 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": ci1.uri, "scope": 0 })
    .expect(200);

  expect(res2.body[0].leases.length).toEqual(2);

  done();
});

it('post lease successfully with scope is 1', async done => {
  await supertest(appTest)
    .post(`/ci`)
    .send(ci1)
    .expect(200);

  // post lease one
  await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac",
      "scope": 1,
    })
    .expect(200);

  const res1 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": ci1.uri, "scope": 0 })
    .expect(200);

  expect(res1.body[0].leases.length).toEqual(1);

  // post lease two
  await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac",
      "scope": 1,
    })
    .expect(200);

  const res2 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": ci1.uri, "scope": 0 })
    .expect(200);

  expect(res2.body[0].leases.length).toEqual(2);

  done();
});

it('no ci can be leased', async done => {

  await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac",
      "scope": 1,
    })
    .expect(404);

  await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac/158",
      "scope": 0,
    })
    .expect(404);

  done();
});

it('no free ci to lease', async done => {

  const ci2 = {
    uri: "/jupiter/desktop/mac/172",
    data: {
      "ip": "10.32.35.172",
      "sys": "mac",
      "name": "rcadmin"
    },
    maxLease: 1
  };

  await supertest(appTest)
    .post(`/ci`)
    .send(ci2)
    .expect(200);

  // post lease one
  await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac/172",
      "scope": 0,
    })
    .expect(200);


  let res1 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": ci2.uri, "scope": 0 })
    .expect(200);

  expect(res1.body[0].leases.length).toEqual(1);

  // post lease two
  await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac/172",
      "scope": 0,
    })
    .expect(409);

  done();
});
