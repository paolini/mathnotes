import fs from 'fs';
import AWS from 'aws-sdk';
import uuid from 'node-uuid';

AWS.config.update({
  region: "eu-central-1"
});

function main() {
  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: 'notes' /* required */
  };

  dynamodb.describeTable(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

function import_json_data(filename) {
  const obj = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const notes = [];
  const users = [];
  const usersocialauth = [];
  function extract_item(item) {
    return { ...item.fields, id: item.pk};
  }
  for (const item of obj) {
    if (item.model === 'main.note') {
      notes.push(extract_item(item));
    } else if (item.model === 'auth.user') {
      users.push(extract_item(item));
    } else if (item.model === 'default.usersocialauth') {
      const data = { ...extract_item(item)};
      data.extra_data = JSON.parse(data.extra_data);
      usersocialauth.push(data);
    }
  }
  return {notes, users, usersocialauth};
}

console.log(process.argv)
if (process.argv[2] === 'import') {
  const obj = import_json_data(process.argv[3]);
  console.log('import obj', obj);
}
