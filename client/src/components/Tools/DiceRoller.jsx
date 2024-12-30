import { Fragment, useState } from "react"
import { Button, Row, Col, Form } from "react-bootstrap"

const DiceRoller = ({onRoll, ...props}) => {
    const [diceString, setDiceString] = useState("")
    const [diceObject, setDiceObject] = useState({})
    
    const dice = [4, 6, 8, 10, 12, 20, 100]

    const resetRoller = () => {
        setDiceString("")
        setDiceObject({})
    }

    const updateDiceString = (amounts) => {
        let output = ""
        for(let die of dice){
            if(amounts[die] !== undefined){
                if(output !== ""){
                    output += "+"
                }
                output += `${amounts[die]}d${die}`
            }
        }
        setDiceString(output)
    }

    const addDice = (die) => {
        let amounts = {...diceObject}
        if(amounts[die] === undefined){
            amounts[die] = 1
        }else{
            amounts[die] += 1
        }
        setDiceObject(amounts)
        updateDiceString(amounts)
    }

    return <Fragment>
        <Row className="justify-content-sm-center">
            {dice.map(die => <Col className="mb-2" xs={3} key={die}>
                <Button className="full_width" onClick={(e) => addDice(die)}>+ d{die}</Button>
            </Col>)}
        </Row>
        <Form.Control
            type="text"
            placeholder="Dice String"
            disabled={Object.keys(diceObject).length !== 0}
            value={diceString}
            onChange={e => setDiceString(e.target.value)}
            className="mb-2"
        />
        <Row className="justify-content-sm-center">
            <Col xs={6} >
                <Button className="full_width" onClick={(e) => onRoll(diceString)}>Roll</Button>
            </Col>
            <Col xs={6} >
                <Button className="full_width" onClick={(e) => resetRoller()}>Reset</Button>
            </Col>
        </Row>
    </Fragment>
}

export default DiceRoller