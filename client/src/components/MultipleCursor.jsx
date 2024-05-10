// import React from 'react';
import { useState, useEffect } from 'react';
import Cursor from "./Cursor";

function MultipleCursor({ username, socket }) {
  // const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [otherUsersCursorPosition, setOtherUsersCursorPosition] = useState([]);


  // Update cursor position
  useEffect(() => {
    if (socket == null) return;

    let timeout = null;

    const handleMouseMove = (e) => {
      if (!timeout) {
        timeout = setTimeout(() => {
          const x = Math.round(e.clientX);
          const y = Math.round(e.clientY);
          // setCursorPosition({ x, y });
          socket.emit("send-cursor", { position: { x, y }, username });
          timeout = null;
        }, 200);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [socket, username]);


  // Update other user cursor position
  useEffect(() => {
    if (socket == null) return;

    const handleReceiveCursor = (cursor) => {
      const { username, position } = cursor;
      const existingUserIndex = otherUsersCursorPosition.findIndex(user => user.username === username);

      if (existingUserIndex === -1) {
        const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
        setOtherUsersCursorPosition(prevUsers => [...prevUsers, { username, position, color: randomColor }]);
      } else {
        setOtherUsersCursorPosition(prevUsers => {
          const updatedUsers = [...prevUsers];
          updatedUsers[existingUserIndex].position = position;
          return updatedUsers;
        });
      }
    };

    socket.on("receive-cursor", handleReceiveCursor);

    return () => {
      socket.off("receive-cursor", handleReceiveCursor);
    };
  }, [socket, otherUsersCursorPosition]);


  // Remove other user cursor position
  useEffect(() => {
    if (socket == null) return;

    const handleDeleteCursor = (username) => {
      setOtherUsersCursorPosition(prevUsers => {
        return prevUsers.filter(user => user.username !== username);
      });
    };

    socket.on("delete-cursor", handleDeleteCursor);

    return () => {
      socket.off("delete-cursor", handleDeleteCursor);
    };
  }, [socket, otherUsersCursorPosition]);


  // useEffect(() => {
  //   let intervalId;

  //   // const trackCursor = () => {
  //   //   const inputElement = document.querySelector('.ql-editor');
  //   //   const selection = window.getSelection();

  //   //   if (selection.rangeCount > 0) {
  //   //     const range = selection.getRangeAt(0);
  //   //     const clonedRange = range.cloneRange();
  //   //     clonedRange.selectNodeContents(inputElement);
  //   //     clonedRange.setEnd(range.startContainer, range.startOffset);
  //   //     const cursorPosition = clonedRange.toString().length;
  //   //     console.log('Cursor position:', cursorPosition);
  //   //   }
  //   // };

  //   const trackCursor = () => {
  //     const inputElement = document.querySelector('.ql-editor');
  //     if (inputElement) {
  //       const selection = window.getSelection();
  //       if (selection.rangeCount > 0) {
  //         const range = selection.getRangeAt(0);
  //         const rect = range.getBoundingClientRect();
  //         const editorRect = inputElement.getBoundingClientRect();
  //         const x = rect.left - editorRect.left;
  //         const y = rect.top;
  //         setCursorPosition([x, y]);
  //       }
  //     }
  //   };

  //   intervalId = setInterval(trackCursor, 80);

  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, []);


  return (
    <>
      {otherUsersCursorPosition.map(user => (
        <Cursor
          key={user.username}
          point={[user.position.x, user.position.y]}
          color={user.color}
        />
      ))}
    </>
  );
}

export default MultipleCursor;