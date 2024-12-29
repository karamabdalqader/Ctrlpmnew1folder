import { useEffect } from 'react';
import { Project, ProjectData, getProjectData } from '../types/project';
import useNotifications from './useNotifications';

const useProjectNotifications = (projects: Project[]) => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    const checkProjectUpdates = () => {
      if (!Array.isArray(projects)) return;

      projects.forEach((project) => {
        if (!project || !project.id) return;
        
        const projectData = getProjectData(project.id);
        if (!projectData) return;
        
        checkForNotifications(project, projectData);
      });
    };

    // Initial check
    checkProjectUpdates();

    // Set up interval for periodic checks
    const interval = setInterval(checkProjectUpdates, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [projects, addNotification]);

  const checkForNotifications = (project: Project, projectData: ProjectData) => {
    // Check for tasks near deadline
    if (projectData.kanban?.tasks) {
      projectData.kanban.tasks.forEach((task) => {
        if (!task.dueDate) return;
        
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue <= 3 && daysUntilDue > 0 && task.status !== 'done') {
          addNotification({
            title: `Task Due Soon: ${task.title}`,
            message: `Task in project "${project.name}" is due in ${daysUntilDue} days`,
            type: 'daily'
          });
        }
      });

      // Check for overdue tasks
      projectData.kanban.tasks.forEach((task) => {
        if (!task.dueDate) return;
        
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        if (dueDate < today && task.status !== 'done') {
          addNotification({
            title: `Overdue Task: ${task.title}`,
            message: `Task in project "${project.name}" is overdue`,
            type: 'daily'
          });
        }
      });
    }

    // Check for upcoming milestones
    if (projectData.timeline) {
      projectData.timeline.forEach((event) => {
        if (event.type === 'milestone' && event.date) {
          const eventDate = new Date(event.date);
          const today = new Date();
          const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilEvent <= 7 && daysUntilEvent > 0) {
            addNotification({
              title: `Upcoming Milestone: ${event.title}`,
              message: `Milestone in project "${project.name}" is coming up in ${daysUntilEvent} days`,
              type: 'weekly'
            });
          }
        }
      });
    }

    // Check for invoice status changes
    if (projectData.invoices) {
      projectData.invoices.forEach((invoice) => {
        if (invoice.status === 'pending' && invoice.dueDate) {
          const dueDate = new Date(invoice.dueDate);
          const today = new Date();
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilDue <= 5 && daysUntilDue > 0) {
            addNotification({
              title: `Invoice Due Soon: ${invoice.invoiceNumber}`,
              message: `Invoice in project "${project.name}" is due in ${daysUntilDue} days`,
              type: 'daily'
            });
          }
        }
      });
    }

    // Check project progress
    if (typeof project.progress === 'number' && project.status === 'active') {
      if (project.progress >= 90) {
        addNotification({
          title: `Project Near Completion: ${project.name}`,
          message: `Project is ${project.progress}% complete`,
          type: 'weekly'
        });
      }
    }

    // Check budget alerts
    if (typeof project.amountSpent === 'number' && typeof project.budget === 'number' && project.budget > 0) {
      const budgetUsagePercentage = (project.amountSpent / project.budget) * 100;
      if (budgetUsagePercentage >= 80) {
        addNotification({
          title: `Budget Alert: ${project.name}`,
          message: `Project has used ${budgetUsagePercentage.toFixed(1)}% of its budget`,
          type: 'weekly'
        });
      }
    }
  };
};

export default useProjectNotifications;
