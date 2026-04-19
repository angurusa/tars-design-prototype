// Inlined from @tars/shared/constants (prototype has no workspace dependency)

export const DATA_SOURCE_LABELS: Record<string, string> = {
  "ado-tasks": "ADO Work Items",
  "ado-prs": "ADO Pull Requests",
  calendar: "M365 Calendar",
  email: "M365 Email",
  teams: "M365 Teams",
  "quick-notes": "Quick Notes",
  "knowledge-base": "Knowledge Base",
};

export const DEFAULT_AGENT_TAGS: Record<string, string[]> = {
  DailyBriefingAgent: ["content"],
  StandupAgent: ["content"],
  DailyNotesAgent: ["content"],
  WeeklyNotesAgent: ["content"],
  MonthlyNotesAgent: ["content"],
  EngagePostDraftAgent: ["content"],
  LearningFinderAgent: ["content"],
  DemoFinderAgent: ["content"],
  OneOnOneAgent: ["content"],
  CodingAgentDispatcher: ["work"],
  ProjectPlannerAgent: ["work"],
  KnowledgeIndexerAgent: ["system"],
  ADOSyncAgent: ["system"],
  ValuesEvolutionAgent: ["system"],
  HealthCheckAgent: ["system"],
  QuickNoteProcessorAgent: ["system"],
};

export const AGENT_DISPLAY_NAMES: Record<string, string> = {
  DailyBriefingAgent: "Daily Briefing",
  StandupAgent: "Standup",
  DailyNotesAgent: "Daily Notes",
  WeeklyNotesAgent: "Weekly Notes",
  MonthlyNotesAgent: "Monthly Notes",
  EngagePostDraftAgent: "Engage Post",
  LearningFinderAgent: "Learning Finder",
  DemoFinderAgent: "Demo Finder",
  OneOnOneAgent: "1:1 Notes",
  ProjectPlannerAgent: "Project Planner",
  CodingAgentDispatcher: "Coding Agent",
  ADOSyncAgent: "ADO Sync",
  KnowledgeIndexerAgent: "Knowledge Indexer",
  HealthCheckAgent: "Health Check",
  ValuesEvolutionAgent: "Values Evolution",
  QuickNoteProcessorAgent: "Quick Note Processor",
};

export function formatAgentName(agentName?: string): string {
  if (!agentName) return "Output";
  return AGENT_DISPLAY_NAMES[agentName] ?? agentName.replace(/Agent$/, "");
}
