import type {
  BriefingRecord,
  StandupRecord,
  NoteRecord,
  AdoTask,
  PullRequest,
  CodingAgentTask,
  Person,
  OneOnOneSession,
  EngagePost,
  AgentRegistryEntry,
  ApprovalQueueItem,
  SystemHealth,
  CalendarEvent,
  QuickNote,
  TokenBudget,
} from "./types";

// =============================================================================
// TARS Mission Control - Mock Data
// Reference date: 2026-03-10 (Tuesday), Sprint 14
// =============================================================================

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export const mockPeople: Person[] = [
  { name: "Sarah Mitchell", initials: "SM", relationship: "manager", hasUpcoming1on1: true },
  { name: "Ben Kowalski", initials: "BK", relationship: "peer", hasUpcoming1on1: false },
];

// ---------------------------------------------------------------------------
// Briefing
// ---------------------------------------------------------------------------

export const mockBriefing: BriefingRecord = {
  id: "briefing-2026-03-10",
  date: "2026-03-10",
  status: "draft",
  generatedAt: "2026-03-10T06:30:00Z",
  sourcesAvailable: { workiq: true, ado: true, manual: true },
  actionItems: [
    {
      id: "ai-1",
      text: "Review and merge PR #487 for the telemetry pipeline refactor before EOD -- Ben is blocked on this for his downstream work.",
      priority: 1,
      source: "ado",
      owner: "Andi",
    },
    {
      id: "ai-2",
      text: "Respond to Sarah's design-doc comments on the event-driven ingestion proposal. She flagged concerns about back-pressure handling.",
      priority: 2,
      source: "manual",
      owner: "Andi",
    },
    {
      id: "ai-3",
      text: "Sprint 14 mid-sprint review is tomorrow (Wed). Ensure the board is updated and stories reflect current progress.",
      priority: 2,
      source: "ado",
    },
    {
      id: "ai-4",
      text: "Follow up with Priya on the accessibility audit results for the dashboard components -- due Friday.",
      priority: 3,
      source: "workiq",
      owner: "Andi",
    },
  ],
  content: `## Good Morning, Andi

Today is **Tuesday, March 10, 2026** -- day 7 of Sprint 14. You have **4 meetings** today, including the team standup at 9:30 AM and a 1:1 with Sarah at 2:00 PM. There is a 90-minute focus block available from 10:30 AM to 12:00 PM.

## Sprint 14 Status

Sprint 14 ("Telemetry Pipeline v2") is tracking slightly behind. Of the 34 story points committed, **21 points are completed** (62%), with 8 points actively in progress and 5 points not yet started. The main risk is the event-driven ingestion story (US-4521), which has been in review for 3 days. Velocity from the previous sprint was 31 points.

The coding agent completed work on the retry-logic refactor (Task-8834) overnight and submitted PR #489 as a draft. Initial static analysis passed, but you should review the error-boundary handling before promoting it to ready-for-review.

## Key Updates Since Yesterday

- **ADO**: Two tasks moved to "In Review" -- the telemetry schema migration (Task-8830) and the dashboard widget tests (Task-8836). Bug #9012 was filed overnight by QA regarding a timezone offset in the weekly report aggregation.
- **WorkIQ**: Your focus score yesterday was 72/100. Deep work time was 3.2 hours out of a target 4.0 hours. The primary interruption pattern was context-switching between code review and the design document.
- **Repository Activity**: 3 PRs merged to main in the last 24 hours. Test coverage for the telemetry module moved from 78% to 83%.

## Recommendations

1. Use the morning focus block to address the ingestion proposal feedback -- this is the highest-leverage item given tomorrow's mid-sprint review.
2. Batch your code reviews into the afternoon slot after the 1:1 with Sarah.
3. Consider delegating the timezone bug (Bug-9012) to the coding agent since it has clear repro steps and acceptance criteria already defined.`,
};

// ---------------------------------------------------------------------------
// Standup
// ---------------------------------------------------------------------------

export const mockStandup: StandupRecord = {
  id: "standup-2026-03-10",
  date: "2026-03-10",
  status: "draft",
  generatedAt: "2026-03-10T06:35:00Z",
  yesterday: [
    "Completed code review for PR #485 (schema migration) and left 3 minor comments -- Ben addressed them and it's ready for final approval.",
    "Continued work on the event-driven ingestion design doc -- incorporated feedback from the architecture review and added the back-pressure handling section.",
    "Paired with Priya on the dashboard widget test framework for 45 minutes -- resolved the flaky assertion issue in the chart rendering tests.",
  ],
  today: [
    "Finalize and submit the event-driven ingestion design doc for team review ahead of tomorrow's mid-sprint check-in.",
    "Review the two agent-generated PRs (#488, #489) and the telemetry pipeline PR (#487) that Ben is blocked on.",
  ],
  blockers: [
    "Waiting on DevOps to provision the staging environment for the telemetry pipeline v2 integration tests -- requested last Thursday, no ETA yet.",
  ],
};

// ---------------------------------------------------------------------------
// Daily Notes
// ---------------------------------------------------------------------------

const dailyNoteContent_0309 = `## What I Worked On

Spent the majority of the morning on the event-driven ingestion design document. The architecture review last Friday surfaced valid concerns about back-pressure handling when the upstream Kafka cluster experiences partition rebalancing. I added a dedicated section covering the circuit-breaker pattern we plan to implement, with configurable thresholds per consumer group.

In the afternoon, I did a deep code review of Ben's schema migration PR (#485). The migration itself is clean, but I flagged three areas where the rollback strategy could be more defensive -- specifically around the nullable column additions in the telemetry_events table. Ben turned those around quickly.

## Meetings & Decisions

- **Team standup (9:30 AM)**: Standard sync. James raised that the QA environment is running low on disk -- DevOps ticket filed.
- **Architecture review follow-up (11:00 AM)**: Async discussion in the #arch-decisions channel. Consensus is to proceed with the consumer-group-per-tenant model for the ingestion pipeline, with a shared DLQ.

## Progress Against Sprint Goals

- US-4521 (Event-Driven Ingestion): Design doc at 85% -- need to finalize the monitoring section and get Sarah's sign-off.
- Task-8830 (Schema Migration): In review, nearly ready to merge.
- Task-8836 (Dashboard Widget Tests): Priya and I unblocked the flaky test -- she's wrapping up the remaining test cases.

## Observations & Thoughts

The coding agent handled the retry-logic refactor (Task-8834) with minimal issues. The generated code followed our patterns well, though it missed an edge case around connection pool exhaustion. This is a good candidate for adding to our agent prompt templates as a common gotcha.

## Tomorrow's Focus

- Submit the design doc and get it in front of the team before the mid-sprint review.
- Clear the PR review backlog -- three PRs waiting including two from the coding agent.`;

