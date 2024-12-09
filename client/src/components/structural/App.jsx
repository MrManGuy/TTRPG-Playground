import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from '../content/Home'
import Characters from '../content/Characters'
import Campaigns from '../content/Campaigns'
import Layout from './Layout'

import { Dice } from "../functional/DiceBox";

// initialize the Dice Box outside of the component
Dice.initialize().then(() => {
    // clear dice on click anywhere on the screen
    document.addEventListener("mousedown", () => {
    const diceBoxCanvas = document.querySelector("#dice-box canvas");
    if (diceBoxCanvas instanceof HTMLElement && window.getComputedStyle(diceBoxCanvas).display !== "none") {
        Dice.clearDice();
    }
    });
  }).catch((e) => console.error(e));

const App = () => {
    // This method is triggered whenever dice are finished rolling
    Dice.onRollComplete = (results) => {
        console.log(results);
    };

    // trigger dice roll
    const rollDice = (notation, group) => {
        Dice.roll(notation);
    };

    return <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home/>}/>
                    <Route path="characters" element={<Characters onRoll={rollDice}/>}/>
                    <Route path="campaigns" element={<Campaigns/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
}

export default App