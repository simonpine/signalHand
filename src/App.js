import logo from './logo.svg';
import './App.scss';
import React, { useRef, useState } from 'react';
import * as tf from "@tensorflow/tfjs"
import * as handpose from "@tensorflow-models/handpose"
//import * as posenet from "@tensorflow-models/posenet"
import Webcam from 'react-webcam';
import { drawHand } from './utilities';
import * as fp from 'fingerpose'
//import { drawKeypoints, drawSkeleton } from "./utilities2"

function App() {
  const [letter, setLetter] = useState('')
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

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);

        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          // console.log(gesture.gestures);
          if(gesture.gestures.length === 1){
            setLetter(gesture.gestures[0].name)
          }
          else{
            const confidence = gesture.gestures.sort((a, b) => a.score - b.score)
            setLetter(confidence[confidence.length - 1].name)
          }

          //console.log(gesture)
        }
      }


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
      <h1 style={{ zIndex: "1000", position: "fixed" }}>{letter}</h1>
    </div>
  );
}

export default App;
