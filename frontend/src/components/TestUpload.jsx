import Arweave from 'arweave'

const ar = Arweave.init({
    host: "localhost",
    port: 1984,
    protocol: "http",
});

const TestUpload = () => {

    async function sendTransaction(e) {
        e.preventDefault();

        // validation logic

        const formData = new FormData(e.target);
        const formJson = Object.fromEntries(formData.entries());
        console.log(formJson)

        const beatDesc = formJson["beat_desc"];
        const beatMp3 = formJson["beat_mp3"];

        const reader = new FileReader();
        reader.readAsText(formJson["keyfile"]);
        reader.onload = async (f) => {
            try {
                const keyFileData = JSON.parse(f.target.result);
                const publicKey = await ar.wallets.getAddress(keyFileData);
                const privateKey = keyFileData
                console.log(publicKey);      
                console.log(privateKey);

                await new Promise((resolve) => {
                    const fr = new FileReader();
                    fr.readAsArrayBuffer(beatMp3);
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
                        transaction.addTag("Note", beatDesc);
        
                        await ar.transactions.sign(transaction, privateKey);
        
                        let uploader = await ar.transactions.getUploader(transaction);

                        while (!uploader.isComplete) {
                            await uploader.uploadChunk();
                            console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
                        }
        
                        // commit("setUploadBeatComplete", true)
                        resolve()
                        console.log("Tx successfully sent!");
                    };
                });

            } catch (err) {
                console.error(err);
            }
        };

        // const soundFile = document.getElementById("soundFile").files[0];
    }

    return (
        <form className="flex flex-col" method="post" onSubmit={sendTransaction}>
            <input name="beat_desc" type="text" defaultValue={"beat description"} />
            <div className="flex flex-row">
                <p>Mp3:</p>
                <input
                    name="beat_mp3"
                    type="file"
                    id="soundfile"
                    accept="audio/*"
                />
            </div>
            <div className="flex flex-row">
                <p>Wallet Keyfile:</p>
                <input
                    name="keyfile"
                    type="file"
                    id="keyfile"
                    accept="json/*"
                />
            </div>
            <button type="submit">SUBMIT</button>
        </form>
    )
}

export default TestUpload