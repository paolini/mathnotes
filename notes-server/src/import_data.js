import fs from 'fs';
import {aws_batchWriteItems} from './database';

function import_json_data(filename, done) {
  const obj = JSON.parse(fs.readFileSync(filename, 'utf8'));

  function extract_item(item) {
    const o = {id: item.pk.toString()};
    for (const [key, value] of Object.entries(item.fields)) {
      if (value) {
        o[key] = value;
      }
    }
    return o;
  }

  const notes = [], users = [];
  for (const item of obj) {
    if (item.model === 'main.note') {
      const data = extract_item(item);
      notes.push(data);
    } else if (item.model === 'auth.user') {
      const data = extract_item(item);
      delete data.groups;
      delete data.user_permissions;
      users.push(data);
    } else if (item.model === 'default.usersocialauth') {
      const data = { ...extract_item(item)};
      data.extra_data = JSON.parse(data.extra_data);
    }
  }
  aws_batchWriteItems(users, 'users', (err, data1) => {
    const data = {users: data1};
    if (err) return done(err, data);
    aws_batchWriteItems(notes, 'notes', (err, data2) => {
      data.notes = data2;
      return done(err, data);
    });
  })
//  aws_putItems(item_queue, done);
}

const json_filename = process.argv[2];
console.log("importing data from JSON file", json_filename);
import_json_data(json_filename, (err, data) => {
    if (err) {
      console.log("ERROR!", err.stack);
    }
    console.log(data);
  });
