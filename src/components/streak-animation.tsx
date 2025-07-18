'use client';
// TODO: implement entire thing


import 'nextjs-animated-counter/dist/esm/styles.css';

import React, { useState } from 'react';
import { AnimatedCounter } from 'nextjs-animated-counter';
import { useEffect } from 'react';

type StreakAnimationProps = {
  streak: number;
}

function StreakAnimation({ streak }: StreakAnimationProps) {
  const [counterValue, setCounterValue] = useState(streak);

  interface HandleCounterUpdate {
    (increment: boolean): void;
  }

  const handleCounterUpdate: HandleCounterUpdate = (increment) => {
    setCounterValue(increment ? counterValue + 1 : counterValue - 1);
  };

  useEffect(() => {
    setTimeout(() => { handleCounterUpdate(true) }, 1000)
  }, [])


  return (
    <div>
      <AnimatedCounter value={counterValue} color="black" fontSize="40px" includeDecimals={false} />
    </div>
  );
};

export default StreakAnimation;
