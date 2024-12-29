import { ReportGenerator, ProjectData } from './ReportGenerator';
import { NotificationPreferences } from './NotificationSettings';
import { Project, getProjectData } from '../../types/project';

export class NotificationService {
  private reportGenerator: ReportGenerator;
  private preferences: NotificationPreferences;
  private dailyInterval: ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null = null;
  private weeklyInterval: ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null = null;
  private monthlyInterval: ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null = null;
  private lastNotifications: { [key: string]: number } = {};

  constructor(openAiApiKey: string, preferences: NotificationPreferences) {
    this.reportGenerator = new ReportGenerator(openAiApiKey);
    this.preferences = preferences;
  }

  public updatePreferences(preferences: NotificationPreferences) {
    this.preferences = preferences;
    this.resetSchedules();
  }

  private async sendEmail(report: string, to: string) {
    // TODO: Implement email sending functionality
    // This should be implemented on the backend for security
    console.log('Sending email to:', to);
    console.log('Report content:', report);
  }

  private async generateAndSendReport(reportType: 'daily' | 'weekly' | 'monthly') {
    try {
      const now = Date.now();
      const lastSent = this.lastNotifications[reportType] || 0;
      
      // Prevent duplicate notifications within a short time window (5 minutes)
      if (now - lastSent < 5 * 60 * 1000) {
        console.log(`Skipping ${reportType} report - too soon since last notification`);
        return;
      }

      // TODO: Fetch project data from your backend/database
      const projects: ProjectData[] = await this.fetchProjectData();
      
      const report = await this.reportGenerator.generateReport(projects, reportType);
      
      if (this.preferences.emailAddress) {
        await this.sendEmail(report, this.preferences.emailAddress);
        this.lastNotifications[reportType] = now;
      }
    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error);
    }
  }

  private async fetchProjectData(): Promise<ProjectData[]> {
    try {
      // Get all project IDs from localStorage
      const projectKeys = Object.keys(localStorage).filter(key => key.startsWith('project_'));
      const projects: Project[] = [];
      
      // Parse each project
      projectKeys.forEach(key => {
        try {
          const projectData = localStorage.getItem(key);
          if (projectData) {
            const project = JSON.parse(projectData);
            projects.push(project);
          }
        } catch (error) {
          console.error(`Error parsing project data for key ${key}:`, error);
        }
      });

      // Transform projects into ProjectData format
      return projects.map(project => {
        const projectData = getProjectData(project.id);
        return {
          name: project.name,
          description: project.description,
          tasks: projectData.kanban.tasks.map(task => ({
            name: task.title,
            status: task.status,
            dueDate: task.dueDate,
            assignee: task.assignedTo || 'Unassigned'
          })),
          milestones: projectData.timeline
            .filter(event => event.type === 'milestone')
            .map(milestone => ({
              name: milestone.title,
              status: 'Pending',
              dueDate: milestone.date
            })),
          budget: {
            total: project.budget,
            spent: project.amountSpent,
            remaining: project.budget - project.amountSpent
          },
          invoices: projectData.invoices.map(invoice => ({
            id: invoice.id,
            amount: invoice.amount,
            dueDate: invoice.dueDate || '',
            status: invoice.status
          })),
          deliveryNotes: projectData.timeline
            .filter(event => event.type === 'task' && event.title.toLowerCase().includes('delivery'))
            .map(note => ({
              item: note.title,
              status: note.description
            })),
          risks: []
        };
      });
    } catch (error) {
      console.error('Error fetching project data:', error);
      return [];
    }
  }

  private scheduleDaily() {
    if (this.preferences.daily) {
      // Schedule daily report at 9:00 AM
      const now = new Date();
      const nextReport = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + (now.getHours() >= 9 ? 1 : 0),
        9, 0, 0
      );
      
      const timeUntilNext = nextReport.getTime() - now.getTime();
      
      this.dailyInterval = setTimeout(() => {
        this.generateAndSendReport('daily');
        // Set up the recurring interval after the first notification
        this.dailyInterval = setInterval(() => {
          this.generateAndSendReport('daily');
        }, 24 * 60 * 60 * 1000); // 24 hours
      }, timeUntilNext);
    }
  }

  private scheduleWeekly() {
    if (this.preferences.weekly) {
      // Schedule weekly report on Monday at 9:00 AM
      const now = new Date();
      const nextMonday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + ((7 - now.getDay() + 1) % 7) + (now.getDay() === 1 && now.getHours() >= 9 ? 7 : 0),
        9, 0, 0
      );
      
      const timeUntilNext = nextMonday.getTime() - now.getTime();
      
      this.weeklyInterval = setTimeout(() => {
        this.generateAndSendReport('weekly');
        // Set up the recurring interval after the first notification
        this.weeklyInterval = setInterval(() => {
          this.generateAndSendReport('weekly');
        }, 7 * 24 * 60 * 60 * 1000); // 7 days
      }, timeUntilNext);
    }
  }

  private scheduleMonthly() {
    if (this.preferences.monthly) {
      // Schedule monthly report on the 1st of each month at 9:00 AM
      const now = new Date();
      const nextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + (now.getDate() === 1 && now.getHours() >= 9 ? 1 : 0),
        1,
        9, 0, 0
      );
      
      const timeUntilNext = nextMonth.getTime() - now.getTime();
      
      this.monthlyInterval = setTimeout(() => {
        this.generateAndSendReport('monthly');
        // Set up the recurring interval after the first notification
        this.monthlyInterval = setInterval(() => {
          this.generateAndSendReport('monthly');
        }, 30 * 24 * 60 * 60 * 1000); // Approximately 30 days
      }, timeUntilNext);
    }
  }

  private clearSchedules() {
    if (this.dailyInterval) {
      clearTimeout(this.dailyInterval);
      clearInterval(this.dailyInterval);
    }
    if (this.weeklyInterval) {
      clearTimeout(this.weeklyInterval);
      clearInterval(this.weeklyInterval);
    }
    if (this.monthlyInterval) {
      clearTimeout(this.monthlyInterval);
      clearInterval(this.monthlyInterval);
    }
    
    this.dailyInterval = null;
    this.weeklyInterval = null;
    this.monthlyInterval = null;
  }

  public resetSchedules() {
    this.clearSchedules();
    this.scheduleDaily();
    this.scheduleWeekly();
    this.scheduleMonthly();
  }

  public start() {
    this.resetSchedules();
  }

  public stop() {
    this.clearSchedules();
  }
}

export const createNotificationService = (
  openAiApiKey: string,
  preferences: NotificationPreferences
) => {
  return new NotificationService(openAiApiKey, preferences);
};
