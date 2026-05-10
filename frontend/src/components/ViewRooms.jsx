import {useEffect, useState} from "react";
import axios from "axios";

export default function ViewRooms(){
    const [ rooms, setRooms ] = useState([]);

    useEffect( () => {
        axios.get("http://localhost:5000/rooms")
        .then( (res) => {
            setRooms(res.data);
        });
    }, []);

     const fetchRooms = async () => {
        const res = await axios.get(
            "http://localhost:5000/rooms"
        );
        setRooms(res.data);
    }

    const deleteRoom = async (id) => {
        try{
            await axios.delete(
                `http://localhost:5000/rooms/${id}`
            );
            fetchRooms();
        }
        catch(error){
            console.log(error);
        }
    }

    return (
        <div className="container">
            <h2>Rooms</h2>
            {
                rooms.map((room) => (
                    <div className="card" key={room.id}>
                        <div>
                            <h3> Room {room.room_no}</h3>
                            <p>Capacity: {room.capacity}</p>
                            <p>Gender: {room.gender}</p>
                        </div>
                        <i className="fa-solid fa-trash" onClick={() => deleteRoom(room.id)}></i>
                    </div>
                ))
            }
        </div>
    );
}