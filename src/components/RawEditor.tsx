import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { FormattedJsonEditor } from './FormattedJsonEditor';
import { Save } from 'lucide-react';

export const RawEditor: React.FC = () => {
  const currentFile = useAppStore((state) => state.currentFile);
  const referenceFile = useAppStore((state) => state.workspace?.referenceFile);
  const updateFileContent = useAppStore((state) => state.updateFileContent);
  
  const [editedContent, setEditedContent] = useState<string>('');
  const [referenceContent, setReferenceContent] = useState<string>('');

  React.useEffect(() => {
    if (currentFile) {
      setEditedContent(JSON.stringify(currentFile.content, null, 2));
    }
    if (referenceFile) {
      setReferenceContent(JSON.stringify(referenceFile.content, null, 2));
    }
  }, [currentFile, referenceFile]);

  const handleSave = () => {
    if (!currentFile) return;

    try {
      const parsed = JSON.parse(editedContent);
      updateFileContent(currentFile.id, parsed);
    } catch (error) {
      alert('Invalid JSON format');
    }
  };

  if (!currentFile) {
    return (
      <div className="editor-empty">
        <p>Select a file to start editing</p>
      </div>
    );
  }

  return (
    <div className="raw-editor">
      <div className="editor-header">
        <h3>{currentFile.path}</h3>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={16} />
          Save
        </button>
      </div>

      <div className="editor-content">
        <div className="editor-pane">
          <div className="pane-header">
            <h4>Reference ({referenceFile?.language || 'en_us'})</h4>
          </div>
          <FormattedJsonEditor
            value={referenceContent}
            onChange={() => {}}
            readOnly
            placeholder="No reference file selected"
          />
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <h4>Translation ({currentFile.language})</h4>
          </div>
          <FormattedJsonEditor
            value={editedContent}
            onChange={setEditedContent}
            placeholder="Enter translations..."
          />
        </div>
      </div>
    </div>
  );
};
