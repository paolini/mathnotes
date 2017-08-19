import fs from 'fs';
import {aws_putItems} from './database';

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
  aws_putItems(item_queue, done);
}

const json_filename = process.argv[2];
console.log("importing data from JSON file", json_filename);
import_json_data(json_filename, (err, data) => {
    if (err) {
      console.log("ERROR!", err.stack);
    }
    console.log(data);
  });
