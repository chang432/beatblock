import { useState } from "react";
import rightSymbol from "../assets/rightSymbol.png"
import downSymbol from "../assets/downSymbol.png"
import musicNoteSymbol from "../assets/musicNoteSymbol.png"
import certificateSymbol from "../assets/certificateSymbol.png"

const Cell = ({data}) => {
    const [expanded, setExpanded] = new useState(true);

    const expandPressed = () => {
        setExpanded(!expanded);
    }

    return (
        <div>
            { !expanded && <div className="w-full h-20 flex flex-row px-5 justify-between items-center" style={{"backgroundColor":"#1F1F1F"}}>
                <div className="flex flex-row space-x-5">
                    <p className="border rounded-2xl px-2">BSFESVDSRS...</p>
                    <p>By</p>
                    <p className="border rounded-2xl px-2">vVDFVDVDDG...</p>
                    <p>At</p>
                    <p className="border rounded-2xl px-2">06/23/2024 - 18:11 UTC</p>
                </div>
                <p>Sick Type Beat By Dreany</p>
                <img className="w-8 h-8 border rounded-3xl p-1 hover:cursor-pointer" src={rightSymbol} onClick={expandPressed} />
            </div>}
            { expanded && <div className="w-full h-44 flex flex-col pt-6" style={{"backgroundColor":"#1F1F1F"}}>
                <div className="flex flex-row px-5 justify-between items-start">
                    <div className="flex flex-row space-x-5">
                        <div className="flex flex-col text-center space-y-5">
                            <p>Transaction ID:</p>
                            <p>Wallet ID:</p>
                            <p>Date Time:</p>
                        </div>
                        <div className="flex flex-col space-y-5">
                            <p className="border rounded-2xl px-2 w-fit">{data.tx_id}</p>
                            <p className="border rounded-2xl px-2 w-fit">{data.owner_address}</p>
                            <p className="border rounded-2xl px-2 w-fit">{data.date}</p>
                        </div>
                    </div>
                    <div className="flex flex-col text-center space-y-4">
                        <p>Note</p>
                        <p>Sick Type Beat By Dreany</p>
                    </div>
                    <div className="flex flex-col space-y-4">
                        <img className="w-8 h-8 border rounded-3xl p-1 hover:cursor-pointer" src={downSymbol} onClick={expandPressed} />
                        <img className="w-8 h-8 border rounded-3xl p-1 hover:cursor-pointer" src={certificateSymbol} />
                        <img className="w-8 h-8 border rounded-3xl p-1 hover:cursor-pointer" src={musicNoteSymbol} />
                    </div>
                </div>
                <div className="flex flex-row space-x-4 w-full">

                </div>
                
            </div>}
        </div>
    )
}

export default Cell