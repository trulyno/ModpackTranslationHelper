import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import type { FileTreeNode } from '../types';
import { useAppStore } from '../store/appStore';

interface FileTreeProps {
  nodes: FileTreeNode[];
  onFileSelect?: (fileId: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ nodes, onFileSelect }) => {
  return (
    <div className="file-tree">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} onFileSelect={onFileSelect} level={0} />
      ))}
    </div>
  );
};

interface TreeNodeProps {
  node: FileTreeNode;
  level: number;
  onFileSelect?: (fileId: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, onFileSelect }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const currentFile = useAppStore((state) => state.currentFile);
  const setCurrentFile = useAppStore((state) => state.setCurrentFile);
  const workspace = useAppStore((state) => state.workspace);

  const isActive = currentFile?.id === node.fileId;
  const isFolder = node.type === 'folder';

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else if (node.fileId) {
      const file = workspace?.files.find((f) => f.id === node.fileId);
      if (file) {
        setCurrentFile(file);
        onFileSelect?.(node.fileId);
      }
    }
  };

  return (
    <div className="tree-node">
      <div
        className={`tree-node-content ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        <span className="tree-node-icon">
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              {isExpanded ? (
                <FolderOpen size={16} className="folder-icon" />
              ) : (
                <Folder size={16} className="folder-icon" />
              )}
            </>
          ) : (
            <File size={16} />
          )}
        </span>
        <span className="tree-node-name">{node.name}</span>
      </div>
      {isFolder && isExpanded && node.children && (
        <div className="tree-node-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
