import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

const SessionDMToolbar = () => {
    const [show, setShow] = useState(false);

    const handleToggle = () => setShow(!show);

    return <>
    <Button className={"hamburger_button right_float"} onClick={handleToggle}>
       {show ? "DM Tools >" :  "< DM Tools"}
    </Button>
    <div className={`overlay right ${show ? 'show' : ''}`}>
      <div className="menu-content">
        <p>DM 1</p>
        <p>DM 2</p>
        <p>DM 3</p>
      </div>
    </div>
  </>
}

export default SessionDMToolbar