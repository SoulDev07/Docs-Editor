// import React from 'react';
import { useEffect, useCallback, useRef } from 'react';
import { usePerfectCursor } from "../hooks/index.js";

function Cursor({ username, point, color }) {
  const cursorRef = useRef(null);

  const animateCursor = useCallback((point) => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    cursor.style.setProperty(
      "transform",
      `translate(${point[0]}px, ${point[1]}px)`
    );
  }, [cursorRef]);

  const onPointMove = usePerfectCursor(animateCursor);

  useEffect(() => {
    onPointMove(point);
  }, [onPointMove, point]);


  return (
    // <svg
    //   ref={cursorRef}
    //   style={{
    //     position: "absolute",
    //     top: -15,
    //     left: -15,
    //     width: 35,
    //     height: 35,
    //   }}
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 35 35"
    //   fill="none"
    //   fillRule="evenodd"
    // >
    //   <g fill="rgba(0,0,0,.2)" transform="translate(1,1)">
    //     <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
    //     <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
    //   </g>
    //   <g fill="white">
    //     <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
    //     <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
    //   </g>
    //   <g fill={color}>
    //     <path d="m19.751 24.4155-1.844.774-3.1-7.374 1.841-.775z" />
    //     <path d="m13 10.814v11.188l2.969-2.866.428-.139h4.768z" />
    //   </g>
    // </svg>

    <svg
      ref={cursorRef}
      className='other-user-cursors'
      style={{
        position: "absolute",
        top: -3,
        left: 0,
        width: 28,
        height: 25,
      }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 125"
      enableBackground="new 0 0 100 100"
      xmlSpace="preserve"
    >
      <g>
        <path
          d="M71.129,91.224c0,2.086-1.699,3.776-3.776,3.776h-8.128c-3.606,0-6.864-1.473-9.224-3.852C47.64,93.527,44.383,95,40.776,95h-8.128c-2.077,0-3.776-1.69-3.776-3.776c0-2.086,1.699-3.776,3.776-3.776h8.128c3.002,0,5.447-2.445,5.447-5.447V18c0-3.002-2.445-5.447-5.447-5.447h-8.128c-2.077,0-3.776-1.69-3.776-3.776C28.871,6.69,30.571,5,32.648,5h8.128C44.383,5,47.64,6.473,50,8.852C52.36,6.473,55.617,5,59.224,5h8.128c2.077,0,3.776,1.69,3.776,3.776c0,2.086-1.699,3.776-3.776,3.776h-8.128c-3.002,0-5.447,2.445-5.447,5.447v64c0,3.002,2.445,5.447,5.447,5.447h8.128C69.429,87.447,71.129,89.137,71.129,91.224z"
          fill={color}
        />
      </g>
    </svg>
  );
}

export default Cursor;