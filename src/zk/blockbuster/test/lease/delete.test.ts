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
  expect(leaseIds[0]).toBeDefined();
  expect(leaseIds[1]).toBeDefined();

  console.log(`${ci1.uri}/leases/${leaseIds[0]}`);

  // delete one
  const res1 = await supertest(appTest)
    .delete(`/lease`)
    .send({ uri: `${ci1.uri}/leases/${leaseIds[0]}` })
    .expect(200);
  expect(res1.body.result).toEqual(true);

  res3 = await getCi();

  expect(res3.body[0].leases.length).toEqual(1);

  let leaseIdsNew: string[] = res3.body[0].leases.map(o => o.id);

  expect(leaseIdsNew.includes(leaseIds[0])).toBeFalsy();
  expect(leaseIdsNew[0]).toEqual(leaseIds[1]);

  console.log(`${ci1.uri}/leases/${leaseIds[1]}`);

  // delete two
  const res2 = await supertest(appTest)
    .delete(`/lease`)
    .send({ uri: `${ci1.uri}/leases/${leaseIds[1]}` })
    .expect(200);
  expect(res2.body.result).toEqual(true);

  res3 = await getCi();

  expect(res3.body[0].leases.length).toEqual(0);

  done();
});

it('not a lease uri', async done => {
  await supertest(appTest)
    .delete(`/lease`)
    .send({ uri: `${ci1.uri}` })
    .expect(400);

  await supertest(appTest)
    .delete(`/lease`)
    .send({ uri: `/` })
    .expect(400);

  done();
});

it('uri no found', async done => {

  await supertest(appTest)
    .delete(`/lease`)
    .send({ uri: `${ci1.uri}/leases/123` })
    .expect(404);

  done();
});
