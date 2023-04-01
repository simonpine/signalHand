import logo from './logo.svg';
import './App.scss';
import React, { useRef, useState } from 'react';
import * as tf from "@tensorflow/tfjs"
import * as handpose from "@tensorflow-models/handpose"
//import * as posenet from "@tensorflow-models/posenet"
import Webcam from 'react-webcam';
import { drawHand } from './utilities';
//import { drawKeypoints, drawSkeleton } from "./utilities2"

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);
     //console.log(hand);

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  runHandpose();
  return (
    <div className="App">
      <Webcam ref={webcamRef} className='webcam'></Webcam>
      <canvas ref={canvasRef} className='webcamCanvas'></canvas>
    </div>
  );
}

export default App;
