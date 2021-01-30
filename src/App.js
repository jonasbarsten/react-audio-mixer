import React from "react";
import Home from "./components/Home";
import AudioContextProvider from "./context/Audio";

import "./fonts/digital-7.eot";
import "./fonts/digital-7.svg";
import "./fonts/digital-7.ttf";
import "./fonts/digital-7.woff";

import "./stylesheets/normalize.css";
import "./stylesheets/normalize-edit.css";
import "./stylesheets/fonts.css";
import "./stylesheets/loader.css";
import "./stylesheets/main.css";

const App = () => {
  return (
    <>
      <AudioContextProvider>
        <div className="App">
          <header>
            <h1>Stokkmaur</h1>
          </header>
          <Home />
        </div>
      </AudioContextProvider>
      <div id="audio-container"></div>
    </>
  );
};

export default App;
