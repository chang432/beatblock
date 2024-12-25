/**
 * ===========================================================
 * Lambda handler for submitting a subsidized Arweave transaction
 * ===========================================================
 * 
 * This lambda handler transfers a small amount of arweave to a user wallet, waits a little bit for it to be confirmed, 
and then submits the user data transaction. 
 * 
 * Note: If testing locally, make sure AWS_PROFILE is set to a valid profile before calling this
 * 
 * Input JSON:
 * "state": valid values are
 * -- "arlocal" -> generate temp wallet and Use local testnet server to submit transaction (DO NOT USE REAL WALLET FOR TARGET)
 * -- "local" -> submit transaction locally with test data, real arweave wallets/network
 * -- "prod" -> submit transaction on the lambda with real data, real arweave wallets/network
 * "dry_run": Boolean that will not submit the transaction if set to true
 * "note": Desired description to be uploaded with the audio file
 * "userKeyFile": ["prod" state only] The desired wallet keyfile to receive arweave from the master wallet and be used to upload the audiofile
 * "audioFile": ["prod" state only] The desired audio file to upload
 */


const Arweave = require('arweave');
const Axios = require('axios');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const localTestingPort = 1984;

const txConfirmationWaitTimeInMinutes = 6;

const localTestingKeyFileLocation = "../../../../ARWEAVE/wallets/MAIN_DESTINATION/arweave-key-u4p-8HMKgQtah3MTsCZbCdxMcOcMFH_0sTPFum6HKdE.json";

const arweave_real = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

const arweave_local = Arweave.init({
    host: '127.0.0.1',
    port: localTestingPort,
    protocol: 'http'
});

/*
arlocal - generate temp wallet and Use local testnet server to submit transaction (DO NOT USE REAL WALLET FOR TARGET)
local - submit transaction locally
prod - submit transaction on the lambda
*/
const validStateValues = ["arlocal", "local", "prod"];

exports.handler = async (event) => {
    if (!event.hasOwnProperty("state") || typeof event.state !== "string" || !validStateValues.includes(event.state)) {
        throw new Error("Parameter state does not exist, is not a valid value, or is not a string!");
    } else if (!event.hasOwnProperty("dry_run") || typeof event.dry_run !== "boolean") {
        throw new Error("Parameter dry_run does not exist or is not a boolean!");
    } else if (!event.hasOwnProperty("note") || typeof event.note !== "string") {
        throw new Error("Parameter note does not exist or is not a string!");
    } else if (event.state === "prod" && (!event.hasOwnProperty("audioFile"))) {     // Only require this input if executing on lambda
        throw new Error("Parameter audioFile does not exist!");
    } else if (event.state === "prod" && (!event.hasOwnProperty("userKeyFile") || typeof event.userKeyFile !== "object")) {    // Only require this input if executing on lambda
        throw new Error("Parameter userKeyFile does not exist or is not type object!");
    }

    console.log(`Lambda params: ${event}`);

    const arweave = (event.state === "arlocal") ? arweave_local : arweave_real;

    var txData = null;
    var userKeyFile = null;
    var userPublicKey = null;

    if (event.state === "arlocal") {
        txData = Buffer.from("test content");

        // Create and populate test wallet with coins
        userKeyFile = await arweave.wallets.generate();
        userPublicKey = await arweave.wallets.jwkToAddress(userKeyFile);

        const mintArweaveOutput = await Axios.get(`http://localhost:${localTestingPort}/mint/${userPublicKey}/1000000000000000`);
        console.log(mintArweaveOutput.config.url + " - " + mintArweaveOutput.status + " " + mintArweaveOutput.statusText);
        const mineArweaveOutput = await Axios.get(`http://localhost:${localTestingPort}/mine`);
        console.log(mineArweaveOutput.config.url + " - " + mineArweaveOutput.status + " " + mineArweaveOutput.statusText);
    } else if (event.state === "local") {
        // Create dummy file and convert to Buffer
        txData = Buffer.from("test content");
        userKeyFile = require(localTestingKeyFileLocation);
        userPublicKey = await arweave.wallets.jwkToAddress(userKeyFile);
    } else {
        txData = event.audioFile;
        userKeyFile = event.userKeyFile;
        userPublicKey = await arweave.wallets.jwkToAddress(userKeyFile);
    }

    var subsidizerLambdaDryRun = true
    if (!event.dry_run) {
        subsidizerLambdaDryRun = false
    }

    // Call subsidization lambda to send over arweave from master wallet to this wallet
    const lambdaClient = new LambdaClient({})
    const params = {
        "FunctionName": "BeatBlockTransactionSubsidizer",
        "Payload": JSON.stringify({
            "state": "prod",
            "dry_run": subsidizerLambdaDryRun,
            "target": userPublicKey
        }) 
    }
    const lambdaCmd = new InvokeCommand(params);

    const lambdaResponse = await lambdaClient.send(lambdaCmd);
    if (lambdaResponse.StatusCode != 200) {
        throw new Error("Subsidization failed! Look into CloudWatch logs to troubleshoot...");
    }

    console.log(`Subsidization has completed! Now waiting ${txConfirmationWaitTimeInMinutes} minutes for at least 1 confirmation...`);

    const wait = () => {
        return new Promise((resolve) => {       
            setTimeout(resolve, txConfirmationWaitTimeInMinutes * 60 * 1000);
        });
    };

    if (!event.dry_run) {
        // Only wait if actually subsidizing 
        await wait();
    }

    console.log(`Wait has completed. Now initiating data transaction upload with wallet ${userPublicKey}`);

    const dataTx = await arweave.createTransaction({
        data: txData
    }, userKeyFile);

    var appName = "BeatBlock";
    if (event.state !== "prod") { 
        appName = "BeatBlockTest";
    }

    dataTx.addTag("Content-Type", "text/mpeg");
    dataTx.addTag("App-Name", appName);
    dataTx.addTag("Note", event.note);

    await arweave.transactions.sign(dataTx, userKeyFile);

    if (!event.dry_run) {
        let uploader = await arweave.transactions.getUploader(dataTx);

        while (!uploader.isComplete) {
            await uploader.uploadChunk();
            console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
        }
    } else {
        console.log(`[SIMULATION] Would have uploaded transaction: ${JSON.stringify(dataTx)}`);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('Subsidized audio upload complete!'),
    };
    return response;
};