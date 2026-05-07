import test from "node:test";
import assert from "node:assert/strict";
import {
  daysUntil,
  filterFestivals,
  formatMoney,
  isUrgent,
  sortFestivals,
  summarizeFestivals,
  scoreRadarCandidate,
  candidateToFestival,
  scoreFestivalMatch,
  rankFestivalMatches,
  betaFeedbackToCsv,
  betaFeedbackToText,
  buildBetaFeedbackReport,
  buildDemoWorkspaceReport,
  buildDeviceLabReport,
  buildRoadmapReport,
  buildSourceTrustReport,
  buildSubmissionPacket,
  buildFestivalIntelligence,
  buildAppShellReport,
  buildAccessConversionPreview,
  buildDeadlineCalendar,
  buildFestivalDetailReport,
  buildFestivalDataQualityReport,
  buildImportReviewReport,
  buildLaunchReadinessReport,
  buildOnboardingGuide,
  buildProductGuide,
  buildSettingsSummary,
  buildSubmissionSeasonPlan,
  buildSubmissionPipeline,
  buildTrialOnboardingFlow,
  buildWatchScanPlan,
  canUseAccessFeature,
  createWorkspaceBackup,
  createDemoWorkspace,
  deadlineCalendarToIcs,
  deadlineCalendarToText,
  deviceLabToCsv,
  deviceLabToText,
  demoWorkspaceToText,
  accessConversionToText,
  evaluateFestivalSourceTrust,
  buildFilmLibraryReport,
  getAccessSummary,
  getViewAccessGate,
  getWatchSourceHealth,
  filmLibraryToText,
  filmProjectToProfile,
  festivalDetailToText,
  festivalDataQualityToText,
  importReviewReportToText,
  intelligenceToText,
  launchReadinessToText,
  productGuideToText,
  settingsSummaryToText,
  seasonPlanToText,
  sourceTrustToText,
  normalizeAccessState,
  normalizeFilmLibrary,
  normalizeFilmProject,
  normalizeOnboardingState,
  normalizeBetaFeedbackItem,
  normalizeDeviceLabIssue,
  normalizePipelineItem,
  normalizeRoadmapItem,
  normalizeTrialProgress,
  normalizeUserPreferences,
  packetToText,
  pipelineToCsv,
  pipelineToText,
  preferencesToFilmProfile,
  parseWorkspaceBackupText,
  applyCandidateReviewPatch,
  createReviewAuditEntry,
  normalizeWatchSource,
  normalizeScoutLead,
  normalizeOrganizerSubmission,
  parseLeadImportText,
  summarizeWatchSources,
  summarizeBackupSections,
  summarizeScoutLeads,
  toCalendarStamp,
  trialOnboardingToText,
  FEEDBACK_STATUSES,
  PIPELINE_STAGES,
  ROADMAP_STATUSES,
  roadmapToCsv,
  roadmapToText
} from "../public/logic.js";

const now = new Date("2026-05-06T12:00:00Z");
const sample = [
  {
    id: "near",
    name: "Near AI Festival",
    shortName: "Near",
    status: "Accepting Submissions",
    deadline: "2026-05-10T12:00:00Z",
    description: "Animation showcase",
    fitSummary: "Best for animation",
    location: { city: "Online", country: "Global", region: "Online" },
    contentTypes: ["Animation"],
    strategyNotes: [],
    greenFlags: [],
    redFlags: [],
    duration: { min: 1, max: 8 },
    prizeMoney: 1000,
    entryFee: 10,
    confidence: 90,
    frequency: "Annual"
  },
  {
    id: "later",
    name: "Later Documentary Days",
    shortName: "Later",
    status: "Not Yet Open",
    deadline: "2026-09-10T12:00:00Z",
    description: "Documentary program",
    fitSummary: "Best for docs",
    location: { city: "Berlin", country: "Germany", region: "Europe" },
    contentTypes: ["Documentary"],
    strategyNotes: [],
    greenFlags: [],
    redFlags: [],
    duration: { min: 15, max: 45 },
    prizeMoney: 5000,
    entryFee: 40,
    confidence: 70,
    frequency: "One-Time"
  }
];

test("calculates deadline urgency", () => {
  assert.equal(daysUntil("2026-05-10T12:00:00Z", now), 4);
  assert.equal(isUrgent("2026-05-10T12:00:00Z", now), true);
  assert.equal(isUrgent("2026-09-10T12:00:00Z", now), false);
});

test("filters festivals by deadline, status, region, content, runtime, and prize", () => {
  const filters = {
    search: "animation",
    status: "Accepting Submissions",
    deadline: "30",
    region: "Online",
    type: "Animation",
    runtime: "short",
    prizeOnly: true,
    minPrize: 500,
    recurringOnly: true
  };
  assert.deepEqual(
    filterFestivals(sample, filters, now).map((festival) => festival.id),
    ["near"]
  );
});

test("sorts festivals by prize and confidence", () => {
  assert.deepEqual(
    sortFestivals(sample, "prize").map((festival) => festival.id),
    ["later", "near"]
  );
  assert.deepEqual(
    sortFestivals(sample, "confidence").map((festival) => festival.id),
    ["near", "later"]
  );
});

test("summarizes festival metrics", () => {
  const summary = summarizeFestivals(sample, now);
  assert.equal(summary.accepting, 1);
  assert.equal(summary.urgent, 1);
  assert.equal(summary.prizeTotal, 6000);
  assert.equal(summary.highConfidence, 1);
});

test("scores festival source trust and exports proof reports", () => {
  const trusted = {
    ...sample[0],
    sourceType: "Official website",
    lastVerified: "2026-05-02",
    confidence: 92,
    websiteUrl: "https://example.com/festival",
    submissionUrl: "https://example.com/festival/submit",
    greenFlags: ["Named organizer", "Clear rules"],
    communitySignals: [{ label: "Signal", tone: "positive", summary: "Filmmakers discussed it as credible." }]
  };
  const stale = {
    ...sample[1],
    sourceType: "Directory listing",
    lastVerified: "2025-10-01",
    confidence: 58,
    websiteUrl: "",
    submissionUrl: "",
    redFlags: ["No rules page"]
  };

  const trust = evaluateFestivalSourceTrust(trusted, now);
  assert.equal(trust.tier, "Verified");
  assert.equal(trust.freshnessLabel, "Current");
  assert.equal(trust.warnings.length, 0);

  const report = buildSourceTrustReport([trusted, stale], now);
  assert.equal(report.summary.total, 2);
  assert.equal(report.summary.verified, 1);
  assert.equal(report.summary.stale, 1);
  assert.equal(report.summary.needsReview, 1);
  assert.match(sourceTrustToText(report), /Source Trust Proof/u);
  assert.match(sourceTrustToText(report), /Near AI Festival/u);
});

