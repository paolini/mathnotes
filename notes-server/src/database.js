import AWS from 'aws-sdk';

const util = require('util')

function dump(msg, myObject) {
  console.log(msg, util.inspect(myObject, {showHidden: false, depth: null}))
}

AWS.config.update({
  region: "eu-central-1"
});

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
