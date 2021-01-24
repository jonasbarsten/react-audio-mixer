// import logo from './logo.svg';
import "./stylesheets/normalize.css";
import "./stylesheets/normalize-edit.css";
import "./stylesheets/fonts.css";
import "./stylesheets/loader.css";
import "./stylesheets/main.css";

import Track from "./components/Track";
import Controls from "./components/Controls";

function App() {
  return (
    <div className="App">
      <header>
        <h1>Stokkmaur</h1>
      </header>

      {/* <div id="loader">
        <div className="loader-bar"></div>
        <span>Loading Audio Assets...</span>
      </div> */}

      <div id="mixer">
        <Track />
        <Track />
        <Track />
        <Track />
        <Track />
        <Track />
        <Track />
        <Track />
        <Track />
        <Track />
        <Track />
        <Track />
        <div id="meters">
          <div className="vu">
            <div className="mask">
              <div
                className="needle left"
                style={{ WebkitTransform: "rotateZ(0deg)" }}
              ></div>
            </div>
            <p className="vu-label">L</p>
          </div>
          <div className="vu">
            <div className="mask">
              <div
                className="needle right"
                style={{ WebkitTransform: "rotateZ(0deg)" }}
              ></div>
            </div>
            <p className="vu-label">R</p>
          </div>
        </div>
        <div id="master">
          <div className="track">
            <div className="fader" style={{ top: "209px" }}></div>
          </div>
          <p className="label">Master</p>
        </div>
      </div>
      <Controls />
    </div>
  );
}

export default App;
