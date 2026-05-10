import {useEffect, useState} from "react";
import axios from "axios";

export default function ViewStudents(){
    const [ students, setStudents ] = useState([]);

    useEffect( () => {
        axios.get("http://localhost:5000/students")
        .then( (res) => {
            setStudents(res.data);
        });
    }, []);

    const fetchStudents = async () => {
        const res = await axios.get(
            "http://localhost:5000/students"
        );
        setStudents(res.data);
    };

    const deleteStudent = async (id) => {
        try{
            await axios.delete(`http://localhost:5000/students/${id}`);
            fetchStudents();
        }
        catch(error){
            console.log(error);
        }
    };

    return (
        <div className="container">
            <h2>Students</h2>
            {
                students.map((student) => (
                    <div className="card" key={student.id}>
                        <div>
                            <h3>{student.name}</h3>
                            <p>Gender: {student.gender}</p>
                            <p>Preference: {student.preference}</p>
                        </div>
                        <i className="fa-solid fa-trash" onClick={() => deleteStudent(student.id)}></i>
                    </div>
                ))
            }
        </div>
    );
}