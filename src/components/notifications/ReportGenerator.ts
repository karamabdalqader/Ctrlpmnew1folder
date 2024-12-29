import OpenAI from 'openai';

export interface ProjectData {
  name: string;
  description: string;
  tasks: Array<{
    name: string;
    status: string;
    dueDate: string;
    assignee: string;
  }>;
  milestones: Array<{
    name: string;
    status: string;
    dueDate: string;
  }>;
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
  invoices: Array<{
    id: string;
    amount: number;
    dueDate: string;
    status: string;
  }>;
  deliveryNotes: Array<{
    item: string;
    status: string;
    expectedDelivery?: string;
  }>;
  risks: Array<{
    description: string;
    severity: string;
    mitigation: string;
  }>;
}

interface CachedReport {
  report: string;
  timestamp: number;
  projectHashes: string[];
}

export class ReportGenerator {
  private openai: OpenAI;
  private cache: Map<string, CachedReport> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Note: In production, API calls should be made from the backend
    });
  }

  private generateProjectHash(project: ProjectData): string {
    return JSON.stringify({
      name: project.name,
      tasks: project.tasks.map(t => ({ name: t.name, status: t.status })),
      milestones: project.milestones.map(m => ({ name: m.name, status: m.status })),
      budget: project.budget,
      risks: project.risks.map(r => ({ description: r.description, severity: r.severity }))
    });
  }

  private getCacheKey(projectHashes: string[], reportType: string): string {
    return `${reportType}_${projectHashes.sort().join('_')}`;
  }

  private async generatePrompt(projects: ProjectData[], reportType: 'daily' | 'weekly' | 'monthly'): Promise<string> {
    // Optimize the project data structure for the prompt
    const projectsSummary = projects.map(project => {
      const activeTasksCount = project.tasks.filter(t => t.status === 'in_progress').length;
      const completedTasksCount = project.tasks.filter(t => t.status === 'completed').length;
      const upcomingMilestones = project.milestones
        .filter(m => m.status === 'pending')
        .slice(0, 3); // Only include next 3 upcoming milestones
      const criticalRisks = project.risks
        .filter(r => r.severity === 'high')
        .slice(0, 3); // Only include top 3 critical risks

      return `
Project: ${project.name}
Overview: ${project.description}
Progress: ${activeTasksCount} active tasks, ${completedTasksCount} completed
Budget: ${project.budget.spent}/${project.budget.total} (${Math.round((project.budget.remaining/project.budget.total) * 100)}% remaining)
Next Milestones: ${upcomingMilestones.map(m => m.name).join(', ')}
Critical Risks: ${criticalRisks.map(r => r.description).join(', ')}`;
    }).join('\n---\n');

    return `Generate a concise ${reportType} summary focusing on:
1. Key metrics and progress
2. Critical issues and risks
3. Action items

Projects Summary:
${projectsSummary}

Format as a brief, action-oriented email.`;
  }

  public async generateReport(
    projects: ProjectData[],
    reportType: 'daily' | 'weekly' | 'monthly'
  ): Promise<string> {
    try {
      // Generate hashes for projects to check cache
      const projectHashes = projects.map(p => this.generateProjectHash(p));
      const cacheKey = this.getCacheKey(projectHashes, reportType);
      
      // Check cache
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('Using cached report');
        return cached.report;
      }

      // Process in batches of 5 projects if there are many
      const batchSize = 5;
      let finalReport = '';

      for (let i = 0; i < projects.length; i += batchSize) {
        const batch = projects.slice(i, i + batchSize);
        const prompt = await this.generatePrompt(batch, reportType);
        
        const completion = await this.openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-3.5-turbo",
          temperature: 0.7,
          max_tokens: 1000,
        });

        finalReport += completion.choices[0].message.content || '';
        
        // Add small delay between batches to avoid rate limiting
        if (i + batchSize < projects.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Cache the result
      this.cache.set(cacheKey, {
        report: finalReport,
        timestamp: Date.now(),
        projectHashes
      });

      return finalReport;
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  // Clear old cache entries
  public clearOldCache(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    });
  }
}

export const createReportGenerator = (apiKey: string) => {
  return new ReportGenerator(apiKey);
};
