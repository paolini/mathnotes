import AWS from 'aws-sdk';

AWS.config.update({
  region: "eu-central-1"
});

export function aws_putItems(items, done) {
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
      // console.log("...trasferred", count-1);
    }
    console.log("trasferring item...", count);
    dynamodb.putItem(items[count], callback);
    count ++;
  }

  callback();
}