const dailyNoteContent_0308 = `## What I Worked On

Sunday -- did a light pass on the design document from home. Reorganized the sequence diagrams and added the capacity estimation appendix. About 2 hours of focused work.

## Meetings & Decisions

No meetings (weekend).

## Progress Against Sprint Goals

- US-4521 (Event-Driven Ingestion): Design doc moved from 70% to 85%. The capacity estimation section required pulling production metrics from the last 90 days.

## Observations & Thoughts

The weekend work was optional but worthwhile. The mid-sprint review on Wednesday will go much smoother with the doc in better shape. Need to be careful about weekend work becoming a pattern.

## Tomorrow's Focus

- Code review for Ben's schema migration PR.
- Pair with Priya on the widget test flakiness.`;

const dailyNoteContent_0306 = `## What I Worked On

Architecture review day. Presented the event-driven ingestion proposal to the broader team. The discussion was productive -- the main pushback was on the back-pressure handling approach. I had proposed a simple rate limiter, but Sarah and the platform team convinced me that a circuit-breaker pattern would be more resilient.

Also merged PR #482 (telemetry collector config refactor) after it passed all CI checks. This was a cleanup task that had been lingering for a sprint.

## Meetings & Decisions

- **Architecture Review (10:00 AM - 11:30 AM)**: Presented event-driven ingestion. Decision: proceed with circuit-breaker pattern instead of rate limiter. Action item: update design doc.
- **1:1 with Sarah (2:00 PM)**: Discussed her growth goals for Q2. She wants to lead the next greenfield feature. Agreed to give her ownership of the notification service redesign in Sprint 15.
- **Sprint 14 planning check-in (4:00 PM)**: Velocity tracking at 62%. On pace if we close the in-review items this week.

## Progress Against Sprint Goals

- US-4521: Design doc presented. Needs revision based on feedback.
- Task-8832 (Collector Config Refactor): Completed and merged.
- Task-8834 (Retry Logic Refactor): Assigned to coding agent -- queued overnight.

## Observations & Thoughts

Sarah's architecture feedback was sharp. She caught a failure mode in the partition rebalancing scenario that I hadn't considered. Good signal that she's ready for more ownership. Should document this in her 1:1 notes for the growth conversation.

## Tomorrow's Focus

- Weekend -- but if time permits, restructure the design doc based on arch review feedback.`;

const dailyNoteContent_0304 = `## What I Worked On

Focused day on implementation. Completed the telemetry schema migration script (Task-8830) and opened PR #485. The migration handles both forward and rollback paths, with special attention to the nullable column additions that need to be backwards-compatible with the v1 collectors still in production.

Also spent an hour reviewing the coding agent output from the weekend batch. The config validation task (Task-8833) was solid -- merged after minor style adjustments. The error-handling task needed more work, so I added detailed feedback to the agent prompt for the retry.

## Meetings & Decisions

- **Team standup (9:30 AM)**: All team members on track. Priya starting the dashboard widget tests today.
- **DevOps sync (11:00 AM)**: Requested staging environment for telemetry v2 integration tests. DevOps said they'd have it provisioned by Thursday.

## Progress Against Sprint Goals

- Task-8830 (Schema Migration): PR opened, ready for review.
- Task-8833 (Config Validation): Agent PR merged after review.
- US-4521: Design doc at 60% -- architecture review scheduled for Friday.

## Observations & Thoughts

The schema migration was more complex than estimated (3 points, probably should have been 5). The backwards-compatibility requirement with v1 collectors adds significant constraint surface. Worth noting for future estimation sessions.

## Tomorrow's Focus

- Prepare architecture review presentation for the ingestion proposal.
- Continue design doc -- target 70% completion.`;

const dailyNoteContent_0303 = `## What I Worked On

Sprint 14 kickoff. Spent the morning in sprint planning and the afternoon setting up the initial branch structure for the telemetry pipeline v2 work. Created the feature branch, set up the CI pipeline configuration, and wrote the initial integration test scaffolding.

## Meetings & Decisions

- **Sprint 14 Planning (9:30 AM - 11:00 AM)**: Committed to 34 story points. Main theme: Telemetry Pipeline v2 and dashboard reliability improvements. I'm carrying US-4521 (Event-Driven Ingestion) as the spike/design story.
- **Team standup (11:15 AM)**: Quick sync post-planning. Everyone aligned on priorities.

## Progress Against Sprint Goals

- Sprint just started. All items in "New" state.
- Set up feature branch and CI for the telemetry-v2 work.

## Observations & Thoughts

34 points is ambitious given last sprint's velocity of 31. The coding agent capacity should help -- I've queued three well-defined tasks for agent execution this sprint. If the agent handles those cleanly, we should be fine.

## Tomorrow's Focus

- Begin the telemetry schema migration implementation.
- Start drafting the event-driven ingestion design doc.`;

const dailyNoteContent_0302 = `## What I Worked On

Sprint 13 retro and wrap-up. Spent the morning closing out remaining documentation for Sprint 13 deliverables. Updated the runbook for the new caching layer and wrote the post-mortem summary for the incident we had on Feb 26.

## Meetings & Decisions

- **Sprint 13 Retrospective (10:00 AM - 11:00 AM)**: Team highlighted that agent-generated PRs saved approximately 12 hours of implementation time. Area for improvement: agent PRs need better test coverage -- we should add test-coverage thresholds to the agent pipeline.
- **Backlog grooming (2:00 PM)**: Refined 8 stories for Sprint 14. Estimation was smooth -- team is getting better at calibrating points.

## Progress Against Sprint Goals

- Sprint 13 completed: 31/33 points delivered (94%). Two carry-over items moved to Sprint 14 backlog.

## Observations & Thoughts

The retro feedback on agent PR test coverage is actionable. I should update the agent prompt templates to include explicit test requirements and add a coverage gate to the agent CI pipeline. Good candidate for a Sprint 14 improvement task.

## Tomorrow's Focus

- Sprint 14 planning session.
- Set up feature branches for the new sprint work.`;

