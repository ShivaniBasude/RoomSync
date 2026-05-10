import {Link} from "react-router-dom";

export default function Navbar(){
    return (
        <div className="navbar">
            <Link to="/">Home</Link>
            <Link to="/students">Students</Link>
            <Link to="/rooms">Rooms</Link>
            <Link to="/allocation">Allocation</Link>
        </div>
    )
}