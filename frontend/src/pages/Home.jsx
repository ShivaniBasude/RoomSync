import {Link} from "react-router-dom";

export default function Home() {
    return (
        <>
        <div className="home">
            <h1>Smart Hostel Room Allocation System</h1>

        <Link to="/students">
            <button>Add Students</button>
        </Link>

        <br/><br/>

        <Link to="/rooms">
            <button>Add rooms</button>
        </Link>

        <br/><br/>

        <Link to="/allocation">
            <button>Run allocation</button>
        </Link>
        </div>
    </>
    );
}