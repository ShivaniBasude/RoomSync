import {useState, useEffect} from "react";
import axios from "axios";
import ViewRooms from "../components/ViewRooms";


export default function Rooms() {
    const[showForm, setShowForm] = useState(false);

    const [room, setRoom] = useState({
        room_no: "",
        capacity: "",
        gender: ""
    });

    const[rooms, setRooms] = useState([]);

    const fetchRooms = async () => {
        const res = await axios.get(
            "http://localhost:5000/rooms"
        );
        setRooms(res.data);
    }

    useEffect(() => {
        fetchRooms();
    }, []);


    const handleChange = (e) => {
        setRoom({
            ...room, [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const res = await axios.post(
                "http://localhost:5000/rooms",
                room
            );
            alert(res.data.message);

            setRoom({
                room_no: "",
                capacity: "",
                gender: ""
            });
            fetchRooms();
            setShowForm(false);
        }

        catch(error){
            console.log(error);
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <h2>Rooms</h2>
            </div>
            <button onClick={() => setShowForm(!showForm)}>Add Room</button>
            {
                showForm && (
                <form onSubmit={handleSubmit}>
                    <input type="text" name="room_no" placeholder="Room Number" onChange={handleChange}/>
                    <br/><br/>
                    <input type="number" name="capacity" placeholder="Capacity" onChange={handleChange}/>
                    <br/><br/>
                    <input type="text" name="gender" placeholder="Gender" onChange={handleChange}/>
                    <br/><br/>
                    <button type="submit">Save Room</button>
                </form>
                )
            }
            <hr/>

            <ViewRooms/>
        </div>
    );
}