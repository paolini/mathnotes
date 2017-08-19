import fs from 'fs';
import AWS from 'aws-sdk';
import uuid from 'node-uuid';


AWS.config.update({
  region: "eu-central-1"
});

function aws_putItems(items, done) {
  const dynamodb = new AWS.DynamoDB();
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
      console.log("trasferred", count-1);
    }
    console.log("trasferring item...", count, items[count]);
    dynamodb.putItem(items[count], callback);
    count ++;
  }

  callback();
}

function import_json_data(filename, done) {
  const obj = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const notes = [];
  const users = [];
  const usersocialauth = [];

  function extract_item(item) {
    const o = {id: item.pk.toString()};
    for (const [key, value] of Object.entries(item.fields)) {
      if (value) {
        o[key] = value;
      }
    }
    return o;
  }

  function prepare_params(data, table) {
    const Item = {};
    for (let [key, value] of Object.entries(data)) {
      if (typeof(value) == 'string') Item[key] = {'S': value};
      else if (typeof(value) == 'boolean') Item[key] = {'BOOL': value};
      else if (typeof(value) == 'number') Item[key] = {'N': value.toString()};
      else {
        throw 'unexpected key type ' + typeof(value);
      }
    }
    return {TableName: table, Item};
  }

  const item_queue = [];
  for (const item of obj) {
    if (item.model === 'main.note') {
      const data = extract_item(item);
      const params = prepare_params(data, 'notes');
      item_queue.push(params);
    } else if (item.model === 'auth.user') {
      const data = extract_item(item);
      delete data.groups;
      delete data.user_permissions;
      item_queue.push(prepare_params(data, 'users'));
    } else if (item.model === 'default.usersocialauth') {
      const data = { ...extract_item(item)};
      data.extra_data = JSON.parse(data.extra_data);
    }
  }

  const dynamodb = new AWS.DynamoDB();

  function aws_callback(err, data) {
    AWS.putItem
  }

  aws_putItems(item_queue, done);
}

console.log(process.argv)
if (process.argv[2] === 'import') {
  import_json_data(process.argv[3], (err, data) => {
    if (err) {
      console.log("ERROR!", err.stack);
    }
    console.log(data);
  });
}
