module.exports = (kinesis, StreamName) => {
  const wait = ms => () => new Promise(resolve => setTimeout(resolve, ms));

  const callback = (err, result) => err ? console.error('Handler failed:', err.message) : console.log('Handler suceeded:', result);

  const mapKinesisRecord = record => ({
    data: record.Data.toString('base64'),
    sequenceNumber: record.SequenceNumber,
    approximateArrivalTimestamp: record.ApproximateArrivalTimestamp,
    partitionKey: record.PartitionKey,
  });

  const reduceRecord = lambda => (promise, kinesisRecord) => promise.then(() => {
    const singleRecordEvent = { Records: [{ kinesis: mapKinesisRecord(kinesisRecord) }] };
    console.log('Invoking lambda with record from stream:', JSON.stringify(singleRecordEvent));
    return lambda(singleRecordEvent, null, callback);
  });

  const pollKinesis = lambda => firstShardIterator => {
    const fetchAndProcessRecords = shardIterator => (
      kinesis.getRecords({ ShardIterator: shardIterator }).promise().then(records => (
        records.Records.reduce(reduceRecord(lambda), Promise.resolve())
          .then(wait(500))
          .then(() => fetchAndProcessRecords(records.NextShardIterator))
      ))
    )
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

  return run;
};
