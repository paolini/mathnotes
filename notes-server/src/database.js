import AWS from 'aws-sdk';

AWS.config.update({
  region: "eu-central-1"
});

const dynamodb = new AWS.DynamoDB();


export function aws_getItems() {
}

function aws_prepare_params(data) {
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

export function aws_batchWriteItems(items, table, done) {
  const lst = [];
  for (const item of items) {
    lst.push({PutRequest: {Item: aws_prepare_params(item)}});
  }
  const r = {RequestItems: {[table]: lst}};
  dynamodb.batchWriteItem(r, done);
}

/*
export function aws_putItems(items, done) {
  let count = 0;

  function callback(err, data) {
    if (err) {
      done(err, {count});
      return;
    }
    if (count >= items.length) {
      done(null, {count});
      return;
    }
    if (count > 0) {
      // console.log("...trasferred", count-1);
    }
    console.log("trasferring item...", count);
    dynamodb.putItem(items[count], callback);
    count ++;
  }

  callback();
}
*/
