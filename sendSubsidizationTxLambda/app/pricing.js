const Axios = require('axios');
const Info = require('./creds/info.json');

class Pricing {
    constructor(arweave) {
        this.arweave = arweave;
    }

    /**
     * 
     * @param {Number} arweaveAmount 
     * @returns arweave amount in US dollars
     */
    async arweaveToUSD(arweaveAmount) {
        const output = await Axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
        {
            headers: {
                'X-CMC_PRO_API_KEY': Info.coinMarketCapApiToken,
                'Accept': 'application/json'
            },
            params: {
                symbol: 'AR'
            }
        }
        );
        const price = output.data.data.AR.quote.USD.price;
        console.log(arweaveAmount + ", " + price);
        return arweaveAmount * price;
    }

    /**
     * Total fees include price of the beat upload transaction, the fee amount being transferred, and the price of the wallet transfer fee
     * @param {Number} sizeInBytes - Size of the data in the transaction
     * @param {Number} feePercentage - Desired percentage of the transaction cost to charge as a service fee
     * @returns {Number} 
     */
    async calculateTotalFee(sizeInBytes, feePercentage) {
        const mainTxCost = await this.calculateFee(sizeInBytes);
        const fee = (feePercentage / 100) * mainTxCost;
        const feeTxCost = await this.calculateFee(0);

        const mainTxCostUSD = await this.arweaveToUSD(mainTxCost);
        const feeUSD = await this.arweaveToUSD(fee);
        const feeTxCostUSD = await this.arweaveToUSD(feeTxCost);

        console.log(`Given a transaction of size ${sizeInBytes} bytes and charging a ${feePercentage}% fee:`);
        console.log(`main tx cost: ${mainTxCost} arweave ($${mainTxCostUSD})`);
        console.log(`fee: ${mainTxCost} arweave ($${feeUSD})`);
        console.log(`fee tx cost: ${feeTxCost} arweave ($${feeTxCostUSD})`);

        const totalCost = mainTxCost + fee + feeTxCost;
        const totalCostUSD = mainTxCostUSD + feeUSD + feeTxCostUSD;

        console.log(`TOTAL cost: ${totalCost} arweave ($${totalCostUSD})`);
        return totalCost
    }

    /**
     * 
     * @param {Number} sizeInBytes 
     * @returns {Number} price in arweave
     */
    async calculateFee(sizeInBytes) {
        const price = await this.arweave.transactions.getPrice(sizeInBytes); 
        return price / (10 ** 12);
    }
}

module.exports = Pricing;