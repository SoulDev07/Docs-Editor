// import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Quill from 'quill';
import katex from 'katex';
import io from 'socket.io-client';
import hash from 'object-hash';
import Cursor from "./Cursor";
import 'quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';

window.katex = katex;

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ align: [] }, { list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline", "strike"],
  ["link", "blockquote", "code-block", "formula"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  ["image", "video"],
  ["clean"],
];
const SAVE_INTERVAL = 3000;

function TextEditor() {
  const { id: documentID } = useParams();
  const [quill, setQuill] = useState();
  const [socket, setSocket] = useState();
  const [lastSavedContentHash, setLastSavedContentHash] = useState("");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const editorRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    // Clear out previous quill instance
    wrapper.innerHTML = "";

    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, {
      modules: {
        toolbar: TOOLBAR_OPTIONS,
      },
      theme: "snow"
    });

    q.disable();

    setQuill(q);
  }, []);


  // Update cursor position
  useEffect(() => {
    let timeout = null;

    const handleMouseMove = (e) => {
      if (!timeout) {
        timeout = setTimeout(() => {
          const x = Math.round(e.clientX);
          const y = Math.round(e.clientY);
          setCursorPosition({ x, y });
          timeout = null;
        }, 200);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);


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


  // Setup socket.io connection
  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);


  // Load document from server
  useEffect(() => {
    if (quill == null || socket == null) return;

    socket.emit("get-document", documentID);

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.once("error-document-not-found", (err) => {
      console.log(err);
    });

  }, [quill, socket, documentID]);


  // Send quill changes to server
  useEffect(() => {
    if (quill == null || socket == null) return;

    const handleTextChange = (delta, oldDelta, source) => {
      if (source !== "user") return;

      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handleTextChange);

    return () => {
      quill.off("text-change", handleTextChange);
    };
  }, [quill, socket]);


  // Receive quill changes to server
  useEffect(() => {
    if (quill == null || socket == null) return;

    const handleReceiveChanges = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handleReceiveChanges);

    return () => {
      socket.off("receive-changes", handleReceiveChanges);
    };
  }, [quill, socket]);


  // Autosave document
  useEffect(() => {
    if (quill == null || socket == null) return;

    const interval = setInterval(() => {
      const content = quill.getContents();
      const currentContentHash = hash(content);

      if (currentContentHash !== lastSavedContentHash) {
        socket.emit("save-document", content);
        setLastSavedContentHash(currentContentHash);
      }
    }, SAVE_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [quill, socket, documentID, lastSavedContentHash]);


  return (
    <>
      <div id="text-editor" ref={editorRef}></div>
      <Cursor point={[cursorPosition.x, cursorPosition.y]} color={"red"} />
      <Cursor point={[cursorPosition.x + 10, cursorPosition.y + 10]} color={"blue"} />
    </>
  );
}

export default TextEditor;