import React from 'react';
import './App.css';
import Project from './Project';
import {HashRouter} from "react-router-dom";
import {Routes, Route} from "react-router";
import { YearProvider } from './contexts/YearContext';

function App() {
   return (
    <HashRouter>
      <YearProvider>
        <div className="App">
          <Routes>
            <Route path="/*" element={<Project />} />
          </Routes>
        </div>
      </YearProvider>
    </HashRouter>
);}
export default App;
