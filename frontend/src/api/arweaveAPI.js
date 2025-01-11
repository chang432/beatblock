import Arweave from 'arweave'
import ArDB from 'ardb'
import Axios from 'axios'
import { LambdaClient,InvokeCommand } from '@aws-sdk/client-lambda';

const localPort = 1984;

const masterWalletKey = "OHkkHPdBDHbjcDTLDBBCMv1b05z3i7HP4cVzb1CFdUg";

const arweaveGraphqlEndpoint = "https://arweave.net/graphql";

const arweave_real = Arweave.init({});

const arweave_local = Arweave.init({
    host: '127.0.0.1',
    port: localPort,
    protocol: 'http'
});

class API {
    constructor(testing) {
        this.arweave = testing ? arweave_local : arweave_real;
        this.ardb = new ArDB(this.arweave);
    }

    async generate () {
        this.arweave.wallets.generate().then(async (key) => {
            var public_key = await this.arweave.wallets.getAddress(key);
            var filename = "arweave-key-" + public_key + ".json";
            var file = new Blob([JSON.stringify(key)], { type: JSON });
            if (window.navigator.msSaveOrOpenBlob)
                // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
            else {
                // Others
                var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            }
        });
    }
    
    async sendTransaction(note=null, keyfile=null, audiofile=null, handleUploadExitClick=null) {
        if (note == null || typeof note !== "string") {
            console.log("Error note is null or not a string!");
        } else if (keyfile == null || typeof note !== "object") {
            console.log("Error note is null or not an object!");
        } else if (audiofile == null || typeof audiofile !== "object") {
            console.log("Error audiofile is null or not an object!");
        } else if (handleUploadExitClick == null || typeof handleUploadExitClick !== "function") {
            console.log("Error handleUploadExitClick is null or not a function!");
        }

        const self = this;    // Need to store class ref for promise use

        const reader = new FileReader();
        reader.readAsText(keyfile);
        reader.onload = async (f) => {
            try {
                const keyFileData = JSON.parse(f.target.result);
                const publicKey = await this.arweave.wallets.getAddress(keyFileData);
                const privateKey = keyFileData
                console.log(publicKey);      
                console.log(privateKey);

                await new Promise((resolve) => {
                    const fr = new FileReader();
                    fr.readAsArrayBuffer(audiofile);
                    fr.onload = async function () {
                        var arrayBufferOne = fr.result;
        
                        await Axios.get(`http://127.0.0.1:${localPort}/mint/${publicKey}/100000000000000`);
                        await Axios.get(`http://127.0.0.1:${localPort}/mine`);

                        let transaction = await self.arweave.createTransaction(
                            {
                                data: arrayBufferOne,
                            },
                            privateKey
                        );
                        transaction.addTag("Content-Type", "text/mpeg");
                        transaction.addTag("App-Name", "BeatBlock");
                        transaction.addTag("Note", note);
        
                        await self.arweave.transactions.sign(transaction, privateKey);
        
                        let uploader = await self.arweave.transactions.getUploader(transaction);

                        while (!uploader.isComplete) {
                            await uploader.uploadChunk();
                            console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
                        }
                        resolve()
                        console.log("Tx successfully sent!");
                        handleUploadExitClick();
                    };
                });

            } catch (err) {
                console.error(err);
            }
        };
    }

    async sendSubsidizedTransaction(note=null, keyfile=null, audiofile=null, handleUploadExitClick=null, local=false) {
        if (note == null || typeof note !== "string") {
            console.log("Error note is null or not a string!");
        } else if (keyfile == null || typeof keyfile !== "object") {
            console.log("Error keyfile is null or not an object!");
        } else if (audiofile == null || typeof audiofile !== "object") {
            console.log("Error audiofile is null or not an object!");
        } else if (handleUploadExitClick == null || typeof handleUploadExitClick !== "function") {
            console.log("Error handleUploadExitClick is null or not a function!");
        }

        const reader = new FileReader();
        reader.readAsText(keyfile);
        reader.onload = async (f) => {
            const keyFileData = JSON.parse(f.target.result);

            await new Promise(() => {
                const fr = new FileReader();
                fr.readAsDataURL(audiofile);
                fr.onload = async function (event) {
                    var audioBase64 = fr.result;

                    var lambdaClient;
                    
                    if (local) {
                        lambdaClient = new LambdaClient({
                            region: "us-east-1",
                            credentials: {
                                accessKeyId: "{{ACCESS_KEY}}",   // replaced in local_deploy.sh
                                secretAccessKey: "{{SECRET_ACCESS_KEY}}",   // replaced in local_deploy.sh
                            }
                        });
                    } else {
                        lambdaClient = new LambdaClient({
                            region: "us-east-1",
                        });
                    }
            
                    const params = {
                        "FunctionName": "BeatBlockTransactionSubsidizerSubmitter",
                        "Payload": JSON.stringify({
                            "state": "prod",
                            "dry_run": false,
                            "userKeyFile": keyFileData,
                            "audioFile": audioBase64,
                            "note": note
                        })
                    };

                    const lambdaCmd = new InvokeCommand(params);
                    const lambdaResponse = await lambdaClient.send(lambdaCmd);
                    if (lambdaResponse.StatusCode != 200) {
                        throw new Error("Subsidization failed! Look into CloudWatch logs to troubleshoot...");
                    } else { 
                        console.log("Successfully submitted subsidized audio!");
                        handleUploadExitClick();
                    }
                }
            });
        }
    }

