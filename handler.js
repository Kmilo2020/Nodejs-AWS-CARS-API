"use strict";

/* module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v2.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};*/

// API URL: https://6e4iw1qxo0.execute-api.us-east-1.amazonaws.com/dev/cars
// CHANGES TESTING GIT 1 2

//After install express
const serverless = require('serverless-http');
const express = require("express");
const app = express();

//To work with DynamoDB Service
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Endpoint to post a car into DynamoDB
app.post("/cars", async (req, res) => {
  const data = req.body;
  const params = {
    TableName: "carsTable",
    Item: {
      id: uuidv4(),
      make: data.make,
      model: data.model,
      year: data.year
    },
  };

  try {
    await db.put(params).promise();
    res.status(201).json({car: params.Item});
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

//Endpoint to get cars list from DynamoDB
app.get("/cars", async (req, res) => {
  const params = {
    TableName: "carsTable",
  };

  const result = await db.scan(params).promise();
  res.status(200).json({cars: result});
});

//Endpoint to update/Modify a car into DynamoDB
app.patch("/cars/:id", async (req, res) => {
  const data = req.body;
  const params = {
    TableName: "carsTable",
    Item: {
      id: data.id,
      make: data.make,
      model: data.model,
      year: data.year
    },
  };

  await db.put(params).promise();
  res.status(200).json({car: params.Item});
});

//Endpoint to delete a car into DynamoDB
app.delete("/cars/:id", async (req, res) => {
  const params = {
    TableName: "carsTable",
    Key: {
      id: req.params.id
    },
  };

  await db.delete(params).promise();
  res.status(200).json({success: true});
});

//Service for testing endpoints
app.get("/test", (req, res) => {
  res.status(200).json({foo: "bar"});
});

module.exports.app = serverless(app);
