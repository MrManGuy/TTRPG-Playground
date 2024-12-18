import api from './api.js';
import http from 'http';
import { Server, Socket  } from "socket.io";
const server = http.createServer(api);
const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
const PORT = 3001

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});

let sessions = {}
let nextSessionId = 1

const sessionNamespace = io.of('/sessions')
sessionNamespace.on("connection", (socket) => {
    let id
    console.log("A user connected");
  
    socket.on('create_session', (session_data) => {
      id = "room-" + nextSessionId
      session_data = {
        "users": [{
          "uid": session_data["user"]["uid"],
          "name": session_data["user"]["displayName"],
          "sid": socket.id
        }],
        "id": id,
        "pin": session_data["pin"]
      }
      socket.join(id)
      sessions[id] = session_data
      console.log(socket.id, "created session:", id)
      socket.emit('session_started', session_data)
      console.log(session_data)
      
      nextSessionId += 1;
    });
    
    socket.on("join_session", (input_data) => {
      id = "room-" + input_data["id"]
      if(sessions[id] === undefined){
        socket.emit("failed_join", {
          "msg": "Specified ID does not exist"
        })
      }else if(sessions[id]["pin"] !== input_data["pin"]){
        socket.emit("failed_join", {
          "msg": "The pin does not match"
        })
      }else{
        let session_data = sessions[id]
        session_data["users"].push({
          "uid": input_data["user"]["uid"],
          "name": input_data["user"]["displayName"],
          "sid": socket.id
        })
        
        socket.join(id);
        console.log(socket.id, "joined session:", id)
        socket.emit('session_joined', session_data)

        socket.to(id).emit("player_joined", session_data);
      }
    });

    socket.on("rolled_dice", (roll_data) => {
      socket.to(id).emit("rolled_dice", roll_data);
    })
  
    // Handle the socket.io disconnect event
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });