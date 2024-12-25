export AWS_PROFILE=beatblock

cd app
zip -r ../beatblock-subsidizer-submitter.zip . -x "node_modules/*"
cd ..

aws lambda update-function-code --function-name BeatBlockTransactionSubsidizerSubmitter --zip-file fileb://beatblock-subsidizer-submitter.zip

rm -f beatblock-subsidizer-submitter.zip