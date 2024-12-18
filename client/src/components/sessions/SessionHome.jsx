import { Fragment, useContext, useEffect, useState, useRef } from "react"
import {  Container } from "react-bootstrap"
import socketIO from 'socket.io-client'
import { UserContext } from "../../contexts/user"
import UserNotSignedIn from "../auth/UserNotSignedIn"
import SessionJoin from "./SessionJoin"
import ActiveSession from "./ActiveSession"

const SessionHome = ({onRoll, ...props}) => {
    const { currentUser } = useContext(UserContext)
    const [currentSession, setCurrentSession] = useState(null)
    const [sessionID, setSessionID] = useState("")
    const [sessionPin, setSessionPin] = useState("")
    const [diceTime, setDiceTime] = useState(Date.now())

    const socket = useRef(null)

    const createSession = () => {
        if(sessionPin === ""){
            alert("Session pin must be specified")
        }else{
            socket.current.emit("create_session", {user: currentUser, pin: sessionPin})
        }
    }

    const joinSession = () => {
        if(sessionPin === ""){
            alert("Session pin must be specified")
        }else if(sessionID === ""){
            alert("Session id must be specified")
        }else{
            socket.current.emit("join_session", {user: currentUser, id: sessionID, pin: sessionPin})
        }
    }

    const handleDiceRoll = async (diceString) => {
        setDiceTime(Date.now())
        const results = await onRoll(diceString);
        let resultString = ""
        for(let set of results["sets"]){
            for(let roll of set["rolls"]){
                if(resultString !== ""){
                    resultString += ","
                }
                resultString += roll["value"]
            }
        }
        socket.current.emit('rolled_dice', {
            rollString: diceString + `@${resultString}`
        })
    }

    const handleSessionStart = (session_data) => {
        setCurrentSession("room-" + session_data["id"])
    }

    const handleSessionJoin = (session_data) => {
        setCurrentSession("room-" + session_data["id"])
    }

    const handleFailedJoin = (data) => {
        alert(data["msg"])
    }

    const handlePlayerJoin = (session_data) => {
        console.log(session_data)
    }

    const handleRolledDice = (roll_data) => {
        if(Date.now() - diceTime >= 5000){
            onRoll(roll_data.rollString)
        }else{
            console.log(roll_data.rollString)
        }
    }

    useEffect(() => {
        // no-op if the socket is already connected
        socket.current = socketIO.connect('http://localhost:3001/sessions');
    
        socket.current.on('session_started', handleSessionStart)
        socket.current.on('session_joined', handleSessionJoin)
        socket.current.on('player_joined', handlePlayerJoin)
        socket.current.on('failed_join', handleFailedJoin)
    
        return () => {
            socket.current.off('session_started', handleSessionStart)
            socket.current.off('session_joined', handleSessionJoin)
            socket.current.off('player_joined', handlePlayerJoin)
            socket.current.off('failed_join', handleFailedJoin)

            socket.current.disconnect();
        };
    }, []);

    useEffect(() => {
        socket.current.on('rolled_dice', handleRolledDice)

        return () => {
            socket.current.off('rolled_dice', handleRolledDice)
        }
    }, [diceTime])

    return <Container fluid className="page_body">
        {currentUser === null ? 
            <UserNotSignedIn /> : 
            <Fragment>
                {currentSession === null ? 
                    <SessionJoin 
                        createSession={createSession} 
                        joinSession={joinSession} 
                        id={sessionID}
                        setId={setSessionID} 
                        pin={sessionPin}
                        setPin={setSessionPin}/> : 
                    <ActiveSession 
                        handleLeave={setCurrentSession} 
                        onRoll={handleDiceRoll}/>
                }
            </Fragment>
        }
        </Container>
}

export default SessionHome