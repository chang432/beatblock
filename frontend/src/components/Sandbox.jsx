import transactionsTest from "../../../sandbox/transactionsTest.js"

function Sandbox() {
    function testClicked() {
        transactionsTest.sendArweave();
    }
    
    return (
        <div>
            <button onClick={testClicked}>SUBMIT_TRANSACTION</button>
        </div>
    )
}

export default Sandbox;