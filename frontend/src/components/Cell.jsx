import { useState, useEffect } from "react";
import rightSymbol from "../assets/rightSymbol.png"
import downSymbol from "../assets/downSymbol.png"
import musicNoteSymbol from "../assets/musicNoteSymbol.png"
import certificateSymbol from "../assets/certificateSymbol.png"
import xSymbol from "../assets/xSymbol.png"

const Cell = ({data, playPauseLogic}) => {
    const [expanded, setExpanded] = new useState(true);
    const [showMusicPlayer, setShowMusicPlayer] = new useState(false);
    // const [isPlaying, setIsPlaying] = useState(data.playPauseState === "pause");

    const expandPressed = () => {
        setExpanded(!expanded);
    }

    const [progress, setProgress] = useState(0);
    useEffect(() => {
        let audio = document.getElementById("beat_player");
        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        audio.addEventListener('timeupdate', updateProgress);
        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
        };
    }, []);

    const toggleAudioPlayer = () => {
        setShowMusicPlayer(!showMusicPlayer);
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
                    <div className="flex flex-col h-32 w-8 items-center">
                        <div className={`absolute z-10 space-y-4 ${showMusicPlayer ? "invisible" : "visible"}`}>
                            <img className="w-8 h-8 border rounded-3xl p-1 hover:cursor-pointer" src={downSymbol} onClick={expandPressed} />
                            <img className="w-8 h-8 border rounded-3xl p-1 hover:cursor-pointer" src={certificateSymbol} />
                            <img className="w-8 h-8 border rounded-3xl p-1 hover:cursor-pointer" src={musicNoteSymbol} onClick={toggleAudioPlayer} />
                        </div>
                        <div className={`absolute z-0 flex flex-col h-32 w-8 justify-end ${showMusicPlayer ? "visible" : "invisible"}`}>
                            <div className={`relative ${showMusicPlayer ? 'h-32 duration-500' : 'h-0'} w-8 mb-4 bg-[#CCCCCC] rounded-t-full overflow-hidden`}>
                                <div
                                    className="absolute bottom-0 left-0 w-full bg-[#2CEB06] transition-all duration-1000 ease-out"
                                    style={{ height: `${progress}%` }}
                                />
                            </div>
                            <img className="absolute w-8 h-8 mt-8 border border-[#2CEB06] bg-[#1F1F1F] rounded-3xl p-2 hover:cursor-pointer" src={xSymbol} onClick={toggleAudioPlayer} />
                        </div>
                    </div>
                    <audio id="beat_player" />
                </div>
            </div>}
        </div>
    )
}

export default Cell