test("scores festival data quality and highlights enrichment gaps", () => {
  const ready = {
    ...sample[0],
    sourceType: "Official website",
    lastVerified: "2026-05-02",
    websiteUrl: "https://example.com/festival",
    submissionUrl: "https://example.com/festival/submit",
    notificationDate: "2026-05-30",
    eventDate: "2026-06-14",
    formats: ["MP4", "MOV"],
    language: "English subtitles required",
    aspectRatio: ["16:9"],
    premiereStatus: "Any premiere status accepted",
    strategyNotes: ["Lead with story.", "Mention AI workflow.", "Keep runtime tight."],
    checklist: ["Export MP4.", "Write synopsis.", "Prepare stills."],
    greenFlags: ["Official rules", "Named organizer"],
    communitySignals: [{ label: "Trust", tone: "positive", summary: "Credible filmmaker discussion." }]
  };
  const thin = {
    ...sample[1],
    websiteUrl: "",
    submissionUrl: "",
    sourceType: "Directory listing",
    lastVerified: "2025-01-01",
    formats: [],
    language: "",
    aspectRatio: [],
    premiereStatus: "",
    strategyNotes: [],
    checklist: [],
    communitySignals: []
  };

  const report = buildFestivalDataQualityReport([ready, thin], now);
  assert.equal(report.summary.total, 2);
  assert.equal(report.summary.subscriberReady, 1);
  assert.equal(report.summary.needsEnrichment, 1);
  assert.ok(report.rows[0].missing.includes("website link"));
  const text = festivalDataQualityToText(report);
  assert.match(text, /Festival Data Quality/u);
  assert.match(text, /three strategy notes/u);
});

test("formats money and calendar dates", () => {
  assert.equal(formatMoney(0), "No prize listed");
  assert.equal(formatMoney(1000), "$1,000");
  assert.equal(toCalendarStamp("2026-05-10T12:00:00Z"), "20260510T120000Z");
});

test("builds deadline calendar reports and local exports", () => {
  const report = buildDeadlineCalendar(sample, {
    windowDays: 45,
    status: "Accepting Submissions",
    region: "Online"
  }, now);
  assert.equal(report.summary.total, 1);
  assert.equal(report.summary.next7, 1);
  assert.equal(report.summary.feeTotal, 10);
  assert.equal(report.months.length, 1);
  assert.equal(report.nextDeadline.name, "Near AI Festival");
  assert.match(report.actions[0], /Near AI Festival/u);

  const text = deadlineCalendarToText(report);
  assert.match(text, /LaurelPilot Deadline Calendar/u);
  assert.match(text, /Near AI Festival/u);

  const ics = deadlineCalendarToIcs(report);
  assert.match(ics, /BEGIN:VCALENDAR/u);
  assert.match(ics, /SUMMARY:Near AI Festival submission deadline/u);
});

test("builds budget-aware submission season plans", () => {
  const festivalSet = [
    sample[0],
    {
      ...sample[0],
      id: "free",
      name: "Free AI Shorts Lab",
      deadline: "2026-06-18T12:00:00Z",
      entryFee: 0,
      prizeMoney: 0,
      confidence: 84
    },
    {
      ...sample[0],
      id: "premium",
      name: "Premium Prize Circuit",
      deadline: "2026-07-12T12:00:00Z",
      entryFee: 200,
      prizeMoney: 20000,
      confidence: 92
    }
  ];
  const plan = buildSubmissionSeasonPlan(
    festivalSet,
    {
      title: "Signal Bloom",
      runtime: 7,
      contentType: "Animation",
      goal: "Prestige",
      region: "Any",
      mode: "Any",
      maxFee: 20,
      publicAlready: false
    },
    {
      budget: 20,
      targetCount: 2,
      windowDays: 180,
      strategy: "Budget saver",
      region: "Any"
    },
    now
  );

  assert.equal(plan.summary.selectedCount, 2);
  assert.ok(plan.summary.totalFees <= 20);
  assert.equal(plan.selected[0].priority, 1);
  assert.ok(plan.skipped.some((target) => target.festival.id === "premium"));
  assert.ok(plan.actions.some((action) => action.includes("budget")));

  const text = seasonPlanToText(plan);
  assert.match(text, /LaurelPilot Submission Season Plan/u);
  assert.match(text, /Selected Festivals/u);
});

test("scores radar candidates and converts approved candidates into festivals", () => {
  const candidate = {
    id: "test-candidate",
    name: "Test Candidate Festival",
    deadline: "2026-05-25T12:00:00Z",
    notificationDate: "2026-06-01",
    eventDate: "2026-06-10",
    location: { city: "Online", country: "Global", region: "Online", mode: "Online" },
    prizeMoney: 1000,
    entryFee: 10,
    frequency: "Annual",
    duration: { min: 1, max: 10 },
    contentTypes: ["Animation"],
    formats: ["MP4"],
    premiereStatus: "Any premiere status accepted",
    language: "English subtitles recommended",
    aspectRatio: ["16:9"],
    description: "A test candidate.",
    websiteUrl: "https://example.com",
    submissionUrl: "https://example.com/submit",
    suggestedFit: "Best for tests.",
    suggestedStrategy: ["Check the rules."],
    extractedSignals: ["Rules page found"],
    evidence: {
      officialWebsite: true,
      submissionLink: true,
      deadline: true,
      namedOrganizers: true,
      venue: true,
      rulesPage: true,
      socialPresence: true,
      pastEdition: false,
      transparentFees: true,
      prizeDetails: false
    },
    warningSignals: []
  };
  const scored = scoreRadarCandidate(candidate);
  assert.equal(scored.recommendation, "Auto-publish");
  assert.equal(scored.score, 90);
  const festival = candidateToFestival(candidate, "2026-05-06");
  assert.equal(festival.id, "promoted-test-candidate");
  assert.equal(festival.sourceType, "Radar promoted");
  assert.equal(festival.confidence, 90);
});

test("penalizes risky radar candidates", () => {
  const scored = scoreRadarCandidate({
    evidence: {
      officialWebsite: true,
      submissionLink: true,
      deadline: true,
      namedOrganizers: false,
      venue: false,
      rulesPage: false,
      socialPresence: false,
      pastEdition: false,
      transparentFees: false,
      prizeDetails: false
    },
    warningSignals: ["noOrganizer", "noVenue", "tooManyCategories"]
  });
  assert.equal(scored.recommendation, "Reject");
  assert.equal(scored.riskLevel, "High");
});

