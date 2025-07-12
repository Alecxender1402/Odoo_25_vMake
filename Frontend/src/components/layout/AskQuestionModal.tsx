import React, { useState } from 'react';
import Modal from 'react-modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Toolbar configuration
const toolbarOptions = [
  [{ 'header': [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'align': [] }],
  ['link', 'image', 'video'],
  ['code-block'],
  ['clean']
];

Modal.setAppElement('#root');

const AskQuestionModal = ({ isOpen, onRequestClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quill modules configuration
  const modules = {
    toolbar: toolbarOptions,
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent', 'align',
    'link', 'image', 'video', 'code-block'
  ];

  const validateForm = () => {
    const newErrors = {
      title: '',
      description: '',
      tags: ''
    };

    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters long';
    } else if (title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    // Description validation
    const plainTextDescription = description.replace(/<[^>]*>/g, '').trim();
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (plainTextDescription.length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    // Tags validation
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    if (tagArray.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (tagArray.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    } else if (tagArray.some(tag => tag.length < 2)) {
      newErrors.tags = 'Each tag must be at least 2 characters long';
    } else if (tagArray.some(tag => tag.length > 20)) {
      newErrors.tags = 'Each tag must be less than 20 characters';
    }

    setErrors(newErrors);
    return !newErrors.title && !newErrors.description && !newErrors.tags;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSubmit({
        title: title.trim(),
        description,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setTags('');
      setErrors({ title: '', description: '', tags: '' });
      
      // Close modal
      onRequestClose();
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (field === 'title') setTitle(value);
    if (field === 'description') setDescription(value);
    if (field === 'tags') setTags(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Ask Question"
      className="w-full max-w-5xl mx-auto my-4 bg-white p-6 md:p-10 rounded-2xl shadow-2xl outline-none max-h-[95vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 p-4 overflow-y-auto"
      style={{
        content: {
          inset: 'auto',
        }
      }}
    >
      <h2 className="text-3xl font-extrabold mb-2 text-primary">Ask Your Question</h2>
      <p className="mb-6 text-lg text-muted-foreground">
        Please provide a clear and detailed question. Use the editor below to format your content, add images, and share code snippets!
      </p>
      <div className="mb-5">
        <input
          type="text"
          placeholder="Title (e.g. How do I use React Context API?)"
          value={title}
          onChange={e => handleInputChange('title', e.target.value)}
          className={`w-full border rounded p-3 text-lg ${
            errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
        <div className="text-xs text-gray-500 mt-1">
          {title.length}/200 characters
        </div>
      </div>
      <div className="mb-5">
        <ReactQuill
          value={description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="Describe your question in detail. You can use formatting, code blocks, images, and more."
          style={{ minHeight: 180, maxHeight: 400 }}
          modules={modules}
          formats={formats}
          className={`bg-white [&_.ql-editor]:max-h-80 [&_.ql-editor]:overflow-y-auto ${
            errors.description ? '[&_.ql-container]:border-red-500 [&_.ql-container]:bg-red-50' : ''
          }`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
        <div className="text-xs text-gray-500 mt-1">
          {description.replace(/<[^>]*>/g, '').length} characters (minimum 20)
        </div>
      </div>
      <div className="mb-8">
        <input
          type="text"
          placeholder="Tags (comma separated, e.g. react, context, hooks)"
          value={tags}
          onChange={e => handleInputChange('tags', e.target.value)}
          className={`w-full border rounded p-3 text-lg ${
            errors.tags ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.tags && (
          <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
        )}
        <div className="text-xs text-gray-500 mt-1">
          {tags.split(',').filter(tag => tag.trim()).length}/5 tags
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onRequestClose}
          className="px-6 py-2 border rounded-lg text-lg hover:bg-gray-100 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !title.trim() || !description.trim() || !tags.trim()}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit Question'
          )}
        </button>
      </div>
    </Modal>
  );
};

export default AskQuestionModal;
