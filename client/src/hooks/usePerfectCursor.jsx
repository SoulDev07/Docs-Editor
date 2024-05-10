// import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { PerfectCursor } from "perfect-cursors";

function usePerfectCursor(cb, point) {
  const [pc] = useState(() => new PerfectCursor(cb));

  useEffect(() => {
    if (point) {
      pc.addPoint(point);
    }

    return () => {
      pc.dispose();
    };
  }, [pc, point]);

  const onPointChange = useCallback((point) => {
    pc.addPoint(point);
  }, [pc]);

  return onPointChange;
}

export default usePerfectCursor;