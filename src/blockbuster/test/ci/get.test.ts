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

it('uri exists, and scope is 0', async () => {

  await createSomeData();

  const res1 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": data1.uri, "scope": 0 })
    .expect(200);

  console.log("res.body>>", res1.body);
  expect(res1.body.length).toBe(1);
  expect(res1.body[0].data).toEqual(data1.data);
  expect(res1.body[0].maxLease).toEqual(data1.maxLease);

  const res2 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": data2.uri, "scope": 0 })
    .expect(200);

  console.log("res.body>>", res2.body);
  expect(res2.body.length).toBe(1);

  expect(res2.body[0].data).toEqual(data2.data);
  expect(res2.body[0].maxLease).toEqual(data2.maxLease);
});

it('uri exists, and scope is 1', async () => {

  await createSomeData();

  const res1 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/mac", "scope": 1 })
    .expect(200);

  console.log("res.body>>", res1.body);
  expect(res1.body.length).toBe(2);

  expect(res1.body[0].data).toEqual(data1.data);
  expect(res1.body[0].maxLease).toEqual(data1.maxLease);

  expect(res1.body[1].data).toEqual(data2.data);
  expect(res1.body[1].maxLease).toEqual(data2.maxLease);
});

it('uri no exists', async () => {

  await createSomeData();

  const res1 = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/mac/xxx", "scope": 0 })
    .expect(404);
});
