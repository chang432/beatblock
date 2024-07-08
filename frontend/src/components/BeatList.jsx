import Cell from './Cell.jsx'
import { useEffect, useState } from 'react'
import ArweaveAPI from '../api/arweaveAPI.js'

const API = new ArweaveAPI();

const BeatList = () => {
    const [beats, setBeats] = useState([]);

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
            const local_beats = await API.queryAllBeatsArdb();
            setBeats(local_beats);
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
        <div>
            <button onClick={test}>test</button>
            {beats.map((entry, index) => {
                return <Cell key={index} data={entry} playPauseLogic={playPauseLogic} />
            })}
        </div>
    )
}

export default BeatList;