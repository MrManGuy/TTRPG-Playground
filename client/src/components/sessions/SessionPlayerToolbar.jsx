import React, { useState } from 'react';
import { Button, Accordion } from 'react-bootstrap';
import DiceRoller from '../Tools/DiceRoller';

const SessionPlayerToolbar = ({onRoll}) => {
    const [show, setShow] = useState(false);

    const handleToggle = () => setShow(!show);

    return <>
    <Button className={"hamburger_button"} onClick={handleToggle}>
       {show ? "< Tools" :  "Tools >"}
    </Button>
    <div className={`overlay left ${show ? 'show' : ''}`}>
      <div className="menu-content">
        <Accordion flush>
            <Accordion.Item eventKey="0">
            <Accordion.Header>Dice Roller</Accordion.Header>
                <Accordion.Body>
                    <DiceRoller
                        mode="toolbar"
                        onRoll={onRoll}
                    />
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
      </div>
    </div>
  </>
}

export default SessionPlayerToolbar