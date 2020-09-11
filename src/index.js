import React, { useState } from "react";
import ReactDOM from "react-dom";
import Wave from "./wavify.js";
import "./style.css";

// Todo: rewrite wavify in hooks and import script
const App = (p) => {
  return (
    <div id="wave">
      <Wave style={{ zIndex: 10 }} options={{ speed: 0.5 }} fill="#257" />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
