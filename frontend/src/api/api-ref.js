import store from "../store/store"
import logger from "../utilities/logger"
const Ar = require('arweave').default
const ArDB = require('ardb').default
const ArGql = require('ar-gql')

const ar = Ar.init({
  host: "localhost",
  port: 1984,
  protocol: "http",
});

const ardb = new ArDB(ar);

const API = {
  ar: ar,

  async sendTxWithText (e) {
    e.preventDefault();

    // validate beat name length
    if (!this.isWithinMaxLength(this.beat_name, 16)) {
    alert(
        "Please specify a beat name with length greater than 0 and less than or equal to 16 characters"
    );
    return;
    }

    // validate beat name characters
    if (this.beat_name.includes(" ")) {
    alert("Please specify a beat name without spaces");
    return;
    }

    // validate beat note length
    if (!this.isWithinMaxLength(this.note, 50)) {
    alert(
        "Please specify a beat note with length greater than 0 and less than or equal to 50 characters"
    );
    return;
    }

    // validate characters?

    const isUnique = await API.isUniqueBeatName(this.beat_name);
    if (!isUnique) {
    alert("Please specify an original beat name");
    return;
    }

    await this.uploadBeat({
        public_key: this.keyFile.public_key,
        private_key: this.keyFile.private_key,
        beat_name: this.beat_name,
        note: this.note,
    })
    .then(() => {
        if (this.$store.state.uploadBeatComplete) {
        this.open = false;
        alert(
            "Beat successfully uploaded, please wait for some time for it to be confirmed and uploaded to the network!"
        );
        }
    })
    .catch((error) => {
        console.error(error);
    });
  },

  async uploadBeat ({ commit, dispatch }, data) {
    commit("setUploadBeatComplete", false)

    const public_key = data.public_key;
    const private_key = data.private_key;
    const beat_name = data.beat_name;
    const note = data.note;

    const free_beats_left = await dispatch("freeBeatsLeft")
    if (free_beats_left > 0) {
      logger.log(public_key + " has " + free_beats_left + " free beats left");
    }

    let real_file = document.getElementById("real_audio_file").files[0];

    await new Promise((resolve) => {
      const fr = new FileReader();
      fr.readAsArrayBuffer(real_file);
      fr.onload = async function () {
        var arrayBufferOne = fr.result;

        var walletAddress = public_key;

        await ar.api.get("mint/" + walletAddress + "/10000000000000000");

        let transaction = await ar.createTransaction(
          {
            data: arrayBufferOne,
          },
          private_key
        );
        transaction.addTag("Content-Type", "text/mpeg");
        transaction.addTag("App-Name", "BeatLedger");
        transaction.addTag("Name", beat_name);
        transaction.addTag("Note", note);

        await ar.transactions.sign(transaction, private_key);

        let uploader = await ar.transactions.getUploader(transaction);

        while (!uploader.isComplete) {
          await uploader.uploadChunk();
          commit("setUploadStatus", `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`)
        }

        commit("setUploadBeatComplete", true)
        resolve()
        logger.log("Tx successfully sent!");
      };
    });
  },

  isUniqueBeatName (beat_name) {
    return new Promise((resolve, reject) => {
      // Filter by beat owner
      ardb
        .search("transactions")
        .appName("BeatLedger")
        .tag("Name", beat_name)
        .findAll()
        .then((txs) => {
          if (txs.length > 0) {
            resolve(false);
          } else {
            resolve(true);
          }
        }).catch((err) => {
          reject(err)
        })
    })
  },

  async getTxData (beat_id) {
    return new Promise((resolve) => {
      ar.transactions.getData(beat_id, { decode: true }).then((data) => {
        // data is Uint8Array
        const blob = new Blob([data], {
          type: "audio/mpeg",
        });
        resolve(blob);
      });
    });
  },

  async queryAllBeatsNumber () {
    await ardb
      .search("transactions")
      .appName("BeatLedger")
      .findAll()
      .then((txs) => {
        logger.log(txs.length);
      });
  },

  // query cursors with ArGql
  async queryCursors () {
    let query = `query($cursor: String) {
      transactions(
        sort: HEIGHT_DESC,
        owners: ["kLx41ALBpTVpCAgymxPaooBgMyk9hsdijSF2T-lZ_Bg"],
        after: $cursor
      ) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            id
          }
        }
      }
    }`

    await ArGql
      .all(query)
      .then((res) => {
        // logger.log(res);
        let numBeatsPerPage = 5
        var cursors = []
        var totalPages = Math.ceil(res.length / numBeatsPerPage);
        var totalBeats = res.length

        // add empty cursor for first page
        cursors.push("");

        for (let i = numBeatsPerPage - 1; i < totalBeats; i += numBeatsPerPage) {
          // cursors starts on second page
          let entry = res[i];
          // let txid = entry.node.id
          let cursor = entry.cursor
          cursors.push(cursor)
          // logger.log(`${i}\ntxid: ${txid}\ncursor: ${cursor}\n`)
        }

        store.dispatch("populateCursors", [totalPages, cursors, totalBeats])
      });
  },

  // query beats with cursors from ArGql
  async queryBeatsWithCursor (cursor) {
    logger.log(`cursor to query: ${cursor}`);
    let query = `query {
      transactions(
        sort: HEIGHT_DESC,
        first: 5,
        owners: ["kLx41ALBpTVpCAgymxPaooBgMyk9hsdijSF2T-lZ_Bg"],
        after: "${cursor}"
      ) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            id
          }
        }
      }
    }`

    await ArGql
      .run(query)
      .then((res) => {
        for (var entry of res.data.transactions.edges) {
          logger.log(entry);
        }
      });
  },

  // Used for querying test data from ArLocal
  async queryAllBeatsArdb () {
    var new_beats = [];

    const query_beats = await new Promise((resolve) => {
      ardb
        .search("transactions")
        .appName("BeatLedger")
        .findAll()
        .then((txs) => {
          resolve(txs);
        });
    })
      .then((txs) => {
        for (const tx of txs) {
          let new_beat = {
            name: tx.tags[2].value,
            tx_id: tx.id,
            owner_address: tx.owner.address,
            note: tx.tags[3].value,
            playPauseState: "faPlayComponent",
          };
          new_beats.push(new_beat);
        }
        return new_beats;
      })
      .catch(err => { logger.log(err) });

    return new Promise((resolve) => {
      Promise.all(
        query_beats.map(async (obj) => {
          obj.blob = await this.getTxData(obj.tx_id);
          return obj;
        })
      ).then((new_beats) => {
        resolve(new_beats);
      });
    })
  },

  async queryAllBeatsFiltered (searchEntry) {
    var new_beats = [];

    const queryByBeatOwner = await new Promise((resolve) => {
      // Filter by beat owner
      ardb
        .search("transactions")
        .appName("BeatLedger")
        .from(searchEntry)
        .findAll()
        .then((txs) => {
          resolve(txs);
        });
    });

    const queryByBeatName = await new Promise((resolve) => {
      // Filter by beat name
      ardb
        .search("transactions")
        .appName("BeatLedger")
        .tag("Name", searchEntry)
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
                name: tx.tags[2].value,
                tx_id: tx.id,
                owner_address: tx.owner.address,
                note: tx.tags[3].value,
                playPauseState: "faPlayComponent",
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
              return obj;
            })
          ).then((new_beats) => {
            resolve(new_beats)
          });
        });
    })

  },

  async uploadBeatTest (beat_name, note, arrayBuffer) {
    // var arrayBuffer = fr.result;
    logger.log(arrayBuffer);

    var wallet = await ar.wallets.generate();

    var walletAddress = await ar.wallets.getAddress(wallet);
    await ar.api.get("mint/" + walletAddress + "/10000000000000000");

    let transaction = await ar.createTransaction(
      {
        data: arrayBuffer,
      },
      wallet
    );
    transaction.addTag("Content-Type", "text/mpeg");
    transaction.addTag("App-Name", "BeatLedger");
    transaction.addTag("Name", beat_name);
    transaction.addTag("Note", note);

    await ar.transactions.sign(transaction, wallet);

    let uploader = await ar.transactions.getUploader(transaction);

    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      logger.log(
        `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
      );
    }

    logger.log("Tx successfully sent!");
  },

  async uploadBeatsTestMany (arrayBuffer) {
    for (let i = 0; i < 10; i++) {
      let beat_name = "beat_" + i;
      let beat_note = "beat_note" + i;
      let wallet = await ar.wallets.generate();

      let walletAddress = await ar.wallets.getAddress(wallet);
      await ar.api.get("mint/" + walletAddress + "/10000000000000000");

      let transaction = await ar.createTransaction(
        {
          data: arrayBuffer,
        },
        wallet
      );
      transaction.addTag("Content-Type", "text/mpeg");
      transaction.addTag("App-Name", "BeatLedger");
      transaction.addTag("Name", beat_name);
      transaction.addTag("Note", beat_note);

      await ar.transactions.sign(transaction, wallet);

      let uploader = await ar.transactions.getUploader(transaction);

      while (!uploader.isComplete) {
        await uploader.uploadChunk();
        logger.log(
          `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
        );
      }
    }

    logger.log("Tx successfully sent!");
  },

  async generate () {
    ar.wallets.generate().then(async (key) => {
      logger.log(JSON.stringify(key));
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
  },

  async uploadKeyFile (instance, file) {
    if (file != null) {
      this.open = false;

      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = async (f) => {
        try {
          var fileContent = JSON.parse(f.target.result);
          var addy = await ar.wallets.getAddress(fileContent);
          var kf = {
            public_key: addy,
            private_key: fileContent,
          };
          instance.$emit("loginSuccessful", kf);
        } catch (err) {
          console.error(err);
        }
      };
    } else {
      alert("Key File not Uploaded");
    }
  }
}

export default API
