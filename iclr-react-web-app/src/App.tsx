import React from 'react';
import './App.css';
import Project from './Project';
import {HashRouter} from "react-router-dom";
import {Routes, Route} from "react-router";

function App() {
   return (
    <HashRouter>
      <div>
        <Routes>
          <Route path="/*" element={<Project />} />
        </Routes>
      </div>
    </HashRouter>
);}
export default App;
