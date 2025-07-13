'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Undo, 
  Redo, 
  Copy, 
  ClipboardPaste, 
  Trash2, 
  FileText, 
  FolderOpen, 
  Save, 
  Clock,
  Download,
  X
} from 'lucide-react';

interface DesignToolbarProps {
  // History
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  
  // Selection
  hasSelection: boolean;
  hasClipboard: boolean;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onClone: () => void;
  
  // Layers
  onBringToFront: () => void;
  onSendToBack: () => void;
  onMoveUpOneLayer: () => void;
  onMoveDownOneLayer: () => void;
  onToggleLock: () => void;
  isLocked: boolean;
  
  // Project management
  currentProject: any;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  saveStatus: 'saved' | 'saving' | 'error' | 'unsaved';
  lastSaved: Date | null;
  onSave: () => void;
  onNewProject: () => void;
  onOpenProject: () => void;
  onExport: () => void;
  
  // Full screen
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export const DesignToolbar: React.FC<DesignToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  hasSelection,
  hasClipboard,
  onCopy,
  onPaste,
  onDelete,
  onClone,
  onBringToFront,
  onSendToBack,
  onMoveUpOneLayer,
  onMoveDownOneLayer,
  onToggleLock,
  isLocked,
  currentProject,
  hasUnsavedChanges,
  isSaving,
  saveStatus,
  lastSaved,
  onSave,
  onNewProject,
  onOpenProject,
  onExport,
  isFullScreen,
  onToggleFullScreen,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* History controls */}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onUndo} 
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onRedo} 
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </Button>
          
          {/* Selection controls */}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onCopy} 
            disabled={!hasSelection}
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onPaste} 
            disabled={!hasClipboard}
            title="Paste (Ctrl+V)"
          >
            <ClipboardPaste className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onDelete} 
            disabled={!hasSelection}
            title="Delete (Del)"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onClone} 
            disabled={!hasSelection}
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Project Management */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onNewProject}
              title="New Project"
            >
              <FileText className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onOpenProject}
              title="Open Project"
            >
              <FolderOpen className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant={hasUnsavedChanges ? "default" : "outline"}
              onClick={onSave}
              disabled={isSaving}
              title={currentProject ? "Save Project" : "Save As New Project"}
            >
              {isSaving ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Project Status */}
          {currentProject && (
            <div className="text-xs text-gray-600 flex items-center space-x-2">
              <span className="font-medium">{currentProject.name}</span>
              {hasUnsavedChanges && <span className="text-orange-500">•</span>}
              {lastSaved && (
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}

          {/* Save Status Indicator */}
          <div className="flex items-center space-x-2">
            {saveStatus === 'saving' && (
              <div className="flex items-center text-xs text-blue-600">
                <div className="w-3 h-3 animate-spin rounded-full border border-blue-600 border-t-transparent mr-1" />
                Saving...
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center text-xs text-green-600">
                <div className="w-3 h-3 rounded-full bg-green-600 mr-1" />
                Saved
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center text-xs text-red-600">
                <div className="w-3 h-3 rounded-full bg-red-600 mr-1" />
                Save failed
              </div>
            )}
            {saveStatus === 'unsaved' && (
              <div className="flex items-center text-xs text-yellow-600">
                <div className="w-3 h-3 rounded-full bg-yellow-600 mr-1" />
                Unsaved
              </div>
            )}
          </div>

          {/* Actions */}
          {isFullScreen && (
            <Button size="sm" variant="outline" onClick={onToggleFullScreen}>
              <X className="w-4 h-4 mr-1" />
              Exit Full Screen
            </Button>
          )}
          <Button size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}; 