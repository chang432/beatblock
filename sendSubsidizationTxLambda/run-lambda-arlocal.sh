echo "#### Running lambda locally with arlocal testnet and input app/tests/test-arlocal-event.json ####"

export AWS_PROFILE="beatblock"

if [[ -e "arlocal_output.log" ]]; then
    rm -f arlocal_output.log
fi

npx arlocal >> arlocal_output.log 2>&1 &
ARLOCAL_PID=$!
echo "Started arlocal background process with pid: ${ARLOCAL_PID}"

cd app

npm run arlocally

cd ..

echo "Stopping arlocal background process"
kill $ARLOCAL_PID

echo "#### Script Completed ####"