    convertEpochToFormattedString(epochTime) {
        // Convert epoch time to milliseconds
        const date = new Date(parseInt(epochTime, 10) * 1000);
    
        // Get the components of the date
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getUTCDate()).padStart(2, '0');
        const year = date.getUTCFullYear();
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    
        // Format the date and time in the desired format
        const formattedDate = `${month}/${day}/${year} - ${hours}:${minutes} UTC`;
    
        return formattedDate;
    }

    async getTxDate(beat_id) {
        return new Promise(async (resolve) => {
            const tx_status = await this.arweave.transactions.getStatus(beat_id);
            resolve(tx_status)
        })
        .then(async (res) => {
            if (res.confirmed === "Pending") {
                return res.confirmed
            }

            var block_indep_hash = res.confirmed.block_indep_hash
            const result = await this.arweave.blocks.get(block_indep_hash); 
            return this.convertEpochToFormattedString(result.timestamp)
        })
    }

    async getTxData(beat_id) {
        return new Promise((resolve) => {
            this.arweave.transactions.getData(beat_id, { decode: true }).then((data) => {
            // data is Uint8Array
            const blob = new Blob([data], {
                type: "audio/mpeg",
            });
            resolve(blob);
            });
        });
    }

    // Used for querying test data from ArLocal
    async queryAllBeatsArdb() {
        var new_beats = [];

        const query_beats = await new Promise((resolve) => {
            this.ardb
            .search("transactions")
            .appName("BeatBlock")
            .findAll()
            .then((txs) => {
                resolve(txs);
            });
        })
        .then((txs) => {
            for (const tx of txs) {
                // console.log(tx);
                let new_beat = {
                    name: tx.tags[1].value,
                    tx_id: tx.id,
                    owner_address: tx.owner.address,
                    note: tx.tags[2].value,
                    playPauseState: "play",
                };
                new_beats.push(new_beat);
            }
            return new_beats;
        })
        .catch(err => { console.log("ERROR:", err) });

        return new Promise((resolve) => {
            Promise.all(
                query_beats.map(async (obj) => {
                    obj.blob = await this.getTxData(obj.tx_id);
                    return obj;
                }
            ))
            .then((new_beats) => {
                Promise.all(
                    new_beats.map(async (obj) => {
                        obj.date = await this.getTxDate(obj.tx_id);
                        return obj;
                    })
                )
                .then((final_beats) => {
                    resolve(final_beats);
                }) 
            });
        })
    }

    async queryAllBeatsFiltered (searchEntry) {
        var new_beats = [];
    
        const queryByBeatOwner = await new Promise((resolve) => {
          // Filter by beat owner walled id
          this.ardb
            .search("transactions")
            .appName("BeatBlock")
            .from(searchEntry)
            .findAll()
            .then((txs) => {
              resolve(txs);
            });
        });
    
        const queryByBeatName = await new Promise((resolve) => {
          // Filter by note
          this.ardb
            .search("transactions")
            .appName("BeatBlock")
            .tag("Note", searchEntry)
            .findAll()
            .then((txs) => {
              resolve(txs);
            });
        });
    
        return await new Promise((resolve) => {
          Promise.all([queryByBeatOwner, queryByBeatName])
            .then((combined_txs) => {
              for (const tx_arr of combined_txs) {
                for (const tx of tx_arr) {
                    let new_beat = {
                        name: tx.tags[1].value,
                        tx_id: tx.id,
                        owner_address: tx.owner.address,
                        note: tx.tags[2].value,
                        playPauseState: "play",
                    };
                    new_beats.push(new_beat);
                }
              }
              return new_beats;
            })
            .then((new_beats) => {
              Promise.all(
                new_beats.map(async (obj) => {
                  obj.blob = await this.getTxData(obj.tx_id);
                  obj.date = await this.getTxDate(obj.tx_id);
                  return obj;
                })
              ).then((new_beats) => {
                resolve(new_beats)
              });
            });
        })
    }

    /**
     * Checks if the specified wallet has gotten a free beat subsidization from the master wallet
     * @param {string} userKey - public key of the user wallet to check
     * @returns {boolean} 
     */
    async hasWalletUsedSubsidization(userKey) {
        const recipientQuery = `
        query {
            transactions(
                owners: ["${masterWalletKey}"]
            ) {
                edges {
                    node {
                        recipient
                    }
                }
            }
        }`;

        const response = await Axios.post(arweaveGraphqlEndpoint, { query: recipientQuery });
        const recipientList = response.data.data.transactions.edges;

        for (let entry of recipientList) {
            let recipient = entry.node.recipient;
            console.log(recipient);
            if (recipient === userKey) {
                console.log(`User key ${userKey} has been subsidized already!`);
                return true;
            } 
        }
        return false;
    }

    async keyfileToPublicKey(keyfile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsText(keyfile);
            reader.onload = async (f) => {
                try {
                    const keyFileData = JSON.parse(f.target.result);
                    resolve(await this.arweave.wallets.getAddress(keyFileData));

                } catch (err) {
                    console.error(err);
                    reject(err);
                }
            };
        });
    }
}


export default API;