const dailyNoteContent_0228 = `## What I Worked On

Final push on Sprint 13 deliverables. Completed the caching layer integration tests and got the last PR merged. Spent the afternoon on documentation and knowledge transfer for the components Ben will be maintaining going forward.

## Meetings & Decisions

- **Team standup (9:30 AM)**: Sprint 13 on track for completion. All stories either done or in final review.
- **Knowledge transfer with Ben (2:00 PM)**: Walked through the caching layer architecture, failure modes, and monitoring dashboards.

## Progress Against Sprint Goals

- Sprint 13: 29/33 points completed. Remaining 4 points are in final review and expected to close tomorrow.

## Observations & Thoughts

Knowledge transfer sessions are time well spent. Ben asked good questions about the cache invalidation strategy that helped me identify a potential edge case we should add a test for.

## Tomorrow's Focus

- Sprint 13 retro preparation.
- Close out remaining review items.`;

const dailyNoteContent_0227 = `## What I Worked On

Deep focus day on the caching layer performance tests. Ran the full benchmark suite against the staging environment and documented the results. P95 latency improved from 340ms to 89ms with the new caching strategy -- a 74% reduction. Wrote up the performance report for stakeholders.

## Meetings & Decisions

- **Team standup (9:30 AM)**: Brief sync. No blockers across the team.
- **Stakeholder update (3:00 PM)**: Presented caching performance results. Product team very happy with the latency improvements.

## Progress Against Sprint Goals

- Task-8820 (Cache Performance Tests): Completed. Results documented.
- Sprint 13: 26/33 points completed (79%). On track for sprint close on Monday.

## Observations & Thoughts

The 74% latency reduction exceeded our target of 50%. The key insight was that the hot-path query pattern benefits significantly from a write-through cache rather than the lazy-loading approach we initially prototyped.

## Tomorrow's Focus

- Caching layer integration tests.
- Documentation for Ben's knowledge transfer.`;

export const mockDailyNotes: NoteRecord[] = [
  {
    id: "dn-2026-03-10",
    type: "daily-note",
    dateKey: "2026-03-10",
    displayLabel: "Tue, Mar 10",
    status: "draft",
    content: "",
    sources: ["ado", "calendar", "git"],
    usedBy: [],
  },
  {
    id: "dn-2026-03-09",
    type: "daily-note",
    dateKey: "2026-03-09",
    displayLabel: "Mon, Mar 9",
    status: "approved",
    content: dailyNoteContent_0309,
    sources: ["ado", "calendar", "git", "workiq"],
    usedBy: ["standup-2026-03-10", "briefing-2026-03-10"],
  },
  {
    id: "dn-2026-03-08",
    type: "daily-note",
    dateKey: "2026-03-08",
    displayLabel: "Sun, Mar 8",
    status: "approved",
    content: dailyNoteContent_0308,
    sources: ["git"],
    usedBy: [],
  },
  {
    id: "dn-2026-03-06",
    type: "daily-note",
    dateKey: "2026-03-06",
    displayLabel: "Fri, Mar 6",
    status: "approved",
    content: dailyNoteContent_0306,
    sources: ["ado", "calendar", "git", "workiq"],
    usedBy: ["standup-2026-03-09", "weekly-note-w10"],
  },
  {
    id: "dn-2026-03-05",
    type: "daily-note",
    dateKey: "2026-03-05",
    displayLabel: "Thu, Mar 5",
    status: "missing",
    content: "",
    sources: [],
    usedBy: [],
  },
  {
    id: "dn-2026-03-04",
    type: "daily-note",
    dateKey: "2026-03-04",
    displayLabel: "Wed, Mar 4",
    status: "approved",
    content: dailyNoteContent_0304,
    sources: ["ado", "calendar", "git"],
    usedBy: ["standup-2026-03-05"],
  },
  {
    id: "dn-2026-03-03",
    type: "daily-note",
    dateKey: "2026-03-03",
    displayLabel: "Tue, Mar 3",
    status: "approved",
    content: dailyNoteContent_0303,
    sources: ["ado", "calendar"],
    usedBy: ["standup-2026-03-04"],
  },
  {
    id: "dn-2026-03-02",
    type: "daily-note",
    dateKey: "2026-03-02",
    displayLabel: "Mon, Mar 2",
    status: "approved",
    content: dailyNoteContent_0302,
    sources: ["ado", "calendar", "workiq"],
    usedBy: ["standup-2026-03-03", "weekly-note-w09"],
  },
  {
    id: "dn-2026-02-28",
    type: "daily-note",
    dateKey: "2026-02-28",
    displayLabel: "Sat, Feb 28",
    status: "approved",
    content: dailyNoteContent_0228,
    sources: ["ado", "calendar", "git"],
    usedBy: ["standup-2026-03-01"],
  },
  {
    id: "dn-2026-02-27",
    type: "daily-note",
    dateKey: "2026-02-27",
    displayLabel: "Fri, Feb 27",
    status: "approved",
    content: dailyNoteContent_0227,
    sources: ["ado", "calendar", "git", "workiq"],
    usedBy: ["standup-2026-02-28", "weekly-note-w09"],
  },
];

// ---------------------------------------------------------------------------
// Weekly Notes
// ---------------------------------------------------------------------------

