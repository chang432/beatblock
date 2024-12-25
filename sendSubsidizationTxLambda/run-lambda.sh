echo "#### Running lambda locally with input app/tests/test-local-event.json ####"

export AWS_PROFILE="beatblock"

cd app

npm run locally

cd ..

echo "#### Script Completed ####"