test("scores festival matches from a film profile", () => {
  const match = scoreFestivalMatch(
    sample[0],
    {
      runtime: 7,
      contentType: "Animation",
      goal: "Prestige",
      region: "Online",
      mode: "Any",
      maxFee: 20,
      publicAlready: false
    },
    now
  );
  assert.equal(match.tier, "Strong fit");
  assert.ok(match.score >= 78);
  assert.ok(match.reasons.some((reason) => reason.includes("Runtime fits")));
});

test("ranks stronger festival matches first", () => {
  const ranked = rankFestivalMatches(
    sample,
    {
      runtime: 7,
      contentType: "Animation",
      goal: "Audience feedback",
      region: "Online",
      mode: "Any",
      maxFee: 20,
      publicAlready: false
    },
    now
  );
  assert.equal(ranked[0].festival.id, "near");
});

test("normalizes film libraries and reports active project matches", () => {
  const library = normalizeFilmLibrary({
    activeId: "film-b",
    projects: [
      normalizeFilmProject({
        id: "film-a",
        title: "Signal Bloom",
        runtime: 7,
        contentType: "Animation",
        goal: "Prestige",
        region: "Online",
        mode: "Any",
        maxFee: 25,
        stage: "Festival strategy"
      }, {}, now),
      normalizeFilmProject({
        id: "film-b",
        title: "Quiet Archive",
        runtime: 22,
        contentType: "Documentary",
        goal: "Networking",
        region: "Europe",
        mode: "Physical",
        maxFee: 50,
        stage: "Submitting"
      }, {}, now)
    ]
  }, {}, now);

  assert.equal(library.activeId, "film-b");
  assert.equal(filmProjectToProfile(library.projects[1]).title, "Quiet Archive");

  const report = buildFilmLibraryReport(library, sample, [
    { filmTitle: "Signal Bloom", festivalId: "near" }
  ], now);
  assert.equal(report.summary.projectCount, 2);
  assert.equal(report.summary.submittedCount, 1);
  assert.equal(report.active.title, "Quiet Archive");
  assert.equal(report.activeMatches[0].festival.id, "later");

  const text = filmLibraryToText(report);
  assert.match(text, /LaurelPilot Film Library/u);
  assert.match(text, /Quiet Archive/u);
});

test("builds festival detail decision reports and text briefs", () => {
  const report = buildFestivalDetailReport(
    sample[0],
    {
      title: "Signal Bloom",
      runtime: 7,
      contentType: "Animation",
      goal: "Prestige",
      region: "Online",
      mode: "Any",
      maxFee: 25,
      publicAlready: false
    },
    sample,
    now
  );

  assert.equal(report.festivalName, "Near AI Festival");
  assert.equal(report.match.tier, "Strong fit");
  assert.equal(report.riskLevel, "Low");
  assert.equal(report.related[0].id, "later");
  assert.ok(report.readinessScore >= 45);

  const text = festivalDetailToText(report);
  assert.match(text, /Festival Decision Brief/u);
  assert.match(text, /Near AI Festival/u);
  assert.match(text, /Prep Actions/u);
});

test("builds submission pipeline boards and local exports", () => {
  const pipelineItem = normalizePipelineItem(
    {
      id: "pipe-1",
      festivalId: "near",
      filmTitle: "Signal Bloom",
      stage: "Preparing",
      priority: "High",
      dueDate: "2026-05-09",
      notes: "Poster still needs a festival-safe export."
    },
    now
  );
  const report = buildSubmissionPipeline(
    [pipelineItem],
    sample,
    {
      runtime: 7,
      contentType: "Animation",
      goal: "Prestige",
      region: "Online",
      mode: "Any",
      maxFee: 25
    },
    [
      {
        festivalId: "later",
        filmTitle: "Quiet Archive",
        status: "Submitted",
        submissionDate: "2026-05-01",
        notes: "Confirmation saved."
      }
    ],
    now
  );
  assert.equal(report.summary.total, 2);
  assert.equal(report.summary.preparing, 1);
  assert.equal(report.summary.submitted, 1);
  assert.equal(report.summary.urgent, 1);
  assert.equal(report.summary.feeExposure, 10);
  assert.equal(report.summary.focus, 1);
  assert.equal(report.summary.overBudget, 0);
  assert.equal(report.summary.readyToSubmit, 1);
  assert.ok(report.summary.boardScore >= 70);
  assert.equal(report.focusQueue[0].nextAction.label, "Finish today");
  assert.equal(report.cards.find((card) => card.festivalId === "later").editable, false);
  assert.equal(report.columns.find((column) => column.stage === "Preparing").count, 1);
  assert.equal(report.columns.find((column) => column.stage === "Submitted").count, 1);
  assert.equal(report.columns.find((column) => column.stage === "Preparing").tone, "amber");
  assert.ok(PIPELINE_STAGES.includes("Follow Up"));
  assert.match(pipelineToText(report), /LaurelPilot Submission Pipeline/u);
  assert.match(pipelineToText(report), /Focus Queue/u);
  assert.match(pipelineToCsv(report), /Signal Bloom/u);
  assert.match(pipelineToCsv(report), /Next Action/u);
});

test("builds device lab reports and responsive QA exports", () => {
  const issues = [
    normalizeDeviceLabIssue(
      {
        id: "device-1",
        device: "mobile-stack",
        view: "Pipeline",
        severity: "Blocker",
        status: "Open",
        title: "Pipeline action buttons wrap poorly",
        notes: "Next and Prep buttons need a cleaner mobile stack."
      },
      now
    ),
    normalizeDeviceLabIssue(
      {
        id: "device-2",
        device: "desktop-command",
        view: "Product",
        severity: "Polish",
        status: "Fixed",
        title: "Hero logo spacing tightened"
      },
      now
    )
  ];
  const report = buildDeviceLabReport(issues, { launchScore: 82 }, now);
  assert.equal(report.summary.total, 2);
  assert.equal(report.summary.open, 1);
  assert.equal(report.summary.blockers, 1);
  assert.equal(report.deviceRows.find((row) => row.id === "mobile-stack").blockerCount, 1);
  assert.equal(report.checklist.find((item) => item.id === "mobile").ready, true);
  assert.equal(report.checklist.find((item) => item.id === "launch").ready, true);
  assert.match(deviceLabToText(report), /LaurelPilot Device Lab/u);
  assert.match(deviceLabToCsv(report), /Pipeline action buttons/u);
});

