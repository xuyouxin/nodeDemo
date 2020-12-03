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

it('delete lease successfully when id exists', async done => {
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

  // delete one
  await supertest(appTest)
    .delete(`/lease/${leaseIds[0]}`)
    .expect(204);

  res3 = await getCi();

  expect(res3.body[0].leases.length).toEqual(1);

  let leaseIdsNew: string[] = res3.body[0].leases.map(o => o.id);

  expect(leaseIdsNew.includes(leaseIds[0])).toBeFalsy();
  expect(leaseIdsNew[0]).toEqual(leaseIds[1]);

  // delete two
  await supertest(appTest)
    .delete(`/lease/${leaseIds[1]}`)
    .expect(204);

  res3 = await getCi();

  expect(res3.body[0].leases.length).toEqual(0);

  done();
});

it('id no exists', async done => {
  await supertest(appTest)
    .delete(`/lease/xxx`)
    .expect(204);

  done();
});
