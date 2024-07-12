import Ar from 'arweave'
import ArDB from 'ardb'

const ar = Ar.init({
    host: "localhost",
    port: 1984,
    protocol: "http",
});

const ardb = new ArDB(ar);

class API {

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

    async getTxData(beat_id) {
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
    async queryAllBeatsArdb() {
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
}

export default API;