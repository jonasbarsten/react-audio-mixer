import React from "react";
import Home from "./components/Home";
import Header from "./components/Header";
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
          <Header />
          <Home />
        </div>
      </AudioContextProvider>
    </>
  );
};

export default App;
