import Ar from 'arweave'
import ArDB from 'ardb'

const ar = Ar.init({
    host: "localhost",
    port: 1984,
    protocol: "http",
});

const ardb = new ArDB(ar);

class API {

    static async generate () {
        ar.wallets.generate().then(async (key) => {
            var public_key = await ar.wallets.getAddress(key);
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
    
    static async sendTransaction(note, keyfile, audiofile, handleUploadExitClick) {
        // validation logic

        const reader = new FileReader();
        reader.readAsText(keyfile);
        reader.onload = async (f) => {
            try {
                const keyFileData = JSON.parse(f.target.result);
                const publicKey = await ar.wallets.getAddress(keyFileData);
                const privateKey = keyFileData
                console.log(publicKey);      
                console.log(privateKey);

                await new Promise((resolve) => {
                    const fr = new FileReader();
                    fr.readAsArrayBuffer(audiofile);
                    fr.onload = async function () {
                        var arrayBufferOne = fr.result;
        
                        await ar.api.get("/mint/" + publicKey + "/100000000000000");

                        let transaction = await ar.createTransaction(
                            {
                                data: arrayBufferOne,
                            },
                            privateKey
                        );
                        transaction.addTag("Content-Type", "text/mpeg");
                        transaction.addTag("App-Name", "BeatBlock");
                        transaction.addTag("Note", note);
        
                        await ar.transactions.sign(transaction, privateKey);
        
                        let uploader = await ar.transactions.getUploader(transaction);

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

    static convertEpochToFormattedString(epochTime) {
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

    static async getTxDate(beat_id) {
        return new Promise(async (resolve) => {
            const tx_status = await ar.transactions.getStatus(beat_id);
            resolve(tx_status)
        })
        .then(async (res) => {
            if (res.confirmed === "Pending") {
                return res.confirmed
            }

            var block_indep_hash = res.confirmed.block_indep_hash
            const result = await ar.blocks.get(block_indep_hash); 
            return this.convertEpochToFormattedString(result.timestamp)
        })
    }

    static async getTxData(beat_id) {
        return new Promise((resolve) => {
            ar.transactions.getData(beat_id, { decode: true }).then((data) => {
            // data is Uint8Array
            const blob = new Blob([data], {
                type: "audio/mpeg",
            });
            resolve(blob);
            });
        });
    }

    // Used for querying test data from ArLocal
    static async queryAllBeatsArdb() {
        var new_beats = [];

        const query_beats = await new Promise((resolve) => {
            ardb
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

    static async queryAllBeatsFiltered (searchEntry) {
        var new_beats = [];
    
        const queryByBeatOwner = await new Promise((resolve) => {
          // Filter by beat owner walled id
          ardb
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
          ardb
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
}

export default API;