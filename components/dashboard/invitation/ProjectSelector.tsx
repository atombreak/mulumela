'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileText, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  canvasWidth: number;
  canvasHeight: number;
  version: number;
  lastOpenedAt?: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  onLoadProject: (projectId: string) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (projectId: string) => void;
  isLoadingProject: boolean;
  projectLoadError: string | null;
  setProjectLoadError: (error: string | null) => void;
  isSaving: boolean;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  onLoadProject,
  onCreateProject,
  onDeleteProject,
  isLoadingProject,
  projectLoadError,
  setProjectLoadError,
  isSaving,
}) => {
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    await onCreateProject(newProjectName.trim());
    setShowNewProjectForm(false);
    setNewProjectName('');
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
    if (!confirmDelete) return;

    await onDeleteProject(projectId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invitation Projects</h1>
          <p className="text-gray-600">Create and manage your invitation card designs</p>
        </div>

        {/* Create New Project Card */}
        {!showNewProjectForm ? (
          <div className="mb-8">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => setShowNewProjectForm(true)}
            >
              <div className="text-center">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Project</h3>
                <p className="text-gray-500">Start designing a new invitation card</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectName" className="text-sm font-medium text-gray-700">
                    Project Name
                  </Label>
                  <Input
                    id="projectName"
                    placeholder="Enter project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newProjectName.trim() && !isSaving) {
                        handleCreateProject();
                      } else if (e.key === 'Escape') {
                        setShowNewProjectForm(false);
                        setNewProjectName('');
                      }
                    }}
                    className="mt-1"
                    autoFocus
                  />
                </div>
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim() || isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? 'Creating...' : 'Create Project'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowNewProjectForm(false);
                      setNewProjectName('');
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
              {isLoadingProject && (
                <div className="flex items-center text-sm text-blue-600">
                  <div className="w-4 h-4 animate-spin rounded-full border border-blue-600 border-t-transparent mr-2" />
                  Loading project...
                </div>
              )}
            </div>
            
            {projectLoadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2" />
                    <span className="text-sm text-red-800">{projectLoadError}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setProjectLoadError(null)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${isLoadingProject ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => !isLoadingProject && onLoadProject(project.id)}
                >
                  {/* Project Thumbnail */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    {project.thumbnail ? (
                      <img 
                        src={project.thumbnail} 
                        alt={project.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-2" />
                        <span className="text-sm">No Preview</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Project Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate" title={project.name}>
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-3 text-xs text-gray-400 mt-3">
                          <span>{project.canvasWidth}×{project.canvasHeight}</span>
                          <span>v{project.version}</span>
                          {project.lastOpenedAt && (
                            <span>
                              {new Date(project.lastOpenedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Project Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          title="Delete Project"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !showNewProjectForm && (
          <div className="text-center py-12">
            <FileText className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-500 mb-4">Create your first invitation project to get started</p>
            <Button onClick={() => setShowNewProjectForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 