

import React, { useState } from 'react';
import axios from 'axios';
import GenIconWh from "./assets/icons/draw_30dp_F3F3F3_FILL0_wght400_GRAD0_opsz24.svg"
import LightmodeWh from "./assets/icons/light_mode_30dp_F3F3F3_FILL0_wght400_GRAD0_opsz24.svg"


const App = () => {
    
  
  return (
  <>
    <div class="app-container">
      <div class="title-bar">
        <span class="title-text">imagine.ai</span>
        <img src={LightmodeWh} />
      </div>
      <div class="gen-imgs-container">
        
        <p class="para-text">Currently no images were generated</p>
      </div>
      <div class="prompt-cont">
      <textarea type="text" class="prompt-box" placeholder="Express your imaginations here" ></textarea>
      <img class="gen-ico" src={GenIconWh} />
      </div>
      
    </div>
  
        
  </>)
};

export default App;
