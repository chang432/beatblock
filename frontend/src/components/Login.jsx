import xSymbol from "../assets/xSymbol.png"
import { useRef } from "react";

const Login = ({handleLoginExitClick}) => {  
    const keyfileInputRef = useRef(null);

    const handleUploadKeyfileClick = () => {
        keyfileInputRef.current.click();
    }

    const handleKeyfileFormChange = () => {
        console.log(keyfileInputRef.current.files[0]);
    }

    return (
        <div className="">
            <div className="absolute w-screen h-screen z-40 bg-black opacity-70"></div>
            <img src={xSymbol} onClick={handleLoginExitClick} className="absolute z-50 w-8 h-8 p-2 border rounded-full right-10 top-10 hover:cursor-pointer"/>
            <div className='absolute flex flex-col bg-[#CCCCCC] rounded-sm w-fit p-2 items-center justify-center blur-none z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                <button id="uploadKeyfileBtn" onClick={handleUploadKeyfileClick} className="bg-[#1F1F1F] rounded-sm w-64 h-14 mb-2">Upload Keyfile</button>
                <input className="hidden" type="file" ref={keyfileInputRef} accept=".json" onChange={handleKeyfileFormChange}/>
                <button className="bg-[#1F1F1F] rounded-sm w-64 h-14">Generate Keyfile</button>
            </div>
        </div>
    )
}

export default Login