export const mockWeeklyNotes: NoteRecord[] = [
  {
    id: "wn-2026-w12",
    type: "weekly-note",
    dateKey: "2026-W12",
    displayLabel: "Week 12 (Mar 9 - Mar 15)",
    status: "draft",
    content: "",
    sources: ["daily-notes", "ado", "git"],
    usedBy: [],
  },
  {
    id: "wn-2026-w11",
    type: "weekly-note",
    dateKey: "2026-W11",
    displayLabel: "Week 11 (Mar 2 - Mar 8)",
    status: "approved",
    content: `## Summary

Week 11 covered the first full week of Sprint 14. The primary focus was the Telemetry Pipeline v2 initiative, specifically the event-driven ingestion design and supporting schema migration work. The team committed to 34 story points and completed 21 by end of week (62%).

## Key Accomplishments

- Presented the event-driven ingestion architecture proposal at the Friday architecture review. Received approval to proceed with the circuit-breaker pattern for back-pressure handling.
- Completed and submitted the telemetry schema migration (Task-8830, PR #485). Migration supports both forward and rollback paths with backwards compatibility for v1 collectors.
- Successfully delegated three tasks to the coding agent. Two completed cleanly (config validation, retry logic refactor). One required a single retry with improved prompt.
- Merged the collector config refactor (Task-8832) that had been carrying from Sprint 13.

## Challenges & Risks

- The staging environment for telemetry v2 integration tests has not been provisioned. Requested on Wednesday, no ETA from DevOps. This could block integration testing next week.
- Sprint velocity is tracking behind (62% at midpoint vs. target 70%). The event-driven ingestion design doc took longer than estimated due to the architecture review feedback requiring a significant revision to the back-pressure approach.

## Team Health

- Sarah: Strong contributions to the architecture review. Identified a critical failure mode in partition rebalancing. Ready for more ownership.
- Ben: Solid work on the schema migration review turnaround. Quick to address feedback.
- Priya: Making good progress on dashboard widget tests. Resolved a persistent flaky test issue with pairing support.
- James: Flagged QA environment disk issues proactively. Good operational awareness.

## Next Week Focus

- Finalize the event-driven ingestion design doc and get team sign-off.
- Mid-sprint review on Wednesday -- ensure board is current.
- Clear PR review backlog including agent-generated PRs.
- Follow up on staging environment provisioning.`,
    sources: ["dn-2026-03-02", "dn-2026-03-03", "dn-2026-03-04", "dn-2026-03-06", "dn-2026-03-08"],
    usedBy: ["monthly-note-2026-03"],
  },
  {
    id: "wn-2026-w10",
    type: "weekly-note",
    dateKey: "2026-W10",
    displayLabel: "Week 10 (Feb 23 - Mar 1)",
    status: "approved",
    content: `## Summary

Week 10 wrapped up Sprint 13 and transitioned into Sprint 14 planning. Sprint 13 delivered 31 of 33 committed points (94%), with two carry-over items moved to the Sprint 14 backlog. The main achievement was the caching layer rollout, which delivered a 74% P95 latency reduction.

## Key Accomplishments

- Caching layer performance validated: P95 latency reduced from 340ms to 89ms, exceeding the 50% target.
- Sprint 13 closed at 94% delivery rate. Team velocity stable at 31 points.
- Conducted knowledge transfer session with Ben on the caching layer architecture.
- Sprint 14 planned and committed at 34 points with a clear focus on Telemetry Pipeline v2.

## Challenges & Risks

- Sprint 13 retrospective flagged that agent-generated PRs need better test coverage. Action: add coverage gates to the agent CI pipeline.
- Two carry-over items indicate slight over-commitment. Should factor this into Sprint 14 mid-sprint assessment.

## Next Week Focus

- Sprint 14 execution begins. Priority is the event-driven ingestion design and schema migration.
- Queue initial coding agent tasks for well-defined implementation stories.`,
    sources: ["dn-2026-02-27", "dn-2026-02-28", "dn-2026-03-02"],
    usedBy: ["monthly-note-2026-03"],
  },
  {
    id: "wn-2026-w09",
    type: "weekly-note",
    dateKey: "2026-W09",
    displayLabel: "Week 9 (Feb 16 - Feb 22)",
    status: "approved",
    content: `## Summary

Week 9 was focused on Sprint 13 execution, specifically the caching layer implementation and integration testing. The team made strong progress, completing 22 of 33 story points by mid-sprint. The coding agent was used for two implementation tasks with mixed results.

## Key Accomplishments

- Completed the core caching layer implementation and opened PR #478 for review.
- Coding agent successfully handled the cache-key generation utility (Task-8815). Clean PR, merged without revisions.
- Began performance testing framework setup for the caching layer benchmarks.

## Challenges & Risks

- One agent-generated PR (Task-8817, cache invalidation helpers) had test coverage below threshold. Required manual intervention to add edge case tests. This informed the retro discussion about agent test coverage requirements.

## Next Week Focus

- Complete caching layer performance tests and document results.
- Prepare Sprint 13 close-out and Sprint 14 planning.`,
    sources: [],
    usedBy: ["monthly-note-2026-02"],
  },
];

// ---------------------------------------------------------------------------
// Monthly Notes
// ---------------------------------------------------------------------------

export const mockMonthlyNotes: NoteRecord[] = [
  {
    id: "mn-2026-03",
    type: "monthly-note",
    dateKey: "2026-03",
    displayLabel: "March 2026",
    status: "generating",
    content: "",
    sources: ["wn-2026-w10", "wn-2026-w11", "wn-2026-w12"],
    usedBy: [],
  },
  {
    id: "mn-2026-02",
    type: "monthly-note",
    dateKey: "2026-02",
    displayLabel: "February 2026",
    status: "approved",
    content: `## February 2026 Summary

February was a productive month focused on two major initiatives: the caching layer rollout (Sprint 13) and the beginning of the Telemetry Pipeline v2 design work. The team delivered consistently, with sprint velocity averaging 31 points across the two sprints that overlapped with this month.

## Key Achievements

- **Caching Layer (Sprint 13)**: Successfully shipped the write-through caching strategy, achieving a 74% reduction in P95 latency. This was the quarter's highest-impact performance initiative.
- **Telemetry Pipeline v2 Kickoff (Sprint 14)**: Initiated design work on the event-driven ingestion architecture. The circuit-breaker pattern was selected after architecture review.
- **Coding Agent Adoption**: The team used the coding agent for 5 tasks across the month, saving an estimated 15-18 hours of implementation time. Test coverage remains an area for improvement.
- **Team Development**: Sarah demonstrated strong architecture skills at the review session. She is on track for the tech lead growth goal in Q2.

## Metrics

- Sprint 13: 31/33 points delivered (94%)
- Sprint 14 (in progress): 21/34 points at mid-sprint (62%)
- PRs merged: 23 (5 agent-generated)
- Test coverage (telemetry module): 78% -> 83%
- Incidents: 1 (P3, cache warm-up race condition -- resolved same day)

## Areas of Focus for March

- Complete the Telemetry Pipeline v2 design and begin implementation.
- Improve coding agent prompt templates to enforce test coverage standards.
- Sarah to take ownership of the notification service redesign in Sprint 15.
- Address the staging environment provisioning gap with DevOps.`,
    sources: ["wn-2026-w09", "wn-2026-w10"],
    usedBy: [],
  },
  {
    id: "mn-2026-01",
    type: "monthly-note",
    dateKey: "2026-01",
    displayLabel: "January 2026",
    status: "approved",
    content: `## January 2026 Summary

January marked the beginning of Q1 2026 with a focus on technical debt reduction and the initial design phase for the caching layer. Sprints 11 and 12 covered this period, with the team delivering a combined 63 story points across both sprints.

## Key Achievements

- **Tech Debt Sprint (Sprint 11)**: Dedicated sprint to address accumulated technical debt. Cleaned up 14 deprecated API endpoints, consolidated 3 utility libraries, and updated the CI pipeline to Node 22 LTS.
- **Caching Layer Design (Sprint 12)**: Completed the design and prototyping phase for the write-through caching strategy. Evaluated Redis Cluster vs. Dragonfly and selected Dragonfly for its lower operational overhead.
- **TARS Agent Bootstrap**: Set up the initial TARS agent infrastructure including the scheduling system, approval queue, and prompt template framework.

## Metrics

- Sprint 11: 30/30 points delivered (100%)
- Sprint 12: 33/35 points delivered (94%)
- PRs merged: 28 (2 agent-generated -- first agent PRs for the team)
- Technical debt items closed: 14

## Areas of Focus for February

- Begin caching layer implementation.
- Ramp up coding agent usage for well-defined tasks.
- Prepare architecture proposal for the telemetry pipeline v2 initiative.`,
    sources: [],
    usedBy: [],
  },
];

