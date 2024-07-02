import Cell from './Cell.jsx'
import { useEffect, useState } from 'react'
import ArweaveAPI from '../api/arweaveAPI.js'

const API = new ArweaveAPI();

const BeatList = () => {
    const [beats, setBeats] = useState([]);

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
                return <Cell key={index} data={entry} />
            })}
        </div>
    )
}

export default BeatList;