import { Fragment } from "react"
import { Button } from "react-bootstrap"

const CharacterView = ({character, ...props}) => {
    return <Fragment>
        <Button variant='danger' onClick={e => props.setViewingCharacter(false)} className="full_width">Character Home</Button>
    </Fragment>
}

export default CharacterView