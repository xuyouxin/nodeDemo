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

  const res1 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/mac", "scope": 1 })
    .expect(200);

  const id = res1.body[0].id;
  const res2 = await supertest(appTest)
    .delete(`/ci/${id}`)
    .expect(204);

  const result = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/mac", "scope": 1 })
    .expect(200);

  console.log("result.body>> ", result.body);
  expect(result.body.length).toBe(1);

  const x101 = result.body[0];
  expect(x101.name).toEqual("101");
  expect(x101.data).toEqual(data2.data);
  expect(x101.maxLease).toEqual(data2.maxLease);
});

it('id no exists', async () => {
  const res1 = await supertest(appTest)
    .delete(`/ci/xxxx`)
    .expect(204);
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

  const res1 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/mac", "scope": 0 })
    .expect(200);

  const id = res1.body[0].id;
  const res2 = await supertest(appTest)
    .delete(`/ci/${id}`)
    .expect(400);
});
