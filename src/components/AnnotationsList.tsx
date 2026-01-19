import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { MessageSquare, Edit2, Trash2 } from 'lucide-react';
import type { Annotation } from '../types';

interface AnnotationsListProps {
  fileId: string;
  translationKey: string;
}

export const AnnotationsList: React.FC<AnnotationsListProps> = ({ fileId, translationKey }) => {
  const annotations = useAppStore((state) => 
    state.workspace?.annotations.filter((a) => a.fileId === fileId && a.key === translationKey) || []
  );
  const updateAnnotation = useAppStore((state) => state.updateAnnotation);
  const deleteAnnotation = useAppStore((state) => state.deleteAnnotation);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleStartEdit = (annotation: Annotation) => {
    setEditingId(annotation.id);
    setEditText(annotation.text);
  };

  const handleSaveEdit = (id: string) => {
    if (editText.trim()) {
      updateAnnotation(id, { text: editText.trim() });
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this annotation?')) {
      deleteAnnotation(id);
    }
  };

  if (annotations.length === 0) return null;

  return (
    <div className="annotations-list">
      {annotations.map((annotation) => (
        <div key={annotation.id} className="annotation-item">
          {editingId === annotation.id ? (
            <div className="annotation-edit">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="annotation-textarea"
                autoFocus
              />
              <div className="annotation-edit-actions">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleSaveEdit(annotation.id)}
                >
                  Save
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="annotation-header">
                <MessageSquare size={14} />
                <span className="annotation-date">
                  {new Date(annotation.createdAt).toLocaleString()}
                </span>
                <div className="annotation-actions">
                  <button
                    className="btn-icon btn-sm"
                    onClick={() => handleStartEdit(annotation)}
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn-icon btn-sm"
                    onClick={() => handleDelete(annotation.id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="annotation-text">{annotation.text}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
