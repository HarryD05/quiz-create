//Import react dependency
import React, { useState, useEffect } from 'react';

//Importing styling
import './timer.scss';

//Creating the timer react component
const Timer = props => {
  const [seconds, setSeconds] = useState(props.start);

  const incrementSecond = () => {
    setSeconds(seconds => seconds + 1);
  }

  useEffect(() => {
    setInterval(incrementSecond, 1000);
  }, []);

  return (
    <div id="timer" key={seconds}>
      {seconds}s
    </div>
  )
}

export default Timer;