test("builds beta feedback reports and triage exports", () => {
  const feedback = [
    normalizeBetaFeedbackItem(
      {
        id: "feedback-1",
        source: "Maya",
        view: "Pricing",
        type: "Pricing objection",
        priority: "Launch blocker",
        status: "New",
        title: "Annual price needs a clearer value promise",
        notes: "Tester understood the product, but wanted stronger proof before paying."
      },
      now
    ),
    normalizeBetaFeedbackItem(
      {
        id: "feedback-2",
        source: "Private beta",
        view: "Pipeline",
        type: "Feature request",
        priority: "High",
        status: "Planned",
        title: "Add reminders for festival follow-up"
      },
      now
    ),
    normalizeBetaFeedbackItem(
      {
        id: "feedback-3",
        source: "Raymond",
        view: "Device Lab",
        type: "UX note",
        priority: "Medium",
        status: "Fixed",
        title: "Mobile headline was too wide"
      },
      now
    )
  ];
  const report = buildBetaFeedbackReport(feedback, { launchScore: 83 }, now);
  assert.equal(report.summary.total, 3);
  assert.equal(report.summary.open, 2);
  assert.equal(report.summary.blockers, 1);
  assert.equal(report.summary.fixed, 1);
  assert.equal(report.columns.find((column) => column.status === "New").count, 1);
  assert.equal(report.themes.find((theme) => theme.type === "Pricing objection").blockerCount, 1);
  assert.ok(FEEDBACK_STATUSES.includes("Archived"));
  assert.match(betaFeedbackToText(report), /Beta Feedback Desk/u);
  assert.match(betaFeedbackToCsv(report), /Annual price/u);
});

test("builds roadmap reports and changelog exports", () => {
  const roadmap = [
    normalizeRoadmapItem(
      {
        id: "roadmap-1",
        title: "Roadmap and Changelog Center",
        type: "Feature",
        status: "Shipped",
        impact: "High",
        release: "Beta 0.8",
        owner: "Raymond",
        notes: "Tracks planned and shipped product work.",
        shippedAt: "2026-05-06T12:00:00Z"
      },
      now
    ),
    normalizeRoadmapItem(
      {
        id: "roadmap-2",
        title: "Connect feedback blockers to roadmap",
        type: "Reliability",
        status: "In Progress",
        impact: "Revenue critical",
        release: "Beta 0.9",
        owner: "Raymond"
      },
      now
    )
  ];
  const report = buildRoadmapReport(roadmap, { launchScore: 84, feedbackBlockers: 1 }, now);
  assert.equal(report.summary.total, 2);
  assert.equal(report.summary.active, 1);
  assert.equal(report.summary.shipped, 1);
  assert.equal(report.summary.revenueCritical, 1);
  assert.equal(report.changelog[0].title, "Roadmap and Changelog Center");
  assert.equal(report.columns.find((column) => column.status === "In Progress").count, 1);
  assert.ok(ROADMAP_STATUSES.includes("Paused"));
  assert.match(roadmapToText(report), /Roadmap And Changelog/u);
  assert.match(roadmapToCsv(report), /Beta 0.9/u);
});

test("creates a complete demo workspace and tour export", () => {
  const workspace = createDemoWorkspace(now);
  assert.equal(workspace.sections.filmProfile.title, "Signal Bloom");
  assert.equal(workspace.sections.filmLibrary.activeId, "demo-film-signal-bloom");
  assert.equal(workspace.sections.filmLibrary.projects.length, 2);
  assert.equal(workspace.sections.promotedFestivals.length, 2);
  assert.equal(workspace.sections.pipelineItems.length, 3);
  assert.equal(workspace.sections.submissions.length, 2);
  assert.equal(workspace.sections.preferences.startView, "demo");

  const summary = summarizeBackupSections(workspace.sections);
  assert.equal(summary.presentSections, 18);
  assert.ok(summary.totalRecords >= 30);

  const report = buildDemoWorkspaceReport(workspace, workspace.sections);
  assert.equal(report.metrics.activeFilm, "Signal Bloom");
  assert.equal(report.metrics.tourSteps, 6);
  assert.ok(report.sectionRows.some((entry) => entry.key === "roadmapItems" && entry.count === 3));
  assert.match(demoWorkspaceToText(report), /LaurelPilot Demo Workspace/u);
  assert.match(demoWorkspaceToText(report), /Prep Pack/u);
});

test("builds a submission prep packet and text export", () => {
  const packet = buildSubmissionPacket(
    sample[0],
    {
      title: "Signal Bloom",
      runtime: 7,
      contentType: "Animation",
      goal: "Prestige",
      region: "Online",
      mode: "Any",
      maxFee: 20,
      publicAlready: false
    },
    {
      logline: "A filmmaker loses control of an artificial dream.",
      aiTools: "Runway and Midjourney",
      synopsis: "A short synopsis.",
      directorStatement: "A short statement.",
      privateNotes: "Submit before lunch."
    },
    now
  );
  assert.equal(packet.summary.festival, "Near AI Festival");
  assert.ok(packet.materials.includes("AI tools disclosure"));
  assert.ok(packet.positioning.some((item) => item.includes("Runway and Midjourney")));
  assert.equal(packet.readiness.score, 75);
  assert.equal(packet.readiness.tier, "Almost ready");
  assert.equal(packet.readiness.checks.length, 8);
  assert.match(packet.submissionAngle, /Signal Bloom should be positioned/u);
  assert.equal(packet.feeDecision.label, "Shortlist carefully");
  assert.ok(packet.materialsByPhase.some((phase) => phase.phase === "Must finish before submission"));
  assert.equal(packet.timeline.length, 4);
  const text = packetToText(packet);
  assert.match(text, /Signal Bloom -> Near AI Festival/u);
  assert.match(text, /Readiness: Almost ready/u);
  assert.match(text, /Submission Angle/u);
  assert.match(text, /Fee decision: Shortlist carefully/u);
  assert.match(text, /Materials Checklist/u);
});

