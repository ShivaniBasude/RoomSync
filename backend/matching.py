def bpm(student, visited, match_room, graph):
    for room in graph[student]:
        if not visited[room]:
            visited[room] = True

            if match_room[room] is None or bpm(
                match_room[room],
                visited,
                match_room,
                graph
            ):
                match_room[room] = student
                return True
            
    return False

def max_bipartite_matching(graph, rooms):
    match_room = {}
    #Initially all rooms unassigned
    for room in rooms:
        match_room[room] = None

    result = 0

    #Try assigning each student
    for student in graph:
        visited = {}
        for room in rooms:
            visited[room] = False
        if bpm(student, visited, match_room, graph):
            result += 1
    allocation = {}

    for room, student in match_room.items():
        if student is not None:
            allocation[student] = room
    return allocation