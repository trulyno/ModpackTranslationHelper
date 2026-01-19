import React from 'react';
import { useAppStore } from '../store/appStore';
import { CheckCircle, Circle, Target } from 'lucide-react';

export const ProgressWidget: React.FC = () => {
  const workspace = useAppStore((state) => state.workspace);
  const currentFile = useAppStore((state) => state.currentFile);

  if (!workspace || !currentFile) return null;

  const referenceFile = workspace.referenceFile;
  if (!referenceFile) return null;

  const referenceKeys = Object.keys(referenceFile.content);
  const translatedKeys = Object.keys(currentFile.content).filter(
    (key) => currentFile.content[key] && currentFile.content[key].trim() !== ''
  );
  const missingKeys = referenceKeys.filter((key) => !currentFile.content[key]);

  const totalKeys = referenceKeys.length;
  const translatedCount = translatedKeys.length;
  const missingCount = missingKeys.length;
  const percentage = totalKeys > 0 ? Math.round((translatedCount / totalKeys) * 100) : 0;

  return (
    <div className="progress-widget">
      <div className="progress-header">
        <Target size={16} />
        <span>Translation Progress</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
        </div>
        <span className="progress-percentage">{percentage}%</span>
      </div>
      <div className="progress-stats">
        <div className="progress-stat">
          <CheckCircle size={14} className="stat-icon-complete" />
          <span>{translatedCount} translated</span>
        </div>
        <div className="progress-stat">
          <Circle size={14} className="stat-icon-missing" />
          <span>{missingCount} missing</span>
        </div>
        <div className="progress-stat">
          <span className="stat-total">{totalKeys} total</span>
        </div>
      </div>
    </div>
  );
};
