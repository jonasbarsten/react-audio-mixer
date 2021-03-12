import React from "react";
import Home from "./components/Home";
import AudioContextProvider from "./context/Audio";

import "./stylesheets/normalize.css";
import "./stylesheets/normalize-edit.css";
import "./stylesheets/fonts.css";
import "./stylesheets/loader.css";
import "./stylesheets/main.scss";

const App = () => {
  return (
    <>
      <AudioContextProvider>
        <div className="App">
          <header>
            <h1>Stokkmaur</h1>
          </header>
          <Home />
          {/* <TestComponent /> */}
        </div>
      </AudioContextProvider>
      {/* <div id="audio-container"></div> */}
    </>
  );
};

export default App;
