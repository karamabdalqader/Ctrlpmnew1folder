export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  status: 'todo' | 'inProgress' | 'done';
  assignedTo?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  description: string;
  status: 'draft' | 'sent' | 'received' | 'pending' | 'collected' | 'paid';
  invoiceType: 'client' | 'vendor';
  deliveryMethod: 'email' | 'etimad' | 'custom';
  etimadStage?: 'submitted' | 'underReview' | 'approved' | 'collected';
  etimadNotes?: string;
  customFields: any[];
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  amount: number;
  dateSent?: string;
  dateReceived?: string;
  dateCollected?: string;
  datePaid?: string;
  customDeliveryMethod?: string;
  dueDate?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'task' | 'meeting';
}

export interface ProjectData {
  kanban: {
    tasks: Task[];
    columns: {
      id: string;
      title: string;
      tasks: Task[];
    }[];
  };
  invoices: Invoice[];
  aiAssistant: {
    conversations: {
      id: string;
      messages: {
        role: 'user' | 'assistant';
        content: string;
        timestamp: string;
      }[];
    }[];
  };
  files: {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
    size: number;
  }[];
  timeline: TimelineEvent[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  dueDate: string;
  teamSize: number;
  tasksCount: {
    total: number;
    completed: number;
  };
  logo: string;
  budget: number;
  amountInvoiced: number;
  amountCollected: number;
  amountSpent: number;
  projectValue: number;
  createdAt: Date;
  updatedAt: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | string;
  phases: {
    id: string;
    name: string;
    title: string;
    description: string;
    insights: string[];
    templates: { id: string; title: string; description: string; content: any }[];
    checklists: any[];
    bestPractices: any[];
    tools: any[];
  }[];
}

// Helper functions to manage project-specific data
export const getProjectData = (projectId: string): ProjectData => {
  const data = localStorage.getItem(`project_data_${projectId}`);
  if (data) {
    return JSON.parse(data);
  }
  
  // Return default structure if no data exists
  return {
    kanban: {
      tasks: [],
      columns: [
        { id: 'todo', title: 'To Do', tasks: [] },
        { id: 'inProgress', title: 'In Progress', tasks: [] },
        { id: 'done', title: 'Done', tasks: [] }
      ]
    },
    invoices: [],
    aiAssistant: {
      conversations: []
    },
    files: [],
    timeline: []
  };
};

export const saveProjectData = (projectId: string, data: ProjectData): void => {
  localStorage.setItem(`project_data_${projectId}`, JSON.stringify(data));
};
