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

it('post lease successfully with scope is 0', async done => {
  const res1 = await supertest(appTest)
    .post(`/ci`)
    .send(ci1)
    .expect(200);

  // post lease one
  let res2 = await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac/158",
      "scope": 0,
    })
    .expect(200);

  expect(res1.body.uri).toEqual(res2.body.ci.uri);
  expect(res1.body.maxLease).toEqual(res2.body.ci.maxLease);

  let res3 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": ci1.uri, "scope": 0 })
    .expect(200);

  expect(res3.body[0].leases.length).toEqual(1);

  // post lease two
  res2 = await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac/158",
      "scope": 0,
    })
    .expect(200);

  expect(res1.body.uri).toEqual(res2.body.ci.uri);
  expect(res1.body.maxLease).toEqual(res2.body.ci.maxLease);

  res3 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": ci1.uri, "scope": 0 })
    .expect(200);

  expect(res3.body[0].leases.length).toEqual(2);

  done();
});

it('post lease successfully with scope is 1', async done => {
  const res1 = await supertest(appTest)
    .post(`/ci`)
    .send(ci1)
    .expect(200);

  // post lease one
  let res2 = await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac",
      "scope": 1,
    })
    .expect(200);

  expect(res1.body.uri).toEqual(res2.body.ci.uri);
  expect(res1.body.maxLease).toEqual(res2.body.ci.maxLease);

  let res3 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": ci1.uri, "scope": 0 })
    .expect(200);

  expect(res3.body[0].leases.length).toEqual(1);

  // post lease two
  res2 = await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac",
      "scope": 1,
    })
    .expect(200);

  expect(res1.body.uri).toEqual(res2.body.ci.uri);
  expect(res1.body.maxLease).toEqual(res2.body.ci.maxLease);

  res3 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": ci1.uri, "scope": 0 })
    .expect(200);

  expect(res3.body[0].leases.length).toEqual(2);

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

  const res1 = await supertest(appTest)
    .post(`/ci`)
    .send(ci2)
    .expect(200);

  // post lease one
  let res2 = await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac/172",
      "scope": 0,
    })
    .expect(200);

  expect(res1.body.uri).toEqual(res2.body.ci.uri);
  expect(res1.body.maxLease).toEqual(res2.body.ci.maxLease);

  let res3 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": ci2.uri, "scope": 0 })
    .expect(200);

  expect(res3.body[0].leases.length).toEqual(1);

  // post lease two
  res2 = await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": "/jupiter/desktop/mac/172",
      "scope": 0,
    })
    .expect(409);

  done();
});
