const AWS = require('aws-sdk');

const pollKinesis = require('./pollKinesis');

const streamName = process.env.STREAM_NAME;
const kinesis = new AWS.Kinesis({
  endpoint: process.env.KINESIS_ENDPOINT,
  region: 'ap-southeast-2',
  accessKeyId: 'FAKE',
  secretAccessKey: 'ALSO FAKE',
});

module.exports = {
  pollKinesis: pollKinesis(kinesis, streamName, console),
};
