import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '../types/project';
import useProjectNotifications from '../hooks/useProjectNotifications';

interface ProjectContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  setProjects: () => {},
  loading: true,
});

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize project notifications
  useProjectNotifications(projects);

  useEffect(() => {
    // Load projects from localStorage
    const loadProjects = () => {
      try {
        const projectKeys = Object.keys(localStorage).filter(key => key.startsWith('project_'));
        const loadedProjects: Project[] = [];

        projectKeys.forEach(key => {
          const projectData = localStorage.getItem(key);
          if (projectData) {
            try {
              const project = JSON.parse(projectData);
              loadedProjects.push(project);
            } catch (error) {
              console.error(`Error parsing project data for key ${key}:`, error);
            }
          }
        });

        setProjects(loadedProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();

    // Set up event listener for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.startsWith('project_')) {
        loadProjects();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, setProjects, loading }}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
