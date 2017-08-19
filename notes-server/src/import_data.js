import fs from 'fs';
import {aws_batchWriteItems} from './database';

const import_json_data = filename => {
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
  return Promise.all([
    aws_batchWriteItems(users, 'users'),
    aws_batchWriteItems(notes, 'notes')])
    .then(([data1, data2]) => ({users: data1, notes: data2}));
};

const json_filename = process.argv[2];
console.log("importing data from JSON file", json_filename);
import_json_data(json_filename).then(data => {
    console.log("done: ", data);
  });