test("builds festival intelligence briefs with strategy, risks, and export text", () => {
  const brief = buildFestivalIntelligence(
    sample[0],
    {
      title: "Signal Bloom",
      runtime: 7,
      contentType: "Animation",
      goal: "Prestige",
      region: "Online",
      mode: "Any",
      maxFee: 20,
      publicAlready: false
    },
    "Acceptance strategy",
    now
  );
  assert.equal(brief.festivalName, "Near AI Festival");
  assert.equal(brief.match.tier, "Strong fit");
  assert.equal(brief.valueVerdict, "Worth shortlisting");
  assert.ok(brief.acceptanceAngles.some((item) => item.includes("Signal Bloom")));
  assert.ok(brief.programmerLens.length >= 2);
  assert.ok(brief.prepMoves.some((item) => item.includes("AI")));
  const text = intelligenceToText(brief);
  assert.match(text, /Near AI Festival Intelligence Brief/u);
  assert.match(text, /Acceptance Angles/u);
  assert.match(text, /Risk Checks/u);
});

test("normalizes organizer submissions into radar candidates", () => {
  const candidate = normalizeOrganizerSubmission(
    {
      name: "New AI Festival",
      websiteUrl: "https://example.com/new-ai",
      submissionUrl: "https://example.com/new-ai/submit",
      deadline: "2026-06-20T23:59:00Z",
      city: "Austin",
      country: "United States",
      region: "North America",
      mode: "Physical",
      organizerName: "Jane Producer",
      venueName: "Cinema Hall",
      hasClearRules: true,
      feesTransparent: true,
      prizeMoney: 2000,
      prizeDetails: true,
      entryFee: 25,
      maxDuration: 12,
      contentTypes: "Animation, Hybrid",
      formats: "MP4, MOV"
    },
    now
  );
  assert.equal(candidate.discoverySource, "Organizer Self-Submission");
  assert.equal(candidate.location.city, "Austin");
  assert.deepEqual(candidate.contentTypes, ["Animation", "Hybrid"]);
  assert.equal(candidate.evidence.namedOrganizers, true);
  assert.equal(candidate.warningSignals.length, 0);
});

test("normalizes scout leads into radar candidates", () => {
  const candidate = normalizeScoutLead({
    id: "scout-test-festival",
    name: "Scout Test Festival",
    capturedAt: "2026-05-06T12:00:00Z",
    discoverySource: "Festival Directory Sweep",
    websiteUrl: "https://example.com/scout",
    submissionUrl: "https://example.com/scout/submit",
    deadline: "2026-06-20T23:59:00Z",
    location: { city: "Online", country: "Global", region: "Online", mode: "Online" },
    contentTypes: ["Animation", "Hybrid"],
    formats: ["MP4"],
    evidence: {
      officialWebsite: true,
      submissionLink: true,
      deadline: true,
      namedOrganizers: false,
      venue: true,
      rulesPage: true,
      socialPresence: false,
      pastEdition: false,
      transparentFees: true,
      prizeDetails: false
    }
  }, now);
  assert.equal(candidate.id, "scout-test-festival");
  assert.equal(candidate.discoverySource, "Festival Directory Sweep");
  assert.equal(candidate.evidence.submissionLink, true);
  assert.ok(candidate.warningSignals.includes("noOrganizer"));
});

test("summarizes scout lead readiness", () => {
  const summary = summarizeScoutLeads([
    {
      id: "ready-lead",
      name: "Ready Lead Festival",
      deadline: "2026-06-20T23:59:00Z",
      websiteUrl: "https://example.com/ready",
      submissionUrl: "https://example.com/ready/submit",
      evidence: {
        officialWebsite: true,
        submissionLink: true,
        deadline: true,
        namedOrganizers: true,
        venue: true,
        rulesPage: true,
        socialPresence: true,
        pastEdition: true,
        transparentFees: true,
        prizeDetails: true
      }
    },
    {
      id: "risky-lead",
      name: "Risky Lead Awards",
      deadline: "2026-06-20T23:59:00Z",
      websiteUrl: "https://example.com/risky",
      submissionUrl: "https://example.com/risky/pay",
      contentTypes: ["Animation", "Live Action", "Hybrid", "Documentary", "Music Video", "Experimental"],
      evidence: {
        officialWebsite: true,
        submissionLink: true,
        deadline: true,
        namedOrganizers: false,
        venue: false,
        rulesPage: false,
        socialPresence: false,
        pastEdition: false,
        transparentFees: false,
        prizeDetails: false
      },
      warningSignals: ["vagueAwards", "aggressiveDiscounts"]
    }
  ], ["ready-lead"]);
  assert.equal(summary.total, 2);
  assert.equal(summary.imported, 1);
  assert.equal(summary.ready, 1);
  assert.equal(summary.highRisk, 1);
});

test("parses CSV lead imports with row-level validation", () => {
  const parsed = parseLeadImportText(
    [
      "name,deadline,websiteUrl,submissionUrl,contentTypes,organizerName,rulesPage,transparentFees,prizeDetails,prizeMoney",
      '"Imported AI Festival",2026-07-01T23:59:00Z,https://example.com/imported,https://example.com/imported/submit,"Animation, Hybrid",Jane Producer,yes,yes,yes,4000',
      ',2026-07-02T23:59:00Z,https://example.com/bad,https://example.com/bad/submit,Animation,,,,,'
    ].join("\n"),
    now
  );
  assert.equal(parsed.candidates.length, 1);
  assert.equal(parsed.errors.length, 1);
  assert.equal(parsed.candidates[0].name, "Imported AI Festival");
  assert.equal(parsed.candidates[0].evidence.namedOrganizers, true);
  assert.deepEqual(parsed.candidates[0].contentTypes, ["Animation", "Hybrid"]);
});

test("parses JSON lead imports", () => {
  const parsed = parseLeadImportText(
    JSON.stringify({
      leads: [
        {
          name: "JSON AI Festival",
          deadline: "2026-07-10T23:59:00Z",
          websiteUrl: "https://example.com/json",
          submissionUrl: "https://example.com/json/submit",
          location: { city: "Online", country: "Global", region: "Online", mode: "Online" },
          contentTypes: ["Experimental"],
          evidence: {
            namedOrganizers: true,
            rulesPage: true,
            transparentFees: true
          }
        }
      ]
    }),
    now
  );
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.candidates[0].name, "JSON AI Festival");
  assert.equal(parsed.candidates[0].discoverySource, "Local Import");
});

