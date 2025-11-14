import React, { useContext, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../context-api/AppContext';
import { useNavigate } from 'react-router-dom';

// Import Image Resize Module
import ImageResize from 'quill-image-resize-module-react';

// Register Image Resize Module (Fix)
Quill.register('modules/imageResize', ImageResize);

export default function ReactQuillPage() {
  const { backendUrl, getTemplatesByCurrentUser } = useContext(AppContext);

  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    alert("Document saved!" + content);

    try {
      const { data } = await axios.post(backendUrl + "/api/auth/generate-pdf", { title, isPublic, content });

      if (data.success) {
        toast.success(data.message);
        getTemplatesByCurrentUser();
        setTitle("");
        setIsPublic(false);
        navigate("/template")
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }], // Headers (H1, H2, H3, Normal)
      [{ 'size': ['small', false, 'large', 'huge'] }], // Font size selection
      [{ 'color': [] }, { 'background': [] }], // Text color & highlight color
      ['bold', 'italic', 'underline', 'strike'], // Formatting
      [{ 'align': [] }], // Text alignment
      ['blockquote', 'code-block'], // Blockquotes & code
      ['image', 'link'], // Insert images & links
      ['clean'] // Remove formatting
    ],
    imageResize: {
      parchment: Quill.import('parchment'), // Ensure the resize module works correctly
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  };

  return (
    <div>
      <label>Template Title</label>
      <input
        type="text"
        className="w-full p-2 mb-3 border"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label htmlFor="is_public">Make this template public</label>
      <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />

      <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
