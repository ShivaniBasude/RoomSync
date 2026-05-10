from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from matching import max_bipartite_matching

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hostel.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# Student model
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    preference = db.Column(db.String(100), nullable=False)
    allocated = db.Column(db.Boolean, default=False, nullable=False)


#Room model
class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_no = db.Column(db.String(20), nullable=False, unique=True)
    capacity = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)


#Home route
@app.route("/")
def home():
    return {"message" : "Backend running!"}

#Add Student
@app.route("/students", methods=["POST"])
def add_student():
    data = request.json
    student = Student(
        name = data["name"],
        gender = data["gender"],
        preference = data["preference"]
    )

    db.session.add(student)
    db.session.commit()
    return jsonify({"message": "Student added successfully!"})


#Delete Student
@app.route("/students/<int:id>", methods=["DELETE"])
def delete_student(id):
    student = Student.query.get(id)
    if student:
        db.session.delete(student)
        db.session.commit()

        return jsonify({
            "message": "Student deleted successfully!"
        })
    return jsonify({
        "message": "Student not found!"
    }), 404


#Add Room
@app.route("/rooms", methods=["POST"])
def add_room():
    data = request.json
    room = Room(
        room_no = data["room_no"],
        capacity = data["capacity"],
        gender = data["gender"]
    )

    db.session.add(room)
    db.session.commit()
    return jsonify({"message": "Room added successfully!"})

#Delete Room
@app.route("/rooms/<int:id>", methods=["DELETE"])
def delete_room(id):
    room = Room.query.get(id)
    if room:
        db.session.delete(room)
        db.session.commit()

        return jsonify({
            "message": "Room deleted successfully!"
        })
    return jsonify({
        "message": "Room not found!"
    }), 404


#Allocate rooms
@app.route("/allocate", methods=["GET"])
def allocate_rooms():
    try:
        students = Student.query.all()
        rooms = Room.query.all()
    
        print(students)
        print(rooms)

        graph = {}
        room_list = []

        #Build room list
        for room in rooms:
            for i in range(room.capacity):
                room_slot = f"{room.room_no}-{i+1}"
                room_list.append(room_slot)

        #Build graph
        for student in students:
            graph[student.name] = []
            for room in rooms:
                if student.gender == room.gender:
                    for i in range(room.capacity):
                        room_slot = f"{room.room_no}-{i+1}"
                        graph[student.name].append(room_slot)

        print(graph)
        print(room_list)

        allocation = max_bipartite_matching(graph, room_list)

        for student_name, room_slot in allocation.items():
            student = Student.query.filter_by(name=student_name).first()
            if student:
                student.allocated = True
        db.session.commit()

        print(allocation)

        return jsonify(allocation)
    
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    

#View students
@app.route("/students", methods=["GET"])
def get_students():
    students = Student.query.all()
    data = []

    for student in students:
        data.append({
            "id":student.id,
            "name": student.name,
            "gender": student.gender,
            "preference": student.preference
        })

    return jsonify(data)


#View rooms
@app.route("/rooms", methods=["GET"])
def get_rooms():

    rooms = Room.query.all()
    data = []
    for room in rooms:
        data.append({
            "id": room.id,
            "room_no": room.room_no,
            "capacity": room.capacity,
            "gender": room.gender
        })

    return jsonify(data)


#main

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="localhost", port=5000, debug=True)