test("builds import review reports from scraper run packets", () => {
  const parsed = parseLeadImportText(
    JSON.stringify({
      runId: "scraper-run-1",
      sourceName: "Local Bot Packet",
      sourceType: "Official source sweep",
      capturedAt: now.toISOString(),
      sourceUrl: "local://source-sweep",
      leads: [
        {
          id: "clean-packet-festival",
          name: "Clean Packet Festival",
          deadline: "2026-07-10T23:59:00Z",
          websiteUrl: "https://example.com/clean",
          submissionUrl: "https://example.com/clean/submit",
          location: { city: "Online", country: "Global", region: "Online", mode: "Online" },
          contentTypes: ["Animation"],
          evidence: {
            namedOrganizers: true,
            rulesPage: true,
            socialPresence: true,
            pastEdition: true,
            transparentFees: true,
            prizeDetails: true
          }
        },
        {
          id: "duplicate-packet-festival",
          name: "Duplicate Packet Festival",
          deadline: "2026-07-11T23:59:00Z",
          websiteUrl: "https://example.com/duplicate",
          submissionUrl: "https://example.com/duplicate/submit",
          location: { city: "Online", country: "Global", region: "Online", mode: "Online" },
          contentTypes: ["Animation"],
          evidence: {
            namedOrganizers: true,
            rulesPage: true,
            transparentFees: true
          }
        }
      ]
    }),
    now
  );
  const report = buildImportReviewReport(
    parsed.candidates,
    parsed.errors,
    [],
    [{ name: "Duplicate Packet Festival", websiteUrl: "https://example.com/duplicate" }],
    parsed.manifest,
    now
  );

  assert.equal(parsed.manifest.sourceName, "Local Bot Packet");
  assert.equal(parsed.candidates[0].discoverySource, "Local Bot Packet");
  assert.equal(report.summary.parsed, 2);
  assert.equal(report.summary.clean, 1);
  assert.equal(report.summary.duplicates, 1);
  assert.equal(report.summary.stageable, 1);
  assert.equal(report.rows.find((row) => row.candidate.name === "Duplicate Packet Festival").stageStatus, "Duplicate");
  const text = importReviewReportToText(report);
  assert.match(text, /Import Review Pipeline/u);
  assert.match(text, /Local Bot Packet/u);
});

test("applies candidate review patches and creates audit entries", () => {
  const candidate = {
    id: "review-test",
    name: "Review Test Festival",
    description: "Before edit.",
    deadline: "2026-07-01T23:59:00Z",
    websiteUrl: "https://example.com/review",
    submissionUrl: "https://example.com/review/submit",
    prizeMoney: 0,
    entryFee: 25,
    frequency: "Annual",
    duration: { min: 1, max: 10 },
    contentTypes: ["Animation"],
    formats: ["MP4"],
    premiereStatus: "Verify on rules page",
    language: "Verify on rules page",
    evidence: {
      officialWebsite: true,
      submissionLink: true,
      deadline: true,
      namedOrganizers: false,
      venue: true,
      rulesPage: false,
      socialPresence: false,
      pastEdition: false,
      transparentFees: false,
      prizeDetails: false
    },
    warningSignals: ["noOrganizer"],
    extractedSignals: [],
    suggestedFit: "Before fit.",
    suggestedStrategy: ["Verify."]
  };
  const patched = applyCandidateReviewPatch(candidate, {
    name: "Review Test Festival Edited",
    prizeMoney: "3000",
    maxDuration: "14",
    contentTypes: "Animation, Hybrid",
    evidence: {
      namedOrganizers: true,
      rulesPage: true,
      transparentFees: true,
      prizeDetails: true
    },
    warningSignals: "",
    extractedSignals: "Organizer verified, Rules archived"
  }, now);
  assert.equal(patched.name, "Review Test Festival Edited");
  assert.equal(patched.prizeMoney, 3000);
  assert.equal(patched.duration.max, 14);
  assert.deepEqual(patched.contentTypes, ["Animation", "Hybrid"]);
  assert.equal(patched.evidence.namedOrganizers, true);
  assert.deepEqual(patched.warningSignals, []);
  const audit = createReviewAuditEntry("edited", patched, "Organizer confirmed.", now);
  assert.equal(audit.candidateId, "review-test");
  assert.equal(audit.action, "edited");
  assert.equal(audit.note, "Organizer confirmed.");
});

test("normalizes watch sources and builds a due scan plan", () => {
  const source = normalizeWatchSource(
    {
      name: "AI Festival Watch Page",
      url: "https://example.com/watch",
      sourceType: "Official festival site",
      trustLevel: 6,
      cadence: "Daily",
      keywords: "AI film festival, submissions",
      coverage: "Rules, Deadlines",
      lastChecked: "2026-05-05T12:00:00Z"
    },
    now
  );
  assert.equal(source.id, "watch-ai-festival-watch-page");
  assert.equal(source.trustLevel, 5);
  assert.deepEqual(source.keywords, ["AI film festival", "submissions"]);
  const health = getWatchSourceHealth(source, now);
  assert.equal(health.due, true);
  assert.equal(health.label, "Due");

  const summary = summarizeWatchSources([
    source,
    {
      name: "Paused Source",
      status: "Paused",
      cadence: "Daily",
      keywords: "AI film festival"
    }
  ], now);
  assert.equal(summary.total, 2);
  assert.equal(summary.active, 1);
  assert.equal(summary.paused, 1);
  assert.equal(summary.highTrust, 1);
  assert.equal(summary.due, 1);
  assert.equal(summary.keywordCount, 2);

  const plan = buildWatchScanPlan([source], now);
  assert.equal(plan.dueSources.length, 1);
  assert.equal(plan.queries.length, 2);
  assert.match(plan.summary, /2 keyword checks/u);
});

test("creates and parses local workspace backups", () => {
  const backup = createWorkspaceBackup(
    {
      filmProfile: { title: "Signal Bloom", runtime: 7 },
      prepDraft: { festivalId: "near" },
      pipelineItems: [{ festivalId: "near", filmTitle: "Signal Bloom", stage: "Preparing" }],
      deviceLabIssues: [{ device: "mobile-stack", view: "Pipeline", title: "Button stack", status: "Open" }],
      betaFeedbackItems: [{ source: "Maya", type: "UX note", title: "Beta note", status: "New" }],
      roadmapItems: [{ title: "Roadmap center", status: "Shipped", release: "Beta 0.8" }],
      submissions: [{ festivalId: "near", status: "Submitted" }],
      promotedFestivals: [sample[0]],
      organizerCandidates: [],
      rejectedCandidates: ["candidate-1"],
      scoutRuns: [{ runAt: "2026-05-06T12:00:00Z" }],
      radarAudit: [{ action: "approved" }],
      watchSources: [{ name: "Official Watch", keywords: ["AI"] }],
      watchRuns: [],
      accessState: { planId: "launch", status: "Active" },
      onboarding: { completedSteps: ["film-profile"] },
      filmLibrary: { activeId: "film-current", projects: [{ id: "film-current", title: "Signal Bloom" }] }
    },
    now
  );
  assert.equal(backup.product, "LaurelPilot");
  assert.equal(backup.schemaVersion, 1);
  assert.equal(backup.summary.sections, 18);
  assert.ok(backup.summary.records >= 6);

  const parsed = parseWorkspaceBackupText(JSON.stringify(backup));
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.sections.filmProfile.title, "Signal Bloom");
  assert.equal(parsed.summary.presentSections, 18);
  assert.ok(parsed.summary.entries.some((entry) => entry.key === "submissions" && entry.count === 1));
  assert.ok(parsed.summary.entries.some((entry) => entry.key === "pipelineItems" && entry.count === 1));
  assert.ok(parsed.summary.entries.some((entry) => entry.key === "deviceLabIssues" && entry.count === 1));
  assert.ok(parsed.summary.entries.some((entry) => entry.key === "betaFeedbackItems" && entry.count === 1));
  assert.ok(parsed.summary.entries.some((entry) => entry.key === "roadmapItems" && entry.count === 1));

  const sectionSummary = summarizeBackupSections(parsed.sections);
  assert.equal(sectionSummary.totalRecords, parsed.summary.totalRecords);

  const bad = parseWorkspaceBackupText("{nope");
  assert.equal(bad.backup, null);
  assert.equal(bad.errors.length, 1);
});

