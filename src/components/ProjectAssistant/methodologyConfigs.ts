import { MethodologyGuide } from './types';

export const methodologyConfigs: Record<string, MethodologyGuide> = {
  pmp: {
    id: 'pmp',
    name: 'Project Management Professional (PMP)',
    description: 'Based on PMI\'s PMBOK Guide methodology',
    phases: [
      {
        id: 'initiation',
        name: 'Initiation',
        title: 'Project Initiation',
        description: 'Define the project and obtain authorization',
        insights: [
          'Focus on defining clear project objectives and success criteria',
          'Identify key stakeholders early and assess their influence',
          'Document assumptions and constraints thoroughly',
        ],
        templates: [
          {
            id: 'project-charter',
            title: 'Project Charter',
            description: 'Document that formally authorizes the project',
            content: {
              sections: [
                {
                  title: 'Project Overview',
                  fields: [
                    {
                      id: 'project-name',
                      label: 'Project Name',
                      type: 'text',
                      required: true
                    },
                    {
                      id: 'project-description',
                      label: 'Project Description',
                      type: 'textarea',
                      required: true
                    }
                  ]
                },
                {
                  title: 'Project Objectives',
                  fields: [
                    {
                      id: 'objectives',
                      label: 'Project Objectives',
                      type: 'textarea',
                      required: true
                    }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'charter',
            title: 'Project Charter',
            description: 'Create and get approval for the project charter',
            items: [
              { 
                id: 'pc1', 
                text: 'Define project purpose and justification',
                description: 'Clearly state why the project is needed and its business value',
                resources: ['Project Charter Template', 'Business Case Guidelines'],
                completed: false 
              },
              { 
                id: 'pc2', 
                text: 'Document high-level requirements',
                description: 'Outline key deliverables and major project constraints',
                resources: ['Requirements Template', 'Scope Statement Guide'],
                completed: false 
              },
              { 
                id: 'pc3', 
                text: 'Identify key stakeholders',
                description: 'Create stakeholder register with roles and influence levels',
                resources: ['Stakeholder Analysis Matrix', 'RACI Chart Template'],
                completed: false 
              },
              { 
                id: 'pc4', 
                text: 'Define success criteria',
                description: 'Establish measurable objectives and acceptance criteria',
                resources: ['Success Criteria Framework', 'KPI Guidelines'],
                completed: false 
              },
            ],
          },
          {
            id: 'stakeholder',
            title: 'Stakeholder Analysis',
            description: 'Identify and analyze project stakeholders',
            items: [
              { 
                id: 'sa1', 
                text: 'Create stakeholder register',
                description: 'Document all stakeholders and their contact information',
                resources: ['Stakeholder Register Template'],
                completed: false 
              },
              { 
                id: 'sa2', 
                text: 'Assess stakeholder influence and interest',
                description: 'Use power/interest grid for stakeholder analysis',
                resources: ['Power/Interest Grid Template', 'Influence Mapping Guide'],
                completed: false 
              },
              { 
                id: 'sa3', 
                text: 'Develop stakeholder engagement strategy',
                description: 'Plan communication and management approaches for each stakeholder',
                resources: ['Engagement Strategy Template', 'Communication Plan Guide'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp1',
            title: 'Stakeholder Engagement',
            description: 'Early stakeholder identification and engagement is crucial for project success',
            tips: [
              'Hold one-on-one meetings with key stakeholders',
              'Document stakeholder requirements and expectations',
              'Create a communication plan for regular updates',
            ],
          },
          {
            id: 'bp2',
            title: 'Project Charter Development',
            description: 'A well-defined project charter sets the foundation for project success',
            tips: [
              'Get input from all key stakeholders',
              'Be specific about project objectives and constraints',
              'Include high-level risks and assumptions',
            ],
          },
        ],
        tools: [
          {
            id: 'stakeholder-matrix',
            name: 'Stakeholder Analysis Matrix',
            type: 'matrix',
            config: {
              axes: ['Power', 'Interest'],
              categories: ['Monitor', 'Keep Informed', 'Keep Satisfied', 'Manage Closely'],
            },
          },
        ],
      },
      {
        id: 'planning',
        name: 'Planning',
        title: 'Planning',
        description: 'Develop project management plan and subsidiary plans',
        insights: [
          'Develop a comprehensive project management plan',
          'Create a detailed project schedule and budget',
          'Identify and assess risks, and develop mitigation strategies',
        ],
        templates: [
          {
            id: 'project-plan',
            title: 'Project Management Plan',
            description: 'Comprehensive document that defines how the project is executed, monitored, and controlled',
            content: {
              sections: [
                {
                  title: 'Scope Management',
                  fields: [
                    {
                      id: 'scope-statement',
                      label: 'Project Scope Statement',
                      type: 'textarea',
                      required: true
                    },
                    {
                      id: 'deliverables',
                      label: 'Key Deliverables',
                      type: 'textarea',
                      required: true
                    }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'project-plan',
            title: 'Project Management Plan',
            description: 'Develop comprehensive project management plan',
            items: [
              { 
                id: 'pp1', 
                text: 'Define project scope',
                description: 'Clearly outline what is included and excluded from the project',
                resources: ['Scope Statement Guide', 'Work Breakdown Structure Template'],
                completed: false 
              },
              { 
                id: 'pp2', 
                text: 'Create WBS',
                description: 'Break down the project into smaller, manageable tasks',
                resources: ['Work Breakdown Structure Template', 'Task List Template'],
                completed: false 
              },
              { 
                id: 'pp3', 
                text: 'Develop schedule',
                description: 'Create a detailed project schedule with milestones and deadlines',
                resources: ['Gantt Chart Template', 'Schedule Management Guide'],
                completed: false 
              },
              { 
                id: 'pp4', 
                text: 'Estimate costs and determine budget',
                description: 'Establish a realistic budget and cost management plan',
                resources: ['Cost Estimation Template', 'Budgeting Guide'],
                completed: false 
              },
              { 
                id: 'pp5', 
                text: 'Plan quality management',
                description: 'Develop a quality management plan to ensure high-quality deliverables',
                resources: ['Quality Management Plan Template', 'Quality Control Checklist'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp3',
            title: 'Project Scheduling',
            description: 'Develop a realistic project schedule with clear milestones and deadlines',
            tips: [
              'Use a Gantt chart or similar tool to visualize the project schedule',
              'Establish clear dependencies between tasks',
              'Identify and mitigate potential scheduling risks',
            ],
          },
          {
            id: 'bp4',
            title: 'Cost Management',
            description: 'Establish a realistic budget and cost management plan',
            tips: [
              'Use a cost estimation template to establish a baseline budget',
              'Identify and mitigate potential cost risks',
              'Establish a cost management plan with clear roles and responsibilities',
            ],
          },
        ],
        tools: [
          {
            id: 'gantt-chart',
            name: 'Gantt Chart',
            type: 'gantt',
            config: {
              timeUnit: 'week',
              showCriticalPath: true,
            },
          },
        ],
      },
      {
        id: 'execution',
        name: 'Executing',
        title: 'Executing',
        description: 'Direct and manage project work, implement approved changes',
        insights: [
          'Focus on delivering high-quality project results',
          'Manage and control changes to the project scope, schedule, and budget',
          'Ensure effective communication and stakeholder engagement',
        ],
        templates: [
          {
            id: 'status-report',
            title: 'Project Status Report',
            description: 'Regular report on project progress and performance',
            content: {
              sections: [
                {
                  title: 'Project Status',
                  fields: [
                    {
                      id: 'overall-status',
                      label: 'Overall Status',
                      type: 'select',
                      options: ['On Track', 'At Risk', 'Off Track'],
                      required: true
                    },
                    {
                      id: 'status-details',
                      label: 'Status Details',
                      type: 'textarea',
                      required: true
                    }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'execution-checklist',
            title: 'Project Execution',
            description: 'Track and manage project execution activities',
            items: [
              { 
                id: 'ex1', 
                text: 'Implement approved project plans',
                description: 'Execute the project management plan and subsidiary plans',
                resources: ['Project Management Plan', 'Execution Strategy Template'],
                completed: false 
              },
              { 
                id: 'ex2', 
                text: 'Manage team performance',
                description: 'Monitor and control team performance, and take corrective action as needed',
                resources: ['Team Performance Metrics', 'Performance Management Guide'],
                completed: false 
              },
              { 
                id: 'ex3', 
                text: 'Distribute information to stakeholders',
                description: 'Communicate project information to stakeholders, and ensure their needs are met',
                resources: ['Communication Plan', 'Stakeholder Engagement Strategy'],
                completed: false 
              },
              { 
                id: 'ex4', 
                text: 'Manage project communications',
                description: 'Ensure effective communication among team members, stakeholders, and sponsors',
                resources: ['Communication Plan', 'Meeting Management Guide'],
                completed: false 
              },
            ],
          }
        ],
        bestPractices: [
          {
            id: 'bp5',
            title: 'Team Performance Management',
            description: 'Monitor and control team performance, and take corrective action as needed',
            tips: [
              'Establish clear performance metrics and expectations',
              'Provide regular feedback and coaching',
              'Address performance issues promptly and fairly',
            ],
          },
          {
            id: 'bp6',
            title: 'Stakeholder Communication',
            description: 'Communicate project information to stakeholders, and ensure their needs are met',
            tips: [
              'Develop a stakeholder communication plan',
              'Use multiple communication channels to reach stakeholders',
              'Ensure stakeholder feedback is incorporated into the project',
            ],
          },
        ],
        tools: [
          {
            id: 'team-performance',
            name: 'Team Performance Metrics',
            type: 'metrics',
            config: {
              metrics: ['Velocity', 'Burn-down', 'Cycle Time'],
            },
          },
        ],
      },
      {
        id: 'monitoring',
        name: 'Monitoring & Controlling',
        title: 'Monitoring & Controlling',
        description: 'Track, review, and regulate project progress and performance',
        insights: [
          'Monitor and control project progress, and take corrective action as needed',
          'Ensure project deliverables meet the required quality standards',
          'Identify and address potential project risks and issues',
        ],
        templates: [
          {
            id: 'project-closure',
            title: 'Project Closure Document',
            description: 'Formal documentation that the project has been completed',
            content: {
              sections: [
                {
                  title: 'Project Completion',
                  fields: [
                    {
                      id: 'completion-status',
                      label: 'Completion Status',
                      type: 'select',
                      options: ['Completed Successfully', 'Completed with Issues', 'Cancelled'],
                      required: true
                    },
                    {
                      id: 'lessons-learned',
                      label: 'Lessons Learned',
                      type: 'textarea',
                      required: true
                    }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'monitoring-checklist',
            title: 'Project Monitoring',
            description: 'Monitor and control project activities',
            items: [
              { 
                id: 'mc1', 
                text: 'Monitor project work',
                description: 'Track project progress, and identify potential issues',
                resources: ['Project Schedule', 'Work Breakdown Structure'],
                completed: false 
              },
              { 
                id: 'mc2', 
                text: 'Control scope changes',
                description: 'Manage changes to the project scope, and ensure they are approved and documented',
                resources: ['Scope Change Request Template', 'Change Management Plan'],
                completed: false 
              },
              { 
                id: 'mc3', 
                text: 'Control schedule and costs',
                description: 'Monitor and control the project schedule and budget, and take corrective action as needed',
                resources: ['Project Schedule', 'Budgeting Guide'],
                completed: false 
              },
              { 
                id: 'mc4', 
                text: 'Monitor risks',
                description: 'Identify and address potential project risks, and develop mitigation strategies',
                resources: ['Risk Management Plan', 'Risk Assessment Template'],
                completed: false 
              },
            ],
          }
        ],
        bestPractices: [
          {
            id: 'bp7',
            title: 'Project Monitoring',
            description: 'Monitor and control project progress, and take corrective action as needed',
            tips: [
              'Establish clear project metrics and benchmarks',
              'Use project management tools to track progress',
              'Identify and address potential project issues promptly',
            ],
          },
          {
            id: 'bp8',
            title: 'Risk Management',
            description: 'Identify and address potential project risks, and develop mitigation strategies',
            tips: [
              'Develop a risk management plan',
              'Use a risk assessment template to identify potential risks',
              'Establish a risk mitigation strategy',
            ],
          },
        ],
        tools: [
          {
            id: 'risk-matrix',
            name: 'Risk Matrix',
            type: 'matrix',
            config: {
              axes: ['Probability', 'Impact'],
              categories: ['Low', 'Medium', 'High'],
            },
          },
        ],
      },
      {
        id: 'closing',
        name: 'Closing',
        title: 'Closing',
        description: 'Finalize all activities to formally close the project',
        insights: [
          'Formally close the project, and document lessons learned',
          'Evaluate project success, and identify areas for improvement',
          'Release project resources, and ensure knowledge transfer',
        ],
        templates: [
          {
            id: 'project-closure',
            title: 'Project Closure Document',
            description: 'Formal documentation that the project has been completed',
            content: {
              sections: [
                {
                  title: 'Project Completion',
                  fields: [
                    {
                      id: 'completion-status',
                      label: 'Completion Status',
                      type: 'select',
                      options: ['Completed Successfully', 'Completed with Issues', 'Cancelled'],
                      required: true
                    },
                    {
                      id: 'lessons-learned',
                      label: 'Lessons Learned',
                      type: 'textarea',
                      required: true
                    }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'closing-checklist',
            title: 'Project Closure',
            description: 'Complete project closure activities',
            items: [
              { 
                id: 'cl1', 
                text: 'Obtain final acceptance',
                description: 'Get formal acceptance from the customer or sponsor',
                resources: ['Acceptance Criteria', 'Final Acceptance Template'],
                completed: false 
              },
              { 
                id: 'cl2', 
                text: 'Document lessons learned',
                description: 'Document project successes, challenges, and lessons learned',
                resources: ['Lessons Learned Template', 'Post-Project Review Guide'],
                completed: false 
              },
              { 
                id: 'cl3', 
                text: 'Archive project documents',
                description: 'Organize and store project documents, and ensure they are accessible',
                resources: ['Document Management Plan', 'Archive Template'],
                completed: false 
              },
              { 
                id: 'cl4', 
                text: 'Release project resources',
                description: 'Release project team members, and ensure knowledge transfer',
                resources: ['Resource Release Plan', 'Knowledge Transfer Template'],
                completed: false 
              },
            ],
          }
        ],
        bestPractices: [
          {
            id: 'bp9',
            title: 'Project Closure',
            description: 'Formally close the project, and document lessons learned',
            tips: [
              'Develop a project closure plan',
              'Get formal acceptance from the customer or sponsor',
              'Document project successes, challenges, and lessons learned',
            ],
          },
          {
            id: 'bp10',
            title: 'Knowledge Transfer',
            description: 'Ensure knowledge transfer, and release project resources',
            tips: [
              'Develop a knowledge transfer plan',
              'Identify and document key project knowledge',
              'Release project team members, and ensure knowledge transfer',
            ],
          },
        ],
        tools: [
          {
            id: 'lessons-learned',
            name: 'Lessons Learned Template',
            type: 'template',
            config: {
              sections: ['Project Overview', 'Successes', 'Challenges', 'Lessons Learned'],
            },
          },
        ],
      },
    ],
    bestPractices: [
      {
        id: 'bp-1',
        title: 'Project Charter Development',
        description: 'Create a formal project charter to authorize the project',
        tips: ['Involve key stakeholders', 'Define project objectives clearly', 'Document constraints and assumptions']
      },
      {
        id: 'bp-2',
        title: 'Stakeholder Management',
        description: 'Identify and manage stakeholder expectations',
        tips: ['Create stakeholder register', 'Assess stakeholder influence', 'Develop engagement strategies']
      }
    ],
    resources: [
      {
        id: 'templates',
        title: 'Project Templates',
        items: [
          {
            id: 'charter-template',
            name: 'Project Charter Template',
            type: 'document',
            format: 'docx',
            description: 'Comprehensive template for creating project charter',
          },
          {
            id: 'stakeholder-register',
            name: 'Stakeholder Register Template',
            type: 'spreadsheet',
            format: 'xlsx',
            description: 'Template for tracking stakeholders and their information',
          },
        ],
      },
      {
        id: 'guides',
        title: 'Best Practice Guides',
        items: [
          {
            id: 'risk-management',
            name: 'Risk Management Guide',
            type: 'document',
            format: 'pdf',
            description: 'Comprehensive guide to project risk management',
          },
          {
            id: 'quality-management',
            name: 'Quality Management Guide',
            type: 'document',
            format: 'pdf',
            description: 'Guide to implementing quality management processes',
          },
        ],
      },
    ],
  },
  prince2: {
    id: 'prince2',
    name: 'PRINCE2',
    description: 'Projects IN Controlled Environments methodology',
    phases: [
      {
        id: 'starting-up',
        name: 'Starting Up',
        title: 'Starting Up a Project (SU)',
        description: 'Initial project setup and evaluation of project viability',
        insights: [
          'Establish project mandate and brief',
          'Appoint Executive and Project Manager',
          'Capture previous lessons',
          'Design and appoint project management team'
        ],
        templates: [
          {
            id: 'project-brief-template',
            title: 'Project Brief Template',
            description: 'Template for creating comprehensive project brief',
            content: {
              sections: [
                {
                  title: 'Project Definition',
                  fields: [
                    { id: 'background', label: 'Project Background', type: 'textarea' },
                    { id: 'objectives', label: 'Project Objectives', type: 'textarea' },
                    { id: 'scope', label: 'Project Scope', type: 'textarea' }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'project-brief',
            title: 'Project Brief',
            description: 'Create the project brief document',
            items: [
              { 
                id: 'pb1', 
                text: 'Appoint Executive and Project Manager',
                description: 'Establish clear roles and responsibilities',
                resources: ['Project Brief Template', 'Role Description Template'],
                completed: false 
              },
              { 
                id: 'pb2', 
                text: 'Capture previous lessons',
                description: 'Document lessons learned from previous projects',
                resources: ['Lessons Learned Template', 'Post-Project Review Guide'],
                completed: false 
              },
              { 
                id: 'pb3', 
                text: 'Design and appoint project management team',
                description: 'Establish a comprehensive project management team',
                resources: ['Project Management Team Template', 'Role Description Template'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp-prince2-1',
            title: 'Project Brief Development',
            description: 'Develop a comprehensive project brief, and establish a clear project mandate',
            tips: [
              'Establish clear project objectives, and scope',
              'Identify key stakeholders, and their roles',
              'Develop a detailed project schedule, and identify key milestones',
            ],
          },
          {
            id: 'bp-prince2-2',
            title: 'Project Management Team',
            description: 'Establish a comprehensive project management team',
            tips: [
              'Establish clear roles and responsibilities',
              'Identify key skills, and expertise required',
              'Develop a comprehensive project management plan',
            ],
          },
        ],
        tools: [
          {
            id: 'project-brief-template',
            name: 'Project Brief Template',
            type: 'template',
            config: {
              sections: ['Project Overview', 'Objectives', 'Scope', 'Roles and Responsibilities'],
            },
          },
        ],
      },
      {
        id: 'directing',
        name: 'Directing',
        title: 'Directing a Project (DP)',
        description: 'Strategic decision-making and project oversight by Project Board',
        insights: [
          'Authorize project initiation',
          'Provide strategic direction',
          'Authorize stage boundaries',
          'Confirm project closure'
        ],
        templates: [
          {
            id: 'project-brief-template',
            title: 'Project Brief Template',
            description: 'Template for creating comprehensive project brief',
            content: {
              sections: [
                {
                  title: 'Project Definition',
                  fields: [
                    { id: 'background', label: 'Project Background', type: 'textarea' },
                    { id: 'objectives', label: 'Project Objectives', type: 'textarea' },
                    { id: 'scope', label: 'Project Scope', type: 'textarea' }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'project-brief',
            title: 'Project Brief',
            description: 'Create the project brief document',
            items: [
              { 
                id: 'pb1', 
                text: 'Appoint Executive and Project Manager',
                description: 'Establish clear roles and responsibilities',
                resources: ['Project Brief Template', 'Role Description Template'],
                completed: false 
              },
              { 
                id: 'pb2', 
                text: 'Capture previous lessons',
                description: 'Document lessons learned from previous projects',
                resources: ['Lessons Learned Template', 'Post-Project Review Guide'],
                completed: false 
              },
              { 
                id: 'pb3', 
                text: 'Design and appoint project management team',
                description: 'Establish a comprehensive project management team',
                resources: ['Project Management Team Template', 'Role Description Template'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp-prince2-1',
            title: 'Project Brief Development',
            description: 'Develop a comprehensive project brief, and establish a clear project mandate',
            tips: [
              'Establish clear project objectives, and scope',
              'Identify key stakeholders, and their roles',
              'Develop a detailed project schedule, and identify key milestones',
            ],
          },
          {
            id: 'bp-prince2-2',
            title: 'Project Management Team',
            description: 'Establish a comprehensive project management team',
            tips: [
              'Establish clear roles and responsibilities',
              'Identify key skills, and expertise required',
              'Develop a comprehensive project management plan',
            ],
          },
        ],
        tools: [
          {
            id: 'project-brief-template',
            name: 'Project Brief Template',
            type: 'template',
            config: {
              sections: ['Project Overview', 'Objectives', 'Scope', 'Roles and Responsibilities'],
            },
          },
        ],
      },
      {
        id: 'initiating',
        name: 'Initiating',
        title: 'Initiating a Project (IP)',
        description: 'Establish solid foundations for the project',
        insights: [
          'Prepare Risk Management Strategy',
          'Prepare Configuration Management Strategy',
          'Prepare Quality Management Strategy',
          'Prepare Project Plan'
        ],
        templates: [
          {
            id: 'project-brief-template',
            title: 'Project Brief Template',
            description: 'Template for creating comprehensive project brief',
            content: {
              sections: [
                {
                  title: 'Project Definition',
                  fields: [
                    { id: 'background', label: 'Project Background', type: 'textarea' },
                    { id: 'objectives', label: 'Project Objectives', type: 'textarea' },
                    { id: 'scope', label: 'Project Scope', type: 'textarea' }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'project-brief',
            title: 'Project Brief',
            description: 'Create the project brief document',
            items: [
              { 
                id: 'pb1', 
                text: 'Appoint Executive and Project Manager',
                description: 'Establish clear roles and responsibilities',
                resources: ['Project Brief Template', 'Role Description Template'],
                completed: false 
              },
              { 
                id: 'pb2', 
                text: 'Capture previous lessons',
                description: 'Document lessons learned from previous projects',
                resources: ['Lessons Learned Template', 'Post-Project Review Guide'],
                completed: false 
              },
              { 
                id: 'pb3', 
                text: 'Design and appoint project management team',
                description: 'Establish a comprehensive project management team',
                resources: ['Project Management Team Template', 'Role Description Template'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp-prince2-1',
            title: 'Project Brief Development',
            description: 'Develop a comprehensive project brief, and establish a clear project mandate',
            tips: [
              'Establish clear project objectives, and scope',
              'Identify key stakeholders, and their roles',
              'Develop a detailed project schedule, and identify key milestones',
            ],
          },
          {
            id: 'bp-prince2-2',
            title: 'Project Management Team',
            description: 'Establish a comprehensive project management team',
            tips: [
              'Establish clear roles and responsibilities',
              'Identify key skills, and expertise required',
              'Develop a comprehensive project management plan',
            ],
          },
        ],
        tools: [
          {
            id: 'project-brief-template',
            name: 'Project Brief Template',
            type: 'template',
            config: {
              sections: ['Project Overview', 'Objectives', 'Scope', 'Roles and Responsibilities'],
            },
          },
        ],
      },
      {
        id: 'controlling',
        name: 'Controlling',
        title: 'Controlling a Stage (CS)',
        description: 'Day-to-day management of project activities',
        insights: [
          'Authorize work packages',
          'Review work package status',
          'Receive completed work packages',
          'Review stage status'
        ],
        templates: [
          {
            id: 'project-brief-template',
            title: 'Project Brief Template',
            description: 'Template for creating comprehensive project brief',
            content: {
              sections: [
                {
                  title: 'Project Definition',
                  fields: [
                    { id: 'background', label: 'Project Background', type: 'textarea' },
                    { id: 'objectives', label: 'Project Objectives', type: 'textarea' },
                    { id: 'scope', label: 'Project Scope', type: 'textarea' }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'project-brief',
            title: 'Project Brief',
            description: 'Create the project brief document',
            items: [
              { 
                id: 'pb1', 
                text: 'Appoint Executive and Project Manager',
                description: 'Establish clear roles and responsibilities',
                resources: ['Project Brief Template', 'Role Description Template'],
                completed: false 
              },
              { 
                id: 'pb2', 
                text: 'Capture previous lessons',
                description: 'Document lessons learned from previous projects',
                resources: ['Lessons Learned Template', 'Post-Project Review Guide'],
                completed: false 
              },
              { 
                id: 'pb3', 
                text: 'Design and appoint project management team',
                description: 'Establish a comprehensive project management team',
                resources: ['Project Management Team Template', 'Role Description Template'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp-prince2-1',
            title: 'Project Brief Development',
            description: 'Develop a comprehensive project brief, and establish a clear project mandate',
            tips: [
              'Establish clear project objectives, and scope',
              'Identify key stakeholders, and their roles',
              'Develop a detailed project schedule, and identify key milestones',
            ],
          },
          {
            id: 'bp-prince2-2',
            title: 'Project Management Team',
            description: 'Establish a comprehensive project management team',
            tips: [
              'Establish clear roles and responsibilities',
              'Identify key skills, and expertise required',
              'Develop a comprehensive project management plan',
            ],
          },
        ],
        tools: [
          {
            id: 'project-brief-template',
            name: 'Project Brief Template',
            type: 'template',
            config: {
              sections: ['Project Overview', 'Objectives', 'Scope', 'Roles and Responsibilities'],
            },
          },
        ],
      },
      {
        id: 'managing',
        name: 'Managing',
        title: 'Managing Product Delivery (MP)',
        description: 'Control of work package delivery',
        insights: [
          'Accept work packages',
          'Execute work packages',
          'Deliver work packages',
          'Quality check deliverables'
        ],
        templates: [
          {
            id: 'project-brief-template',
            title: 'Project Brief Template',
            description: 'Template for creating comprehensive project brief',
            content: {
              sections: [
                {
                  title: 'Project Definition',
                  fields: [
                    { id: 'background', label: 'Project Background', type: 'textarea' },
                    { id: 'objectives', label: 'Project Objectives', type: 'textarea' },
                    { id: 'scope', label: 'Project Scope', type: 'textarea' }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'project-brief',
            title: 'Project Brief',
            description: 'Create the project brief document',
            items: [
              { 
                id: 'pb1', 
                text: 'Appoint Executive and Project Manager',
                description: 'Establish clear roles and responsibilities',
                resources: ['Project Brief Template', 'Role Description Template'],
                completed: false 
              },
              { 
                id: 'pb2', 
                text: 'Capture previous lessons',
                description: 'Document lessons learned from previous projects',
                resources: ['Lessons Learned Template', 'Post-Project Review Guide'],
                completed: false 
              },
              { 
                id: 'pb3', 
                text: 'Design and appoint project management team',
                description: 'Establish a comprehensive project management team',
                resources: ['Project Management Team Template', 'Role Description Template'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp-prince2-1',
            title: 'Project Brief Development',
            description: 'Develop a comprehensive project brief, and establish a clear project mandate',
            tips: [
              'Establish clear project objectives, and scope',
              'Identify key stakeholders, and their roles',
              'Develop a detailed project schedule, and identify key milestones',
            ],
          },
          {
            id: 'bp-prince2-2',
            title: 'Project Management Team',
            description: 'Establish a comprehensive project management team',
            tips: [
              'Establish clear roles and responsibilities',
              'Identify key skills, and expertise required',
              'Develop a comprehensive project management plan',
            ],
          },
        ],
        tools: [
          {
            id: 'project-brief-template',
            name: 'Project Brief Template',
            type: 'template',
            config: {
              sections: ['Project Overview', 'Objectives', 'Scope', 'Roles and Responsibilities'],
            },
          },
        ],
      },
      {
        id: 'boundaries',
        name: 'Managing Boundaries',
        title: 'Managing Stage Boundaries (SB)',
        description: 'Control of transitions between stages',
        insights: [
          'Plan next stage',
          'Update project plan',
          'Update business case',
          'Report stage end'
        ],
        templates: [
          {
            id: 'project-brief-template',
            title: 'Project Brief Template',
            description: 'Template for creating comprehensive project brief',
            content: {
              sections: [
                {
                  title: 'Project Definition',
                  fields: [
                    { id: 'background', label: 'Project Background', type: 'textarea' },
                    { id: 'objectives', label: 'Project Objectives', type: 'textarea' },
                    { id: 'scope', label: 'Project Scope', type: 'textarea' }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'project-brief',
            title: 'Project Brief',
            description: 'Create the project brief document',
            items: [
              { 
                id: 'pb1', 
                text: 'Appoint Executive and Project Manager',
                description: 'Establish clear roles and responsibilities',
                resources: ['Project Brief Template', 'Role Description Template'],
                completed: false 
              },
              { 
                id: 'pb2', 
                text: 'Capture previous lessons',
                description: 'Document lessons learned from previous projects',
                resources: ['Lessons Learned Template', 'Post-Project Review Guide'],
                completed: false 
              },
              { 
                id: 'pb3', 
                text: 'Design and appoint project management team',
                description: 'Establish a comprehensive project management team',
                resources: ['Project Management Team Template', 'Role Description Template'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp-prince2-1',
            title: 'Project Brief Development',
            description: 'Develop a comprehensive project brief, and establish a clear project mandate',
            tips: [
              'Establish clear project objectives, and scope',
              'Identify key stakeholders, and their roles',
              'Develop a detailed project schedule, and identify key milestones',
            ],
          },
          {
            id: 'bp-prince2-2',
            title: 'Project Management Team',
            description: 'Establish a comprehensive project management team',
            tips: [
              'Establish clear roles and responsibilities',
              'Identify key skills, and expertise required',
              'Develop a comprehensive project management plan',
            ],
          },
        ],
        tools: [
          {
            id: 'project-brief-template',
            name: 'Project Brief Template',
            type: 'template',
            config: {
              sections: ['Project Overview', 'Objectives', 'Scope', 'Roles and Responsibilities'],
            },
          },
        ],
      },
      {
        id: 'closing',
        name: 'Closing',
        title: 'Closing a Project (CP)',
        description: 'Controlled project closure',
        insights: [
          'Prepare planned closure',
          'Prepare premature closure',
          'Hand over products',
          'Evaluate project'
        ],
        templates: [
          {
            id: 'project-brief-template',
            title: 'Project Brief Template',
            description: 'Template for creating comprehensive project brief',
            content: {
              sections: [
                {
                  title: 'Project Definition',
                  fields: [
                    { id: 'background', label: 'Project Background', type: 'textarea' },
                    { id: 'objectives', label: 'Project Objectives', type: 'textarea' },
                    { id: 'scope', label: 'Project Scope', type: 'textarea' }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'project-brief',
            title: 'Project Brief',
            description: 'Create the project brief document',
            items: [
              { 
                id: 'pb1', 
                text: 'Appoint Executive and Project Manager',
                description: 'Establish clear roles and responsibilities',
                resources: ['Project Brief Template', 'Role Description Template'],
                completed: false 
              },
              { 
                id: 'pb2', 
                text: 'Capture previous lessons',
                description: 'Document lessons learned from previous projects',
                resources: ['Lessons Learned Template', 'Post-Project Review Guide'],
                completed: false 
              },
              { 
                id: 'pb3', 
                text: 'Design and appoint project management team',
                description: 'Establish a comprehensive project management team',
                resources: ['Project Management Team Template', 'Role Description Template'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp-prince2-1',
            title: 'Project Brief Development',
            description: 'Develop a comprehensive project brief, and establish a clear project mandate',
            tips: [
              'Establish clear project objectives, and scope',
              'Identify key stakeholders, and their roles',
              'Develop a detailed project schedule, and identify key milestones',
            ],
          },
          {
            id: 'bp-prince2-2',
            title: 'Project Management Team',
            description: 'Establish a comprehensive project management team',
            tips: [
              'Establish clear roles and responsibilities',
              'Identify key skills, and expertise required',
              'Develop a comprehensive project management plan',
            ],
          },
        ],
        tools: [
          {
            id: 'project-brief-template',
            name: 'Project Brief Template',
            type: 'template',
            config: {
              sections: ['Project Overview', 'Objectives', 'Scope', 'Roles and Responsibilities'],
            },
          },
        ],
      }
    ],
    bestPractices: [
      {
        id: 'bp-1',
        title: 'Business Case Focus',
        description: 'Maintain focus on business justification',
        tips: ['Regular business case reviews', 'Track benefits realization', 'Update justification as needed']
      },
      {
        id: 'bp-2',
        title: 'Management by Exception',
        description: 'Establish clear tolerance levels',
        tips: ['Define tolerance levels', 'Monitor thresholds', 'Escalate when needed']
      }
    ],
    resources: [
      {
        id: 'templates',
        title: 'Project Templates',
        items: [
          {
            id: 'project-brief-template',
            name: 'Project Brief Template',
            type: 'document',
            format: 'docx',
            description: 'Comprehensive template for creating project brief',
          },
          {
            id: 'project-management-team-template',
            name: 'Project Management Team Template',
            type: 'spreadsheet',
            format: 'xlsx',
            description: 'Template for establishing project management team',
          },
        ],
      },
      {
        id: 'guides',
        title: 'Best Practice Guides',
        items: [
          {
            id: 'project-management-guide',
            name: 'Project Management Guide',
            type: 'document',
            format: 'pdf',
            description: 'Comprehensive guide to project management',
          },
          {
            id: 'risk-management-guide',
            name: 'Risk Management Guide',
            type: 'document',
            format: 'pdf',
            description: 'Guide to project risk management',
          },
        ],
      },
    ],
  },
  agile: {
    id: 'agile',
    name: 'Agile',
    description: 'Iterative and incremental project management approach',
    phases: [
      {
        id: 'project-initiation',
        name: 'Project Initiation',
        title: 'Project Initiation Phase',
        description: 'Setting up the project foundation and vision',
        insights: [
          'Define project vision',
          'Identify stakeholders',
          'Form initial team',
          'Create product backlog'
        ],
        templates: [
          {
            id: 'project-vision',
            title: 'Project Vision',
            description: 'Document that outlines the project vision and goals',
            content: {
              sections: [
                {
                  title: 'Project Overview',
                  fields: [
                    {
                      id: 'project-name',
                      label: 'Project Name',
                      type: 'text',
                      required: true
                    },
                    {
                      id: 'project-description',
                      label: 'Project Description',
                      type: 'textarea',
                      required: true
                    }
                  ]
                },
                {
                  title: 'Project Objectives',
                  fields: [
                    {
                      id: 'objectives',
                      label: 'Project Objectives',
                      type: 'textarea',
                      required: true
                    }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'vision',
            title: 'Project Vision',
            description: 'Define project vision and goals',
            items: [
              { 
                id: 'v1', 
                text: 'Create project vision statement',
                description: 'Establish a clear project vision, and goals',
                resources: ['Project Vision Template', 'Goal Setting Guide'],
                completed: false 
              },
              { 
                id: 'v2', 
                text: 'Identify key personas',
                description: 'Develop a comprehensive understanding of key stakeholders',
                resources: ['Persona Template', 'Stakeholder Analysis Guide'],
                completed: false 
              },
              { 
                id: 'v3', 
                text: 'Define high-level features',
                description: 'Establish a clear understanding of key project features',
                resources: ['Feature Template', 'Product Backlog Guide'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp-agile-1',
            title: 'Project Vision Development',
            description: 'Establish a clear project vision, and goals',
            tips: [
              'Establish clear project objectives, and scope',
              'Identify key stakeholders, and their roles',
              'Develop a comprehensive project plan, and identify key milestones',
            ],
          },
          {
            id: 'bp-agile-2',
            title: 'Product Backlog Development',
            description: 'Develop a comprehensive product backlog',
            tips: [
              'Establish clear product backlog items, and priorities',
              'Identify key product backlog attributes, and estimation techniques',
              'Develop a comprehensive product backlog management plan',
            ],
          },
        ],
        tools: [
          {
            id: 'product-backlog-template',
            name: 'Product Backlog Template',
            type: 'template',
            config: {
              sections: ['Product Backlog Items', 'Priorities', 'Estimation'],
            },
          },
        ],
      },
      {
        id: 'release-planning',
        name: 'Release Planning',
        title: 'Release Planning Phase',
        description: 'Planning and organizing product releases',
        insights: [
          'Prioritize product backlog',
          'Define release goals',
          'Create release roadmap',
          'Plan initial sprints'
        ],
        templates: [
          {
            id: 'release-plan',
            title: 'Release Plan',
            description: 'Document that outlines the release plan and goals',
            content: {
              sections: [
                {
                  title: 'Release Overview',
                  fields: [
                    {
                      id: 'release-name',
                      label: 'Release Name',
                      type: 'text',
                      required: true
                    },
                    {
                      id: 'release-description',
                      label: 'Release Description',
                      type: 'textarea',
                      required: true
                    }
                  ]
                },
                {
                  title: 'Release Objectives',
                  fields: [
                    {
                      id: 'objectives',
                      label: 'Release Objectives',
                      type: 'textarea',
                      required: true
                    }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'release-plan',
            title: 'Release Plan',
            description: 'Create the release plan document',
            items: [
              { 
                id: 'rp1', 
                text: 'Prioritize product backlog',
                description: 'Prioritize product backlog items based on business value and complexity',
                resources: ['Product Backlog Template', 'Prioritization Guide'],
                completed: false 
              },
              { 
                id: 'rp2', 
                text: 'Define release goals',
                description: 'Establish clear release goals and objectives',
                resources: ['Release Plan Template', 'Goal Setting Guide'],
                completed: false 
              },
              { 
                id: 'rp3', 
                text: 'Create release roadmap',
                description: 'Develop a comprehensive release roadmap',
                resources: ['Release Roadmap Template', 'Roadmap Development Guide'],
                completed: false 
              },
              { 
                id: 'rp4', 
                text: 'Plan initial sprints',
                description: 'Plan the initial sprints and develop a sprint plan',
                resources: ['Sprint Plan Template', 'Sprint Planning Guide'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp-agile-3',
            title: 'Release Planning',
            description: 'Plan and organize product releases',
            tips: [
              'Establish clear release goals and objectives',
              'Prioritize product backlog items',
              'Develop a comprehensive release roadmap',
              'Plan initial sprints',
            ],
          },
          {
            id: 'bp-agile-4',
            title: 'Sprint Planning',
            description: 'Plan and execute sprints',
            tips: [
              'Establish clear sprint goals and objectives',
              'Prioritize sprint backlog items',
              'Develop a comprehensive sprint plan',
              'Execute the sprint',
            ],
          },
        ],
        tools: [
          {
            id: 'release-roadmap-template',
            name: 'Release Roadmap Template',
            type: 'template',
            config: {
              sections: ['Release Roadmap', 'Milestones', 'Deadlines'],
            },
          },
        ],
      },
      {
        id: 'sprint-planning',
        name: 'Sprint Planning',
        title: 'Sprint Planning Phase',
        description: 'Detailed planning for upcoming sprint',
        insights: [
          'Select sprint backlog items',
          'Estimate effort',
          'Define sprint goal',
          'Create sprint backlog'
        ],
        templates: [
          {
            id: 'sprint-plan',
            title: 'Sprint Plan',
            description: 'Document that outlines the sprint plan and goals',
            content: {
              sections: [
                {
                  title: 'Sprint Overview',
                  fields: [
                    {
                      id: 'sprint-name',
                      label: 'Sprint Name',
                      type: 'text',
                      required: true
                    },
                    {
                      id: 'sprint-description',
                      label: 'Sprint Description',
                      type: 'textarea',
                      required: true
                    }
                  ]
                },
                {
                  title: 'Sprint Objectives',
                  fields: [
                    {
                      id: 'objectives',
                      label: 'Sprint Objectives',
                      type: 'textarea',
                      required: true
                    }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'sprint-plan',
            title: 'Sprint Plan',
            description: 'Create the sprint plan document',
            items: [
              { 
                id: 'sp1', 
                text: 'Select sprint backlog items',
                description: 'Select the sprint backlog items to be completed during the sprint',
                resources: ['Sprint Backlog Template', 'Backlog Management Guide'],
                completed: false 
              },
              { 
                id: 'sp2', 
                text: 'Estimate effort',
                description: 'Estimate the effort required to complete the sprint backlog items',
                resources: ['Estimation Template', 'Estimation Guide'],
                completed: false 
              },
              { 
                id: 'sp3', 
                text: 'Define sprint goal',
                description: 'Establish a clear sprint goal and objectives',
                resources: ['Sprint Goal Template', 'Goal Setting Guide'],
                completed: false 
              },
              { 
                id: 'sp4', 
                text: 'Create sprint backlog',
                description: 'Create the sprint backlog and prioritize the items',
                resources: ['Sprint Backlog Template', 'Backlog Management Guide'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp-agile-5',
            title: 'Sprint Planning',
            description: 'Plan and execute sprints',
            tips: [
              'Establish clear sprint goals and objectives',
              'Prioritize sprint backlog items',
              'Develop a comprehensive sprint plan',
              'Execute the sprint',
            ],
          },
          {
            id: 'bp-agile-6',
            title: 'Sprint Execution',
            description: 'Execute the sprint and deliver working software',
            tips: [
              'Develop a comprehensive sprint plan',
              'Execute the sprint',
              'Deliver working software',
              'Conduct sprint review and retrospective',
            ],
          },
        ],
        tools: [
          {
            id: 'sprint-backlog-template',
            name: 'Sprint Backlog Template',
            type: 'template',
            config: {
              sections: ['Sprint Backlog Items', 'Priorities', 'Estimation'],
            },
          },
        ],
      },
      {
        id: 'sprint-execution',
        name: 'Sprint Execution',
        title: 'Sprint Execution Phase',
        description: 'Implementing sprint backlog items',
        insights: [
          'Daily stand-ups',
          'Track progress',
          'Remove impediments',
          'Update sprint board'
        ],
        templates: [
          {
            id: 'sprint-execution-plan',
            title: 'Sprint Execution Plan',
            description: 'Document that outlines the sprint execution plan and goals',
            content: {
              sections: [
                {
                  title: 'Sprint Execution Overview',
                  fields: [
                    {
                      id: 'sprint-execution-name',
                      label: 'Sprint Execution Name',
                      type: 'text',
                      required: true
                    },
                    {
                      id: 'sprint-execution-description',
                      label: 'Sprint Execution Description',
                      type: 'textarea',
                      required: true
                    }
                  ]
                },
                {
                  title: 'Sprint Execution Objectives',
                  fields: [
                    {
                      id: 'objectives',
                      label: 'Sprint Execution Objectives',
                      type: 'textarea',
                      required: true
                    }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'sprint-execution-plan',
            title: 'Sprint Execution Plan',
            description: 'Create the sprint execution plan document',
            items: [
              { 
                id: 'sep1', 
                text: 'Daily stand-ups',
                description: 'Conduct daily stand-ups to track progress and remove impediments',
                resources: ['Daily Stand-up Template', 'Stand-up Guide'],
                completed: false 
              },
              { 
                id: 'sep2', 
                text: 'Track progress',
                description: 'Track progress and update the sprint board',
                resources: ['Sprint Board Template', 'Board Management Guide'],
                completed: false 
              },
              { 
                id: 'sep3', 
                text: 'Remove impediments',
                description: 'Remove impediments and blockers to ensure smooth sprint execution',
                resources: ['Impediment Removal Template', 'Impediment Management Guide'],
                completed: false 
              },
              { 
                id: 'sep4', 
                text: 'Update sprint board',
                description: 'Update the sprint board to reflect the current progress',
                resources: ['Sprint Board Template', 'Board Management Guide'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp-agile-7',
            title: 'Sprint Execution',
            description: 'Execute the sprint and deliver working software',
            tips: [
              'Develop a comprehensive sprint plan',
              'Execute the sprint',
              'Deliver working software',
              'Conduct sprint review and retrospective',
            ],
          },
          {
            id: 'bp-agile-8',
            title: 'Sprint Review and Retrospective',
            description: 'Conduct sprint review and retrospective',
            tips: [
              'Conduct sprint review',
              'Conduct sprint retrospective',
              'Identify and document lessons learned',
              'Improve sprint execution',
            ],
          },
        ],
        tools: [
          {
            id: 'sprint-board',
            name: 'Sprint Board',
            type: 'board',
            config: {
              columns: ['To Do', 'In Progress', 'Done']
            }
          }
        ]
      },
      {
        id: 'sprint-review',
        name: 'Sprint Review',
        title: 'Sprint Review Phase',
        description: 'Demonstrating and reviewing sprint results',
        insights: [
          'Demo completed work',
          'Gather feedback',
          'Update product backlog',
          'Plan potential releases'
        ],
        templates: [
          {
            id: 'sprint-review-plan',
            title: 'Sprint Review Plan',
            description: 'Document that outlines the sprint review plan and goals',
            content: {
              sections: [
                {
                  title: 'Sprint Review Overview',
                  fields: [
                    {
                      id: 'sprint-review-name',
                      label: 'Sprint Review Name',
                      type: 'text',
                      required: true
                    },
                    {
                      id: 'sprint-review-description',
                      label: 'Sprint Review Description',
                      type: 'textarea',
                      required: true
                    }
                  ]
                },
                {
                  title: 'Sprint Review Objectives',
                  fields: [
                    {
                      id: 'objectives',
                      label: 'Sprint Review Objectives',
                      type: 'textarea',
                      required: true
                    }
                  ]
                }
              ]
            }
          }
        ],
        checklists: [
          {
            id: 'sprint-review-plan',
            title: 'Sprint Review Plan',
            description: 'Create the sprint review plan document',
            items: [
              { 
                id: 'srp1', 
                text: 'Demo completed work',
                description: 'Demonstrate the completed work to stakeholders',
                resources: ['Demo Template', 'Demo Guide'],
                completed: false 
              },
              { 
                id: 'srp2', 
                text: 'Gather feedback',
                description: 'Gather feedback from stakeholders and team members',
                resources: ['Feedback Template', 'Feedback Guide'],
                completed: false 
              },
              { 
                id: 'srp3', 
                text: 'Update product backlog',
                description: 'Update the product backlog based on feedback and new requirements',
                resources: ['Product Backlog Template', 'Backlog Management Guide'],
                completed: false 
              },
              { 
                id: 'srp4', 
                text: 'Plan potential releases',
                description: 'Plan potential releases based on the updated product backlog',
                resources: ['Release Plan Template', 'Release Planning Guide'],
                completed: false 
              },
            ],
          },
        ],
        bestPractices: [
          {
            id: 'bp-agile-9',
            title: 'Sprint Review',
            description: 'Demonstrate and review sprint results',
            tips: [
              'Demonstrate completed work',
              'Gather feedback',
              'Update product backlog',
              'Plan potential releases',
            ],
          },
          {
            id: 'bp-agile-10',
            title: 'Release Planning',
            description: 'Plan and organize product releases',
            tips: [
              'Establish clear release goals and objectives',
              'Prioritize product backlog items',
              'Develop a comprehensive release roadmap',
              'Plan initial sprints',
            ],
          },
        ],
        tools: [
          {
            id: 'sprint-review-board',
            name: 'Sprint Review Board',
            type: 'board',
            config: {
              columns: ['To Do', 'In Progress', 'Done']
            }
          }
        ]
      }
    ],
    bestPractices: [
      {
        id: 'bp-agile-1',
        title: 'Agile Methodology',
        description: 'Implement agile methodology principles',
        tips: [
          'Emphasize iterative and incremental development',
          'Focus on delivering working software',
          'Encourage collaboration and communication',
          'Embrace change and flexibility',
        ],
      },
      {
        id: 'bp-agile-2',
        title: 'Sprint Planning',
        description: 'Plan and execute sprints',
        tips: [
          'Establish clear sprint goals and objectives',
          'Prioritize sprint backlog items',
          'Develop a comprehensive sprint plan',
          'Execute the sprint',
        ],
      },
    ],
    resources: [
      {
        id: 'templates',
        title: 'Agile Templates',
        items: [
          {
            id: 'sprint-plan-template',
            name: 'Sprint Plan Template',
            type: 'document',
            format: 'docx',
            description: 'Comprehensive template for creating sprint plan',
          },
          {
            id: 'product-backlog-template',
            name: 'Product Backlog Template',
            type: 'spreadsheet',
            format: 'xlsx',
            description: 'Template for creating and managing product backlog',
          },
        ],
      },
      {
        id: 'guides',
        title: 'Agile Guides',
        items: [
          {
            id: 'agile-methodology-guide',
            name: 'Agile Methodology Guide',
            type: 'document',
            format: 'pdf',
            description: 'Comprehensive guide to agile methodology',
          },
          {
            id: 'sprint-planning-guide',
            name: 'Sprint Planning Guide',
            type: 'document',
            format: 'pdf',
            description: 'Guide to sprint planning and execution',
          },
        ],
      },
    ],
  },
};

export default methodologyConfigs;
