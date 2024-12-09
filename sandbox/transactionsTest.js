import Ar from 'arweave'
// import keyfile from '../../../ARWEAVE/wallets/MAIN/arweave-keyfile-OHkkHPdBDHbjcDTLDBBCMv1b05z3i7HP4cVzb1CFdUg.json'
import keyfile from '../../../ARWEAVE/wallets/TESTS/arweave-key-AAsgSiLZZrTZh-AU6eKLSuvLIOGcVQLbD2wjDOwkRVs.json'

// const arweave = Ar.init({});
const arweave = Ar.init({
    host: "localhost",
    port: 1984,
    protocol: "http",
});

class transactionsTest {
    static async sendArweave() {
        let transaction = await arweave.createTransaction({
            target: 'kpXm3YTPhT63EbNULV0ZhKR-Js9M3BblRRWamecizks',
            quantity: arweave.ar.arToWinston('0.05')
        }, keyfile);

        await arweave.transactions.sign(transaction, keyfile);

        const response = await arweave.transactions.post(transaction);
        console.log(response.status);
    }

    static getBalance() {
        arweave.wallets.getBalance('OHkkHPdBDHbjcDTLDBBCMv1b05z3i7HP4cVzb1CFdUg').then((balance) => {
            let winston = balance;
            let ar = arweave.ar.winstonToAr(balance);
        
            console.log(winston);
            //125213858712
        
            console.log(ar);
            //0.125213858712
        });
    }
}

export default transactionsTest;