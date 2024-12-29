import { Project } from '../types/project';

export const calculateDocumentationScore = (project: Project): number => {
  const hasProjectCharter = project.phases.some(p => p.checklists?.some(c => c.id === 'charter'));
  const hasRequirements = project.phases.some(p => p.templates?.some(t => t.id === 'requirements'));
  const hasStakeholder = project.phases.some(p => p.checklists?.some(c => c.id === 'stakeholder'));
  const hasRiskRegister = project.phases.some(p => p.templates?.some(t => t.id === 'risk-register'));
  const hasProjectPlan = project.phases.some(p => p.templates?.some(t => t.id === 'project-plan'));

  const scores = [
    hasProjectCharter ? 20 : 0,
    hasRequirements ? 20 : 0,
    hasStakeholder ? 20 : 0,
    hasRiskRegister ? 20 : 0,
    hasProjectPlan ? 20 : 0
  ];

  return scores.reduce((a, b) => a + b, 0);
};

export const calculateTaskScore = (project: Project): number => {
  const { total, completed } = project.tasksCount;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

export const calculateTeamScore = (project: Project): number => {
  // Since we don't have detailed team member data in the Project interface,
  // we'll use a simple calculation based on team size
  return project.teamSize > 0 ? 80 : 40; // Basic score if team exists
};

export const calculateTimelineScore = (project: Project): number => {
  if (!project.startDate || !project.dueDate) return 0;

  const start = new Date(project.startDate);
  const end = new Date(project.dueDate);
  const today = new Date();
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsedDuration = today.getTime() - start.getTime();
  
  if (totalDuration <= 0) return 0;
  
  const expectedProgress = (elapsedDuration / totalDuration) * 100;
  const actualProgress = project.progress;
  
  // Score is better when actual progress matches or exceeds expected progress
  return Math.min(100, Math.round((actualProgress / expectedProgress) * 100));
};

export const calculateRiskScore = (project: Project): number => {
  const hasRiskMatrix = project.phases.some(p => p.tools?.some(t => t.id === 'risk-matrix'));
  const hasRiskRegister = project.phases.some(p => p.templates?.some(t => t.id === 'risk-register'));
  
  if (!hasRiskMatrix && !hasRiskRegister) return 0;
  if (hasRiskMatrix && hasRiskRegister) return 100;
  return 50;
};

export const getDocumentationDetails = (project: Project): string[] => {
  const details: string[] = [];
  
  if (!project.phases.some(p => p.checklists?.some(c => c.id === 'charter'))) {
    details.push('Project charter needs to be completed');
  }
  if (!project.phases.some(p => p.templates?.some(t => t.id === 'requirements'))) {
    details.push('Requirements documentation is missing');
  }
  if (!project.phases.some(p => p.checklists?.some(c => c.id === 'stakeholder'))) {
    details.push('Stakeholder analysis needs to be documented');
  }
  if (!project.phases.some(p => p.templates?.some(t => t.id === 'risk-register'))) {
    details.push('Risk register documentation is missing');
  }
  if (!project.phases.some(p => p.templates?.some(t => t.id === 'project-plan'))) {
    details.push('Project plan needs to be created');
  }
  
  return details.length > 0 ? details : ['All required documentation is complete'];
};

export const getTaskDetails = (project: Project): string[] => {
  const { total, completed } = project.tasksCount;
  return [
    `${completed} of ${total} tasks completed`,
    `${total - completed} tasks remaining`,
  ];
};

export const getTeamDetails = (project: Project): string[] => {
  return [
    `Team size: ${project.teamSize} members`,
    'Team collaboration metrics coming soon',
  ];
};

export const getTimelineDetails = (project: Project): string[] => {
  if (!project.startDate || !project.dueDate) {
    return ['Project timeline not set'];
  }

  const start = new Date(project.startDate);
  const end = new Date(project.dueDate);
  const today = new Date();
  
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return [
    `Project is ${project.progress}% complete`,
    `${remainingDays} days remaining until deadline`,
    `Total project duration: ${totalDays} days`
  ];
};

export const getRiskDetails = (project: Project): string[] => {
  const details: string[] = [];
  
  const hasRiskMatrix = project.phases.some(p => p.tools?.some(t => t.id === 'risk-matrix'));
  const hasRiskRegister = project.phases.some(p => p.templates?.some(t => t.id === 'risk-register'));
  
  if (!hasRiskMatrix) {
    details.push('Risk matrix needs to be created');
  }
  if (!hasRiskRegister) {
    details.push('Risk register documentation is missing');
  }
  
  return details.length > 0 ? details : ['Risk management is properly maintained'];
};
