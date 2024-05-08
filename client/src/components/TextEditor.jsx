// import React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Quill from 'quill';
import "quill/dist/quill.snow.css";

function TextEditor() {
  const [quill, setQuill] = useState();

  const editorRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    // Clear out previous quill instance
    wrapper.innerHTML = "";

    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, { theme: "snow" });
    setQuill(q);
  }, []);


  return (
    <div id="text-editor" ref={editorRef}></div>
  );
}

export default TextEditor;