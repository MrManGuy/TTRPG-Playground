import React, { useState } from 'react';
import { Button, Accordion } from 'react-bootstrap';
import DiceRoller from '../tools/DiceRoller';
import CharacterView from '../characters/CharacterView';

const SessionPlayerToolbar = ({currentCharacter, onRoll}) => {
    const [show, setShow] = useState(false);

    const handleToggle = () => setShow(!show);

    const tabs = [
      {
        "Header": "Player Sheet",
        "Component": <CharacterView 
                      mode="toolbar"
                      character={currentCharacter} />
      },
      {
        "Header": "Dice Roller",
        "Component": <DiceRoller 
                      mode="toolbar"
                      onRoll={onRoll} />
      }
    ]

    return <>
    <Button className={"hamburger_button"} onClick={handleToggle}>
       {show ? "< Tools" :  "Tools >"}
    </Button>
    <div className={`overlay left ${show ? 'show' : ''}`}>
      <div className="menu-content">
        {tabs.map(tab => 
          <Accordion flush key={tab.Header}>
            <Accordion.Item eventKey='0'>
            <Accordion.Header>{tab.Header}</Accordion.Header>
                <Accordion.Body>
                  {tab.Component}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
        )}
      </div>
    </div>
  </>
}

export default SessionPlayerToolbar