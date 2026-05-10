import {useEffect, useState} from "react";
import axios from "axios";

export default function Allocation() {
    const[allocations, setAllocations] = useState({});

    useEffect(() => {
        axios.get("http://localhost:5000/allocate")
        .then(res => setAllocations(res.data));
    }, []);

    return (
        <div className="container"> 
            <div className="page-header">
                <h2>Room Allocations</h2>
            </div>
            {
                Object.entries(allocations).map(
                    ([student, room]) => (
                        <div className="allocation-card" key={student}>
                            <h3>{student} -- Room {room}</h3>
                        </div>
                    )
                )
            }
        </div>
    );
}