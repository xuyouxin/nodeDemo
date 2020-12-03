import { Connection } from "typeorm";
import { Express } from "express-serve-static-core";
import * as http from "http";
import { connectToDbAndCreateApp, deleteDbIfExists } from "./util";
import * as supertest from 'supertest'

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

async function getCi() {
  return await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": ci1.uri, "scope": 0 })
    .expect(200);
}

async function postLease() {
  await supertest(appTest)
    .post(`/lease`)
    .send({
      "duration": 60,
      "uri": ci1.uri,
      "scope": 0,
    })
    .expect(200);
}

it('put lease successfully', async done => {
  await supertest(appTest)
    .post(`/ci`)
    .send(ci1)
    .expect(200);

  // post lease one
  await postLease();

  // post lease two
  await postLease();

  let res3 = await getCi();

  expect(res3.body[0].leases.length).toEqual(2);

  const leaseIds = res3.body[0].leases.map(o => o.id);

  await supertest(appTest)
    .put(`/lease/${leaseIds[0]}`)
    .send({ renew: 60 })
    .expect(200);

  res3 = await getCi();

  expect(res3.body[0].leases.length).toEqual(2);

  done();
});

it('lease no found', async done => {
  await supertest(appTest)
    .post(`/ci`)
    .send(ci1)
    .expect(200);

  // post lease one
  await postLease();

  // post lease two
  await postLease();

  await supertest(appTest)
    .put(`/lease/xxx`)
    .send({ renew: 60 })
    .expect(404);

  let res3 = await getCi();

  expect(res3.body[0].leases.length).toEqual(2);

  done();
});

it('invalid renew', async done => {
  await supertest(appTest)
    .post(`/ci`)
    .send(ci1)
    .expect(200);

  // post lease one
  await postLease();

  // post lease two
  await postLease();

  let res3 = await getCi();

  expect(res3.body[0].leases.length).toEqual(2);

  const leaseIds = res3.body[0].leases.map(o => o.id);

  await supertest(appTest)
    .put(`/lease/${leaseIds[0]}`)
    .expect(400);

  await supertest(appTest)
    .put(`/lease/${leaseIds[0]}`)
    .send({ renew: -1 })
    .expect(400);

  res3 = await getCi();

  expect(res3.body[0].leases.length).toEqual(2);

  done();
});