test("summarizes local access plans and feature entitlements", () => {
  const preview = normalizeAccessState({}, now);
  const previewSummary = getAccessSummary(preview, now);
  assert.equal(previewSummary.plan.id, "preview");
  assert.equal(previewSummary.status, "Preview");
  assert.equal(canUseAccessFeature(preview, "discover"), true);
  assert.equal(canUseAccessFeature(preview, "vault"), false);
  assert.ok(previewSummary.lockedCount > 0);

  const launch = normalizeAccessState({ planId: "launch" }, now);
  const launchSummary = getAccessSummary(launch, now);
  assert.equal(launchSummary.plan.name, "Launch Pass");
  assert.equal(launchSummary.isPaid, true);
  assert.equal(launchSummary.renewalDaysLeft, 365);
  assert.equal(canUseAccessFeature(launch, "vault"), true);

  const trial = normalizeAccessState({ trialActive: true }, now);
  const trialSummary = getAccessSummary(trial, now);
  assert.equal(trialSummary.status, "Trial");
  assert.equal(trialSummary.trialDaysLeft, 14);
});

test("builds an access conversion preview and export brief", () => {
  const preview = normalizeAccessState({}, now);
  const report = buildAccessConversionPreview(preview, {
    festivalCount: 7,
    sourceCount: 7,
    verifiedSources: 5,
    averageSourceTrust: 87,
    plannedSubmissions: 2,
    activeProjects: 1
  }, now);

  assert.equal(report.currentPlan.id, "preview");
  assert.equal(report.targetPlan.id, "launch");
  assert.ok(report.valueScore >= 70);
  assert.ok(report.upgradeFeatureCount > 0);
  assert.equal(report.monthlyEquivalent, 2.42);
  assert.match(report.message, /fewer missed deadlines/u);
  assert.ok(report.receiptRows.some((row) => row.label === "Source confidence"));

  const text = accessConversionToText(report);
  assert.match(text, /LaurelPilot Access Conversion Preview/u);
  assert.match(text, /Upgrade Unlocks/u);
});

test("identifies locked premium views from the local access state", () => {
  const preview = normalizeAccessState({}, now);
  const proofGate = getViewAccessGate("proof", preview);
  assert.equal(proofGate.locked, true);
  assert.equal(proofGate.featureId, "proof");
  assert.match(proofGate.title, /subscriber/u);

  const matchGate = getViewAccessGate("match", preview);
  assert.equal(matchGate, null);

  const launch = normalizeAccessState({ planId: "launch" }, now);
  assert.equal(getViewAccessGate("proof", launch).locked, false);
  assert.equal(getViewAccessGate("radar", launch).locked, false);
});

test("builds trial onboarding steps for the paid feature walkthrough", () => {
  const preview = normalizeAccessState({}, now);
  const previewFlow = buildTrialOnboardingFlow(preview, normalizeTrialProgress({}, now), {}, now);
  assert.equal(previewFlow.trialLive, false);
  assert.equal(previewFlow.completedCount, 0);
  assert.equal(previewFlow.steps[0].locked, true);
  assert.equal(previewFlow.nextStep.id, "proof");
  assert.match(trialOnboardingToText(previewFlow), /Start the local trial/u);

  const trial = normalizeAccessState({
    planId: "launch",
    trialActive: true,
    trialStartedAt: now.toISOString()
  }, now);
  const progress = normalizeTrialProgress({
    visited: ["proof", "calendar", "proof", "unknown"],
    startedAt: now.toISOString()
  }, now);
  const flow = buildTrialOnboardingFlow(trial, progress, {
    sourceTrust: 87,
    calendarItems: 5,
    prepReady: true,
    pipelineItems: 1
  }, now);

  assert.equal(flow.trialLive, true);
  assert.equal(flow.completedCount, 2);
  assert.equal(flow.nextStep.id, "prep");
  assert.equal(flow.progressPercent, 50);
  assert.equal(flow.metrics.sourceTrust, 87);
  assert.equal(flow.metrics.calendarItems, 5);
  assert.ok(flow.steps.every((step) => step.locked === false));

  const text = trialOnboardingToText(flow);
  assert.match(text, /LaurelPilot Trial Onboarding Flow/u);
  assert.match(text, /Generate a prep packet \[Next\]/u);
});

test("builds onboarding progress from a film profile and starter matches", () => {
  const onboarding = normalizeOnboardingState({ shortlistReviewed: true }, now);
  const guide = buildOnboardingGuide(
    sample,
    {
      title: "Signal Bloom",
      runtime: 7,
      contentType: "Animation",
      goal: "Prestige",
      region: "Online",
      mode: "Any",
      maxFee: 20,
      publicAlready: false
    },
    onboarding,
    now
  );
  assert.equal(guide.totalSteps, 4);
  assert.equal(guide.completedCount, 3);
  assert.equal(guide.progress, 75);
  assert.equal(guide.nextStep.id, "first-action");
  assert.equal(guide.topMatches[0].festival.id, "near");
  assert.equal(guide.strongFits, 1);
  assert.ok(guide.suggestedActions.some((action) => action.includes("Strategy Tips")));
});

