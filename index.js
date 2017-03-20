
const AWS = require('aws-sdk')

const StreamName = process.env.STREAM_NAME;
const kinesis = new AWS.Kinesis({
  endpoint: process.env.KINESIS_ENDPOINT,
  region: 'ap-southeast-2',
  accessKeyId: 'FAKE',
  secretAccessKey: 'ALSO FAKE',
});

const callback = (err, result) => err ? console.error('Handler failed:', err.message) : console.log('Handler suceeded:', result);

const mapKinesisRecord = record => ({
  data: record.Data.toString('base64'),
  sequenceNumber: record.SequenceNumber,
  approximateArrivalTimestamp: record.ApproximateArrivalTimestamp,
  partitionKey: record.PartitionKey,
});

const pollKinesis = lambda => firstShardIterator => {
  const fetchAndProcessRecords = (shardIterator) => {
    return kinesis.getRecords({ ShardIterator: shardIterator }).promise().then((records) => {
      records.Records.forEach(kinesisRecord => {
        const singleRecordEvent = { Records: [{ kinesis: mapKinesisRecord(kinesisRecord) }] };
        console.log('Invoking lambda with record from stream:', JSON.stringify(singleRecordEvent));
        lambda(singleRecordEvent, null, callback);
      });
      setTimeout(() => fetchAndProcessRecords(records.NextShardIterator), 500);
    });
  }
  return fetchAndProcessRecords(firstShardIterator);
}

const run = lambda => {
  const loop = () => {
    return kinesis.describeStream({ StreamName }).promise()
      .then(stream => {
        console.log(`Found ${StreamName}!`);
        const ShardId = stream.StreamDescription.Shards[0].ShardId

        const params = { StreamName, ShardId, ShardIteratorType: 'LATEST' };
        return kinesis.getShardIterator(params).promise();
      })
      .then(shardIterator => {
        console.log('Polling kinesis for events...');
        return shardIterator.ShardIterator;
      })
      .then(pollKinesis(lambda))
      .catch(err => {
        console.error(err.message);
        console.log('Restarting...');
        setTimeout(loop, 2000);
      });
  };
  loop();
};

module.exports = run;
