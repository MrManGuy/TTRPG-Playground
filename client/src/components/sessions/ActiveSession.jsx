import { Fragment } from "react"
import { Button } from "react-bootstrap"
import SessionDMToolbar from "./SessionDMToolbar"
import SessionPlayerToolbar from "./SessionPlayerToolbar"

const ActiveSession = ({handleLeave, currentCharacter, onRoll, ...props}) => {
    return <Fragment>
            <SessionPlayerToolbar 
                onRoll={onRoll}
                currentCharacter={currentCharacter}/>
            <Button onClick={(e) => handleLeave(null)}>Leave session</Button>
            <SessionDMToolbar />
        </Fragment>
}

export default ActiveSession