test("builds app shell install readiness reports", () => {
  const partial = buildAppShellReport({
    manifestLinked: true,
    serviceWorkerAvailable: true,
    serviceWorkerRegistered: false,
    cacheReady: false,
    noExternalApi: true,
    online: true
  });
  assert.equal(partial.readyCount, 2);
  assert.equal(partial.mode, "Browser tab");
  assert.match(partial.summary, /2\/5/u);

  const ready = buildAppShellReport({
    manifestLinked: true,
    serviceWorkerAvailable: true,
    serviceWorkerRegistered: true,
    cacheReady: true,
    cachedAssets: 8,
    noExternalApi: true,
    installPromptReady: true,
    installed: false,
    online: false
  });
  assert.equal(ready.readiness, 100);
  assert.equal(ready.mode, "Offline capable");
  assert.ok(ready.checks.every((check) => check.ready));
});

test("builds launch readiness reports and text exports", () => {
  const festivalSet = Array.from({ length: 6 }, (_, index) => ({
    ...sample[0],
    id: `launch-${index}`,
    name: `Launch Festival ${index + 1}`,
    deadline: `2026-06-${String(10 + index).padStart(2, "0")}T12:00:00Z`,
    confidence: index === 0 ? 76 : 88,
    status: index < 3 ? "Accepting Submissions" : "Not Yet Open"
  }));
  const candidate = {
    id: "launch-candidate",
    evidence: {
      officialWebsite: true,
      submissionLink: true,
      deadline: true,
      namedOrganizers: true,
      venue: true,
      rulesPage: true,
      socialPresence: true,
      pastEdition: true,
      transparentFees: true,
      prizeDetails: true
    },
    warningSignals: []
  };
  const watchSources = [
    { name: "Official Festival Sites", trustLevel: 5, keywords: "AI film festival, AI submissions" },
    { name: "AI Filmmaker Communities", trustLevel: 4, keywords: "AI cinema awards, synthetic film" },
    { name: "Submission Platforms", trustLevel: 4, keywords: "generative film festival, animation AI" }
  ];
  const profile = {
    title: "Signal Bloom",
    runtime: 7,
    contentType: "Animation",
    goal: "Prestige",
    region: "Online",
    mode: "Any",
    maxFee: 20,
    publicAlready: false
  };
  const onboarding = {
    completedSteps: ["film-profile", "submission-goals", "starter-shortlist"],
    shortlistReviewed: true,
    completedAt: now.toISOString()
  };
  const backup = createWorkspaceBackup({
    filmProfile: profile,
    prepDraft: { filmTitle: "Signal Bloom", festivalId: "launch-0" },
    submissions: [{ id: "submission-1" }],
    organizerCandidates: [candidate],
    watchSources,
    accessState: { planId: "launch" },
    onboarding
  }, now);

  const report = buildLaunchReadinessReport({
    festivals: festivalSet,
    candidates: [candidate, { ...candidate, id: "launch-candidate-2" }],
    submissions: [{ id: "submission-1" }],
    watchSources,
    radarAudit: [{ action: "Approve" }],
    accessState: { planId: "launch" },
    onboarding,
    filmProfile: profile,
    prepDraft: { filmTitle: "Signal Bloom", festivalId: "launch-0" },
    installStatus: {
      manifestLinked: true,
      serviceWorkerAvailable: true,
      serviceWorkerRegistered: true,
      cacheReady: true,
      cachedAssets: 8,
      noExternalApi: true,
      installPromptReady: true,
      online: true
    },
    backupSections: backup.sections
  }, now);

  assert.equal(report.totalChecks, 8);
  assert.equal(report.blockerCount, 0);
  assert.ok(report.score >= 90);
  assert.equal(report.metrics.festivals, 6);
  const text = launchReadinessToText(report);
  assert.match(text, /LaurelPilot Launch Readiness/u);
  assert.match(text, /Festival Directory/u);
});

test("builds product guide workflows and text exports", () => {
  const guide = buildProductGuide(
    { workflowId: "first-submission", phase: "Submit" },
    {
      festivalCount: 8,
      matchCount: 3,
      submissionCount: 0,
      candidateCount: 2,
      activeSourceCount: 3,
      radarAuditCount: 1,
      scoutRunCount: 1,
      backupRecords: 9,
      accessPlan: "Launch Pass",
      filmProfile: {
        title: "Signal Bloom",
        runtime: 7,
        contentType: "Animation"
      },
      prepDraft: { festivalId: "near", filmTitle: "Signal Bloom" },
      launchReport: { stage: "Private beta", blockerCount: 1, score: 82 },
      installReport: { readyCount: 4 }
    }
  );
  assert.equal(guide.workflow.label, "Plan a first submission");
  assert.equal(guide.phase, "Submit");
  assert.equal(guide.totalSteps, 6);
  assert.equal(guide.readyCount, 5);
  assert.equal(guide.nextStep.title, "Track the outcome");
  assert.ok(guide.toolCards.some((tool) => tool.label === "Season Plan"));
  assert.ok(guide.toolCards.some((tool) => tool.label === "Prep Pack"));
  const text = productGuideToText(guide);
  assert.match(text, /LaurelPilot Product Guide/u);
  assert.match(text, /Track the outcome/u);
});

test("normalizes preferences and builds settings summaries", () => {
  const preferences = normalizeUserPreferences({
    startView: "match",
    productMode: "Studio",
    defaultRegion: "Europe",
    defaultMode: "Hybrid",
    defaultContentType: "Documentary",
    defaultGoal: "Networking",
    defaultRuntime: 240,
    maxFee: -10,
    includePublicFilms: true,
    localOnlyReminder: true,
    exportReminder: false
  }, now);
  assert.equal(preferences.defaultRuntime, 180);
  assert.equal(preferences.maxFee, 0);
  assert.equal(preferences.startView, "match");
  assert.equal(preferences.defaultRegion, "Europe");

  const profile = preferencesToFilmProfile(preferences, { title: "Archive Light" });
  assert.equal(profile.title, "Archive Light");
  assert.equal(profile.contentType, "Documentary");
  assert.equal(profile.region, "Europe");
  assert.equal(profile.publicAlready, true);

  const summary = buildSettingsSummary(preferences, {
    currentProfile: { title: "Archive Light" },
    localDataCount: 8,
    launchScore: 82
  });
  assert.equal(summary.cards.length, 4);
  assert.match(summary.summary, /Studio mode/u);
  assert.ok(summary.actions.some((action) => action.includes("Documentary")));
  const text = settingsSummaryToText(summary);
  assert.match(text, /LaurelPilot Preferences/u);
  assert.match(text, /Fee ceiling/u);
});
