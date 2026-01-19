import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import {
  FileUp,
  FolderArchive,
  Github,
  FileText,
  Package,
  Database,
} from 'lucide-react';
import { 
  createFileInput, 
  readFileAsText, 
  importFromZip, 
  exportWorkspaceComplete,
  importWorkspaceComplete 
} from '../utils/fileOperations';

interface ImportDialogProps {
  onClose: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ onClose }) => {
  const importWorkspace = useAppStore((state) => state.importWorkspace);
  const [isLoading, setIsLoading] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [githubBranch, setGithubBranch] = useState('');

  const handleImportFile = () => {
    createFileInput('.json', async (file) => {
      setIsLoading(true);
      try {
        const content = await readFileAsText(file);
        await importWorkspace({ type: 'file', source: content });
        onClose();
      } catch (error) {
        alert('Failed to import file: ' + error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleImportZip = () => {
    createFileInput('.zip', async (file) => {
      setIsLoading(true);
      try {
        const workspace = await importFromZip(file);
        useAppStore.getState().loadWorkspace(workspace);
        onClose();
      } catch (error) {
        alert('Failed to import ZIP: ' + error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleImportGithub = async () => {
    if (!githubUrl.trim()) return;

    setIsLoading(true);
    try {
      await importWorkspace({ 
        type: 'github', 
        source: githubUrl,
        branch: githubBranch.trim() || undefined 
      });
      onClose();
    } catch (error) {
      alert('Failed to import from GitHub: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEmpty = async () => {
    await importWorkspace({ type: 'empty' });
    onClose();
  };

  const handleImportWorkspace = () => {
    createFileInput('.json', async (file) => {
      setIsLoading(true);
      try {
        const content = await readFileAsText(file);
        const workspace = await importWorkspaceComplete(content);
        useAppStore.getState().loadWorkspace(workspace);
        onClose();
      } catch (error) {
        alert('Failed to import workspace: ' + error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import Workspace</h2>
          <button className="btn-icon" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="import-options">
            <button
              className="import-option"
              onClick={handleImportWorkspace}
              disabled={isLoading}
            >
              <Database size={32} />
              <h3>Import Workspace</h3>
              <p>Import a complete workspace with metadata</p>
            </button>

            <button
              className="import-option"
              onClick={handleImportFile}
              disabled={isLoading}
            >
              <FileUp size={32} />
              <h3>Import Lang File</h3>
              <p>Import a single .json language file</p>
            </button>

            <button
              className="import-option"
              onClick={handleImportZip}
              disabled={isLoading}
            >
              <FolderArchive size={32} />
              <h3>Import ZIP Archive</h3>
              <p>Import a resource pack or KubeJS project ZIP</p>
            </button>

            <div className="import-option github-option">
              <Github size={32} />
              <h3>Import from GitHub</h3>
              <p>Import lang files from a repository</p>
              <input
                type="text"
                className="input"
                placeholder="https://github.com/owner/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                disabled={isLoading}
              />
              <input
                type="text"
                className="input"
                placeholder="Branch (optional, defaults to repository default)"
                value={githubBranch}
                onChange={(e) => setGithubBranch(e.target.value)}
                disabled={isLoading}
              />
              <button
                className="btn btn-primary"
                onClick={handleImportGithub}
                disabled={isLoading || !githubUrl.trim()}
              >
                Import
              </button>
            </div>

            <button
              className="import-option"
              onClick={handleCreateEmpty}
              disabled={isLoading}
            >
              <FileText size={32} />
              <h3>Create Empty Workspace</h3>
              <p>Start with a blank workspace</p>
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Importing...</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ExportDialogProps {
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ onClose }) => {
  const workspace = useAppStore((state) => state.workspace);
  const currentFile = useAppStore((state) => state.currentFile);
  const exportWorkspace = useAppStore((state) => state.exportWorkspace);
  const [isLoading, setIsLoading] = useState(false);
  const [packName, setPackName] = useState('Translation Pack');
  const [packDescription, setPackDescription] = useState('Generated by Translation Helper');

  const handleExportSingle = async () => {
    if (!currentFile) {
      alert('No file selected');
      return;
    }

    setIsLoading(true);
    try {
      await exportWorkspace({ type: 'single', files: [currentFile.id] });
      onClose();
    } catch (error) {
      alert('Failed to export: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportZip = async () => {
    setIsLoading(true);
    try {
      await exportWorkspace({ type: 'zip-kubejs' });
      onClose();
    } catch (error) {
      alert('Failed to export: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportResourcePack = async () => {
    setIsLoading(true);
    try {
      await exportWorkspace({
        type: 'resourcepack',
        packName,
        packDescription,
        packFormat: 15, // Minecraft 1.20.2+
      });
      onClose();
    } catch (error) {
      alert('Failed to export: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportWorkspaceComplete = async () => {
    if (!workspace) return;
    
    setIsLoading(true);
    try {
      await exportWorkspaceComplete(workspace);
      onClose();
    } catch (error) {
      alert('Failed to export workspace: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Export Workspace</h2>
          <button className="btn-icon" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="export-options">
            <button
              className="export-option"
              onClick={handleExportWorkspaceComplete}
              disabled={isLoading || !workspace}
            >
              <Database size={32} />
              <h3>Export Complete Workspace</h3>
              <p>Export workspace with all metadata (annotations, pins, etc.)</p>
            </button>

            <button
              className="export-option"
              onClick={handleExportSingle}
              disabled={isLoading || !currentFile}
            >
              <FileText size={32} />
              <h3>Export Current File</h3>
              <p>Export the currently selected file</p>
            </button>

            <button
              className="export-option"
              onClick={handleExportZip}
              disabled={isLoading || !workspace?.files.length}
            >
              <FolderArchive size={32} />
              <h3>Export as KubeJS ZIP</h3>
              <p>Export workspace with KubeJS folder structure</p>
            </button>

            <div className="export-option resourcepack-option">
              <Package size={32} />
              <h3>Export as Resource Pack</h3>
              <p>Export as a Minecraft resource pack</p>
              <input
                type="text"
                className="input"
                placeholder="Pack name"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                disabled={isLoading}
              />
              <input
                type="text"
                className="input"
                placeholder="Pack description"
                value={packDescription}
                onChange={(e) => setPackDescription(e.target.value)}
                disabled={isLoading}
              />
              <button
                className="btn btn-primary"
                onClick={handleExportResourcePack}
                disabled={isLoading || !workspace?.files.length}
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Exporting...</p>
          </div>
        )}
      </div>
    </div>
  );
};
