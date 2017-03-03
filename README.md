# local-kinesis-lambda-runner

The Rabble Rouser project makes extensive use of kinesis streams, and also uses lambda functions to process events off
of the stream. We want a way to spin up a whole Rabble Rouser system locally, and this package is part of the solution
to that problem.

This is a script that will poll a kinesis stream forever, and invoke your lambda function whenever a new event is
detected.

Also if someone can come up with a better name, please do.
