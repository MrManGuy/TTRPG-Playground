import { Fragment } from "react"
import { Button } from "react-bootstrap"
import SessionDMToolbar from "./SessionDMToolbar"
import SessionPlayerToolbar from "./SessionPlayerToolbar"

const ActiveSession = ({handleLeave, onRoll, ...props}) => {
    return <Fragment>
            <SessionPlayerToolbar 
                onRoll={onRoll}/>
            <Button onClick={(e) => handleLeave(null)}>Leave session</Button>
            <SessionDMToolbar />
        </Fragment>
}

export default ActiveSession