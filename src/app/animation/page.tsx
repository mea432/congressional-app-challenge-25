'use client';
// TODO: implement entire thing


import 'nextjs-animated-counter/dist/esm/styles.css';

import React, { useState } from 'react';
import { AnimatedCounter } from 'nextjs-animated-counter';
import { Button } from '@/components/ui/button';

const App = () => {
  const [counterValue, setCounterValue] = useState(500);

  interface HandleCounterUpdate {
    (increment: boolean): void;
  }

  const handleCounterUpdate: HandleCounterUpdate = (increment) => {
    setCounterValue(increment ? counterValue + 1 : counterValue - 1);
  };

  return (
    <div>
      <AnimatedCounter value={counterValue} color="black" fontSize="40px" includeDecimals={false} />
      <div>
        <Button onClick={() => handleCounterUpdate(false)}>Decrement</Button>
        <Button onClick={() => handleCounterUpdate(true)}>Increment</Button>
      </div>
    </div>
  );
};

export default App;
