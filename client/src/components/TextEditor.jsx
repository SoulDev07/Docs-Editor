// import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Quill from 'quill';
import katex from 'katex';
import io from 'socket.io-client';
import hash from 'object-hash';
import MultipleCursor from "./MultipleCursor";
import 'quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
import './TextEditor.css';

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
  const [username, setUsername] = useState("user" + Math.floor(10 + Math.random() * 90));
  const [quill, setQuill] = useState();
  const [socket, setSocket] = useState();
  const [lastSavedContentHash, setLastSavedContentHash] = useState("");

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

    socket.emit("get-document", { documentID, username });

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.once("error-document-not-found", (err) => {
      console.log(err);
    });

  }, [quill, socket, documentID, username]);


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
      <MultipleCursor username={username} socket={socket} />
    </>
  );
}

export default TextEditor;