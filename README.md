# local-kinesis-lambda-runner

The Rabble Rouser project makes extensive use of kinesis streams, and also uses lambda functions to process events from
the stream. We want a way to spin up a whole Rabble Rouser instance locally, and this package is part of the solution to
that problem.

This is a script that will poll a kinesis stream forever, and invoke your lambda function whenever a new event is
detected.

Also if someone can come up with a better name, please do.

## Usage

First install the package as a development dependency:
```sh
npm install --save-dev @rabblerouser/local-kinesis-lambda-runner
```

Then add a script to your project that looks something like this:

```js
const run = require('@rabblerouser/local-kinesis-lambda-runner');
const lambda = require('./index').handler;

run(lambda);
```

You might also like to add an npm task to run that script:

```json
{
  "scripts": {
    "start": "node localDev.js"
  }
}
```

## Running it

If you follow the setup above, you can start up your lambda locally with `npm start`, although it won't work properly
without a little configuration:

- `KINESIS_ENDPOINT`: The endpoint where kinesis is located
- `STREAM_NAME`: The name of the stream to poll

E.g:
```sh
KINESIS_ENDPOINT="http://kinesis:4567" STREAM_NAME="rabblerouser_stream" npm start
```

Note that this is only intended for local development with something like [kinesalite](https://github.com/mhart/kinesalite),
so the AWS region and credentials are internally hardcoded to arbitrary values. This script could be extended to support
running against a real kinesis stream, it would just be a matter of parameterising the extra config.

For a full example of this script in action, see the docker-compose config for [rabblerouser/core](https://github.com/rabblerouser/core).

## Publishing this library

Scoped packages (which this is) are private by default on npm, which is a paid feature. To publish publically, use this
command:

```sh
npm publish --access=public
```
