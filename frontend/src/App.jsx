import { BrowserRouter , Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Students from "./pages/Students";
import Rooms from "./pages/Rooms";
import Allocation from "./pages/Allocation";
import Navbar from "./components/Navbar";

export default function App(){
    return (
        <BrowserRouter>
        <Navbar/>
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/students" element={<Students/>} />
            <Route path="/rooms" element={<Rooms/>} />
            <Route path="/allocation" element={<Allocation/>} />
        </Routes>
        </BrowserRouter>
    );
}