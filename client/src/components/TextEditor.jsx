// import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Quill from 'quill';
import katex from 'katex';
import io from 'socket.io-client';
import 'quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';

window.katex = katex;

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

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function TextEditor() {
  const { id: documentID } = useParams();
  const [quill, setQuill] = useState();
  const [socket, setSocket] = useState();

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
    setQuill(q);
  }, []);

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
  }, [quill, socket, documentID]);


  // Send quill changes to server
  useEffect(() => {
    if (quill == null || socket == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;

      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [quill, socket]);

  // Receive quill changes to server
  useEffect(() => {
    if (quill == null || socket == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [quill, socket]);

  return (
    <div id="text-editor" ref={editorRef}></div>
  );
}

export default TextEditor;