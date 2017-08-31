import AWS from 'aws-sdk';

const util = require('util')

function dump(msg, myObject) {
  console.log(msg, util.inspect(myObject, {showHidden: false, depth: null}))
}

AWS.config.update({
  region: "eu-central-1"
});

/*
TODO: instead of using aws_encode_params and aws_decode_params
one can simply use the dynamodb.docClient interface.
*/

function aws_encode_params(data) {
  const Item = {};
  for (let [key, value] of Object.entries(data)) {
    if (value === '') continue;
    else if (typeof(value) === 'string') Item[key] = {'S': value};
    else if (typeof(value) === 'boolean') Item[key] = {'BOOL': value};
    else if (typeof(value) === 'number') Item[key] = {'N': value.toString()};
    else {
      throw 'unexpected key type ' + typeof(value);
    }
  }
  return Item;
}

function aws_decode_params(params) {
  const data = {};
  for (let [key, value_obj] of Object.entries(params)) {
    const [type, value] = Object.entries(value_obj)[0];
    if (type === "S" || type == "BOOL") {
      data[key] = value;
    } else if (type === "N") {
      data[key] = Number(value);
    } else {
      throw 'unexpected key type ' + type;
    }
  }
  return data;
}

const dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

export const aws_getItem = (table, key) => new Promise(
  (resolve, reject) => {
    const params = {
        TableName: table,
        Key: key
    };
    docClient.get(params, (err, data) => {
      console.log("aws_getItem", data, err, params);
      if (err) return reject(err);
      resolve(data.Item);
    });
  });

/* test aws_getItem */
// aws_getItem("users", {"id": "2"}).then(data => {console.log("DATA", data)});

export const aws_putItem = (table, item) => new Promise(
  (resolve, reject) => {
    const params = {
        TableName: table,
        Item: item };
    console.log("putItem", params);
    docClient.put(params, (err, data) => {
      if (err) return reject(err);
      resolve(data);
      // apparently data turns out to be and empty object {}
    });
  });

/* test aws_putItem */
/*
aws_putItem("users", { password: 'buh!',
     last_name: 'Ginnasta',
     first_name: 'Pippo',
     id: '42' })
     .then(
       data => console.log("CREATED", data),
       err => console.log("ERROR", err));
*/

export const aws_getItems = (table) => new Promise(
  (resolve, reject) =>
    dynamodb.scan(
      {TableName: table},
      (err, data) => {
        if (err) return reject(err);
        resolve(data.Items.map(aws_decode_params));
      }));

/* testing example: */
//  aws_getItems("notes").then(data => dump("notes", data));


export const aws_batchWriteItems = (items, table) => new Promise(
  (resolve, reject) => {
     const lst = [];
     for (const item of items) {
       lst.push({PutRequest: {Item: aws_encode_params(item)}});
     }
     const r = {RequestItems: {[table]: lst}};
     dynamodb.batchWriteItem(r, (err, data) => {
       if (err) return reject(err);
       resolve(data);
     });
   });
