import {useState, useEffect} from "react";
import axios from "axios";
import ViewStudents from "../components/ViewStudents";


export default function Students (){
    const[showForm, setShowForm] = useState(false);

    const [student, setStudent] = useState({
        name: "",
        gender: "",
        preference: ""
    });

    const[students, setStudents] = useState([]);

    const fetchStudents = async () => {
        const res = await axios.get(
            "http://localhost:5000/students"
        );
        setStudents(res.data);
    };

    useEffect( () => {
        fetchStudents();
    }, []);

    const handleChange = (e) => {
        setStudent({
            ...student, [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const res = await axios.post(
                "http://localhost:5000/students",
                student
            );
            alert(res.data.message);

            setStudent({
                name: "",
                gender: "",
                preference: ""
            });
            fetchStudents();
            setShowForm(false);
        }

        catch(error){
            console.log(error);
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <h2>Student</h2>
            </div>
            <button onClick={() => setShowForm(!showForm)}>Add Student</button>

            {
                showForm && (
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" placeholder="Student Name" onChange={handleChange} />
                    <br/><br/>
                    <input type="text" name="gender" placeholder="Gender" onChange={handleChange}/>
                    <br/><br/>
                    <input type="text" name="preference" placeholder="Room preference" onChange={handleChange}/>
                    <br/><br/>
                    <button type="submit">Save Student</button>
                </form>
                )
            }
            

            <hr/>

            <ViewStudents/>
        </div>
    );
}