// ---------------------------------------------------------------------------
// ADO Tasks
// ---------------------------------------------------------------------------

export const mockAdoTasks: AdoTask[] = [
  {
    id: 4521,
    type: "User Story",
    priority: 1,
    title: "Event-Driven Ingestion Pipeline Design",
    state: "Active",
    sprint: "Sprint 14",
    points: 8,
    org: "contoso",
    project: "telemetry-platform",
    description:
      "Design and document the event-driven ingestion pipeline architecture, including consumer group topology, back-pressure handling via circuit-breaker pattern, and DLQ strategy.",
    acceptanceCriteria: [
      "Design document approved by architecture review board",
      "Capacity estimation appendix with production metrics",
      "Circuit-breaker configuration parameters defined",
      "Monitoring and alerting strategy documented",
    ],
    assignedTo: "Andi Chamygurusamy",
    tags: ["telemetry", "architecture", "v2"],
    areaPath: "telemetry-platform\\Pipeline",
  },
  {
    id: 8830,
    type: "Task",
    priority: 2,
    title: "Telemetry Schema Migration (v1 -> v2)",
    state: "In Review",
    sprint: "Sprint 14",
    points: 5,
    org: "contoso",
    project: "telemetry-platform",
    description:
      "Implement the database schema migration from v1 to v2 telemetry_events table with backwards-compatible nullable column additions.",
    acceptanceCriteria: [
      "Migration script handles forward and rollback paths",
      "Backwards compatible with v1 collectors",
      "Migration tested against production-scale dataset",
      "Runbook updated with migration procedure",
    ],
    assignedTo: "Andi Chamygurusamy",
    tags: ["migration", "schema", "backwards-compat"],
    areaPath: "telemetry-platform\\Data",
  },
  {
    id: 8834,
    type: "Task",
    priority: 2,
    title: "Retry Logic Refactor for Telemetry Collectors",
    state: "In Review",
    sprint: "Sprint 14",
    points: 3,
    org: "contoso",
    project: "telemetry-platform",
    description:
      "Refactor the retry logic in telemetry collectors to use exponential backoff with jitter. Replace the existing linear retry with configurable retry policies.",
    acceptanceCriteria: [
      "Exponential backoff with jitter implemented",
      "Configurable max retries and base delay",
      "Connection pool exhaustion edge case handled",
      "Unit tests cover all retry scenarios",
    ],
    assignedTo: "Andi Chamygurusamy",
    tags: ["retry", "reliability", "collectors"],
    areaPath: "telemetry-platform\\Collectors",
    agentStatus: "pr-submitted",
  },
  {
    id: 8836,
    type: "Task",
    priority: 3,
    title: "Dashboard Widget Test Framework",
    state: "Active",
    sprint: "Sprint 14",
    points: 3,
    org: "contoso",
    project: "telemetry-platform",
    description:
      "Set up comprehensive test framework for dashboard widgets including snapshot tests, interaction tests, and accessibility checks.",
    acceptanceCriteria: [
      "Test framework configured with Vitest and Testing Library",
      "Snapshot tests for all chart widgets",
      "Interaction tests for filter and drill-down components",
      "Accessibility audit passing for all dashboard components",
    ],
    assignedTo: "Priya Raghavan",
    tags: ["testing", "a11y", "widgets"],
    areaPath: "telemetry-platform\\Dashboard",
  },
  {
    id: 9012,
    type: "Bug",
    priority: 1,
    title: "Timezone Offset in Weekly Report Aggregation",
    state: "New",
    sprint: "Sprint 14",
    points: 2,
    org: "contoso",
    project: "telemetry-platform",
    description:
      "Weekly report aggregation shows incorrect totals for users in UTC+/- timezones. The aggregation boundary is using server time instead of the user's configured timezone.",
    acceptanceCriteria: [
      "Aggregation uses user-configured timezone for boundaries",
      "Existing reports recalculated for affected users",
      "Unit tests cover UTC+, UTC-, and UTC edge cases",
    ],
    assignedTo: "Andi Chamygurusamy",
    tags: ["bug", "timezone", "reporting"],
    areaPath: "telemetry-platform\\Reporting",
    agentStatus: "implementing",
  },
  {
    id: 8838,
    type: "Task",
    priority: 3,
    title: "Telemetry Pipeline CI/CD Configuration",
    state: "Closed",
    sprint: "Sprint 14",
    points: 2,
    org: "contoso",
    project: "telemetry-platform",
    description:
      "Configure CI/CD pipeline for the telemetry-v2 feature branch with integration test stages.",
    acceptanceCriteria: [
      "Pipeline runs on PR creation and push",
      "Integration test stage included",
      "Deploy to staging on merge to feature branch",
    ],
    assignedTo: "Andi Chamygurusamy",
    tags: ["ci-cd", "infrastructure"],
    areaPath: "telemetry-platform\\DevOps",
  },
  {
    id: 8832,
    type: "Task",
    priority: 4,
    title: "Collector Config Refactor (Cleanup)",
    state: "Closed",
    sprint: "Sprint 14",
    points: 2,
    org: "contoso",
    project: "telemetry-platform",
    description:
      "Clean up legacy collector configuration files and consolidate into a single typed configuration module.",
    acceptanceCriteria: [
      "Single config module replacing 3 legacy files",
      "Type-safe configuration with validation",
      "No behavior changes in collector startup",
    ],
    assignedTo: "Andi Chamygurusamy",
    tags: ["cleanup", "config"],
    areaPath: "telemetry-platform\\Collectors",
  },
  {
    id: 4530,
    type: "User Story",
    priority: 2,
    title: "Notification Service Redesign (Spike)",
    state: "New",
    sprint: "Sprint 15",
    points: 5,
    org: "contoso",
    project: "telemetry-platform",
    description:
      "Spike to evaluate the current notification service architecture and propose a redesign that supports multi-channel delivery (email, Slack, Teams, push) with user preference management.",
    acceptanceCriteria: [
      "Current architecture documented with pain points",
      "Proposed architecture with ADR",
      "Multi-channel delivery strategy defined",
      "User preference data model designed",
    ],
    assignedTo: "Sarah Mitchell",
    tags: ["spike", "notifications", "multi-channel"],
    areaPath: "telemetry-platform\\Notifications",
  },
];

