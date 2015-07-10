#!/bin/bash
# augur.js test suite

trap "exit" INT

mocha test_connect.js $1
mocha test_contracts.js $1
mocha test_fixedpoint.js $1
mocha test_encoder.js $1
mocha test_ethrpc.js $1
mocha test_invoke.js $1
# mocha test_expiring.js $1
mocha test_batch.js $1
mocha test_createEvent.js $1
mocha test_createMarket.js $1
mocha test_branches.js $1
mocha test_info.js $1
mocha test_markets.js $1
mocha test_events.js $1
mocha test_reporting.js $1
# mocha test_ballot.js $1
mocha test_payments.js $1
mocha test_comments.js $1
# mocha test_priceLog.js $1
mocha test_webclient.js $1
