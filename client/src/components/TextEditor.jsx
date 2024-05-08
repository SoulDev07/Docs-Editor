// import React from 'react';
import { useState, useCallback } from 'react';
import Quill from 'quill';
import katex from 'katex';
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

function TextEditor() {
  const [quill, setQuill] = useState();

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


  return (
    <div id="text-editor" ref={editorRef}></div>
  );
}

export default TextEditor;