// ---------------------------------------------------------------------------
// Pull Requests
// ---------------------------------------------------------------------------

export const mockPullRequests: PullRequest[] = [
  {
    id: 487,
    title: "feat: telemetry pipeline v2 schema migration",
    repo: "contoso/telemetry-platform",
    status: "active",
    reviewers: [
      { name: "Ben Kowalski", initials: "BK", hasUpcoming1on1: false },
      { name: "Sarah Mitchell", initials: "SM", hasUpcoming1on1: true },
    ],
    isDraft: false,
    isAgentPR: false,
    linesAdded: 342,
    linesRemoved: 28,
    branch: "feature/telemetry-v2-schema",
    createdAt: "2026-03-07T14:30:00Z",
  },
  {
    id: 488,
    title: "fix: timezone offset in weekly report aggregation",
    repo: "contoso/telemetry-platform",
    status: "active",
    reviewers: [],
    isDraft: true,
    isAgentPR: true,
    linesAdded: 156,
    linesRemoved: 43,
    branch: "agent/fix-timezone-offset-9012",
    createdAt: "2026-03-10T04:15:00Z",
  },
  {
    id: 489,
    title: "refactor: exponential backoff retry logic for collectors",
    repo: "contoso/telemetry-platform",
    status: "active",
    reviewers: [],
    isDraft: true,
    isAgentPR: true,
    linesAdded: 287,
    linesRemoved: 134,
    branch: "agent/retry-logic-refactor-8834",
    createdAt: "2026-03-10T03:42:00Z",
  },
  {
    id: 486,
    title: "test: add snapshot tests for chart widgets",
    repo: "contoso/telemetry-platform",
    status: "active",
    reviewers: [{ name: "Andi Chamygurusamy", initials: "AC", hasUpcoming1on1: false }],
    isDraft: false,
    isAgentPR: false,
    linesAdded: 524,
    linesRemoved: 12,
    branch: "feature/widget-snapshot-tests",
    createdAt: "2026-03-09T16:00:00Z",
  },
  {
    id: 482,
    title: "refactor: consolidate collector config modules",
    repo: "contoso/telemetry-platform",
    status: "completed",
    reviewers: [{ name: "James Liu", initials: "JL", hasUpcoming1on1: false }],
    isDraft: false,
    isAgentPR: false,
    linesAdded: 189,
    linesRemoved: 267,
    branch: "cleanup/collector-config-refactor",
    createdAt: "2026-03-04T10:20:00Z",
  },
];

// ---------------------------------------------------------------------------
// Coding Agents
// ---------------------------------------------------------------------------

export const mockCodingAgents: CodingAgentTask[] = [
  {
    id: "ca-001",
    adoTaskId: 9012,
    taskTitle: "Timezone Offset in Weekly Report Aggregation",
    org: "contoso",
    tool: "claude-code",
    status: "testing",
    taskType: "code-change",
    branch: "agent/fix-timezone-offset-9012",
    progress: 80,
    steps: [
      { label: "Setup", status: "done" },
      { label: "Analyze", status: "done" },
      { label: "Implement", status: "done" },
      { label: "Test", status: "active" },
      { label: "PR", status: "pending" },
    ],
    startedAt: "2026-03-10T03:00:00Z",
    duration: "3h 45m",
  },
  {
    id: "ca-002",
    adoTaskId: 8834,
    taskTitle: "Retry Logic Refactor for Telemetry Collectors",
    org: "contoso",
    tool: "claude-code",
    status: "pr-submitted",
    taskType: "code-change",
    branch: "agent/retry-logic-refactor-8834",
    progress: 90,
    prNumber: 489,
    prUrl:
      "https://dev.azure.com/contoso/telemetry-platform/_git/telemetry-platform/pullrequest/489",
    steps: [
      { label: "Setup", status: "done" },
      { label: "Analyze", status: "done" },
      { label: "Implement", status: "done" },
      { label: "Test", status: "done" },
      { label: "PR", status: "done" },
    ],
    startedAt: "2026-03-10T01:30:00Z",
    duration: "2h 12m",
  },
  {
    id: "ca-003",
    adoTaskId: 8833,
    taskTitle: "Config Validation Utility",
    org: "contoso",
    tool: "claude-code",
    status: "done",
    taskType: "code-change",
    branch: "agent/config-validation-8833",
    progress: 100,
    prNumber: 484,
    prUrl:
      "https://dev.azure.com/contoso/telemetry-platform/_git/telemetry-platform/pullrequest/484",
    steps: [
      { label: "Setup", status: "done" },
      { label: "Analyze", status: "done" },
      { label: "Implement", status: "done" },
      { label: "Test", status: "done" },
      { label: "PR", status: "done" },
    ],
    startedAt: "2026-03-04T22:00:00Z",
    duration: "1h 38m",
  },
  {
    id: "ca-004",
    adoTaskId: 8835,
    taskTitle: "Error Handling Standardization",
    org: "contoso",
    tool: "agency-cli",
    status: "done",
    taskType: "code-change",
    branch: "agent/error-handling-8835",
    progress: 100,
    prNumber: 483,
    prUrl:
      "https://dev.azure.com/contoso/telemetry-platform/_git/telemetry-platform/pullrequest/483",
    steps: [
      { label: "Setup", status: "done" },
      { label: "Analyze", status: "done" },
      { label: "Implement", status: "done" },
      { label: "Test", status: "done" },
      { label: "PR", status: "done" },
    ],
    startedAt: "2026-03-03T20:00:00Z",
    duration: "2h 55m",
  },
];

// ---------------------------------------------------------------------------
// 1:1 Sessions
// ---------------------------------------------------------------------------

