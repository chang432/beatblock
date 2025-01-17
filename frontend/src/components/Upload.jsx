import xSymbol from "../assets/xSymbol.png"
import API from "../api/arweaveAPI.js"
import Loader from "./sub_components/Loader.jsx"
import { useRef, useState, useEffect } from "react"

const Upload = ({handleUploadExitClick}) => {  
    const keyfileInputRef = useRef(null);
    const audiofileInputRef = useRef(null);
    const noteTextAreaRef = useRef(null);
    const [showLoading, setShowLoading] = useState(false);
    const [hasFreeBeat, setHasFreeBeat] = useState(false);
    const api = new API(testing=true);
    const LOCAL = false;    // replaced in local_deploy.sh

    const handleKeyfileChange = async () => {
        const publicKey = await api.keyfileToPublicKey(keyfileInputRef.current.files[0]);
        console.log("public key: " + publicKey);
        const hasWalletUsedSubsidization = await api.hasWalletUsedSubsidization(publicKey);
        if (!hasWalletUsedSubsidization) {
            setHasFreeBeat(true);
        } else {
            setHasFreeBeat(false);
        }
    }

    const handleGenerateKeyfileClick = () => {
        api.generate();
    }

    const handleSubmitClick = () => {
        if (keyfileInputRef.current.files.length == 0 || audiofileInputRef.current.files.length == 0 || noteTextAreaRef.current.value === "") {
            alert("Make sure all fields are filled out before submitting!");
            return;
        }
        setShowLoading(true);
        console.log(noteTextAreaRef.current.value);
        console.log(keyfileInputRef.current.files[0]);
        console.log(audiofileInputRef.current.files[0]);

        // if (hasFreeBeat) {
        if (hasFreeBeat) {
            console.log("Wallet has free beat, submitting subsidized transaction...");
            api.sendSubsidizedTransaction(noteTextAreaRef.current.value, keyfileInputRef.current.files[0], audiofileInputRef.current.files[0], handleUploadExitClick, LOCAL);
        } else {
            api.sendTransaction(noteTextAreaRef.current.value, keyfileInputRef.current.files[0], audiofileInputRef.current.files[0], handleUploadExitClick);
        }
    }

    return (
        <div className="text-black">
            <div className="absolute w-screen h-screen z-40 bg-black opacity-70"></div>
            <img src={xSymbol} onClick={handleUploadExitClick} className="absolute z-50 w-8 h-8 p-2 border rounded-full right-10 top-10 hover:cursor-pointer"/>
            <div className='absolute flex flex-col bg-[#CCCCCC] rounded-sm h-fit w-fit p-10 space-y-10 items-center justify-center blur-none z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                {showLoading && <Loader />}
                {!showLoading && <div className="flex flex-col bg-[#CCCCCC] rounded-sm h-fit w-fit space-y-10 items-center justify-center">
                    <div className="flex flex-col items-center space-y-2">
                        <p>Note:</p>
                        <textarea ref={noteTextAreaRef} className="w-80 h-24 rounded-m"/>
                    </div>
                    <div className="flex flex-row space-x-10">
                        <div className="flex flex-col items-center space-y-2">
                            <p>Audio:</p>
                            <input type="file" accept="audio/*" className="border border-dashed border-black w-60 p-3" ref={audiofileInputRef}/>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            <p>Keyfile:</p>
                            <input type="file" accept=".json" className="border border-dashed border-black w-60 p-3" ref={keyfileInputRef} onChange={handleKeyfileChange}/>
                            <div className="flex flex-row text-xs space-x-1">
                                <p>Don't have one?</p>
                                <button onClick={handleGenerateKeyfileClick} className="text-[#3A832C]">Generate wallet here</button>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-sm" onClick={handleSubmitClick}>Submit</button>
                    {hasFreeBeat && <p>You have 1 free beat (5MB) available to upload!</p>}
                </div>}
            </div>
        </div>
    )
}

export default Upload