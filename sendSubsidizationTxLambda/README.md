#### Beat Block Subsidizer Transaction Submitter Lambda ####

Lambda that transfers a small amount of arweave to a user wallet, waits a little bit for it to be confirmed, 
and then submits the user data transaction. 


## Lambda Layers:

If there are any changes to the node dependencies (node_modules modification), then
1. Zip up files in "app/node_modules/*" in the structure "nodejs/node_modules/*" named "beat-block-subsidizer-node-deps.zip"
2. Update lambda layer "beat-block-subsidizer-node-deps" with the new zip


## Helper Scripts:

"run-lambda.sh": Runs the lambda locally
- input comes from "app/tests/test-local-event.json" 

"run-lambda-arlocal.sh": Runs the lambda locally with a test event using the arlocal testnet
- input comes from "app/tests/test-arlocal-event.json" 
- arlocal output gets written to "arlocal_output.log"

"upload.sh": Zips up files in "app/*" excluding "node_modules" and uploads it to s3 (to be picked up by the lambda)

================

- Uses CoinMarketCap API for querying latest arweave price.
- If master wallet every changes, make sure the ref is updated in the beatblock monorepo as well.