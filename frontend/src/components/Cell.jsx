import { useState } from "react";
import rightSymbol from "../assets/rightSymbol.png"
import downSymbol from "../assets/downSymbol.png"
import musicNoteSymbol from "../assets/musicNoteSymbol.png"
import certificateSymbol from "../assets/certificateSymbol.png"

const Cell = ({data, playPauseLogic}) => {
    const [expanded, setExpanded] = new useState(true);
    // const [isPlaying, setIsPlaying] = useState(data.playPauseState === "pause");

    const expandPressed = () => {
        setExpanded(!expanded);
    }

    const toggleAudioPlayer = () => {
        playPauseLogic(data.tx_id);

        var url = URL.createObjectURL(data.blob);
        let audio_player = document.getElementById("beat_player");
        audio_player.src = url;

        if (data.playPauseState === "pause") {
            audio_player.play();
        } else {
            audio_player.pause();
        }
    }

    return (
        <div>
            { !expanded && <div className="w-full h-20 flex flex-row px-5 justify-between items-center mb-[0.1rem]" style={{"backgroundColor":"#1F1F1F"}}>
                <div className="flex flex-row space-x-5 text-center">
                    <p className="border rounded-2xl px-2 w-32">{data.tx_id.substring(0,10)}...</p>
                    <p>By</p>
                    <p className="border rounded-2xl px-2 w-32">{data.owner_address.substring(0,10)}...</p>
                    <p>At</p>
                    <p className="border rounded-2xl px-2 w-52">{data.date}</p>
                </div>
                <p>{data.note}</p>
                <img className="w-8 h-8 border rounded-3xl p-1 hover:cursor-pointer" src={rightSymbol} onClick={expandPressed} />
            </div>}
            { expanded && <div className="w-full h-44 flex flex-col pt-6 mb-[0.1rem]" style={{"backgroundColor":"#1F1F1F"}}>
                <div className="flex flex-row px-5 justify-between items-start">
                    <div className="flex flex-col space-y-5">
                        <div className="flex flex-row">
                            <p className="w-44 text-center">Transaction ID:</p>
                            <p className="border rounded-2xl px-2 w-fit">{data.tx_id}</p>
                        </div>
                        <div className="flex flex-row">
                            <p className="w-44 text-center">Wallet ID:</p>
                            <p className="border rounded-2xl px-2 w-fit">{data.owner_address}</p>
                        </div>
                        <div className="flex flex-row">
                            <p className="w-44 text-center">Date Time:</p>
                            <p className="border rounded-2xl px-2 w-fit">{data.date}</p>
                        </div>
                    </div>
                    <div className="flex flex-col text-center space-y-4">
                        <p>Note</p>
                        <p>{data.note}</p>
                    </div>
                    <div className="flex flex-col space-y-4">
                        <img className="w-8 h-8 border rounded-3xl p-1 hover:cursor-pointer" src={downSymbol} onClick={expandPressed} />
                        <img className="w-8 h-8 border rounded-3xl p-1 hover:cursor-pointer" src={certificateSymbol} />
                        <img className="w-8 h-8 border rounded-3xl p-1 hover:cursor-pointer" src={musicNoteSymbol} onClick={toggleAudioPlayer} />
                        <audio id="beat_player" />
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default Cell