import { Connection } from "typeorm";
import { Express } from 'express-serve-static-core'
import * as http from "http";
import * as supertest from 'supertest'
import { connectToDbAndCreateApp, deleteDbIfExists } from "./util";


let connectionTest: Connection;
let appTest: Express;
let serverTest: http.Server;

beforeEach(async () => {

  deleteDbIfExists();

  const { connection, app, server } = await connectToDbAndCreateApp();

  connectionTest = connection;
  appTest = app;
  serverTest = server;
});

afterEach(async () => {

  serverTest.close();

  await connectionTest.close();

  deleteDbIfExists();
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

const ci2 = {
  uri: "/jupiter/desktop/mac/172",
  data: {
    "ip": "10.32.35.172",
    "sys": "mac",
    "name": "rcadmin"
  },
  maxLease: 8
};

it('add one ci', async done => {
  await supertest(appTest)
    .post(`/ci`)
    .send(ci1)
    .expect(200);

  const res = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/mac", "scope": 1 })
    .expect(200);

  console.log("res.body>>", res.body);
  expect(res.body.length).toBe(1);

  expect(res.body[0].data).toEqual(ci1.data);
  expect(res.body[0].maxLease).toEqual(ci1.maxLease);

  done();
});

it('add two cis', async done => {

  await supertest(appTest)
    .post(`/ci`)
    .send(ci1)
    .expect(200);

  await supertest(appTest)
    .post(`/ci`)
    .send(ci2)
    .expect(200);

  const res = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/mac", "scope": 1 })
    .expect(200);

  console.log("res.body>>", res.body);
  expect(res.body.length).toBe(2);

  expect(res.body[0].data).toEqual(ci1.data);
  expect(res.body[0].maxLease).toEqual(ci1.maxLease);

  expect(res.body[1].data).toEqual(ci2.data);
  expect(res.body[1].maxLease).toEqual(ci2.maxLease);

  done();
});


it('add repeat one ci', async done => {

  const data = {
    uri: "/jupiter/desktop/mac/158",
    data: {
      "ip": "10.32.35.158",
      "sys": "mac",
      "name": "rcadmin"
    },
    maxLease: 5
  };

  await supertest(appTest)
    .post(`/ci`)
    .send(data)
    .expect(200);

  await supertest(appTest)
    .post(`/ci`)
    .send(data)
    .expect(409);

  done();
});