export const mockOneOnOneSessions: OneOnOneSession[] = [
  {
    id: "1on1-sarah-2026-03-10",
    person: "Sarah Mitchell",
    date: "2026-03-10",
    dateRange: { start: "2026-03-04", end: "2026-03-10" },
    status: "draft",
    content: `## 1:1 with Sarah (Manager)
### March 10, 2026

## My Updates (5 min)

- Shipped the telemetry pipeline batch processor — closes out the main Sprint 14 epic. PR #489 merged Friday after Ben's review.
- Reviewed 4 PRs this sprint including the schema migration (#485). Left detailed feedback on the Kafka partition rebalancing edge case that could cause data loss during rebalancing.
- Started integrating AI coding agents into my workflow — dispatched 2 tasks this sprint. Early results are promising for well-scoped implementation work.

## Topics to Discuss (15 min)

- **Sprint 15 scope:** I'd like to take ownership of the notification service redesign. I've been thinking about the architecture and have some ideas I want to run by Sarah before the planning session.
- **AI agent workflow:** Want to share early results from using coding agents and get her thoughts on expanding it to the team. Need her buy-in before proposing it at the team retro.
- **On-call rotation concern:** The current rotation has me covering 2 weekends in March. Want to discuss rebalancing with the team.

## Asks / Blockers (5 min)

- Need access to the production telemetry dashboard (Grafana) — currently only have staging. Blocker for validating the pipeline in prod.
- Would like Sarah's help unblocking the infrastructure team on the Redis cluster sizing request. Been waiting 5 days.

## Carried Forward from Last 1:1

- **Conference:** Sarah was checking budget for KubeCon EU in April (registration deadline March 15). Need an answer this week.
- **All-hands presentation:** I drafted a pitch on the caching layer architecture. Waiting for Sarah's feedback on whether the scope is right.

## My Recent Impact

- P95 latency improvement: 340ms → 89ms on the hot-path queries (caching layer shipped Sprint 13)
- Sprint 14: On track, main epic closed, 2 tasks remaining
- Code reviews: 4 this sprint, focused on quality and architecture feedback`,
    carryForward: [
      "KubeCon EU conference budget — need answer by March 15",
      "All-hands presentation pitch — waiting for Sarah's feedback",
      "On-call rotation rebalancing for March",
    ],
  },
  {
    id: "1on1-sarah-2026-03-03",
    person: "Sarah Mitchell",
    date: "2026-03-03",
    dateRange: { start: "2026-02-25", end: "2026-03-03" },
    status: "approved",
    content: `## 1:1 Notes — Sarah (Manager)
### March 3, 2026

## Summary

Good session. Shared my Sprint 14 progress — Sarah was pleased with the telemetry pipeline velocity. Discussed my interest in owning the notification service redesign for Sprint 15; she's supportive and will flag it during planning.

Brought up KubeCon EU (April). Sarah needs to check the travel budget with her manager. Early-bird deadline is March 15.

## Feedback Received

- Sarah appreciates the depth of my code reviews, especially the architecture-level feedback. She specifically mentioned the Kafka rebalancing catch as the kind of review that prevents production incidents.
- She encouraged me to share more of my architectural thinking with the broader team — suggested the engineering all-hands as a venue.

## My Action Items

- Draft a one-paragraph pitch for the all-hands presentation (caching layer architecture decisions) — due by next 1:1.
- Prepare a brief proposal for AI coding agent usage to discuss at team retro.

## Sarah's Action Items

- Check KubeCon EU travel budget with her manager.
- Add me to the Sprint 15 notification service redesign as owner in ADO.

## Carry-Forward

- Conference budget approval.
- All-hands presentation topic pitch.`,
    carryForward: ["KubeCon EU conference budget approval", "All-hands presentation topic pitch"],
  },
  {
    id: "1on1-sarah-2026-02-24",
    person: "Sarah Mitchell",
    date: "2026-02-24",
    dateRange: { start: "2026-02-18", end: "2026-02-24" },
    status: "approved",
    content: `## 1:1 Notes — Sarah (Manager)
### February 24, 2026

## Summary

Discussed Sprint 13 progress. The caching layer optimization shipped — P95 latency down 74%. Sarah was excited about the numbers and wants me to document the approach for the team wiki.

Raised a concern about feeling stretched between implementation work and code review load. Sarah agreed to protect morning focus blocks team-wide and batch review requests to afternoons.

I mentioned wanting to present at the next engineering all-hands. Sarah is supportive — we discussed potential topics. I'm leaning toward the caching layer story since it has clear before/after metrics.

## Feedback Received

- Sarah said my caching work was "exactly the kind of high-impact, self-directed initiative" she wants to see more of. Good signal for my next performance review.
- She noted I should be more vocal about sharing wins — the latency improvement deserved a broader announcement.

## My Action Items

- Write up the caching layer approach for the team wiki.
- Pick a specific topic for the all-hands presentation.

## Carry-Forward

- All-hands presentation topic selection.`,
    carryForward: ["All-hands presentation topic selection"],
  },
];

// ---------------------------------------------------------------------------
// Engage Posts
// ---------------------------------------------------------------------------

export const mockEngagePosts: EngagePost[] = [
  {
    id: "engage-001",
    status: "draft",
    sourceType: "daily-note",
    date: "2026-03-10",
    content:
      "Loving the productivity gains from integrating AI coding agents into our sprint workflow. In Sprint 14, our agent handled 3 well-scoped tasks autonomously, saving the team roughly 15 hours of implementation work. The key insight: clear acceptance criteria and good test coverage requirements make all the difference in agent output quality. What patterns have you found effective for human-AI collaboration in your engineering teams?",
    topics: ["AI", "engineering-productivity", "team-leadership"],
    valuesAlignment: 85,
  },
  {
    id: "engage-002",
    status: "draft",
    sourceType: "weekly-note",
    date: "2026-03-09",
    content:
      "Our team just shipped a caching layer optimization that reduced P95 latency by 74% -- from 340ms down to 89ms. The counterintuitive lesson: a write-through cache outperformed our initial lazy-loading approach by a wide margin for our specific hot-path query pattern. Sometimes the 'heavier' solution is actually the simpler one when you account for cache miss thundering herds. What's your experience with caching strategy trade-offs at scale?",
    topics: ["performance", "system-design", "caching"],
    valuesAlignment: 78,
  },
  {
    id: "engage-003",
    status: "published",
    sourceType: "1on1-note",
    date: "2026-03-01",
    content:
      "One of the most impactful things a senior engineer can do is create space for others to shine. This week, I watched a team member identify a critical failure mode in our architecture review that everyone else missed. Instead of jumping in with my own analysis, I asked her to walk the team through her reasoning. The result: deeper team understanding, higher confidence in the design, and a visible growth moment for her. Leadership isn't about having all the answers -- it's about creating the conditions where others can demonstrate theirs.",
    topics: ["leadership", "mentoring", "team-culture"],
    valuesAlignment: 92,
    rating: 4,
    reactions: 47,
    publishedAt: "2026-03-01T12:00:00Z",
  },
  {
    id: "engage-004",
    status: "published",
    sourceType: "manual",
    date: "2026-02-20",
    content:
      "We recently completed a dedicated tech-debt sprint and the results speak for themselves: 14 deprecated endpoints removed, 3 utility libraries consolidated, and CI pipeline upgraded to Node 22 LTS. The team's velocity in the following sprint actually increased by 8%. Tech debt isn't just about code quality -- it's about developer experience and sustainable pace. How does your team balance feature work with technical health?",
    topics: ["tech-debt", "engineering-culture", "developer-experience"],
    valuesAlignment: 88,
    rating: 5,
    reactions: 63,
    publishedAt: "2026-02-20T15:30:00Z",
  },
  {
    id: "engage-005",
    status: "discarded",
    sourceType: "daily-note",
    date: "2026-02-15",
    content:
      "Spent the day wrestling with a flaky integration test that was blocking our CI pipeline. After 3 hours of investigation, found it was a race condition in the test setup, not the production code. Reminder to self: always check the test harness before blaming the application.",
    topics: ["testing", "debugging"],
    valuesAlignment: 45,
  },
];

