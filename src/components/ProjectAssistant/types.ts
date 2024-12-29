import { Project as BaseProject } from '../../types/project';

export interface Project extends BaseProject {
  // Extend the base project type with any additional properties needed
  checklists?: { [key: string]: ChecklistItem[] };
  risks?: Risk[];
}

export interface WBSNode {
  id: string;
  name: string;
  description: string;
  owner: string;
  children: WBSNode[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Mitigated' | 'Closed';
  mitigation?: string;
  owner?: string;
}

export interface Phase {
  id: string;
  name: string;
  title: string;
  description: string;
  insights: string[];
  checklists: Checklist[];
  bestPractices: BestPractice[];
  templates: Template[];
  tools: Tool[];
}

export interface Checklist {
  id?: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  description: string;
  completed: boolean;
  resources?: string[];
  note?: string;
  templates?: {
    [key: string]: string;
  };
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  options?: string[];
  required?: boolean;
}

export interface TemplateSection {
  title: string;
  fields: TemplateField[];
}

export interface Template {
  id: string;
  title: string;
  description: string;
  content: {
    sections: TemplateSection[];
  };
}

export interface Tool {
  id: string;
  name: string;
  type: string;
  config: any;
}

export interface MethodologyGuide {
  id: string;
  name: string;
  description: string;
  phases: Phase[];
  bestPractices: BestPractice[];
  resources: {
    id: string;
    title: string;
    items: {
      id: string;
      name: string;
      type: string;
      format: string;
      description: string;
    }[];
  }[];
}

export interface BestPractice {
  id: string;
  title: string;
  description: string;
  tips: string[];
  category?: string;
}

export interface GanttTask {
  id: string;
  text: string;
  start_date: Date;
  end_date: Date;
  progress: number;
  parent?: string;
  dependencies?: string[];
}

export interface GanttChartProps {
  tasks: GanttTask[];
  onTaskUpdate: (task: GanttTask) => void;
}

export interface ProjectTemplateProps {
  template: Template;
  onSave: (templateId: string, data: any) => void;
}
