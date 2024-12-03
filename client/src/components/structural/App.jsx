import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from '../content/Home'
import Characters from '../content/Characters'
import Campaigns from '../content/Campaigns'
import Layout from './Layout'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home/>}/>
                    <Route path="characters" element={<Characters/>}/>
                    <Route path="campaigns" element={<Campaigns/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App