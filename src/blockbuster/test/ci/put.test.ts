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

it('update the cis in same uri base', async () => {
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
    .put(`/ci/${id}`)
    .send({
      uri: "/jupiter/desktop/mac/110",
      data: {
        "ip": "10.32.35.110",
        "sys": "mac",
        "name": "rcadmin"
      },
      maxLease: 10
    })
    .expect(200);

  const result = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/mac", "scope": 1 })
    .expect(200);

  console.log("result.body>> ", result.body);
  expect(result.body.length).toBe(2);

  const x110 = result.body.filter(obj => obj.name === "110")[0];
  expect(x110.name).toEqual("110");
  expect(x110.data).toEqual({
    "ip": "10.32.35.110",
    "sys": "mac",
    "name": "rcadmin"
  });
  expect(x110.maxLease).toEqual(10);

  const x101 = result.body.filter(obj => obj.name === "101")[0];
  expect(x101.name).toEqual("101");
  expect(x101.data).toEqual(data2.data);
  expect(x101.maxLease).toEqual(data2.maxLease);
});

it('id no exists', async () => {
  const res1 = await supertest(appTest)
    .put(`/ci/xxxx`)
    .expect(404);
});


it('update the cis in different uri base', async () => {
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
    .put(`/ci/${id}`)
    .send({
      uri: "/jupiter/desktop/win/201",
      data: {
        "ip": "10.32.35.201",
        "sys": "mac",
        "name": "testadmin"
      },
      maxLease: 20
    })
    .expect(200);


  let result = await supertest(appTest)
    .get(`/ci`)
    .query({ "uri": "/jupiter/desktop/win", "scope": 1 })
    .expect(200);

  console.log("result.body>> ", result.body);
  expect(result.body.length).toBe(1);
  const x201 = result.body[0];
  expect(x201.name).toEqual("201");
  expect(x201.data).toEqual({
    "ip": "10.32.35.201",
    "sys": "mac",
    "name": "testadmin"
  });
  expect(x201.maxLease).toEqual(20);


  result = await supertest(appTest)
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
