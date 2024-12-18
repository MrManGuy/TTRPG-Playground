import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from '../content/Home'
import Characters from '../characters/Characters'
import SessionHome from '../sessions/SessionHome';
import Campaigns from '../campaigns/Campaigns'
import About from '../content/About';
import Login from '../auth/Login'
import Layout from './Layout'

import { Dice } from "../functional/DiceBox";

// initialize the Dice Box outside of the component
Dice.initialize().then(() => {
    // clear dice on click anywhere on the screen
    window.dispatchEvent(new Event('resize'));
    document.addEventListener("mousedown", () => {
    const diceBoxCanvas = document.querySelector("#dice-box canvas");
    const diceResults = document.querySelector('#dice_results')
    if (diceBoxCanvas instanceof HTMLElement && window.getComputedStyle(diceBoxCanvas).display !== "none") {
        Dice.clearDice();
        diceResults.innerHTML = ""
        diceResults.style.visibility = "hidden"
    }
    });
}).catch((e) => console.error(e));

const App = () => {
    // This method is triggered whenever dice are finished rolling
    Dice.onRollComplete = (results) => {
        let resultsContainer = document.querySelector('#dice_results');
        let resultString = ""
        for(let set of results["sets"]){
            for(let roll of set["rolls"]){
                if(resultString !== ""){
                    resultString += "+"
                }
                resultString += roll["value"]
            }
        }
        resultString += ` = ${results["total"]}`
        resultsContainer.innerHTML = resultString
        resultsContainer.style.visibility = "visible"
        return results
    };

    // trigger dice roll
    const rollDice = (notation) => {
        return Dice.roll(notation);
    };

    return <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home/>}/>
                    <Route path="characters" element={<Characters onRoll={rollDice}/>}/>
                    <Route path="campaigns" element={<Campaigns/>}/>
                    <Route path="session" element={<SessionHome onRoll={rollDice}/>}/>
                    <Route path="about" element={<About/>}/>
                    <Route path="login" element={<Login/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
}

export default App