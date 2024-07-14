import Cell from './Cell.jsx'
import Loader from './sub_components/Loader.jsx'
import { useEffect, useState } from 'react'
import ArweaveAPI from '../api/arweaveAPI.js'

const API = new ArweaveAPI();

const BeatList = () => {
    const [beats, setBeats] = useState([]);
    const [showLoader, setShowLoader] = useState(false);

    const playPauseLogic = (pressedTxId) => {
        var new_beats = [];

        for (const beat of beats) {
            if (beat.tx_id === pressedTxId) {
                if (beat.playPauseState === "pause") {
                    beat.playPauseState = "play";
                } else {
                    beat.playPauseState = "pause";
                }
            } else {
                beat.playPauseState = "play";
            }
            new_beats.push(beat);
        }

        setBeats(new_beats);
    }

    useEffect(() => {
        const fetchAndSetBeats = async () => {
            setShowLoader(true);
            const local_beats = await API.queryAllBeatsArdb();
            setBeats(local_beats);
            setShowLoader(false);
        };

        if (beats.length === 0) {
            fetchAndSetBeats()
        }
    }, [])

    async function test() {
        const output = await API.getTxDate("LUhzbMasRNTThJVUmkP206VMeNKLZf6RenMsqL8n8t0");
        console.log("OUTPUT", output);
    }

    return(
        <div className='flex flex-col items-center'>
            {showLoader && <Loader />}
            <button onClick={test}>test</button>
            {beats.map((entry, index) => {
                return <Cell key={index} data={entry} playPauseLogic={playPauseLogic} />
            })}
        </div>
    )
}

export default BeatList;