// ---------------------------------------------------------------------------
// Sprint Planning
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Agent Registry
// ---------------------------------------------------------------------------

export const mockAgentRegistry: AgentRegistryEntry[] = [
  {
    name: "briefing-agent",
    status: "success",
    lastRun: "2026-03-10T06:30:00Z",
    nextRun: "2026-03-11T06:30:00Z",
    enabled: true,
    queue: "scheduled",
    consecutiveFailures: 0,
  },
  {
    name: "standup-agent",
    status: "approval",
    lastRun: "2026-03-10T06:35:00Z",
    nextRun: "2026-03-11T06:35:00Z",
    enabled: true,
    queue: "scheduled",
    consecutiveFailures: 0,
  },
  {
    name: "daily-note-agent",
    status: "idle",
    lastRun: "2026-03-09T21:00:00Z",
    nextRun: "2026-03-10T21:00:00Z",
    enabled: true,
    queue: "scheduled",
    consecutiveFailures: 0,
  },
  {
    name: "weekly-note-agent",
    status: "idle",
    lastRun: "2026-03-07T18:00:00Z",
    nextRun: "2026-03-14T18:00:00Z",
    enabled: true,
    queue: "scheduled",
    consecutiveFailures: 0,
  },
  {
    name: "engage-agent",
    status: "approval",
    lastRun: "2026-03-10T07:00:00Z",
    nextRun: "2026-03-11T07:00:00Z",
    enabled: true,
    queue: "scheduled",
    consecutiveFailures: 0,
  },
  {
    name: "1on1-prep-agent",
    status: "success",
    lastRun: "2026-03-10T06:00:00Z",
    nextRun: "2026-03-17T06:00:00Z",
    enabled: true,
    queue: "scheduled",
    consecutiveFailures: 0,
  },
  {
    name: "coding-agent-orchestrator",
    status: "running",
    lastRun: "2026-03-10T03:00:00Z",
    nextRun: "2026-03-10T15:00:00Z",
    enabled: true,
    queue: "on-demand",
    consecutiveFailures: 0,
  },
  {
    name: "monthly-note-agent",
    status: "error",
    lastRun: "2026-03-01T06:00:00Z",
    nextRun: "2026-03-10T12:00:00Z",
    enabled: true,
    queue: "scheduled",
    consecutiveFailures: 2,
  },
];

// ---------------------------------------------------------------------------
// Approval Queue
// ---------------------------------------------------------------------------
// Retained for testing/seeding only — no longer used by API routes.

export const mockApprovalQueue: ApprovalQueueItem[] = [
  {
    id: "aq-001",
    agentName: "standup-agent",
    type: "Standup Draft",
    preview:
      "Yesterday: Completed code review for PR #485, continued event-driven ingestion design doc, paired with Priya on widget tests...",
    timestamp: "2026-03-10T06:35:00Z",
  },
  {
    id: "aq-002",
    agentName: "engage-agent",
    type: "Engage Post Draft",
    preview:
      "Loving the productivity gains from integrating AI coding agents into our sprint workflow...",
    timestamp: "2026-03-10T07:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// System Health
// ---------------------------------------------------------------------------

export const mockSystemHealth: SystemHealth = {
  tokenSpend7d: [8200, 9100, 7400, 11300, 9800, 10500, 12400],
  successRate: 94.2,
  totalFailures: 3,
  adoCacheFresh: true,
  adoCacheAge: "12 minutes ago",
  dlqCount: 1,
  embeddingBacklog: 23,
};

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export const mockSchedule: CalendarEvent[] = [
  {
    time: "9:30 AM",
    title: "Team Standup",
    duration: "15 min",
    isFocusBlock: false,
  },
  {
    time: "10:30 AM",
    title: "Focus Block",
    duration: "90 min",
    isFocusBlock: true,
  },
  {
    time: "2:00 PM",
    title: "1:1 with Sarah Mitchell",
    duration: "30 min",
    isFocusBlock: false,
  },
  {
    time: "3:30 PM",
    title: "Sprint 14 Board Review",
    duration: "30 min",
    isFocusBlock: false,
  },
];

// ---------------------------------------------------------------------------
// Focus Items
// ---------------------------------------------------------------------------

export const mockFocusItems: string[] = [
  "Finalize event-driven ingestion design doc before tomorrow's mid-sprint review",
  "Review agent PRs #488 and #489 -- Ben is blocked on downstream work",
  "Prepare 1:1 talking points for Sarah (2:00 PM today)",
];

// ---------------------------------------------------------------------------
// Quick Notes
// ---------------------------------------------------------------------------

export const mockQuickNotes: QuickNote[] = [
  {
    id: "qn-001",
    content: "Ask DevOps about staging env ETA in standup",
    timestamp: "2026-03-10T07:15:00Z",
    status: "approved",
  },
  {
    id: "qn-002",
    content: "Check if Dragonfly supports the new TTL policy we need for tenant isolation",
    timestamp: "2026-03-10T07:22:00Z",
    status: "approved",
  },
  {
    id: "qn-003",
    content: "Sarah's conference budget -- need to email manager today",
    timestamp: "2026-03-10T07:30:00Z",
    status: "resolved",
  },
];

// ---------------------------------------------------------------------------
// Token Budget
// ---------------------------------------------------------------------------

export const mockTokenBudget: TokenBudget = {
  used: 12400,
  budget: 100000,
  costEstimate: 1.86,
};
