import { festivals, radarCandidates, radarSources, scoutLeads, scoutSources } from "./festivals.js";
import {
  applyCandidateReviewPatch,
  APP_SHELL_ASSETS,
  ACCESS_PLANS,
  accessConversionToText,
  betaFeedbackToCsv,
  betaFeedbackToText,
  buildAppShellReport,
  buildAccessConversionPreview,
  buildBetaFeedbackReport,
  buildDemoWorkspaceReport,
  buildDeadlineCalendar,
  buildDeviceLabReport,
  buildFestivalDetailReport,
  buildFestivalDataQualityReport,
  buildImportReviewReport,
  buildLaunchReadinessReport,
  buildRoadmapReport,
  buildSourceTrustReport,
  buildSubmissionPipeline,
  canUseAccessFeature,
  buildOnboardingGuide,
  buildProductGuide,
  buildSettingsSummary,
  buildSubmissionSeasonPlan,
  createWorkspaceBackup,
  createDemoWorkspace,
  deadlineCalendarToIcs,
  deadlineCalendarToText,
  deviceLabToCsv,
  deviceLabToText,
  demoWorkspaceToText,
  buildFilmLibraryReport,
  buildFestivalIntelligence,
  buildSubmissionPacket,
  buildTrialOnboardingFlow,
  buildWatchScanPlan,
  candidateToFestival,
  createReviewAuditEntry,
  daysUntil,
  escapeCsv,
  evaluateFestivalSourceTrust,
  filterFestivals,
  formatMoney,
  formatShortDate,
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
  isUrgent,
  rankFestivalMatches,
  normalizeWatchSource,
  normalizeAccessState,
  normalizeBetaFeedbackItem,
  normalizeDeviceLabIssue,
  normalizeOnboardingState,
  normalizeScoutLead,
  parseWorkspaceBackupText,
  parseLeadImportText,
  normalizeUserPreferences,
  normalizeFilmLibrary,
  normalizeFilmProject,
  normalizePipelineItem,
  normalizeTrialProgress,
  normalizeRoadmapItem,
  scoreRadarCandidate,
  normalizeOrganizerSubmission,
  sortFestivals,
  summarizeBackupSections,
  summarizeWatchSources,
  summarizeScoutLeads,
  summarizeFestivals,
  packetToText,
  preferencesToFilmProfile,
  pipelineToCsv,
  pipelineToText,
  DEVICE_PROFILES,
  DEVICE_QA_VIEWS,
  FEEDBACK_PRIORITIES,
  FEEDBACK_STATUSES,
  FEEDBACK_TYPES,
  PIPELINE_STAGES,
  productGuideToText,
  ROADMAP_IMPACTS,
  ROADMAP_STATUSES,
  ROADMAP_TYPES,
  roadmapToCsv,
  roadmapToText,
  settingsSummaryToText,
  seasonPlanToText,
  sourceTrustToText,
  toCalendarStamp,
  trialOnboardingToText,
  SEASON_STRATEGIES
} from "./logic.js";

const STORAGE_KEY = "laurelpilot_submissions";
const PROMOTED_KEY = "laurelpilot_promoted_festivals";
const REJECTED_KEY = "laurelpilot_rejected_candidates";
const PROFILE_KEY = "laurelpilot_film_profile";
const FILM_LIBRARY_KEY = "laurelpilot_film_library";
const PREP_KEY = "laurelpilot_prep_draft";
const PIPELINE_KEY = "laurelpilot_pipeline_items";
const ORGANIZER_KEY = "laurelpilot_organizer_candidates";
const SCOUT_RUN_KEY = "laurelpilot_scout_runs";
const RADAR_AUDIT_KEY = "laurelpilot_radar_audit";
const WATCHLIST_KEY = "laurelpilot_watch_sources";
const WATCH_RUN_KEY = "laurelpilot_watch_runs";
const VAULT_LOG_KEY = "laurelpilot_vault_log";
const ACCESS_KEY = "laurelpilot_access_state";
const TRIAL_TOUR_KEY = "laurelpilot_trial_tour";
const ONBOARDING_KEY = "laurelpilot_onboarding_state";
const INSTALL_LOG_KEY = "laurelpilot_install_log";
const LAUNCH_AUDIT_KEY = "laurelpilot_launch_audits";
const DEVICE_LAB_KEY = "laurelpilot_device_lab_issues";
const BETA_FEEDBACK_KEY = "laurelpilot_beta_feedback_items";
const ROADMAP_KEY = "laurelpilot_roadmap_items";
const PREFERENCES_KEY = "laurelpilot_preferences";

const DEFAULT_PROFILE = {
  title: "",
  runtime: 8,
  contentType: "Animation",
  goal: "Prestige",
  region: "Any",
  mode: "Any",
  maxFee: 35,
  publicAlready: false
};

const VALID_VIEWS = new Set(["product", "onboarding", "demo", "films", "install", "launch", "device", "feedback", "roadmap", "guide", "settings", "access", "discover", "proof", "calendar", "season", "intelligence", "match", "prep", "pipeline", "submissions", "scout", "watchlist", "vault", "import", "radar", "submit"]);

const IMPORT_SAMPLE = `{
  "runId": "local-scraper-demo-2026-05-07",
  "sourceName": "Local Scraper Packet",
  "sourceType": "Manual bot output",
  "capturedAt": "2026-05-07T09:00:00Z",
  "sourceUrl": "local://scraper-output/aifilmfestivals",
  "notes": "Demo packet showing clean, review, hold, and duplicate intake outcomes.",
  "leads": [
    {
      "id": "import-lumen-ai-cinema-prize-2026",
      "name": "Lumen AI Cinema Prize",
      "deadline": "2026-07-24T23:59:00-04:00",
      "websiteUrl": "https://example.com/lumen-ai-cinema-prize",
      "submissionUrl": "https://example.com/lumen-ai-cinema-prize/submit",
      "city": "Toronto",
      "country": "Canada",
      "region": "North America",
      "mode": "Hybrid",
      "entryFee": 22,
      "prizeMoney": 18000,
      "maxDuration": 12,
      "contentTypes": "Animation, Hybrid, Experimental",
      "formats": "MP4, MOV",
      "organizerName": "Lumen Screen Lab",
      "venueName": "Toronto Media Centre",
      "rulesPage": "yes",
      "socialPresence": "yes",
      "pastEdition": "yes",
      "transparentFees": "yes",
      "prizeDetails": "yes",
      "description": "Curated prize program for AI-assisted short films with named jury, rules, and a live screening night.",
      "suggestedFit": "Best for polished AI-assisted shorts that can compete on craft, concept, and live audience impact.",
      "suggestedStrategy": "Use premiere language if relevant, lead with finished-film quality, prepare an AI workflow disclosure."
    },
    {
      "id": "import-synthetic-realities-showcase-2026",
      "name": "Synthetic Realities Showcase",
      "deadline": "2026-07-04T23:59:00+02:00",
      "websiteUrl": "https://example.com/synthetic-realities-showcase",
      "submissionUrl": "https://example.com/synthetic-realities-showcase/submit",
      "city": "Amsterdam",
      "country": "Netherlands",
      "region": "Europe",
      "mode": "Physical",
      "entryFee": 32,
      "prizeMoney": 7000,
      "maxDuration": 20,
      "contentTypes": "Documentary, Hybrid, Experimental",
      "formats": "MP4, MOV",
      "organizerName": "Synthetic Realities Collective",
      "rulesPage": "yes",
      "transparentFees": "yes",
      "prizeDetails": "yes",
      "warningSignals": "noVenue",
      "description": "New mixed-media program for synthetic documentaries, hybrid shorts, and experimental AI cinema."
    },
    {
      "id": "import-neon-prompt-awards-2026",
      "name": "Neon Prompt Awards",
      "deadline": "2026-06-30T23:59:00Z",
      "websiteUrl": "https://example.com/neon-prompt-awards",
      "submissionUrl": "https://example.com/neon-prompt-awards/pay",
      "city": "Online",
      "country": "Global",
      "region": "Online",
      "mode": "Online",
      "entryFee": 39,
      "prizeMoney": 0,
      "maxDuration": 45,
      "contentTypes": "Animation, Live Action, Hybrid, Documentary, Music Video, Experimental, Other",
      "formats": "MP4",
      "warningSignals": "vagueAwards, noOrganizer, aggressiveDiscounts, tooManyCategories",
      "description": "High-volume online awards page for short AI videos, social edits, and prompt experiments."
    },
    {
      "id": "duplicate-reply-ai-film-festival-2026",
      "name": "Reply AI Film Festival",
      "deadline": "2026-06-01T23:59:00+02:00",
      "websiteUrl": "https://www.reply.com/en/artificial-intelligence/reply-ai-film-festival",
      "submissionUrl": "https://aiff.reply.com/",
      "city": "Venice",
      "country": "Italy",
      "region": "Europe",
      "mode": "Physical",
      "entryFee": 0,
      "prizeMoney": 15000,
      "maxDuration": 10,
      "contentTypes": "Animation, Live Action, Hybrid, Experimental",
      "formats": "MP4, MOV",
      "organizerName": "Reply",
      "rulesPage": "yes",
      "transparentFees": "yes",
      "prizeDetails": "yes",
      "description": "Duplicate of an existing subscriber-directory record."
    }
  ]
}`;

function getDefaultWatchSources() {
  const sourceMeta = {
    "official-watchlist": {
      url: "https://aif.runwayml.com/",
      sourceType: "Official festival site",
      trustLevel: 5
    },
    "directory-sweep": {
      url: "https://filmfreeway.com/festivals",
      sourceType: "Submission platform search",
      trustLevel: 3
    },
    "community-signal-scan": {
      url: "local community signal queue",
      sourceType: "Community discussion",
      trustLevel: 4
    },
    "organizer-inbox": {
      url: "local organizer intake queue",
      sourceType: "Organizer intake",
      trustLevel: 4
    }
  };
  return scoutSources.map((source) => normalizeWatchSource({
    id: source.id,
    name: source.name,
    url: sourceMeta[source.id]?.url || "",
    sourceType: sourceMeta[source.id]?.sourceType || "Festival directory",
    status: source.status === "Quiet" ? "Paused" : "Active",
    cadence: source.cadence === "Live" ? "Daily" : source.cadence,
    trustLevel: sourceMeta[source.id]?.trustLevel || (source.status === "Healthy" ? 4 : 3),
    keywords: source.coverage,
    coverage: source.coverage,
    note: source.note,
    lastChecked: source.lastRun
  }, new Date("2026-05-06T02:30:00Z")));
}

function getInitialView() {
  const requestedView = new URLSearchParams(window.location.search).get("view");
  if (VALID_VIEWS.has(requestedView)) {
    return requestedView;
  }
  try {
    const preferences = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || "{}");
    if (VALID_VIEWS.has(preferences.startView)) {
      return preferences.startView;
    }
  } catch {
    return "product";
  }
  return "product";
}

const initialFilmProfile = loadJson(PROFILE_KEY, DEFAULT_PROFILE);
const initialFilmLibrary = normalizeFilmLibrary(loadJson(FILM_LIBRARY_KEY, {}), initialFilmProfile);

const state = {
  view: getInitialView(),
  display: "table",
  sort: "deadline",
  selected: new Set(),
  activeFestivalId: null,
  filters: {
    search: "",
    status: "All",
    deadline: "30",
    region: "All",
    type: "All",
    runtime: "All",
    prizeOnly: false,
    minPrize: 0,
    recurringOnly: false
  },
  proofNotice: "",
  calendar: {
    range: "90",
    status: "All",
    region: "All",
    notice: ""
  },
  season: {
    budget: 120,
    targetCount: 5,
    windowDays: "180",
    strategy: "Balanced",
    region: "Any",
    notice: ""
  },
  submissions: loadSubmissions(),
  promotedFestivals: loadJson(PROMOTED_KEY, []),
  rejectedCandidates: loadJson(REJECTED_KEY, []),
  filmProfile: initialFilmProfile,
  filmLibrary: initialFilmLibrary,
  editingFilmId: initialFilmLibrary.activeId,
  filmNotice: "",
  prepDraft: loadJson(PREP_KEY, {}),
  pipelineItems: loadJson(PIPELINE_KEY, []),
  pipelineNotice: "",
  organizerCandidates: loadJson(ORGANIZER_KEY, []),
  scoutRuns: loadJson(SCOUT_RUN_KEY, []),
  radarAudit: loadJson(RADAR_AUDIT_KEY, []),
  watchSources: loadJson(WATCHLIST_KEY, getDefaultWatchSources()),
  watchRuns: loadJson(WATCH_RUN_KEY, []),
  vaultLog: loadJson(VAULT_LOG_KEY, []),
  vaultPreview: null,
  accessState: normalizeAccessState(loadJson(ACCESS_KEY, {})),
  trialProgress: normalizeTrialProgress(loadJson(TRIAL_TOUR_KEY, {})),
  onboarding: normalizeOnboardingState(loadJson(ONBOARDING_KEY, {})),
  demoNotice: "",
  installLog: loadJson(INSTALL_LOG_KEY, []),
  installPrompt: null,
  installNotice: "",
  launchAudits: loadJson(LAUNCH_AUDIT_KEY, []),
  launchNotice: "",
  deviceLabIssues: loadJson(DEVICE_LAB_KEY, []),
  deviceLabNotice: "",
  betaFeedbackItems: loadJson(BETA_FEEDBACK_KEY, []),
  betaFeedbackNotice: "",
  roadmapItems: loadJson(ROADMAP_KEY, []),
  roadmapNotice: "",
  guideWorkflow: "first-submission",
  guidePhase: "Submit",
  guideNotice: "",
  preferences: normalizeUserPreferences(loadJson(PREFERENCES_KEY, {})),
  settingsNotice: "",
  installStatus: {
    manifestLinked: true,
    serviceWorkerAvailable: "serviceWorker" in navigator,
    serviceWorkerRegistered: false,
    cacheReady: false,
    cachedAssets: 0,
    noExternalApi: true,
    installPromptReady: false,
    installed: false,
    online: navigator.onLine
  },
  radarSelected: new Set(),
  editingCandidateId: null,
  intelligenceFestivalId: "",
  intelligenceFocus: "Acceptance strategy",
  importCandidates: [],
  importErrors: [],
  importManifest: {}
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const refs = {
  sidebar: $("#sidebar"),
  menuButton: $("#menu-button"),
  closeMenuButton: $("#close-menu-button"),
  searchInput: $("#search-input"),
  statusFilter: $("#status-filter"),
  deadlineFilter: $("#deadline-filter"),
  regionFilter: $("#region-filter"),
  typeFilter: $("#type-filter"),
  runtimeFilter: $("#runtime-filter"),
  prizeToggle: $("#prize-toggle"),
  prizeFilter: $("#prize-filter"),
  prizeValue: $("#prize-value"),
  recurringToggle: $("#recurring-toggle"),
  clearFilters: $("#clear-filters"),
  sortSelect: $("#sort-select"),
  resultHeading: $("#result-heading"),
  acceptingCount: $("#accepting-count"),
  urgentCount: $("#urgent-count"),
  prizeTotal: $("#prize-total"),
  confidenceCount: $("#confidence-count"),
  proofAverage: $("#proof-average"),
  proofVerified: $("#proof-verified"),
  proofStale: $("#proof-stale"),
  proofReview: $("#proof-review"),
  proofQuality: $("#proof-quality"),
  proofReady: $("#proof-ready"),
  proofEnrich: $("#proof-enrich"),
  proofStrategy: $("#proof-strategy"),
  proofMessage: $("#proof-message"),
  proofActions: $("#proof-actions"),
  proofRows: $("#proof-rows"),
  proofCopy: $("#proof-copy"),
  proofDownload: $("#proof-download"),
  calendarRange: $("#deadline-calendar-range"),
  calendarStatus: $("#deadline-calendar-status"),
  calendarRegion: $("#deadline-calendar-region"),
  calendarCount: $("#deadline-calendar-count"),
  calendarNext7: $("#deadline-calendar-next7"),
  calendarFees: $("#deadline-calendar-fees"),
  calendarPrizes: $("#deadline-calendar-prizes"),
  calendarMessage: $("#deadline-calendar-message"),
  calendarTimeline: $("#deadline-calendar-timeline"),
  calendarMonths: $("#deadline-calendar-months"),
  calendarActions: $("#deadline-calendar-actions"),
  calendarCopy: $("#deadline-calendar-copy"),
  calendarDownloadIcs: $("#deadline-calendar-download-ics"),
  calendarDownloadPlan: $("#deadline-calendar-download-plan"),
  seasonBudget: $("#season-budget"),
  seasonBudgetValue: $("#season-budget-value"),
  seasonTargets: $("#season-targets"),
  seasonWindow: $("#season-window"),
  seasonStrategy: $("#season-strategy"),
  seasonRegion: $("#season-region"),
  seasonSelected: $("#season-selected"),
  seasonFees: $("#season-fees"),
  seasonFit: $("#season-fit"),
  seasonPrize: $("#season-prize"),
  seasonMessage: $("#season-message"),
  seasonActions: $("#season-actions"),
  seasonSlate: $("#season-slate"),
  seasonMonths: $("#season-months"),
  seasonSkipped: $("#season-skipped"),
  seasonHandoff: $("#season-handoff"),
  seasonPrep: $("#season-prep"),
  seasonCopy: $("#season-copy"),
  seasonDownload: $("#season-download"),
  seasonPipeline: $("#season-pipeline"),
  tableWrap: $("#table-wrap"),
  tableBody: $("#festival-table-body"),
  festivalGrid: $("#festival-grid"),
  intelligenceFestival: $("#intelligence-festival"),
  intelligenceFocus: $("#intelligence-focus"),
  intelligencePreview: $("#intelligence-preview"),
  intelMatchScore: $("#intel-match-score"),
  intelRiskCount: $("#intel-risk-count"),
  intelSignalCount: $("#intel-signal-count"),
  intelPrepCount: $("#intel-prep-count"),
  copyIntelligence: $("#copy-intelligence"),
  downloadIntelligence: $("#download-intelligence"),
  accountPlanName: $("#account-plan-name"),
  accountPlanCopy: $("#account-plan-copy"),
  accessPlanName: $("#access-plan-name"),
  accessStatus: $("#access-status"),
  accessRenewal: $("#access-renewal"),
  accessLocked: $("#access-locked"),
  accessIncluded: $("#access-included"),
  accessValueScore: $("#access-value-score"),
  accessUpgradeLift: $("#access-upgrade-lift"),
  accessValueTier: $("#access-value-tier"),
  accessHoursSaved: $("#access-hours-saved"),
  accessMonthlyValue: $("#access-monthly-value"),
  accessMessage: $("#access-message"),
  accessConversionActions: $("#access-conversion-actions"),
  accessPreviewCards: $("#access-preview-cards"),
  accessReceiptList: $("#access-receipt-list"),
  accessObjectionGrid: $("#access-objection-grid"),
  trialMessage: $("#trial-message"),
  trialProgress: $("#trial-progress"),
  trialNextStep: $("#trial-next-step"),
  trialDaysLeft: $("#trial-days-left"),
  trialVisited: $("#trial-visited"),
  trialPipelineCount: $("#trial-pipeline-count"),
  trialStepList: $("#trial-step-list"),
  trialCopy: $("#trial-copy"),
  trialReset: $("#trial-reset"),
  accessPlanGrid: $("#access-plan-grid"),
  accessFeatureGrid: $("#access-feature-grid"),
  accessStartTrial: $("#access-start-trial"),
  accessActivateLaunch: $("#access-activate-launch"),
  accessCopyBrief: $("#access-copy-brief"),
  accessDownloadBrief: $("#access-download-brief"),
  accessReset: $("#access-reset"),
  onboardProgress: $("#onboard-progress"),
  onboardStepCount: $("#onboard-step-count"),
  onboardStrongCount: $("#onboard-strong-count"),
  onboardUrgentCount: $("#onboard-urgent-count"),
  onboardNextStep: $("#onboard-next-step"),
  onboardTitle: $("#onboard-title"),
  onboardRuntime: $("#onboard-runtime"),
  onboardType: $("#onboard-type"),
  onboardGoal: $("#onboard-goal"),
  onboardRegion: $("#onboard-region"),
  onboardMode: $("#onboard-mode"),
  onboardFee: $("#onboard-fee"),
  onboardFeeValue: $("#onboard-fee-value"),
  onboardPublic: $("#onboard-public"),
  onboardMessage: $("#onboard-message"),
  onboardingSteps: $("#onboarding-steps"),
  onboardingMatches: $("#onboarding-matches"),
  onboardingActions: $("#onboarding-actions"),
  onboardSave: $("#onboard-save"),
  onboardSample: $("#onboard-sample"),
  onboardComplete: $("#onboard-complete"),
  onboardReset: $("#onboard-reset"),
  demoSections: $("#demo-sections"),
  demoRecords: $("#demo-records"),
  demoFilm: $("#demo-film"),
  demoTourCount: $("#demo-tour-count"),
  demoMessage: $("#demo-message"),
  demoActions: $("#demo-actions"),
  demoSectionGrid: $("#demo-section-grid"),
  demoTour: $("#demo-tour"),
  demoLoad: $("#demo-load"),
  demoReset: $("#demo-reset"),
  demoCopy: $("#demo-copy"),
  filmProjectCount: $("#film-project-count"),
  filmActiveTitle: $("#film-active-title"),
  filmStrongFits: $("#film-strong-fits"),
  filmSubmittedCount: $("#film-submitted-count"),
  filmMessage: $("#film-library-message"),
  filmProjectId: $("#film-project-id"),
  filmTitle: $("#film-title"),
  filmStage: $("#film-stage"),
  filmRuntime: $("#film-runtime"),
  filmType: $("#film-type"),
  filmGoal: $("#film-goal"),
  filmRegion: $("#film-region"),
  filmMode: $("#film-mode"),
  filmFee: $("#film-fee"),
  filmFeeValue: $("#film-fee-value"),
  filmPublic: $("#film-public"),
  filmLogline: $("#film-logline"),
  filmNotes: $("#film-notes"),
  filmCards: $("#film-cards"),
  filmActions: $("#film-actions"),
  filmTopMatches: $("#film-top-matches"),
  filmNew: $("#film-new"),
  filmSave: $("#film-save"),
  filmUseMatch: $("#film-use-match"),
  filmCopy: $("#film-copy"),
  filmDownload: $("#film-download"),
  installReadiness: $("#install-readiness"),
  installReadyCount: $("#install-ready-count"),
  installMode: $("#install-mode"),
  installCacheCount: $("#install-cache-count"),
  installOnline: $("#install-online"),
  installMessage: $("#install-message"),
  installChecklist: $("#install-checklist"),
  installAssetList: $("#install-asset-list"),
  installLog: $("#install-log"),
  installButton: $("#install-button"),
  installRunCheck: $("#install-run-check"),
  installClearLog: $("#install-clear-log"),
  launchScore: $("#launch-score"),
  launchStage: $("#launch-stage"),
  launchReadyCount: $("#launch-ready-count"),
  launchBlockerCount: $("#launch-blocker-count"),
  launchMessage: $("#launch-message"),
  launchChecklist: $("#launch-checklist"),
  launchActions: $("#launch-actions"),
  launchMetrics: $("#launch-metrics"),
  launchLog: $("#launch-log"),
  launchRun: $("#launch-run"),
  launchCopy: $("#launch-copy"),
  launchDownload: $("#launch-download"),
  launchClearLog: $("#launch-clear-log"),
  deviceScore: $("#device-score"),
  deviceOpen: $("#device-open"),
  deviceBlockers: $("#device-blockers"),
  deviceCoverage: $("#device-coverage"),
  deviceMessage: $("#device-message"),
  deviceProfileGrid: $("#device-profile-grid"),
  deviceChecklist: $("#device-checklist"),
  deviceIssueList: $("#device-issue-list"),
  deviceIssueId: $("#device-issue-id"),
  deviceView: $("#device-view-select"),
  deviceProfile: $("#device-profile"),
  deviceSeverity: $("#device-severity"),
  deviceStatus: $("#device-status"),
  deviceTitle: $("#device-title"),
  deviceNotes: $("#device-notes"),
  deviceSave: $("#device-save"),
  deviceClear: $("#device-clear"),
  deviceMarkFixed: $("#device-mark-fixed"),
  deviceCopy: $("#device-copy"),
  deviceDownload: $("#device-download"),
  feedbackScore: $("#feedback-score"),
  feedbackOpen: $("#feedback-open"),
  feedbackBlockers: $("#feedback-blockers"),
  feedbackFixed: $("#feedback-fixed"),
  feedbackMessage: $("#feedback-message"),
  feedbackActions: $("#feedback-actions"),
  feedbackThemes: $("#feedback-themes"),
  feedbackBoard: $("#feedback-board"),
  feedbackItemId: $("#feedback-item-id"),
  feedbackSource: $("#feedback-source"),
  feedbackView: $("#feedback-view-select"),
  feedbackType: $("#feedback-type"),
  feedbackPriority: $("#feedback-priority"),
  feedbackStatus: $("#feedback-status"),
  feedbackTitle: $("#feedback-title"),
  feedbackNotes: $("#feedback-notes"),
  feedbackSave: $("#feedback-save"),
  feedbackPlan: $("#feedback-plan"),
  feedbackResolve: $("#feedback-resolve"),
  feedbackClear: $("#feedback-clear"),
  feedbackCopy: $("#feedback-copy"),
  feedbackDownload: $("#feedback-download"),
  roadmapScore: $("#roadmap-score"),
  roadmapActive: $("#roadmap-active"),
  roadmapShipped: $("#roadmap-shipped"),
  roadmapReleases: $("#roadmap-releases"),
  roadmapMessage: $("#roadmap-message"),
  roadmapActions: $("#roadmap-actions"),
  roadmapBoard: $("#roadmap-board"),
  roadmapChangelog: $("#roadmap-changelog"),
  roadmapItemId: $("#roadmap-item-id"),
  roadmapTitle: $("#roadmap-title"),
  roadmapType: $("#roadmap-type"),
  roadmapStatus: $("#roadmap-status"),
  roadmapImpact: $("#roadmap-impact"),
  roadmapRelease: $("#roadmap-release"),
  roadmapOwner: $("#roadmap-owner"),
  roadmapNotes: $("#roadmap-notes"),
  roadmapSave: $("#roadmap-save"),
  roadmapShip: $("#roadmap-ship"),
  roadmapPause: $("#roadmap-pause"),
  roadmapClear: $("#roadmap-clear"),
  roadmapCopy: $("#roadmap-copy"),
  roadmapDownload: $("#roadmap-download"),
  guideWorkflow: $("#guide-workflow"),
  guidePhase: $("#guide-phase"),
  guideProgress: $("#guide-progress"),
  guideNextStep: $("#guide-next-step"),
  guideStage: $("#guide-stage"),
  guideRecords: $("#guide-records"),
  guideMessage: $("#guide-message"),
  guideHeroStats: $("#guide-hero-stats"),
  guideSteps: $("#guide-steps"),
  guideTools: $("#guide-tools"),
  guideRecommendations: $("#guide-recommendations"),
  guideCopy: $("#guide-copy"),
  guideDownload: $("#guide-download"),
  settingsStartViewMetric: $("#settings-start-view-metric"),
  settingsModeMetric: $("#settings-mode-metric"),
  settingsRegionMetric: $("#settings-region-metric"),
  settingsFeeMetric: $("#settings-fee-metric"),
  settingsMessage: $("#settings-message"),
  settingsCards: $("#settings-cards"),
  settingsProfilePreview: $("#settings-profile-preview"),
  settingsActions: $("#settings-actions"),
  settingsStartView: $("#settings-start-view"),
  settingsProductMode: $("#settings-product-mode"),
  settingsRegion: $("#settings-region"),
  settingsMode: $("#settings-mode"),
  settingsType: $("#settings-type"),
  settingsGoal: $("#settings-goal"),
  settingsRuntime: $("#settings-runtime"),
  settingsFee: $("#settings-fee"),
  settingsFeeValue: $("#settings-fee-value"),
  settingsPublic: $("#settings-public"),
  settingsLocalOnly: $("#settings-local-only"),
  settingsExportReminder: $("#settings-export-reminder"),
  settingsSave: $("#settings-save"),
  settingsApplyProfile: $("#settings-apply-profile"),
  settingsCopy: $("#settings-copy"),
  settingsDownload: $("#settings-download"),
  settingsReset: $("#settings-reset"),
  compareBar: $("#compare-bar"),
  compareCopy: $("#compare-copy"),
  compareButton: $("#compare-button"),
  clearCompareButton: $("#clear-compare-button"),
  saveProfile: $("#save-profile"),
  profileTitle: $("#profile-title"),
  profileRuntime: $("#profile-runtime"),
  profileType: $("#profile-type"),
  profileGoal: $("#profile-goal"),
  profileRegion: $("#profile-region"),
  profileMode: $("#profile-mode"),
  profileFee: $("#profile-fee"),
  profileFeeValue: $("#profile-fee-value"),
  profilePublic: $("#profile-public"),
  strategyTitle: $("#strategy-title"),
  strategyCopy: $("#strategy-copy"),
  matchStrong: $("#match-strong"),
  matchSoon: $("#match-soon"),
  matchResults: $("#match-results"),
  prepFestival: $("#prep-festival"),
  prepFilmTitle: $("#prep-film-title"),
  prepLogline: $("#prep-logline"),
  prepSynopsis: $("#prep-synopsis"),
  prepDirector: $("#prep-director"),
  prepTools: $("#prep-tools"),
  prepNotes: $("#prep-notes"),
  packetPreview: $("#packet-preview"),
  copyPacket: $("#copy-packet"),
  prepPipeline: $("#prep-pipeline"),
  downloadPacket: $("#download-packet"),
  pipelineTotal: $("#pipeline-total"),
  pipelinePreparing: $("#pipeline-preparing"),
  pipelineSubmitted: $("#pipeline-submitted"),
  pipelineDecisions: $("#pipeline-decisions"),
  pipelineFocusNow: $("#pipeline-focus-now"),
  pipelineFeeExposure: $("#pipeline-fee-exposure"),
  pipelineBoardScore: $("#pipeline-board-score"),
  pipelineMessage: $("#pipeline-message"),
  pipelineActions: $("#pipeline-actions"),
  pipelineBoard: $("#pipeline-board"),
  pipelineItemId: $("#pipeline-item-id"),
  pipelineFestival: $("#pipeline-festival"),
  pipelineFilmTitle: $("#pipeline-film-title"),
  pipelineStage: $("#pipeline-stage"),
  pipelinePriority: $("#pipeline-priority"),
  pipelineDueDate: $("#pipeline-due-date"),
  pipelineNotes: $("#pipeline-notes"),
  pipelineSave: $("#pipeline-save"),
  pipelineClear: $("#pipeline-clear"),
  pipelineAddPrep: $("#pipeline-add-prep"),
  pipelineCopy: $("#pipeline-copy"),
  pipelineDownload: $("#pipeline-download"),
  submissionsList: $("#submissions-list"),
  submissionTotal: $("#submission-total"),
  submissionPending: $("#submission-pending"),
  submissionAccepted: $("#submission-accepted"),
  submissionFees: $("#submission-fees"),
  exportCsv: $("#export-csv"),
  radarGrid: $("#radar-grid"),
  candidateGrid: $("#candidate-grid"),
  radarBulkBar: $("#radar-bulk-bar"),
  radarBulkCopy: $("#radar-bulk-copy"),
  radarSelectAll: $("#radar-select-all"),
  radarBulkApprove: $("#radar-bulk-approve"),
  radarBulkReject: $("#radar-bulk-reject"),
  radarAuditList: $("#radar-audit-list"),
  resetRadar: $("#reset-radar"),
  scoutSourceGrid: $("#scout-source-grid"),
  scoutLeadGrid: $("#scout-lead-grid"),
  scoutLeadCount: $("#scout-lead-count"),
  scoutReadyCount: $("#scout-ready-count"),
  scoutReviewCount: $("#scout-review-count"),
  scoutRiskCount: $("#scout-risk-count"),
  scoutLastRun: $("#scout-last-run"),
  runScout: $("#run-scout"),
  scoutMessage: $("#scout-message"),
  watchActiveCount: $("#watch-active-count"),
  watchDueCount: $("#watch-due-count"),
  watchTrustCount: $("#watch-trust-count"),
  watchKeywordCount: $("#watch-keyword-count"),
  watchForm: $("#watch-form"),
  watchSourceId: $("#watch-source-id"),
  watchName: $("#watch-name"),
  watchUrl: $("#watch-url"),
  watchType: $("#watch-type"),
  watchCadence: $("#watch-cadence"),
  watchStatus: $("#watch-status"),
  watchTrust: $("#watch-trust"),
  watchTrustValue: $("#watch-trust-value"),
  watchKeywords: $("#watch-keywords"),
  watchCoverage: $("#watch-coverage"),
  watchNote: $("#watch-note"),
  watchMessage: $("#watch-message"),
  watchPlanTitle: $("#watch-plan-title"),
  watchPlanCopy: $("#watch-plan-copy"),
  watchPlanList: $("#watch-plan-list"),
  watchRunLog: $("#watch-run-log"),
  watchlistGrid: $("#watchlist-grid"),
  watchExport: $("#watch-export"),
  watchDefaults: $("#watch-defaults"),
  watchRun: $("#watch-run"),
  watchClear: $("#watch-clear"),
  vaultSectionCount: $("#vault-section-count"),
  vaultRecordCount: $("#vault-record-count"),
  vaultSize: $("#vault-size"),
  vaultWarningCount: $("#vault-warning-count"),
  vaultText: $("#vault-text"),
  vaultMessage: $("#vault-message"),
  vaultSummary: $("#vault-summary"),
  vaultLog: $("#vault-log"),
  vaultDownload: $("#vault-download"),
  vaultCopy: $("#vault-copy"),
  vaultLoad: $("#vault-load"),
  vaultParse: $("#vault-parse"),
  vaultRestore: $("#vault-restore"),
  vaultClear: $("#vault-clear"),
  importText: $("#import-text"),
  parseImport: $("#parse-import"),
  sendImport: $("#send-import"),
  stageCleanImport: $("#stage-clean-import"),
  copyImportReport: $("#copy-import-report"),
  clearImport: $("#clear-import"),
  sampleImport: $("#sample-import"),
  importMessage: $("#import-message"),
  importPreview: $("#import-preview"),
  importValidCount: $("#import-valid-count"),
  importCleanCount: $("#import-clean-count"),
  importReviewCount: $("#import-review-count"),
  importDuplicateCount: $("#import-duplicate-count"),
  importRiskCount: $("#import-risk-count"),
  importErrorCount: $("#import-error-count"),
  importManifest: $("#import-manifest"),
  importActions: $("#import-actions"),
  intakeForm: $("#intake-form"),
  clearIntake: $("#clear-intake"),
  intakeName: $("#intake-name"),
  intakeOrganizer: $("#intake-organizer"),
  intakeWebsite: $("#intake-website"),
  intakeSubmitUrl: $("#intake-submit-url"),
  intakeDeadline: $("#intake-deadline"),
  intakeEventDate: $("#intake-event-date"),
  intakeCity: $("#intake-city"),
  intakeCountry: $("#intake-country"),
  intakeRegion: $("#intake-region"),
  intakeMode: $("#intake-mode"),
  intakeFee: $("#intake-fee"),
  intakePrize: $("#intake-prize"),
  intakeMaxDuration: $("#intake-max-duration"),
  intakeFrequency: $("#intake-frequency"),
  intakeDescription: $("#intake-description"),
  intakeTypes: $("#intake-types"),
  intakeFormats: $("#intake-formats"),
  intakeFit: $("#intake-fit"),
  intakeRules: $("#intake-rules"),
  intakeFeesTransparent: $("#intake-fees-transparent"),
  intakePrizeDetails: $("#intake-prize-details"),
  intakePastEdition: $("#intake-past-edition"),
  intakeDiscounts: $("#intake-discounts"),
  intakeMessage: $("#intake-message"),
  detailModal: $("#detail-modal"),
  detailClose: $("#detail-close"),
  detailContent: $("#detail-content"),
  calendarModal: $("#calendar-modal"),
  calendarClose: $("#calendar-close"),
  calendarContent: $("#calendar-content"),
  submissionModal: $("#submission-modal"),
  submissionForm: $("#submission-form"),
  submissionClose: $("#submission-close"),
  submissionFestivalId: $("#submission-festival-id"),
  submissionFilmTitle: $("#submission-film-title"),
  submissionDate: $("#submission-date"),
  submissionStatus: $("#submission-status"),
  submissionNotes: $("#submission-notes"),
  reviewModal: $("#review-modal"),
  reviewForm: $("#review-form"),
  reviewClose: $("#review-close"),
  reviewCandidateId: $("#review-candidate-id"),
  reviewName: $("#review-name"),
  reviewDeadline: $("#review-deadline"),
  reviewWebsite: $("#review-website"),
  reviewSubmissionUrl: $("#review-submission-url"),
  reviewEntryFee: $("#review-entry-fee"),
  reviewPrizeMoney: $("#review-prize-money"),
  reviewMaxDuration: $("#review-max-duration"),
  reviewContentTypes: $("#review-content-types"),
  reviewFormats: $("#review-formats"),
  reviewDescription: $("#review-description"),
  reviewFit: $("#review-fit"),
  reviewSignals: $("#review-signals"),
  reviewWarnings: $("#review-warnings"),
  reviewNote: $("#review-note"),
  reviewOrganizer: $("#review-organizer"),
  reviewVenue: $("#review-venue"),
  reviewRules: $("#review-rules"),
  reviewSocial: $("#review-social"),
  reviewPastEdition: $("#review-past-edition"),
  reviewFees: $("#review-fees"),
  reviewPrizeDetails: $("#review-prize-details")
};

function loadSubmissions() {
  return loadJson(STORAGE_KEY, []);
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function saveSubmissions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.submissions));
}

function saveRadarState() {
  localStorage.setItem(PROMOTED_KEY, JSON.stringify(state.promotedFestivals));
  localStorage.setItem(REJECTED_KEY, JSON.stringify(state.rejectedCandidates));
  localStorage.setItem(ORGANIZER_KEY, JSON.stringify(state.organizerCandidates));
}

function saveScoutRuns() {
  localStorage.setItem(SCOUT_RUN_KEY, JSON.stringify(state.scoutRuns));
}

function saveRadarAudit() {
  localStorage.setItem(RADAR_AUDIT_KEY, JSON.stringify(state.radarAudit));
}

function saveWatchlist() {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(state.watchSources));
}

function saveWatchRuns() {
  localStorage.setItem(WATCH_RUN_KEY, JSON.stringify(state.watchRuns));
}

function saveVaultLog() {
  localStorage.setItem(VAULT_LOG_KEY, JSON.stringify(state.vaultLog));
}

function saveAccessState() {
  localStorage.setItem(ACCESS_KEY, JSON.stringify(state.accessState));
}

function saveTrialProgress() {
  localStorage.setItem(TRIAL_TOUR_KEY, JSON.stringify(state.trialProgress));
}

function saveOnboardingState() {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state.onboarding));
}

function saveInstallLog() {
  localStorage.setItem(INSTALL_LOG_KEY, JSON.stringify(state.installLog));
}

function saveLaunchAudits() {
  localStorage.setItem(LAUNCH_AUDIT_KEY, JSON.stringify(state.launchAudits));
}

function saveDeviceLabIssues() {
  localStorage.setItem(DEVICE_LAB_KEY, JSON.stringify(state.deviceLabIssues));
}

function saveBetaFeedbackItems() {
  localStorage.setItem(BETA_FEEDBACK_KEY, JSON.stringify(state.betaFeedbackItems));
}

function saveRoadmapItems() {
  localStorage.setItem(ROADMAP_KEY, JSON.stringify(state.roadmapItems));
}

function savePreferences() {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(state.preferences));
}

function saveFilmLibrary() {
  localStorage.setItem(FILM_LIBRARY_KEY, JSON.stringify(state.filmLibrary));
}

function saveFilmProfile() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(state.filmProfile));
}

function savePipelineItems() {
  localStorage.setItem(PIPELINE_KEY, JSON.stringify(state.pipelineItems));
}

function savePrepDraft() {
  localStorage.setItem(PREP_KEY, JSON.stringify(state.prepDraft));
}

function recordRadarAudit(action, candidate, note = "") {
  state.radarAudit = [
    createReviewAuditEntry(action, candidate, note),
    ...state.radarAudit
  ].slice(0, 30);
  saveRadarAudit();
}

function getWorkspaceSnapshot() {
  return {
    filmProfile: state.filmProfile,
    filmLibrary: state.filmLibrary,
    prepDraft: state.prepDraft,
    pipelineItems: state.pipelineItems,
    deviceLabIssues: state.deviceLabIssues,
    betaFeedbackItems: state.betaFeedbackItems,
    roadmapItems: state.roadmapItems,
    submissions: state.submissions,
    promotedFestivals: state.promotedFestivals,
    organizerCandidates: state.organizerCandidates,
    rejectedCandidates: state.rejectedCandidates,
    scoutRuns: state.scoutRuns,
    radarAudit: state.radarAudit,
    watchSources: state.watchSources,
    watchRuns: state.watchRuns,
    accessState: state.accessState,
    onboarding: state.onboarding,
    preferences: state.preferences
  };
}

function saveWorkspaceState() {
  saveSubmissions();
  saveRadarState();
  saveScoutRuns();
  saveRadarAudit();
  saveWatchlist();
  saveWatchRuns();
  saveFilmLibrary();
  saveFilmProfile();
  savePrepDraft();
  savePipelineItems();
  saveDeviceLabIssues();
  saveBetaFeedbackItems();
  saveRoadmapItems();
  saveAccessState();
  saveOnboardingState();
  savePreferences();
}

function getCurrentBackup() {
  return createWorkspaceBackup(getWorkspaceSnapshot());
}

function getCurrentBackupText() {
  return JSON.stringify(getCurrentBackup(), null, 2);
}

function getLaunchSnapshot() {
  return {
    festivals: getAllFestivals(),
    candidates: getVisibleCandidates(),
    submissions: state.submissions,
    watchSources: state.watchSources,
    watchRuns: state.watchRuns,
    scoutRuns: state.scoutRuns,
    radarAudit: state.radarAudit,
    accessState: state.accessState,
    onboarding: state.onboarding,
    filmProfile: state.filmProfile,
    filmLibrary: state.filmLibrary,
    prepDraft: state.prepDraft,
    pipelineItems: state.pipelineItems,
    deviceLabIssues: state.deviceLabIssues,
    betaFeedbackItems: state.betaFeedbackItems,
    roadmapItems: state.roadmapItems,
    installStatus: state.installStatus,
    backupSections: getCurrentBackup().sections
  };
}

function getCurrentLaunchReport() {
  return buildLaunchReadinessReport(getLaunchSnapshot());
}

function getCurrentDeviceLabReport() {
  return buildDeviceLabReport(state.deviceLabIssues, {
    launchScore: getCurrentLaunchReport().score
  });
}

function getCurrentBetaFeedbackReport() {
  return buildBetaFeedbackReport(state.betaFeedbackItems, {
    launchScore: getCurrentLaunchReport().score
  });
}

function getCurrentRoadmapReport() {
  const feedbackReport = getCurrentBetaFeedbackReport();
  return buildRoadmapReport(state.roadmapItems, {
    launchScore: getCurrentLaunchReport().score,
    feedbackBlockers: feedbackReport.summary.blockers
  });
}

function getGuideSnapshot() {
  const launchReport = getCurrentLaunchReport();
  const installReport = buildAppShellReport(state.installStatus);
  const matches = rankFestivalMatches(getAllFestivals(), state.filmProfile)
    .filter((match) => match.festival.status !== "Closed");
  return {
    festivalCount: getAllFestivals().length,
    matchCount: matches.length,
    submissionCount: state.submissions.length,
    candidateCount: getVisibleCandidates().length,
    activeSourceCount: state.watchSources.filter((source) => source.status === "Active").length,
    radarAuditCount: state.radarAudit.length,
    scoutRunCount: state.scoutRuns.length,
    backupRecords: getCurrentBackup().summary.records,
    accessPlan: getAccessSummary(state.accessState).plan.name,
    filmProfile: state.filmProfile,
    filmLibrary: state.filmLibrary,
    prepDraft: state.prepDraft,
    launchReport,
    installReport
  };
}

function getCurrentGuide() {
  return buildProductGuide(
    {
      workflowId: state.guideWorkflow,
      phase: state.guidePhase
    },
    getGuideSnapshot()
  );
}

function getCurrentSettingsSummary() {
  const backup = getCurrentBackup();
  return buildSettingsSummary(state.preferences, {
    currentProfile: state.filmProfile,
    localDataCount: backup.summary.records,
    launchScore: getCurrentLaunchReport().score
  });
}

function getDemoWorkspace() {
  return createDemoWorkspace();
}

function getCurrentDemoReport() {
  return buildDemoWorkspaceReport(getDemoWorkspace(), getWorkspaceSnapshot());
}

function upsertById(current = [], incoming = []) {
  const incomingIds = new Set(incoming.map((item) => item.id).filter(Boolean));
  return [
    ...current.filter((item) => !incomingIds.has(item.id)),
    ...incoming
  ];
}

function removeDemoById(current = [], incoming = []) {
  const incomingIds = new Set(incoming.map((item) => item.id).filter(Boolean));
  return current.filter((item) => !item.demo && !incomingIds.has(item.id));
}

function submissionKey(item = {}) {
  return `${item.festivalId || ""}::${String(item.filmTitle || "").trim().toLowerCase()}`;
}

function upsertSubmissions(current = [], incoming = []) {
  const incomingKeys = new Set(incoming.map(submissionKey));
  return [
    ...current.filter((item) => !incomingKeys.has(submissionKey(item))),
    ...incoming
  ];
}

function removeDemoSubmissions(current = [], incoming = []) {
  const incomingKeys = new Set(incoming.map(submissionKey));
  return current.filter((item) => !item.demo && !incomingKeys.has(submissionKey(item)));
}

function demoWorkspaceLoaded(workspace = getDemoWorkspace()) {
  const demoProjectIds = new Set((workspace.sections.filmLibrary?.projects || []).map((project) => project.id));
  const hasFilm = state.filmLibrary.projects.some((project) => demoProjectIds.has(project.id));
  const hasPipeline = state.pipelineItems.some((item) => String(item.id || "").startsWith("demo-") || item.demo);
  const hasFestival = state.promotedFestivals.some((festival) => String(festival.id || "").startsWith("demo-") || festival.demo);
  return hasFilm || hasPipeline || hasFestival;
}

function hydrateAfterWorkspaceChange() {
  hydrateFilmProfile();
  hydrateOnboardingForm();
  hydrateFilmLibraryForm();
  hydrateSettingsForm();
  hydratePrepDraft();
  hydratePipelineForm();
  hydrateDeviceLabForm();
  hydrateFeedbackForm();
  hydrateRoadmapForm();
  hydrateIntelligenceChoices();
}

function loadDemoWorkspace() {
  const workspace = getDemoWorkspace();
  const sections = workspace.sections;
  state.filmProfile = { ...DEFAULT_PROFILE, ...sections.filmProfile };
  state.filmLibrary = normalizeFilmLibrary({
    activeId: sections.filmLibrary.activeId,
    projects: upsertById(state.filmLibrary.projects, sections.filmLibrary.projects)
  }, state.filmProfile);
  state.editingFilmId = state.filmLibrary.activeId;
  state.prepDraft = sections.prepDraft || {};
  state.pipelineItems = upsertById(state.pipelineItems, sections.pipelineItems).map((item) => normalizePipelineItem(item));
  state.deviceLabIssues = upsertById(state.deviceLabIssues, sections.deviceLabIssues).map((issue) => normalizeDeviceLabIssue(issue));
  state.betaFeedbackItems = upsertById(state.betaFeedbackItems, sections.betaFeedbackItems).map((item) => normalizeBetaFeedbackItem(item));
  state.roadmapItems = upsertById(state.roadmapItems, sections.roadmapItems).map((item) => normalizeRoadmapItem(item));
  state.submissions = upsertSubmissions(state.submissions, sections.submissions);
  state.promotedFestivals = upsertById(state.promotedFestivals, sections.promotedFestivals);
  state.organizerCandidates = upsertById(state.organizerCandidates, sections.organizerCandidates);
  state.rejectedCandidates = [...new Set([...state.rejectedCandidates, ...sections.rejectedCandidates])];
  state.scoutRuns = upsertById(state.scoutRuns, sections.scoutRuns);
  state.radarAudit = upsertById(state.radarAudit, sections.radarAudit);
  state.watchSources = upsertById(state.watchSources, sections.watchSources).map((source) => normalizeWatchSource(source));
  state.watchRuns = upsertById(state.watchRuns, sections.watchRuns);
  state.accessState = { ...normalizeAccessState(sections.accessState), demo: true };
  state.onboarding = { ...normalizeOnboardingState(sections.onboarding), demo: true };
  state.preferences = { ...normalizeUserPreferences({ ...state.preferences, ...sections.preferences }), demo: true };
  state.intelligenceFestivalId = sections.prepDraft.festivalId;
  state.guideWorkflow = "first-submission";
  state.guidePhase = "Submit";
  state.selected.clear();
  state.radarSelected.clear();
  state.vaultPreview = null;
  state.demoNotice = `${workspace.title} loaded. Start with Film Library, then Match, Intelligence, Prep Pack, and Pipeline.`;
  saveWorkspaceState();
  recordVaultLog("Demo", `${workspace.summary.records} sample records loaded for a product walkthrough.`);
  hydrateAfterWorkspaceChange();
  renderAll();
}

function resetDemoWorkspace() {
  const workspace = getDemoWorkspace();
  const sections = workspace.sections;
  state.filmProfile = state.filmProfile.title === sections.filmProfile.title ? { ...DEFAULT_PROFILE } : state.filmProfile;
  state.filmLibrary.projects = removeDemoById(state.filmLibrary.projects, sections.filmLibrary.projects);
  state.filmLibrary = normalizeFilmLibrary(
    state.filmLibrary.projects.length
      ? {
          activeId: state.filmLibrary.projects.some((project) => project.id === state.filmLibrary.activeId)
            ? state.filmLibrary.activeId
            : state.filmLibrary.projects[0].id,
          projects: state.filmLibrary.projects
        }
      : {},
    state.filmProfile
  );
  state.editingFilmId = state.filmLibrary.activeId;
  state.prepDraft = state.prepDraft.demo || state.prepDraft.filmTitle === sections.prepDraft.filmTitle ? {} : state.prepDraft;
  state.pipelineItems = removeDemoById(state.pipelineItems, sections.pipelineItems);
  state.deviceLabIssues = removeDemoById(state.deviceLabIssues, sections.deviceLabIssues);
  state.betaFeedbackItems = removeDemoById(state.betaFeedbackItems, sections.betaFeedbackItems);
  state.roadmapItems = removeDemoById(state.roadmapItems, sections.roadmapItems);
  state.submissions = removeDemoSubmissions(state.submissions, sections.submissions);
  state.promotedFestivals = removeDemoById(state.promotedFestivals, sections.promotedFestivals);
  state.organizerCandidates = removeDemoById(state.organizerCandidates, sections.organizerCandidates);
  state.rejectedCandidates = state.rejectedCandidates.filter((id) => !sections.rejectedCandidates.includes(id));
  state.scoutRuns = removeDemoById(state.scoutRuns, sections.scoutRuns);
  state.radarAudit = removeDemoById(state.radarAudit, sections.radarAudit);
  state.watchSources = removeDemoById(state.watchSources, sections.watchSources);
  state.watchRuns = removeDemoById(state.watchRuns, sections.watchRuns);
  if (state.accessState.demo) {
    state.accessState = normalizeAccessState({});
  }
  if (state.onboarding.demo) {
    state.onboarding = normalizeOnboardingState({});
  }
  if (state.preferences.demo || state.preferences.startView === "demo") {
    state.preferences = normalizeUserPreferences({});
  }
  state.demoNotice = "Demo records removed. Non-demo workspace records were left alone.";
  state.selected.clear();
  state.radarSelected.clear();
  state.vaultPreview = null;
  saveWorkspaceState();
  recordVaultLog("Demo reset", "Sample demo records removed from this browser.");
  hydrateAfterWorkspaceChange();
  renderAll();
}

async function copyDemoTour() {
  await navigator.clipboard.writeText(demoWorkspaceToText(getCurrentDemoReport()));
  state.demoNotice = "Demo tour copied.";
  renderDemo();
}

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 102.4) / 10} KB`;
  }
  return `${Math.round(bytes / 104857.6) / 10} MB`;
}

function recordVaultLog(action, detail) {
  state.vaultLog = [
    {
      id: `${Date.now()}-${action}`,
      action,
      detail,
      createdAt: new Date().toISOString()
    },
    ...state.vaultLog
  ].slice(0, 8);
  saveVaultLog();
}

function recordInstallLog(action, detail) {
  state.installLog = [
    {
      id: `${Date.now()}-${action}`,
      action,
      detail,
      createdAt: new Date().toISOString()
    },
    ...state.installLog
  ].slice(0, 8);
  saveInstallLog();
}

function recordLaunchAudit(report) {
  state.launchAudits = [
    {
      id: `${Date.now()}-launch-audit`,
      stage: report.stage,
      score: report.score,
      readyCount: report.readyCount,
      totalChecks: report.totalChecks,
      blockerCount: report.blockerCount,
      detail: report.summary,
      createdAt: report.generatedAt
    },
    ...state.launchAudits
  ].slice(0, 10);
  saveLaunchAudits();
}

function setAccessPlan(planId, options = {}) {
  state.accessState = normalizeAccessState({
    planId,
    trialActive: Boolean(options.trialActive),
    status: options.status,
    trialStartedAt: options.trialStartedAt,
    activatedAt: options.activatedAt,
    expiresAt: options.expiresAt
  });
  saveAccessState();
  renderAccess();
  renderLaunch();
  renderView();
}

function getAccessConversionReport() {
  const sourceReport = buildSourceTrustReport(getAllFestivals());
  const projects = Array.isArray(state.filmLibrary?.projects) ? state.filmLibrary.projects : [];
  return buildAccessConversionPreview(state.accessState, {
    targetPlanId: "launch",
    festivalCount: getAllFestivals().length,
    sourceCount: sourceReport.summary.total,
    verifiedSources: sourceReport.summary.verified,
    averageSourceTrust: sourceReport.summary.averageScore,
    plannedSubmissions: state.pipelineItems.length + state.submissions.length,
    activeProjects: projects.length || 1
  });
}

async function copyAccessBrief() {
  await navigator.clipboard.writeText(accessConversionToText(getAccessConversionReport()));
  refs.accessMessage.textContent = "Access brief copied. This is still a local preview, with no billing code connected.";
}

function downloadAccessBrief() {
  const report = getAccessConversionReport();
  const blob = new Blob([accessConversionToText(report)], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-access-brief-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  refs.accessMessage.textContent = "Access brief downloaded.";
}

function getTrialFlow() {
  const proofReport = buildSourceTrustReport(getAllFestivals());
  const calendarReport = buildDeadlineCalendar(getAllFestivals(), {
    windowDays: state.calendar.range,
    status: state.calendar.status,
    region: state.calendar.region
  });
  return buildTrialOnboardingFlow(state.accessState, state.trialProgress, {
    sourceTrust: proofReport.summary.averageScore,
    calendarItems: calendarReport.summary.total,
    prepReady: Boolean(state.prepDraft?.festivalId),
    pipelineItems: state.pipelineItems.length
  });
}

function recordTrialVisit(view) {
  const stepIdsByView = {
    proof: "proof",
    calendar: "calendar",
    prep: "prep",
    pipeline: "pipeline"
  };
  const stepId = stepIdsByView[view];
  const summary = getAccessSummary(state.accessState);
  if (!stepId || (summary.status !== "Trial" && !summary.isPaid)) {
    return;
  }
  const normalized = normalizeTrialProgress(state.trialProgress);
  if (normalized.visited.includes(stepId)) {
    state.trialProgress = normalized;
    return;
  }
  state.trialProgress = normalizeTrialProgress({
    ...normalized,
    visited: [...normalized.visited, stepId],
    startedAt: normalized.startedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  saveTrialProgress();
}

function resetTrialTour() {
  state.trialProgress = normalizeTrialProgress({});
  saveTrialProgress();
  renderAccess();
}

async function copyTrialPlan() {
  await navigator.clipboard.writeText(trialOnboardingToText(getTrialFlow()));
  refs.trialMessage.textContent = "Trial plan copied.";
}

function activateLocalTrial() {
  setAccessPlan("launch", {
    trialActive: true,
    status: "Trial",
    trialStartedAt: new Date().toISOString()
  });
  state.trialProgress = normalizeTrialProgress({
    ...state.trialProgress,
    startedAt: state.trialProgress.startedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  saveTrialProgress();
  renderAccess();
}

function activateLaunchPass() {
  setAccessPlan("launch", { status: "Active" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFestival(id) {
  const festival = getAllFestivals().find((item) => item.id === id);
  if (festival) {
    return festival;
  }
  if (String(id).startsWith("promoted-")) {
    const candidate = getCandidate(String(id).replace(/^promoted-/u, ""));
    return candidate ? candidateToFestival(candidate, "2026-05-06") : undefined;
  }
  return undefined;
}

function getCandidate(id) {
  return getAllCandidates().find((candidate) => candidate.id === id);
}

function getAllCandidates() {
  const organizerIds = new Set(state.organizerCandidates.map((candidate) => candidate.id));
  return [
    ...radarCandidates.filter((candidate) => !organizerIds.has(candidate.id)),
    ...state.organizerCandidates
  ];
}

function getAllFestivals() {
  const promotedIds = new Set(state.promotedFestivals.map((festival) => festival.id));
  return [
    ...festivals.filter((festival) => !promotedIds.has(festival.id)),
    ...state.promotedFestivals
  ];
}

function getVisibleCandidates() {
  const promotedSourceIds = new Set(
    state.promotedFestivals
      .map((festival) => festival.promotedFromCandidateId)
      .filter(Boolean)
  );
  const rejectedIds = new Set(state.rejectedCandidates);
  return getAllCandidates().filter(
    (candidate) => !promotedSourceIds.has(candidate.id) && !rejectedIds.has(candidate.id)
  );
}

function upsertOrganizerCandidate(candidate) {
  state.organizerCandidates = [
    ...state.organizerCandidates.filter((item) => item.id !== candidate.id),
    candidate
  ];
  saveRadarState();
}

function plural(value, singular, pluralForm = `${singular}s`) {
  return `${value} ${value === 1 ? singular : pluralForm}`;
}

function deadlineLabel(festival) {
  const days = daysUntil(festival.deadline);
  if (days < 0) {
    return "Closed";
  }
  if (days === 0) {
    return "Due today";
  }
  return `${plural(days, "day")} left`;
}

function confidenceBadge(festival) {
  if (festival.confidence >= 85) {
    return `<span class="badge green">${festival.confidence}% verified</span>`;
  }
  if (festival.confidence >= 70) {
    return `<span class="badge amber">${festival.confidence}% verified</span>`;
  }
  return `<span class="badge red">${festival.confidence}% needs review</span>`;
}

function trustBadge(festival) {
  const trust = evaluateFestivalSourceTrust(festival);
  return `<span class="badge ${trust.tone}">${trust.score}/100 ${escapeHtml(trust.tier)}</span>`;
}

function freshnessBadge(festival) {
  const trust = evaluateFestivalSourceTrust(festival);
  const age = Number.isFinite(trust.verifiedAgeDays) ? `${trust.verifiedAgeDays}d` : "unknown";
  return `<span class="badge ${trust.freshnessTone}">${escapeHtml(trust.freshnessLabel)} ${age}</span>`;
}

function statusBadge(status) {
  const cls =
    status === "Accepting Submissions"
      ? "green"
      : status === "Closed"
        ? "red"
        : "amber";
  return `<span class="badge ${cls}">${status}</span>`;
}

function filteredFestivals() {
  return sortFestivals(filterFestivals(getAllFestivals(), state.filters), state.sort);
}

function updateFilterState() {
  state.filters.search = refs.searchInput.value;
  state.filters.status = refs.statusFilter.value;
  state.filters.deadline = refs.deadlineFilter.value;
  state.filters.region = refs.regionFilter.value;
  state.filters.type = refs.typeFilter.value;
  state.filters.runtime = refs.runtimeFilter.value;
  state.filters.prizeOnly = refs.prizeToggle.checked;
  state.filters.minPrize = Number(refs.prizeFilter.value);
  state.filters.recurringOnly = refs.recurringToggle.checked;
  state.sort = refs.sortSelect.value;
  refs.prizeValue.textContent = `${formatMoney(state.filters.minPrize).replace("No prize listed", "$0")}+`;
}

function hydrateFilmProfile() {
  refs.profileTitle.value = state.filmProfile.title || "";
  refs.profileRuntime.value = state.filmProfile.runtime;
  refs.profileType.value = state.filmProfile.contentType;
  refs.profileGoal.value = state.filmProfile.goal;
  refs.profileRegion.value = state.filmProfile.region;
  refs.profileMode.value = state.filmProfile.mode;
  refs.profileFee.value = state.filmProfile.maxFee;
  refs.profilePublic.checked = Boolean(state.filmProfile.publicAlready);
  refs.profileFeeValue.textContent = `$${state.filmProfile.maxFee} max`;
}

function hydrateOnboardingForm() {
  refs.onboardTitle.value = state.filmProfile.title || "";
  refs.onboardRuntime.value = state.filmProfile.runtime || DEFAULT_PROFILE.runtime;
  refs.onboardType.value = state.filmProfile.contentType || DEFAULT_PROFILE.contentType;
  refs.onboardGoal.value = state.filmProfile.goal || DEFAULT_PROFILE.goal;
  refs.onboardRegion.value = state.filmProfile.region || DEFAULT_PROFILE.region;
  refs.onboardMode.value = state.filmProfile.mode || DEFAULT_PROFILE.mode;
  refs.onboardFee.value = state.filmProfile.maxFee || DEFAULT_PROFILE.maxFee;
  refs.onboardPublic.checked = Boolean(state.filmProfile.publicAlready);
  refs.onboardFeeValue.textContent = `$${refs.onboardFee.value} max`;
}

function hydrateSettingsForm() {
  const preferences = normalizeUserPreferences(state.preferences);
  refs.settingsStartView.value = preferences.startView;
  refs.settingsProductMode.value = preferences.productMode;
  refs.settingsRegion.value = preferences.defaultRegion;
  refs.settingsMode.value = preferences.defaultMode;
  refs.settingsType.value = preferences.defaultContentType;
  refs.settingsGoal.value = preferences.defaultGoal;
  refs.settingsRuntime.value = preferences.defaultRuntime;
  refs.settingsFee.value = preferences.maxFee;
  refs.settingsFeeValue.textContent = `$${preferences.maxFee} max`;
  refs.settingsPublic.checked = preferences.includePublicFilms;
  refs.settingsLocalOnly.checked = preferences.localOnlyReminder;
  refs.settingsExportReminder.checked = preferences.exportReminder;
}

function readSettingsForm() {
  return normalizeUserPreferences({
    startView: refs.settingsStartView.value,
    productMode: refs.settingsProductMode.value,
    defaultRegion: refs.settingsRegion.value,
    defaultMode: refs.settingsMode.value,
    defaultContentType: refs.settingsType.value,
    defaultGoal: refs.settingsGoal.value,
    defaultRuntime: refs.settingsRuntime.value,
    maxFee: refs.settingsFee.value,
    includePublicFilms: refs.settingsPublic.checked,
    localOnlyReminder: refs.settingsLocalOnly.checked,
    exportReminder: refs.settingsExportReminder.checked
  });
}

function readOnboardingProfile() {
  return {
    title: refs.onboardTitle.value.trim(),
    runtime: Number(refs.onboardRuntime.value || DEFAULT_PROFILE.runtime),
    contentType: refs.onboardType.value,
    goal: refs.onboardGoal.value,
    region: refs.onboardRegion.value,
    mode: refs.onboardMode.value,
    maxFee: Number(refs.onboardFee.value),
    publicAlready: refs.onboardPublic.checked
  };
}

function updateFilmProfile() {
  state.filmProfile = {
    title: refs.profileTitle.value.trim(),
    runtime: Number(refs.profileRuntime.value || DEFAULT_PROFILE.runtime),
    contentType: refs.profileType.value,
    goal: refs.profileGoal.value,
    region: refs.profileRegion.value,
    mode: refs.profileMode.value,
    maxFee: Number(refs.profileFee.value),
    publicAlready: refs.profilePublic.checked
  };
  refs.profileFeeValue.textContent = `$${state.filmProfile.maxFee} max`;
}

function getActiveFilmProject() {
  return state.filmLibrary.projects.find((project) => project.id === state.filmLibrary.activeId) || state.filmLibrary.projects[0];
}

function getEditingFilmProject() {
  if (state.editingFilmId === "") {
    return null;
  }
  return state.filmLibrary.projects.find((project) => project.id === state.editingFilmId) || getActiveFilmProject();
}

function setActiveFilmFromProject(project, message = "") {
  if (!project) {
    return;
  }
  state.filmLibrary.activeId = project.id;
  state.editingFilmId = project.id;
  state.filmProfile = filmProjectToProfile(project);
  state.prepDraft = {
    ...state.prepDraft,
    filmTitle: project.title
  };
  state.filmNotice = message;
  saveFilmLibrary();
  saveFilmProfile();
  savePrepDraft();
  hydrateFilmProfile();
  hydrateOnboardingForm();
  hydratePrepDraft();
  hydrateIntelligenceChoices();
}

function syncActiveFilmFromProfile(message = "") {
  const active = getActiveFilmProject();
  const project = normalizeFilmProject({
    ...active,
    ...state.filmProfile,
    updatedAt: new Date().toISOString()
  }, state.filmProfile);
  state.filmLibrary.projects = [
    ...state.filmLibrary.projects.filter((item) => item.id !== project.id),
    project
  ];
  state.filmLibrary.activeId = project.id;
  state.editingFilmId = project.id;
  state.filmNotice = message;
  saveFilmLibrary();
  renderFilmLibrary();
}

function hydrateFilmLibraryForm(project = getEditingFilmProject()) {
  const current = project || normalizeFilmProject({ id: "", ...state.filmProfile }, state.filmProfile);
  refs.filmProjectId.value = current.id || "";
  refs.filmTitle.value = current.title === "Untitled Film" ? "" : current.title;
  refs.filmStage.value = current.stage || "Festival strategy";
  refs.filmRuntime.value = current.runtime || DEFAULT_PROFILE.runtime;
  refs.filmType.value = current.contentType || DEFAULT_PROFILE.contentType;
  refs.filmGoal.value = current.goal || DEFAULT_PROFILE.goal;
  refs.filmRegion.value = current.region || DEFAULT_PROFILE.region;
  refs.filmMode.value = current.mode || DEFAULT_PROFILE.mode;
  refs.filmFee.value = current.maxFee ?? DEFAULT_PROFILE.maxFee;
  refs.filmFeeValue.textContent = `$${refs.filmFee.value} max`;
  refs.filmPublic.checked = Boolean(current.publicAlready);
  refs.filmLogline.value = current.logline || "";
  refs.filmNotes.value = current.notes || "";
}

function readFilmLibraryForm() {
  const existing = state.filmLibrary.projects.find((project) => project.id === refs.filmProjectId.value);
  return normalizeFilmProject({
    ...existing,
    id: refs.filmProjectId.value || undefined,
    title: refs.filmTitle.value.trim(),
    stage: refs.filmStage.value,
    runtime: refs.filmRuntime.value,
    contentType: refs.filmType.value,
    goal: refs.filmGoal.value,
    region: refs.filmRegion.value,
    mode: refs.filmMode.value,
    maxFee: refs.filmFee.value,
    publicAlready: refs.filmPublic.checked,
    logline: refs.filmLogline.value,
    notes: refs.filmNotes.value,
    updatedAt: new Date().toISOString()
  }, state.filmProfile);
}

function hydratePrepDraft() {
  const allFestivals = getAllFestivals();
  refs.prepFestival.innerHTML = allFestivals
    .map((festival) => `<option value="${festival.id}">${escapeHtml(festival.name)}</option>`)
    .join("");
  const fallbackFestivalId = allFestivals[0]?.id || "";
  refs.prepFestival.value = state.prepDraft.festivalId || fallbackFestivalId;
  refs.prepFilmTitle.value = state.prepDraft.filmTitle || state.filmProfile.title || "";
  refs.prepLogline.value = state.prepDraft.logline || "";
  refs.prepSynopsis.value = state.prepDraft.synopsis || "";
  refs.prepDirector.value = state.prepDraft.directorStatement || "";
  refs.prepTools.value = state.prepDraft.aiTools || "";
  refs.prepNotes.value = state.prepDraft.privateNotes || "";
}

function updatePrepDraft() {
  state.prepDraft = {
    festivalId: refs.prepFestival.value,
    filmTitle: refs.prepFilmTitle.value.trim(),
    logline: refs.prepLogline.value.trim(),
    synopsis: refs.prepSynopsis.value.trim(),
    directorStatement: refs.prepDirector.value.trim(),
    aiTools: refs.prepTools.value.trim(),
    privateNotes: refs.prepNotes.value.trim()
  };
}

function renderAll() {
  renderView();
  renderAccess();
  renderOnboarding();
  renderDemo();
  renderFilmLibrary();
  renderInstall();
  renderLaunch();
  renderDeviceLab();
  renderBetaFeedback();
  renderRoadmap();
  renderGuide();
  renderSettings();
  renderDiscover();
  renderProof();
  renderDeadlineCalendar();
  renderSeason();
  hydrateIntelligenceChoices();
  renderIntelligence();
  renderMatches();
  renderPrepPack();
  renderPipeline();
  renderSubmissions();
  renderScout();
  renderWatchlist();
  renderVault();
  renderImport();
  renderRadar();
}

function openInitialDetailFromRoute() {
  const detailId = new URLSearchParams(window.location.search).get("detail");
  if (!detailId) {
    return;
  }
  const festival = getFestival(detailId);
  if (festival) {
    renderDetails(festival);
  }
}

function renderView() {
  $$(".view").forEach((view) => {
    view.classList.toggle("active", view.id === `${state.view}-view`);
  });
  $$(".nav-tab").forEach((button) => {
    const gate = getViewAccessGate(button.dataset.view, state.accessState);
    button.classList.toggle("active", button.dataset.view === state.view);
    button.classList.toggle("locked", Boolean(gate?.locked));
    if (gate?.locked) {
      button.title = `${gate.label} unlocks with ${gate.requiredPlan}`;
    } else {
      button.removeAttribute("title");
    }
  });
  renderFeatureGate();
  recordTrialVisit(state.view);
  if (state.view === "calendar") {
    renderDeadlineCalendar();
  }
  if (state.view === "season") {
    renderSeason();
  }
  if (state.view === "films") {
    renderFilmLibrary();
  }
  if (state.view === "demo") {
    renderDemo();
  }
  if (state.view === "pipeline") {
    renderPipeline();
  }
  if (state.view === "device") {
    renderDeviceLab();
  }
  if (state.view === "feedback") {
    renderBetaFeedback();
  }
  if (state.view === "roadmap") {
    renderRoadmap();
  }
  if (state.view === "proof") {
    renderProof();
  }
}

function renderFeatureGate() {
  $$(".feature-lock-panel").forEach((panel) => panel.remove());
  $$(".view").forEach((view) => view.classList.remove("is-gated"));
  const activeView = $(`#${state.view}-view`);
  const gate = getViewAccessGate(state.view, state.accessState);
  if (!activeView || !gate?.locked) {
    return;
  }

  activeView.classList.add("is-gated");
  activeView.insertAdjacentHTML("afterbegin", `
    <section class="feature-lock-panel" aria-label="${escapeHtml(gate.label)} upgrade preview">
      <div class="feature-lock-copy">
        <span class="badge amber">Preview locked</span>
        <p class="eyebrow">${escapeHtml(gate.label)}</p>
        <h2>${escapeHtml(gate.title)}</h2>
        <p>${escapeHtml(gate.detail)}</p>
        <div class="reason-list feature-lock-bullets">
          ${gate.bullets.map((bullet) => `<span>${escapeHtml(bullet)}</span>`).join("")}
        </div>
      </div>
      <div class="feature-lock-actions">
        <span>${escapeHtml(gate.requiredPlan)}</span>
        <strong>Unlock locally before real billing exists.</strong>
        <button class="primary-button js-feature-unlock" type="button">Activate Launch Pass</button>
        <button class="secondary-button js-feature-trial" type="button">Start Local Trial</button>
        <button class="secondary-button js-go-view" type="button" data-view-target="access">View Access</button>
      </div>
    </section>
  `);
}

function renderAccess() {
  const summary = getAccessSummary(state.accessState);
  const conversion = getAccessConversionReport();
  const trialFlow = getTrialFlow();
  refs.accountPlanName.textContent = summary.plan.name;
  refs.accountPlanCopy.textContent = summary.isPaid
    ? `${summary.plan.billing} active locally`
    : summary.status === "Trial"
      ? `${summary.trialDaysLeft} trial days remaining`
      : "Preview mode";
  refs.accessPlanName.textContent = summary.plan.name;
  refs.accessStatus.textContent = summary.status;
  refs.accessRenewal.textContent = summary.isPaid ? `${summary.renewalDaysLeft} days` : summary.status === "Trial" ? `${summary.trialDaysLeft} days` : "Upgrade";
  refs.accessLocked.textContent = String(summary.lockedCount);
  refs.accessIncluded.textContent = String(summary.includedCount);
  refs.accessValueScore.textContent = `${conversion.valueScore}/100`;
  refs.accessUpgradeLift.textContent = `${conversion.upgradeFeatureCount} tools`;
  refs.accessValueTier.textContent = conversion.valueTier;
  refs.accessHoursSaved.textContent = `${conversion.annualHoursSaved}+ hours/year`;
  refs.accessMonthlyValue.textContent = `$${conversion.monthlyEquivalent}/month equivalent`;
  refs.accessMessage.textContent = conversion.message;
  refs.accessConversionActions.innerHTML = conversion.actions
    .map((action) => `<span>${escapeHtml(action)}</span>`)
    .join("");

  refs.accessPreviewCards.innerHTML = conversion.previewCards.map((card) => `
    <article class="access-preview-card">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.title)}</strong>
      <p>${escapeHtml(card.detail)}</p>
    </article>
  `).join("");

  refs.accessReceiptList.innerHTML = conversion.receiptRows.map((row) => `
    <article>
      <span>${escapeHtml(row.label)}</span>
      <strong>${escapeHtml(row.value)}</strong>
      <p>${escapeHtml(row.detail)}</p>
    </article>
  `).join("");

  refs.accessObjectionGrid.innerHTML = conversion.objections.map((item) => `
    <article>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.response)}</p>
    </article>
  `).join("");

  refs.trialMessage.textContent = trialFlow.message;
  refs.trialProgress.textContent = `${trialFlow.progressPercent}%`;
  refs.trialNextStep.textContent = trialFlow.nextStep?.label || "Complete";
  refs.trialDaysLeft.textContent = trialFlow.status === "Trial" ? String(trialFlow.trialDaysLeft) : trialFlow.trialLive ? "Active" : "Start";
  refs.trialVisited.textContent = `${trialFlow.completedCount}/${trialFlow.totalSteps}`;
  refs.trialPipelineCount.textContent = String(trialFlow.metrics.pipelineItems);
  refs.trialStepList.innerHTML = trialFlow.steps.map((step) => `
    <article class="trial-step ${step.complete ? "complete" : step.locked ? "locked" : step.ready ? "ready" : "queued"}">
      <span class="trial-step-number">${step.number}</span>
      <div>
        <span class="badge ${step.complete ? "green" : step.locked ? "amber" : step.ready ? "blue" : ""}">${escapeHtml(step.status)}</span>
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.detail)}</p>
        <small>${escapeHtml(step.outcome)}</small>
      </div>
      <button class="${step.locked ? "secondary-button" : "primary-button"} js-trial-step" type="button" data-view-target="${escapeHtml(step.view)}">
        ${step.complete ? "Open Again" : step.locked ? "Preview Lock" : "Open Step"}
      </button>
    </article>
  `).join("");

  refs.accessPlanGrid.innerHTML = ACCESS_PLANS.map((plan) => {
    const active = plan.id === summary.plan.id;
    const unlocked = plan.features.length;
    return `
      <article class="plan-card ${active ? "active" : ""}">
        <div>
          <span class="badge ${active ? "green" : "blue"}">${escapeHtml(plan.badge)}</span>
          <h2>${escapeHtml(plan.name)}</h2>
          <p>${escapeHtml(plan.featureLimit)}</p>
        </div>
        <div>
          <strong>${plan.price ? `$${plan.price}` : "$0"}</strong>
          <span>${escapeHtml(plan.billing)}</span>
        </div>
        <div class="reason-list">
          <span>${unlocked} enabled features</span>
          ${(plan.highlights || []).slice(0, 2).map((highlight) => `<span>${escapeHtml(highlight)}</span>`).join("")}
        </div>
        <button class="${active ? "secondary-button" : "primary-button"} js-set-plan" type="button" data-plan-id="${plan.id}">
          ${active ? "Current Plan" : plan.id === "preview" ? "Use Preview" : "Activate Locally"}
        </button>
      </article>
    `;
  }).join("");

  refs.accessFeatureGrid.innerHTML = summary.featureRows.map((feature) => {
    const included = canUseAccessFeature(state.accessState, feature.id);
    return `
      <article class="feature-gate ${included ? "open" : "locked"}">
        <span class="badge ${included ? "green" : "amber"}">${included ? "Included" : "Upgrade"}</span>
        <strong>${escapeHtml(feature.label)}</strong>
        <p>${escapeHtml(feature.description || (included ? "Available in the current local access state." : "Shown as a premium affordance in preview mode."))}</p>
      </article>
    `;
  }).join("");
}

function renderOnboarding() {
  const draftProfile = refs.onboardTitle ? readOnboardingProfile() : state.filmProfile;
  const guide = buildOnboardingGuide(getAllFestivals(), draftProfile, state.onboarding);
  refs.onboardProgress.textContent = `${guide.progress}%`;
  refs.onboardStepCount.textContent = `${guide.completedCount}/${guide.totalSteps}`;
  refs.onboardStrongCount.textContent = String(guide.strongFits);
  refs.onboardUrgentCount.textContent = String(guide.urgentMatches);
  refs.onboardNextStep.textContent = guide.nextStep?.label || "Ready";
  refs.onboardFeeValue.textContent = `$${refs.onboardFee.value} max`;

  refs.onboardingSteps.innerHTML = guide.steps.map((step) => `
    <article class="onboard-step ${step.complete ? "complete" : ""}">
      <span class="badge ${step.complete ? "green" : "amber"}">${step.complete ? "Done" : "Next"}</span>
      <strong>${escapeHtml(step.label)}</strong>
      <p>${escapeHtml(step.description)}</p>
    </article>
  `).join("");

  refs.onboardingMatches.innerHTML = guide.topMatches.length
    ? guide.topMatches.map((match) => `
      <article class="onboard-match">
        <div>
          <span class="badge ${match.tier === "Strong fit" ? "green" : "amber"}">${escapeHtml(match.tier)}</span>
          <h2>${escapeHtml(match.festival.name)}</h2>
          <p>${escapeHtml(match.festival.fitSummary)}</p>
        </div>
        <strong>${match.score}</strong>
        <div class="action-row">
          <button class="secondary-button js-open-intelligence" type="button" data-id="${match.festival.id}">Tips</button>
          <button class="secondary-button js-detail" type="button" data-id="${match.festival.id}">Details</button>
          <button class="primary-button js-onboard-prep" type="button" data-id="${match.festival.id}">Prep</button>
        </div>
      </article>
    `).join("")
    : `
      <div class="empty-state">
        <h2>No starter matches yet.</h2>
        <p>Save a film profile or approve more Radar candidates into the directory.</p>
      </div>
    `;

  refs.onboardingActions.innerHTML = guide.suggestedActions.map((action) => `<span>${escapeHtml(action)}</span>`).join("");
}

function renderDemo() {
  const workspace = getDemoWorkspace();
  const report = getCurrentDemoReport();
  const loaded = demoWorkspaceLoaded(workspace);
  refs.demoSections.textContent = String(report.metrics.sections);
  refs.demoRecords.textContent = String(report.metrics.records);
  refs.demoFilm.textContent = report.metrics.activeFilm;
  refs.demoTourCount.textContent = String(report.metrics.tourSteps);
  refs.demoLoad.textContent = loaded ? "Reload Demo Workspace" : "Load Demo Workspace";
  refs.demoMessage.textContent = state.demoNotice || (loaded
    ? "The sample workspace is loaded. Use the tour to walk the product like a paying filmmaker would see it."
    : report.message);
  refs.demoActions.innerHTML = report.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join("");
  refs.demoSectionGrid.innerHTML = report.sectionRows.map((entry) => `
    <article class="demo-section-card">
      <span>${escapeHtml(entry.label)}</span>
      <strong>${entry.count}</strong>
      <small>${escapeHtml(entry.kind)}</small>
    </article>
  `).join("");
  refs.demoTour.innerHTML = report.tour.map((step, index) => `
    <article class="demo-tour-card">
      <div class="demo-tour-index">${index + 1}</div>
      <div>
        <span class="badge blue">${escapeHtml(step.label)}</span>
        <h2>${escapeHtml(step.title)}</h2>
        <p>${escapeHtml(step.detail)}</p>
      </div>
      <button class="secondary-button js-go-view" type="button" data-view-target="${escapeHtml(step.view)}">Open</button>
    </article>
  `).join("");
}

function getFilmLibraryReport() {
  return buildFilmLibraryReport(state.filmLibrary, getAllFestivals(), state.submissions);
}

function renderFilmLibrary() {
  const report = getFilmLibraryReport();
  refs.filmProjectCount.textContent = String(report.summary.projectCount);
  refs.filmActiveTitle.textContent = report.summary.activeTitle;
  refs.filmStrongFits.textContent = String(report.summary.activeStrongFits);
  refs.filmSubmittedCount.textContent = String(report.summary.submittedCount);
  refs.filmMessage.textContent = state.filmNotice || `${report.summary.activeTitle} is the active film for Match, Prep Pack, and Strategy Tips.`;
  refs.filmActions.innerHTML = report.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join("");

  const editingProject = getEditingFilmProject();
  if (state.editingFilmId !== "" && editingProject) {
    hydrateFilmLibraryForm(editingProject);
  }

  refs.filmCards.innerHTML = report.projects.map((project) => `
    <article class="film-card ${project.active ? "active" : ""}">
      <header>
        <div>
          <span class="badge ${project.active ? "green" : "blue"}">${project.active ? "Active" : escapeHtml(project.stage)}</span>
          <h2>${escapeHtml(project.title)}</h2>
          <p>${project.runtime} min ${escapeHtml(project.contentType)} - ${escapeHtml(project.goal)}</p>
        </div>
        <strong>${project.topMatch ? project.topMatch.score : 0}</strong>
      </header>
      <div class="reason-list film-card-meta">
        <span>${escapeHtml(project.region)} region</span>
        <span>${escapeHtml(project.mode)} mode</span>
        <span>$${project.maxFee} max fee</span>
        <span>${project.submissionCount} submission${project.submissionCount === 1 ? "" : "s"}</span>
      </div>
      <p>${project.topMatch ? `Top match: ${escapeHtml(project.topMatch.festivalName)} (${project.topMatch.tier}).` : "No top match yet. Complete the profile or add more festivals."}</p>
      <div class="action-row">
        <button class="secondary-button js-edit-film" type="button" data-id="${escapeHtml(project.id)}">Edit</button>
        <button class="secondary-button js-activate-film" type="button" data-id="${escapeHtml(project.id)}">Activate</button>
        <button class="secondary-button js-film-prep" type="button" data-id="${escapeHtml(project.id)}">Prep</button>
        <button class="text-button js-remove-film" type="button" data-id="${escapeHtml(project.id)}">Remove</button>
      </div>
    </article>
  `).join("");

  refs.filmTopMatches.innerHTML = report.activeMatches.length
    ? report.activeMatches.map((match) => `
      <article class="film-match-row">
        <div>
          <span class="badge ${match.tier === "Strong fit" ? "green" : "amber"}">${escapeHtml(match.tier)}</span>
          <h3>${escapeHtml(match.festival.name)}</h3>
          <p>${escapeHtml(match.festival.fitSummary)}</p>
        </div>
        <strong>${match.score}</strong>
        <button class="secondary-button js-open-intelligence" type="button" data-id="${escapeHtml(match.festival.id)}">Tips</button>
      </article>
    `).join("")
    : `
      <div class="empty-state">
        <h2>No active matches yet.</h2>
        <p>Save a complete film profile or approve more festivals into the directory.</p>
      </div>
    `;
}

function startNewFilmProject() {
  state.editingFilmId = "";
  state.filmNotice = "New film draft ready. Save it to add it to the library.";
  hydrateFilmLibraryForm(normalizeFilmProject({
    id: "",
    title: "",
    runtime: state.preferences.defaultRuntime,
    contentType: state.preferences.defaultContentType,
    goal: state.preferences.defaultGoal,
    region: state.preferences.defaultRegion,
    mode: state.preferences.defaultMode,
    maxFee: state.preferences.maxFee,
    publicAlready: state.preferences.includePublicFilms,
    stage: "Development"
  }, state.filmProfile));
  refs.filmProjectId.value = "";
  renderFilmLibrary();
}

function saveFilmProjectFromForm() {
  const project = readFilmLibraryForm();
  const exists = state.filmLibrary.projects.some((item) => item.id === project.id);
  state.filmLibrary.projects = exists
    ? state.filmLibrary.projects.map((item) => item.id === project.id ? project : item)
    : [project, ...state.filmLibrary.projects];
  setActiveFilmFromProject(project, `${project.title} saved and set as active.`);
  renderFilmLibrary();
  renderOnboarding();
  renderIntelligence();
  renderMatches();
  renderSeason();
  renderPrepPack();
  renderGuide();
  renderLaunch();
}

function activateFilmProject(projectId, message = "") {
  const project = state.filmLibrary.projects.find((item) => item.id === projectId);
  if (!project) {
    return;
  }
  setActiveFilmFromProject(project, message || `${project.title} is now active.`);
  renderFilmLibrary();
  renderOnboarding();
  renderIntelligence();
  renderMatches();
  renderSeason();
  renderPrepPack();
  renderGuide();
  renderLaunch();
}

function removeFilmProject(projectId) {
  if (state.filmLibrary.projects.length <= 1) {
    state.filmNotice = "Keep at least one film project in the library.";
    renderFilmLibrary();
    return;
  }
  const removed = state.filmLibrary.projects.find((project) => project.id === projectId);
  state.filmLibrary.projects = state.filmLibrary.projects.filter((project) => project.id !== projectId);
  if (state.filmLibrary.activeId === projectId) {
    setActiveFilmFromProject(state.filmLibrary.projects[0], `${removed?.title || "Film"} removed. Active film switched.`);
  } else {
    state.filmNotice = `${removed?.title || "Film"} removed from the library.`;
    saveFilmLibrary();
  }
  renderFilmLibrary();
  renderGuide();
  renderLaunch();
}

async function copyFilmLibrary() {
  await navigator.clipboard.writeText(filmLibraryToText(getFilmLibraryReport()));
  state.filmNotice = "Film library copied.";
  renderFilmLibrary();
}

function downloadFilmLibrary() {
  const blob = new Blob([filmLibraryToText(getFilmLibraryReport())], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-film-library-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  state.filmNotice = "Film library downloaded.";
  renderFilmLibrary();
}

function renderInstall() {
  const report = buildAppShellReport(state.installStatus);
  refs.installReadiness.textContent = `${report.readiness}%`;
  refs.installReadyCount.textContent = `${report.readyCount}/${report.totalChecks}`;
  refs.installMode.textContent = report.mode;
  refs.installCacheCount.textContent = `${state.installStatus.cachedAssets}/${APP_SHELL_ASSETS.length}`;
  refs.installOnline.textContent = report.online ? "Online" : "Offline";
  refs.installMessage.textContent = state.installNotice || report.summary;
  refs.installButton.disabled = state.installStatus.installed || !state.installPrompt;
  refs.installButton.textContent = state.installStatus.installed ? "Installed" : state.installPrompt ? "Install App" : "Waiting for Browser";

  refs.installChecklist.innerHTML = report.checks.map((check) => `
    <article class="install-check ${check.ready ? "ready" : "waiting"}">
      <span class="badge ${check.ready ? "green" : "amber"}">${check.ready ? "Ready" : "Waiting"}</span>
      <strong>${escapeHtml(check.label)}</strong>
      <p>${escapeHtml(check.detail)}</p>
    </article>
  `).join("");

  refs.installAssetList.innerHTML = APP_SHELL_ASSETS.map((asset) => `<span>${escapeHtml(asset)}</span>`).join("");

  refs.installLog.innerHTML = state.installLog.length
    ? state.installLog.map((entry) => `
      <article class="audit-item">
        <div>
          <strong>${escapeHtml(entry.action)}</strong>
          <p>${escapeHtml(entry.detail)}</p>
        </div>
        <span class="badge blue">${formatShortDate(entry.createdAt)}</span>
      </article>
    `).join("")
    : `
      <div class="empty-state">
        <h2>No install activity yet.</h2>
        <p>Service worker registration, cache checks, and install attempts will appear here.</p>
      </div>
    `;
}

function isStandaloneDisplay() {
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(navigator.standalone);
}

async function countCachedShellAssets() {
  if (!("caches" in window)) {
    return 0;
  }
    const cache = await caches.open("laurelpilot-shell-v37");
  const matches = await Promise.all(
    APP_SHELL_ASSETS.map((asset) => cache.match(asset, { ignoreSearch: true }))
  );
  return matches.filter(Boolean).length;
}

async function refreshInstallStatus(message = "") {
  let registration = null;
  if ("serviceWorker" in navigator) {
    registration = await navigator.serviceWorker.getRegistration();
  }
  const cachedAssets = await countCachedShellAssets();
  state.installStatus = {
    manifestLinked: true,
    serviceWorkerAvailable: "serviceWorker" in navigator,
    serviceWorkerRegistered: Boolean(registration),
    cacheReady: cachedAssets >= APP_SHELL_ASSETS.length,
    cachedAssets,
    noExternalApi: true,
    installPromptReady: Boolean(state.installPrompt),
    installed: isStandaloneDisplay(),
    online: navigator.onLine
  };
  if (message) {
    state.installNotice = message;
  }
  renderInstall();
  renderLaunch();
}

async function registerAppShell() {
  if (!("serviceWorker" in navigator)) {
    recordInstallLog("Offline unavailable", "This browser does not support service workers.");
    renderInstall();
    return;
  }
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (!existing) {
      await navigator.serviceWorker.register("/sw.js");
      recordInstallLog("Offline shell ready", "Service worker registered and shell cache initialized.");
    }
    await navigator.serviceWorker.ready;
    await refreshInstallStatus();
  } catch (error) {
    recordInstallLog("Offline setup failed", error.message);
    renderInstall();
  }
}

async function requestInstallApp() {
  if (state.installStatus.installed) {
    refs.installMessage.textContent = "LaurelPilot is already running in installed mode.";
    return;
  }
  if (!state.installPrompt) {
    state.installNotice = "The browser has not offered an install prompt yet. Use the browser menu if install is available.";
    renderInstall();
    return;
  }
  state.installPrompt.prompt();
  const choice = await state.installPrompt.userChoice;
  recordInstallLog("Install prompt", `User response: ${choice.outcome}.`);
  state.installPrompt = null;
  await refreshInstallStatus();
}

function launchTone(score) {
  if (score >= 88) {
    return "green";
  }
  if (score >= 74) {
    return "blue";
  }
  if (score >= 58) {
    return "amber";
  }
  return "red";
}

function renderLaunch() {
  const report = getCurrentLaunchReport();
  refs.launchScore.textContent = `${report.score}/100`;
  refs.launchStage.textContent = report.stage;
  refs.launchReadyCount.textContent = `${report.readyCount}/${report.totalChecks}`;
  refs.launchBlockerCount.textContent = String(report.blockerCount);
  refs.launchMessage.textContent = state.launchNotice || report.summary;

  refs.launchChecklist.innerHTML = report.checks.map((check) => `
    <article class="launch-check ${check.ready ? "ready" : "blocked"}">
      <div>
        <span class="badge ${check.ready ? "green" : "amber"}">${check.ready ? "Ready" : "Needs work"}</span>
        <h2>${escapeHtml(check.area)}</h2>
        <p>${escapeHtml(check.detail)}</p>
      </div>
      <div class="launch-check-score">
        <strong>${check.score}</strong>
        <span>of ${check.weight}</span>
      </div>
      <small>${escapeHtml(check.metric)}</small>
    </article>
  `).join("");

  refs.launchActions.innerHTML = report.nextActions.map((action) => `<span>${escapeHtml(action)}</span>`).join("");

  const metricRows = [
    ["Festivals", report.metrics.festivals],
    ["Accepting", report.metrics.accepting],
    ["High confidence", report.metrics.highConfidence],
    ["Active sources", report.metrics.activeSources],
    ["Radar candidates", report.metrics.candidates],
    ["Backup records", report.metrics.backupRecords],
    ["Access plan", report.metrics.accessPlan],
    ["App shell", `${report.metrics.appShellReady}/5`]
  ];
  refs.launchMetrics.innerHTML = metricRows.map(([label, value]) => `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </article>
  `).join("");

  refs.launchLog.innerHTML = state.launchAudits.length
    ? state.launchAudits.map((entry) => `
      <article class="audit-item">
        <div>
          <strong>${escapeHtml(entry.stage)} - ${entry.score}/100</strong>
          <p>${escapeHtml(entry.detail)}</p>
        </div>
        <span class="badge ${launchTone(entry.score)}">${formatShortDate(entry.createdAt)}</span>
      </article>
    `).join("")
    : `
      <div class="empty-state">
        <h2>No launch audits yet.</h2>
        <p>Run a product audit to capture the current score, blockers, and next actions.</p>
      </div>
    `;
}

function runLaunchAudit() {
  const report = getCurrentLaunchReport();
  recordLaunchAudit(report);
  state.launchNotice = `Launch audit captured: ${report.stage} at ${report.score}/100.`;
  renderLaunch();
}

async function copyLaunchBrief() {
  const report = getCurrentLaunchReport();
  await navigator.clipboard.writeText(launchReadinessToText(report));
  state.launchNotice = "Launch readiness brief copied.";
  renderLaunch();
}

function downloadLaunchChecklist() {
  const report = getCurrentLaunchReport();
  const blob = new Blob([launchReadinessToText(report)], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-launch-readiness-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  state.launchNotice = "Launch readiness checklist downloaded.";
  renderLaunch();
}

function hydrateDeviceLabOptions() {
  const currentView = refs.deviceView.value || "Product";
  const currentProfile = refs.deviceProfile.value || "mobile-stack";
  refs.deviceView.innerHTML = DEVICE_QA_VIEWS
    .map((view) => `<option>${escapeHtml(view)}</option>`)
    .join("");
  refs.deviceProfile.innerHTML = DEVICE_PROFILES
    .map((profile) => `<option value="${profile.id}">${escapeHtml(profile.label)} - ${profile.width}x${profile.height}</option>`)
    .join("");
  refs.deviceView.value = DEVICE_QA_VIEWS.includes(currentView) ? currentView : "Product";
  refs.deviceProfile.value = DEVICE_PROFILES.some((profile) => profile.id === currentProfile) ? currentProfile : "mobile-stack";
}

function hydrateDeviceLabForm(issue = null) {
  hydrateDeviceLabOptions();
  refs.deviceIssueId.value = issue?.id || "";
  refs.deviceView.value = issue?.view || refs.deviceView.value || "Product";
  refs.deviceProfile.value = issue?.device || refs.deviceProfile.value || "mobile-stack";
  refs.deviceSeverity.value = issue?.severity || "Polish";
  refs.deviceStatus.value = issue?.status || "Open";
  refs.deviceTitle.value = issue?.title || "";
  refs.deviceNotes.value = issue?.notes || "";
}

function readDeviceLabForm() {
  const existing = state.deviceLabIssues.find((issue) => issue.id === refs.deviceIssueId.value);
  return normalizeDeviceLabIssue({
    ...existing,
    id: refs.deviceIssueId.value || undefined,
    view: refs.deviceView.value,
    device: refs.deviceProfile.value,
    severity: refs.deviceSeverity.value,
    status: refs.deviceStatus.value,
    title: refs.deviceTitle.value,
    notes: refs.deviceNotes.value,
    updatedAt: new Date().toISOString()
  });
}

function saveDeviceLabIssue(message = "Device Lab note saved.") {
  const issue = readDeviceLabForm();
  const exists = state.deviceLabIssues.some((candidate) => candidate.id === issue.id);
  state.deviceLabIssues = exists
    ? state.deviceLabIssues.map((candidate) => candidate.id === issue.id ? issue : candidate)
    : [issue, ...state.deviceLabIssues];
  state.deviceLabNotice = message;
  saveDeviceLabIssues();
  hydrateDeviceLabForm(issue);
  renderDeviceLab();
  renderLaunch();
}

function clearDeviceLabForm() {
  hydrateDeviceLabForm({
    view: "Product",
    device: "mobile-stack",
    severity: "Polish",
    status: "Open",
    title: "",
    notes: ""
  });
  refs.deviceIssueId.value = "";
  state.deviceLabNotice = "Device Lab form cleared.";
  renderDeviceLab();
}

function markCurrentDeviceIssueFixed() {
  if (!refs.deviceIssueId.value) {
    refs.deviceStatus.value = "Fixed";
    state.deviceLabNotice = "Set the form status to fixed. Save the note to record it.";
    renderDeviceLab();
    return;
  }
  refs.deviceStatus.value = "Fixed";
  saveDeviceLabIssue("Device Lab note marked fixed.");
}

function renderDeviceLab() {
  const report = getCurrentDeviceLabReport();
  hydrateDeviceLabOptions();
  refs.deviceScore.textContent = `${report.summary.score}/100`;
  refs.deviceOpen.textContent = String(report.summary.open);
  refs.deviceBlockers.textContent = String(report.summary.blockers);
  refs.deviceCoverage.textContent = `${report.summary.coverage}%`;
  refs.deviceMessage.textContent = state.deviceLabNotice || report.message;

  refs.deviceProfileGrid.innerHTML = report.deviceRows.map((profile) => `
    <article class="device-profile-card ${profile.status === "Untested" ? "untested" : profile.openCount ? "open" : "cleared"}">
      <div>
        <span class="badge ${profile.blockerCount ? "red" : profile.openCount ? "amber" : profile.status === "Cleared" ? "green" : "blue"}">${escapeHtml(profile.status)}</span>
        <h2>${escapeHtml(profile.label)}</h2>
        <p>${profile.width} x ${profile.height}</p>
      </div>
      <p>${escapeHtml(profile.focus)}</p>
      <div class="device-profile-footer">
        <span>${profile.openCount} open</span>
        <button class="secondary-button js-device-log" type="button" data-device="${escapeHtml(profile.id)}">Log</button>
      </div>
    </article>
  `).join("");

  refs.deviceChecklist.innerHTML = report.checklist.map((item) => `
    <article class="launch-check ${item.ready ? "ready" : "blocked"}">
      <div>
        <span class="badge ${item.ready ? "green" : "amber"}">${item.ready ? "Ready" : "Needs work"}</span>
        <h2>${escapeHtml(item.label)}</h2>
        <p>${escapeHtml(item.detail)}</p>
      </div>
    </article>
  `).join("");

  refs.deviceIssueList.innerHTML = report.issues.length
    ? report.issues.map((issue) => {
      const profile = DEVICE_PROFILES.find((device) => device.id === issue.device);
      const tone = issue.status === "Fixed" ? "green" : issue.severity === "Blocker" ? "red" : issue.severity === "Important" ? "amber" : "blue";
      return `
        <article class="device-issue-card">
          <header>
            <div>
              <span class="badge ${tone}">${escapeHtml(issue.status)} / ${escapeHtml(issue.severity)}</span>
              <h2>${escapeHtml(issue.title)}</h2>
              <p>${escapeHtml(issue.view)} on ${escapeHtml(profile?.label || issue.device)}</p>
            </div>
            <span>${formatShortDate(issue.updatedAt)}</span>
          </header>
          ${issue.notes ? `<p>${escapeHtml(issue.notes)}</p>` : ""}
          <div class="device-issue-actions">
            <button class="secondary-button js-device-edit" type="button" data-id="${escapeHtml(issue.id)}">Edit</button>
            <button class="secondary-button js-device-fixed" type="button" data-id="${escapeHtml(issue.id)}">Mark Fixed</button>
            <button class="text-button js-device-remove" type="button" data-id="${escapeHtml(issue.id)}">Remove</button>
          </div>
        </article>
      `;
    }).join("")
    : `
      <div class="empty-state">
        <h2>No device notes yet.</h2>
        <p>Log the first mobile, tablet, or desktop observation to start the QA trail.</p>
      </div>
    `;
}

async function copyDeviceLabReport() {
  await navigator.clipboard.writeText(deviceLabToText(getCurrentDeviceLabReport()));
  state.deviceLabNotice = "Device Lab report copied.";
  renderDeviceLab();
}

function downloadDeviceLabReport() {
  const report = getCurrentDeviceLabReport();
  const blob = new Blob([deviceLabToCsv(report)], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-device-lab-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  state.deviceLabNotice = "Device Lab CSV downloaded.";
  renderDeviceLab();
}

function hydrateFeedbackOptions() {
  const currentView = refs.feedbackView.value || "Product";
  const currentType = refs.feedbackType.value || "UX note";
  const currentPriority = refs.feedbackPriority.value || "Medium";
  const currentStatus = refs.feedbackStatus.value || "New";
  const viewOptions = [...DEVICE_QA_VIEWS, "Pricing", "Payments", "Marketing", "Other"];
  refs.feedbackView.innerHTML = viewOptions
    .map((view) => `<option>${escapeHtml(view)}</option>`)
    .join("");
  refs.feedbackType.innerHTML = FEEDBACK_TYPES
    .map((type) => `<option>${escapeHtml(type)}</option>`)
    .join("");
  refs.feedbackPriority.innerHTML = FEEDBACK_PRIORITIES
    .map((priority) => `<option>${escapeHtml(priority)}</option>`)
    .join("");
  refs.feedbackStatus.innerHTML = FEEDBACK_STATUSES
    .map((status) => `<option>${escapeHtml(status)}</option>`)
    .join("");
  refs.feedbackView.value = viewOptions.includes(currentView) ? currentView : "Product";
  refs.feedbackType.value = FEEDBACK_TYPES.includes(currentType) ? currentType : "UX note";
  refs.feedbackPriority.value = FEEDBACK_PRIORITIES.includes(currentPriority) ? currentPriority : "Medium";
  refs.feedbackStatus.value = FEEDBACK_STATUSES.includes(currentStatus) ? currentStatus : "New";
}

function hydrateFeedbackForm(item = null) {
  hydrateFeedbackOptions();
  refs.feedbackItemId.value = item?.id || "";
  refs.feedbackSource.value = item?.source || "";
  refs.feedbackView.value = item?.view || "Product";
  refs.feedbackType.value = item?.type || "UX note";
  refs.feedbackPriority.value = item?.priority || "Medium";
  refs.feedbackStatus.value = item?.status || "New";
  refs.feedbackTitle.value = item?.title || "";
  refs.feedbackNotes.value = item?.notes || "";
}

function readFeedbackForm() {
  const existing = state.betaFeedbackItems.find((item) => item.id === refs.feedbackItemId.value);
  return normalizeBetaFeedbackItem({
    ...existing,
    id: refs.feedbackItemId.value || undefined,
    source: refs.feedbackSource.value,
    view: refs.feedbackView.value,
    type: refs.feedbackType.value,
    priority: refs.feedbackPriority.value,
    status: refs.feedbackStatus.value,
    title: refs.feedbackTitle.value,
    notes: refs.feedbackNotes.value,
    updatedAt: new Date().toISOString()
  });
}

function saveFeedbackItem(message = "Feedback note saved.") {
  const item = readFeedbackForm();
  const exists = state.betaFeedbackItems.some((candidate) => candidate.id === item.id);
  state.betaFeedbackItems = exists
    ? state.betaFeedbackItems.map((candidate) => candidate.id === item.id ? item : candidate)
    : [item, ...state.betaFeedbackItems];
  state.betaFeedbackNotice = message;
  saveBetaFeedbackItems();
  hydrateFeedbackForm(item);
  renderBetaFeedback();
  renderLaunch();
}

function clearFeedbackForm() {
  hydrateFeedbackForm({
    source: "",
    view: "Product",
    type: "UX note",
    priority: "Medium",
    status: "New",
    title: "",
    notes: ""
  });
  refs.feedbackItemId.value = "";
  state.betaFeedbackNotice = "Feedback form cleared.";
  renderBetaFeedback();
}

function setFeedbackFormStatus(status, message) {
  refs.feedbackStatus.value = status;
  saveFeedbackItem(message);
}

function renderBetaFeedback() {
  const report = getCurrentBetaFeedbackReport();
  hydrateFeedbackOptions();
  refs.feedbackScore.textContent = `${report.summary.score}/100`;
  refs.feedbackOpen.textContent = String(report.summary.open);
  refs.feedbackBlockers.textContent = String(report.summary.blockers);
  refs.feedbackFixed.textContent = String(report.summary.fixed);
  refs.feedbackMessage.textContent = state.betaFeedbackNotice || report.message;
  refs.feedbackActions.innerHTML = report.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join("");
  refs.feedbackThemes.innerHTML = report.themes.length
    ? report.themes.map((theme) => `
      <article>
        <span class="badge ${theme.blockerCount ? "red" : theme.openCount ? "amber" : "green"}">${theme.openCount} open</span>
        <h3>${escapeHtml(theme.type)}</h3>
        <p>${theme.count} total note${theme.count === 1 ? "" : "s"}</p>
      </article>
    `).join("")
    : `
      <article>
        <span class="badge blue">No themes</span>
        <h3>Waiting for beta signal</h3>
        <p>Log tester notes to reveal the product themes that matter most.</p>
      </article>
    `;

  refs.feedbackBoard.innerHTML = report.columns.map((column) => `
    <section class="feedback-column">
      <header>
        <div>
          <h2>${escapeHtml(column.status)}</h2>
          <p>${column.count} note${column.count === 1 ? "" : "s"}</p>
        </div>
        <span class="badge ${column.blockerCount ? "red" : "blue"}">${column.blockerCount} blockers</span>
      </header>
      <div class="feedback-card-list">
        ${column.cards.length ? column.cards.map(renderFeedbackCard).join("") : `
          <div class="feedback-empty">
            <span>No notes</span>
          </div>
        `}
      </div>
    </section>
  `).join("");
}

function renderFeedbackCard(item) {
  const priorityTone = item.priority === "Launch blocker" ? "red" : item.priority === "High" ? "amber" : item.priority === "Medium" ? "blue" : "green";
  return `
    <article class="feedback-card">
      <div class="badge-row">
        <span class="badge ${priorityTone}">${escapeHtml(item.priority)}</span>
        <span class="badge blue">${escapeHtml(item.type)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.view)} - ${escapeHtml(item.source)}</p>
      ${item.notes ? `<p class="feedback-note">${escapeHtml(item.notes)}</p>` : ""}
      <div class="feedback-card-actions">
        <button class="secondary-button js-feedback-edit" type="button" data-id="${escapeHtml(item.id)}">Edit</button>
        <button class="secondary-button js-feedback-plan" type="button" data-id="${escapeHtml(item.id)}">Plan</button>
        <button class="primary-button js-feedback-fixed" type="button" data-id="${escapeHtml(item.id)}">Fixed</button>
      </div>
      <button class="text-button js-feedback-archive" type="button" data-id="${escapeHtml(item.id)}">Archive</button>
      <button class="text-button js-feedback-remove" type="button" data-id="${escapeHtml(item.id)}">Remove</button>
    </article>
  `;
}

async function copyFeedbackReport() {
  await navigator.clipboard.writeText(betaFeedbackToText(getCurrentBetaFeedbackReport()));
  state.betaFeedbackNotice = "Beta feedback report copied.";
  renderBetaFeedback();
}

function downloadFeedbackReport() {
  const report = getCurrentBetaFeedbackReport();
  const blob = new Blob([betaFeedbackToCsv(report)], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-beta-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  state.betaFeedbackNotice = "Beta feedback CSV downloaded.";
  renderBetaFeedback();
}

function hydrateRoadmapOptions() {
  const currentType = refs.roadmapType.value || "Feature";
  const currentStatus = refs.roadmapStatus.value || "Backlog";
  const currentImpact = refs.roadmapImpact.value || "Medium";
  refs.roadmapType.innerHTML = ROADMAP_TYPES.map((type) => `<option>${escapeHtml(type)}</option>`).join("");
  refs.roadmapStatus.innerHTML = ROADMAP_STATUSES.map((status) => `<option>${escapeHtml(status)}</option>`).join("");
  refs.roadmapImpact.innerHTML = ROADMAP_IMPACTS.map((impact) => `<option>${escapeHtml(impact)}</option>`).join("");
  refs.roadmapType.value = ROADMAP_TYPES.includes(currentType) ? currentType : "Feature";
  refs.roadmapStatus.value = ROADMAP_STATUSES.includes(currentStatus) ? currentStatus : "Backlog";
  refs.roadmapImpact.value = ROADMAP_IMPACTS.includes(currentImpact) ? currentImpact : "Medium";
}

function hydrateRoadmapForm(item = null) {
  hydrateRoadmapOptions();
  refs.roadmapItemId.value = item?.id || "";
  refs.roadmapTitle.value = item?.title || "";
  refs.roadmapType.value = item?.type || "Feature";
  refs.roadmapStatus.value = item?.status || "Backlog";
  refs.roadmapImpact.value = item?.impact || "Medium";
  refs.roadmapRelease.value = item?.release || "Beta";
  refs.roadmapOwner.value = item?.owner || "Raymond";
  refs.roadmapNotes.value = item?.notes || "";
}

function readRoadmapForm() {
  const existing = state.roadmapItems.find((item) => item.id === refs.roadmapItemId.value);
  const status = refs.roadmapStatus.value;
  return normalizeRoadmapItem({
    ...existing,
    id: refs.roadmapItemId.value || undefined,
    title: refs.roadmapTitle.value,
    type: refs.roadmapType.value,
    status,
    impact: refs.roadmapImpact.value,
    release: refs.roadmapRelease.value,
    owner: refs.roadmapOwner.value,
    notes: refs.roadmapNotes.value,
    shippedAt: status === "Shipped" ? existing?.shippedAt || new Date().toISOString() : existing?.shippedAt || "",
    updatedAt: new Date().toISOString()
  });
}

function saveRoadmapItem(message = "Roadmap item saved.") {
  const item = readRoadmapForm();
  const exists = state.roadmapItems.some((candidate) => candidate.id === item.id);
  state.roadmapItems = exists
    ? state.roadmapItems.map((candidate) => candidate.id === item.id ? item : candidate)
    : [item, ...state.roadmapItems];
  state.roadmapNotice = message;
  saveRoadmapItems();
  hydrateRoadmapForm(item);
  renderRoadmap();
  renderLaunch();
}

function clearRoadmapForm() {
  hydrateRoadmapForm({
    title: "",
    type: "Feature",
    status: "Backlog",
    impact: "Medium",
    release: "Beta",
    owner: "Raymond",
    notes: ""
  });
  refs.roadmapItemId.value = "";
  state.roadmapNotice = "Roadmap form cleared.";
  renderRoadmap();
}

function setRoadmapFormStatus(status, message) {
  refs.roadmapStatus.value = status;
  saveRoadmapItem(message);
}

function renderRoadmap() {
  const report = getCurrentRoadmapReport();
  hydrateRoadmapOptions();
  refs.roadmapScore.textContent = `${report.summary.score}/100`;
  refs.roadmapActive.textContent = String(report.summary.active);
  refs.roadmapShipped.textContent = String(report.summary.shipped);
  refs.roadmapReleases.textContent = String(report.summary.releaseCount);
  refs.roadmapMessage.textContent = state.roadmapNotice || report.message;
  refs.roadmapActions.innerHTML = report.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join("");

  refs.roadmapBoard.innerHTML = report.columns.map((column) => `
    <section class="roadmap-column">
      <header>
        <div>
          <h2>${escapeHtml(column.status)}</h2>
          <p>${column.count} item${column.count === 1 ? "" : "s"}</p>
        </div>
        <span class="badge ${column.revenueCount ? "red" : "blue"}">${column.revenueCount} revenue</span>
      </header>
      <div class="roadmap-card-list">
        ${column.cards.length ? column.cards.map(renderRoadmapCard).join("") : `
          <div class="roadmap-empty">
            <span>No items</span>
          </div>
        `}
      </div>
    </section>
  `).join("");

  refs.roadmapChangelog.innerHTML = report.changelog.length
    ? report.changelog.map((item) => `
      <article class="roadmap-release-card">
        <span class="badge green">${escapeHtml(item.shippedDate)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.release)} - ${escapeHtml(item.type)} - ${escapeHtml(item.owner)}</p>
        ${item.notes ? `<small>${escapeHtml(item.notes)}</small>` : ""}
      </article>
    `).join("")
    : `
      <div class="roadmap-empty changelog-empty">
        <span>No shipped release notes yet.</span>
      </div>
    `;
}

function renderRoadmapCard(item) {
  const impactTone = item.impact === "Revenue critical" ? "red" : item.impact === "High" ? "amber" : item.impact === "Medium" ? "blue" : "green";
  return `
    <article class="roadmap-card">
      <div class="badge-row">
        <span class="badge ${impactTone}">${escapeHtml(item.impact)}</span>
        <span class="badge blue">${escapeHtml(item.type)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.release)} - ${escapeHtml(item.owner)}</p>
      ${item.notes ? `<p class="roadmap-note">${escapeHtml(item.notes)}</p>` : ""}
      <div class="roadmap-card-actions">
        <button class="secondary-button js-roadmap-edit" type="button" data-id="${escapeHtml(item.id)}">Edit</button>
        <button class="secondary-button js-roadmap-next" type="button" data-id="${escapeHtml(item.id)}">Next</button>
        <button class="primary-button js-roadmap-ship" type="button" data-id="${escapeHtml(item.id)}">Ship</button>
      </div>
      <button class="text-button js-roadmap-pause" type="button" data-id="${escapeHtml(item.id)}">Pause</button>
      <button class="text-button js-roadmap-remove" type="button" data-id="${escapeHtml(item.id)}">Remove</button>
    </article>
  `;
}

async function copyRoadmapReport() {
  await navigator.clipboard.writeText(roadmapToText(getCurrentRoadmapReport()));
  state.roadmapNotice = "Roadmap and changelog report copied.";
  renderRoadmap();
}

function downloadRoadmapReport() {
  const report = getCurrentRoadmapReport();
  const blob = new Blob([roadmapToCsv(report)], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-roadmap-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  state.roadmapNotice = "Roadmap CSV downloaded.";
  renderRoadmap();
}

function renderGuide() {
  const guide = getCurrentGuide();
  refs.guideWorkflow.value = state.guideWorkflow;
  refs.guidePhase.value = state.guidePhase;
  refs.guideProgress.textContent = `${guide.progress}%`;
  refs.guideNextStep.textContent = guide.nextStep?.title || "Ready";
  refs.guideStage.textContent = guide.heroStats.find((stat) => stat.label === "Launch stage")?.value || "Not checked";
  refs.guideRecords.textContent = guide.heroStats.find((stat) => stat.label === "Festival records")?.value || "0";
  refs.guideMessage.textContent = state.guideNotice || `${guide.workflow.promise} ${guide.phaseCopy}`;

  refs.guideHeroStats.innerHTML = guide.heroStats.map((stat) => `
    <article>
      <span>${escapeHtml(stat.label)}</span>
      <strong>${escapeHtml(stat.value)}</strong>
    </article>
  `).join("");

  refs.guideSteps.innerHTML = guide.steps.map((step) => `
    <article class="guide-step ${step.ready ? "ready" : "next"}">
      <span class="guide-number">${step.number}</span>
      <div>
        <span class="badge ${step.ready ? "green" : "amber"}">${step.ready ? "Ready" : "Next"}</span>
        <h2>${escapeHtml(step.title)}</h2>
        <p>${escapeHtml(step.detail)}</p>
      </div>
      <button class="secondary-button js-go-view" type="button" data-view-target="${escapeHtml(step.view)}">Open</button>
    </article>
  `).join("");

  refs.guideTools.innerHTML = guide.toolCards.map((tool) => `
    <article class="guide-tool">
      <span class="badge blue">${escapeHtml(tool.label)}</span>
      <h2>${escapeHtml(tool.bestFor)}</h2>
      <p>${escapeHtml(tool.purpose)}</p>
      <button class="secondary-button js-go-view" type="button" data-view-target="${escapeHtml(tool.view)}">Open ${escapeHtml(tool.label)}</button>
    </article>
  `).join("");

  refs.guideRecommendations.innerHTML = guide.recommendations.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
}

async function copyProductGuide() {
  const guide = getCurrentGuide();
  await navigator.clipboard.writeText(productGuideToText(guide));
  state.guideNotice = "Product guide copied.";
  renderGuide();
}

function downloadProductGuide() {
  const guide = getCurrentGuide();
  const blob = new Blob([productGuideToText(guide)], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-product-guide-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  state.guideNotice = "Product guide downloaded.";
  renderGuide();
}

function renderSettings() {
  const summary = getCurrentSettingsSummary();
  const summaryCards = Object.fromEntries(summary.cards.map((card) => [card.id, card]));
  refs.settingsStartViewMetric.textContent = summaryCards.startup?.value || summary.preferences.startView;
  refs.settingsModeMetric.textContent = summary.preferences.productMode;
  refs.settingsRegionMetric.textContent = summary.preferences.defaultRegion;
  refs.settingsFeeMetric.textContent = summaryCards.fees?.value || `$${summary.preferences.maxFee}`;
  refs.settingsFeeValue.textContent = `$${refs.settingsFee.value} max`;
  refs.settingsMessage.textContent = state.settingsNotice || summary.summary;

  refs.settingsCards.innerHTML = summary.cards.map((card) => `
    <article class="settings-card">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
    </article>
  `).join("");

  refs.settingsProfilePreview.innerHTML = `
    <div class="settings-profile-card">
      <span class="badge blue">Profile seed</span>
      <h2>${escapeHtml(summary.profileSeed.contentType)} short, ${summary.profileSeed.runtime} minutes</h2>
      <p>${escapeHtml(summary.profileSeed.goal)} goal, ${escapeHtml(summary.profileSeed.region)} region, ${escapeHtml(summary.profileSeed.mode)} mode, $${summary.profileSeed.maxFee} fee ceiling.</p>
      <div class="badge-row">
        <span class="badge ${summary.profileSeed.publicAlready ? "amber" : "green"}">${summary.profileSeed.publicAlready ? "Public film allowed" : "Premiere-safe default"}</span>
        <span class="badge ${summary.preferences.localOnlyReminder ? "green" : "amber"}">${summary.preferences.localOnlyReminder ? "Local-only reminder on" : "Reminder hidden"}</span>
        <span class="badge ${summary.preferences.exportReminder ? "green" : "amber"}">${summary.preferences.exportReminder ? "Backup reminder on" : "Backup reminder off"}</span>
      </div>
    </div>
  `;

  refs.settingsActions.innerHTML = summary.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join("");
}

function saveSettingsFromForm(message = "Preferences saved.") {
  state.preferences = readSettingsForm();
  state.settingsNotice = message;
  savePreferences();
  renderSettings();
  renderGuide();
  renderLaunch();
}

function applySettingsToProfile() {
  state.preferences = readSettingsForm();
  state.filmProfile = preferencesToFilmProfile(state.preferences, state.filmProfile);
  savePreferences();
  saveFilmProfile();
  hydrateFilmProfile();
  hydrateOnboardingForm();
  hydratePrepDraft();
  hydrateIntelligenceChoices();
  state.settingsNotice = "Preferences applied to the Match profile.";
  syncActiveFilmFromProfile("Preferences applied to active film.");
  renderSettings();
  renderFilmLibrary();
  renderOnboarding();
  renderIntelligence();
  renderMatches();
  renderPrepPack();
  renderGuide();
  renderLaunch();
}

async function copySettingsSummary() {
  saveSettingsFromForm("Preferences saved and copied.");
  await navigator.clipboard.writeText(settingsSummaryToText(getCurrentSettingsSummary()));
}

function downloadSettingsSummary() {
  saveSettingsFromForm("Preferences saved and downloaded.");
  const blob = new Blob([settingsSummaryToText(getCurrentSettingsSummary())], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-preferences-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function resetSettings() {
  state.preferences = normalizeUserPreferences({});
  state.settingsNotice = "Preferences reset to LaurelPilot defaults.";
  savePreferences();
  hydrateSettingsForm();
  renderSettings();
  renderGuide();
  renderLaunch();
}

function saveOnboardingProfile(message = "Film profile saved. Starter matches updated.") {
  state.filmProfile = readOnboardingProfile();
  state.onboarding = normalizeOnboardingState({
    ...state.onboarding,
    completedSteps: [...state.onboarding.completedSteps, "film-profile", "submission-goals"]
  });
  saveFilmProfile();
  saveOnboardingState();
  syncActiveFilmFromProfile(message);
  hydrateFilmProfile();
  hydratePrepDraft();
  hydrateIntelligenceChoices();
  refs.onboardMessage.textContent = message;
  renderOnboarding();
  renderIntelligence();
  renderMatches();
  renderPrepPack();
  renderLaunch();
}

function loadOnboardingSample() {
  state.filmProfile = {
    title: "Signal Bloom",
    runtime: 7,
    contentType: "Animation",
    goal: "Prestige",
    region: "Online",
    mode: "Any",
    maxFee: 25,
    publicAlready: false
  };
  state.onboarding = normalizeOnboardingState({
    ...state.onboarding,
    completedSteps: ["film-profile", "submission-goals"]
  });
  saveFilmProfile();
  saveOnboardingState();
  syncActiveFilmFromProfile("Sample film added to the library.");
  hydrateFilmProfile();
  hydrateOnboardingForm();
  hydratePrepDraft();
  hydrateIntelligenceChoices();
  refs.onboardMessage.textContent = "Sample film profile loaded.";
  renderOnboarding();
  renderIntelligence();
  renderMatches();
  renderPrepPack();
  renderLaunch();
}

function completeOnboarding() {
  state.filmProfile = readOnboardingProfile();
  state.onboarding = normalizeOnboardingState({
    ...state.onboarding,
    shortlistReviewed: true,
    completedSteps: ["film-profile", "submission-goals", "starter-shortlist", "first-action"],
    completedAt: new Date().toISOString()
  });
  saveFilmProfile();
  saveOnboardingState();
  syncActiveFilmFromProfile("Onboarding profile saved to Film Library.");
  hydrateFilmProfile();
  hydratePrepDraft();
  hydrateIntelligenceChoices();
  refs.onboardMessage.textContent = "Onboarding marked complete. You are ready to work.";
  renderOnboarding();
  renderIntelligence();
  renderMatches();
  renderPrepPack();
  renderLaunch();
}

function resetOnboarding() {
  state.onboarding = normalizeOnboardingState({
    completedSteps: [],
    shortlistReviewed: false,
    completedAt: ""
  });
  saveOnboardingState();
  refs.onboardMessage.textContent = "Onboarding progress reset.";
  renderOnboarding();
  renderLaunch();
}

function renderDiscover() {
  const list = filteredFestivals();
  const summary = summarizeFestivals(list);
  refs.resultHeading.textContent = `Showing ${plural(list.length, "festival")} matching your filters`;
  refs.acceptingCount.textContent = String(summary.accepting);
  refs.urgentCount.textContent = String(summary.urgent);
  refs.prizeTotal.textContent = formatMoney(summary.prizeTotal).replace("No prize listed", "$0");
  refs.confidenceCount.textContent = String(summary.highConfidence);
  refs.tableWrap.classList.toggle("hidden", state.display !== "table");
  refs.festivalGrid.classList.toggle("hidden", state.display !== "cards");
  refs.tableBody.innerHTML = list.length ? list.map(renderFestivalRow).join("") : emptyTableRow();
  refs.festivalGrid.innerHTML = list.length ? list.map(renderFestivalCard).join("") : emptyCardState();
  renderCompareBar();
}

function getSourceProofReport() {
  return buildSourceTrustReport(getAllFestivals());
}

function renderProof() {
  const report = getSourceProofReport();
  const qualityReport = buildFestivalDataQualityReport(getAllFestivals());
  refs.proofAverage.textContent = `${report.summary.averageScore}/100`;
  refs.proofVerified.textContent = String(report.summary.verified);
  refs.proofStale.textContent = String(report.summary.stale);
  refs.proofReview.textContent = String(report.summary.needsReview);
  refs.proofQuality.textContent = `${qualityReport.summary.averageScore}/100`;
  refs.proofReady.textContent = String(qualityReport.summary.subscriberReady);
  refs.proofEnrich.textContent = String(qualityReport.summary.needsEnrichment);
  refs.proofStrategy.textContent = `${qualityReport.summary.averageStrategyDepth}%`;
  refs.proofMessage.textContent = state.proofNotice || qualityReport.message;
  refs.proofActions.innerHTML = [...report.actions, ...qualityReport.actions]
    .map((action) => `<span>${escapeHtml(action)}</span>`)
    .join("");
  const qualityRows = new Map(qualityReport.rows.map((row) => [row.festivalId, row]));
  refs.proofRows.innerHTML = report.rows.length
    ? report.rows.map((row) => {
      const quality = qualityRows.get(row.festivalId);
      return `
      <article class="proof-row ${quality?.tone || row.tone}">
        <div class="proof-row-main">
          <div>
            <div class="badge-row">
              <span class="badge ${row.tone}">${row.score}/100 ${escapeHtml(row.tier)}</span>
              ${quality ? `<span class="badge ${quality.tone}">${quality.score}/100 ${escapeHtml(quality.tier)}</span>` : ""}
              <span class="badge ${row.freshnessTone}">${escapeHtml(row.freshnessLabel)}</span>
              <span class="badge">${escapeHtml(row.sourceType)}</span>
            </div>
            <h2>${escapeHtml(row.festivalName)}</h2>
            <p>${escapeHtml(quality?.summary || row.summary)}</p>
          </div>
          <strong>${Number.isFinite(row.verifiedAgeDays) ? `${row.verifiedAgeDays}d` : "No date"}</strong>
        </div>
        <div class="proof-grid">
          <div>
            <span>Last verified</span>
            <strong>${row.lastVerified ? formatShortDate(row.lastVerified) : "Missing"}</strong>
          </div>
          <div>
            <span>Links</span>
            <strong>${row.hasWebsite && row.hasSubmission ? "Complete" : "Review"}</strong>
          </div>
          <div>
            <span>Proof signals</span>
            <strong>${row.greenFlags + row.communitySignals}</strong>
          </div>
          <div>
            <span>Warnings</span>
            <strong>${row.warnings.length}</strong>
          </div>
          <div>
            <span>Strategy depth</span>
            <strong>${quality ? `${quality.strategyDepth}%` : "n/a"}</strong>
          </div>
          <div>
            <span>Data gaps</span>
            <strong>${quality ? quality.missing.length : 0}</strong>
          </div>
        </div>
        <div class="reason-list proof-points">
          ${row.proofPoints.slice(0, 4).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
          ${(quality?.missing || []).slice(0, 4).map((item) => `<span class="quality-gap">${escapeHtml(item)}</span>`).join("")}
          ${row.warnings.slice(0, 3).map((item) => `<span class="warning">${escapeHtml(item)}</span>`).join("")}
          ${(quality?.warnings || []).filter((item) => !row.warnings.includes(item)).slice(0, 2).map((item) => `<span class="warning">${escapeHtml(item)}</span>`).join("")}
        </div>
        <div class="action-row">
          <button class="secondary-button js-detail" type="button" data-id="${escapeHtml(row.festivalId)}">Open Details</button>
          <button class="secondary-button js-open-intelligence" type="button" data-id="${escapeHtml(row.festivalId)}">Strategy Tips</button>
        </div>
      </article>
    `;
    }).join("")
    : `
      <div class="empty-state">
        <h2>No proof rows yet.</h2>
        <p>Add festival records before auditing source freshness.</p>
      </div>
    `;
}

async function copySourceProof() {
  await navigator.clipboard.writeText([
    sourceTrustToText(getSourceProofReport()),
    "",
    festivalDataQualityToText(buildFestivalDataQualityReport(getAllFestivals()))
  ].join("\n"));
  state.proofNotice = "Source proof report copied.";
  renderProof();
}

function downloadSourceProof() {
  const blob = new Blob([
    [
      sourceTrustToText(getSourceProofReport()),
      "",
      festivalDataQualityToText(buildFestivalDataQualityReport(getAllFestivals()))
    ].join("\n")
  ], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-source-proof-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  state.proofNotice = "Source proof report downloaded.";
  renderProof();
}

function getDeadlineCalendarReport() {
  return buildDeadlineCalendar(getAllFestivals(), {
    windowDays: state.calendar.range,
    status: state.calendar.status,
    region: state.calendar.region
  });
}

function updateDeadlineCalendarState() {
  state.calendar.range = refs.calendarRange.value;
  state.calendar.status = refs.calendarStatus.value;
  state.calendar.region = refs.calendarRegion.value;
}

function renderDeadlineCalendar() {
  const report = getDeadlineCalendarReport();
  refs.calendarRange.value = state.calendar.range;
  refs.calendarStatus.value = state.calendar.status;
  refs.calendarRegion.value = state.calendar.region;
  refs.calendarCount.textContent = String(report.summary.total);
  refs.calendarNext7.textContent = String(report.summary.next7);
  refs.calendarFees.textContent = formatMoney(report.summary.feeTotal).replace("No prize listed", "$0");
  refs.calendarPrizes.textContent = formatMoney(report.summary.prizeTotal).replace("No prize listed", "$0");
  refs.calendarMessage.textContent = state.calendar.notice || `${report.summary.rangeLabel}: ${plural(report.summary.total, "deadline")} across ${plural(report.months.length, "month")}.`;

  refs.calendarActions.innerHTML = report.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join("");
  refs.calendarMonths.innerHTML = report.months.length
    ? report.months.map((month) => `
      <article class="deadline-month-card">
        <span>${escapeHtml(month.label)}</span>
        <strong>${month.deadlineCount}</strong>
        <p>${formatMoney(month.feeTotal).replace("No prize listed", "$0")} fees / ${formatMoney(month.prizeTotal).replace("No prize listed", "$0")} prizes</p>
      </article>
    `).join("")
    : `
      <div class="empty-state">
        <h2>No months in this view.</h2>
        <p>Try expanding the deadline range or selecting All statuses.</p>
      </div>
    `;

  refs.calendarTimeline.innerHTML = report.months.length
    ? report.months.map((month) => `
      <section class="deadline-month">
        <header>
          <div>
            <p class="eyebrow">${escapeHtml(month.label)}</p>
            <h2>${plural(month.deadlineCount, "deadline")}</h2>
          </div>
          <span class="badge blue">${formatMoney(month.feeTotal).replace("No prize listed", "$0")} fees</span>
        </header>
        <div class="deadline-list">
          ${month.rows.map((row) => `
            <article class="deadline-card">
              <div class="deadline-date">
                <strong>${row.daysUntil === 0 ? "Today" : `${row.daysUntil}d`}</strong>
                <span>${escapeHtml(row.deadlineDate)}</span>
              </div>
              <div>
                <div class="badge-row">
                  <span class="badge ${row.tone}">${escapeHtml(row.urgency)}</span>
                  <span class="badge">${escapeHtml(row.status)}</span>
                  <span class="badge">${row.confidence}% verified</span>
                </div>
                <h3>${escapeHtml(row.name)}</h3>
                <p>${escapeHtml(row.fitSummary)}</p>
                <div class="reason-list deadline-meta">
                  <span>${escapeHtml(row.location)}</span>
                  <span>${escapeHtml(row.mode)}</span>
                  <span>Fee $${row.entryFee}</span>
                  <span>${formatMoney(row.prizeMoney).replace("No prize listed", "$0")} prize</span>
                </div>
              </div>
              <div class="deadline-actions">
                <button class="secondary-button js-detail" type="button" data-id="${escapeHtml(row.id)}">Details</button>
                <button class="secondary-button js-track" type="button" data-id="${escapeHtml(row.id)}">Track</button>
                <button class="primary-button js-calendar-prep" type="button" data-id="${escapeHtml(row.id)}">Prep</button>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `).join("")
    : `
      <div class="empty-state">
        <h2>No deadlines match this calendar view.</h2>
        <p>Try All regions, All statuses, or a longer planning range.</p>
      </div>
    `;
}

async function copyDeadlineCalendarPlan() {
  const report = getDeadlineCalendarReport();
  await navigator.clipboard.writeText(deadlineCalendarToText(report));
  state.calendar.notice = "Deadline plan copied.";
  renderDeadlineCalendar();
}

function downloadDeadlineCalendarPlan() {
  const report = getDeadlineCalendarReport();
  const blob = new Blob([deadlineCalendarToText(report)], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-deadline-plan-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  state.calendar.notice = "Deadline plan downloaded.";
  renderDeadlineCalendar();
}

function downloadDeadlineCalendarIcs() {
  const report = getDeadlineCalendarReport();
  const blob = new Blob([deadlineCalendarToIcs(report)], { type: "text/calendar" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-deadlines-${new Date().toISOString().slice(0, 10)}.ics`;
  link.click();
  URL.revokeObjectURL(link.href);
  state.calendar.notice = `${plural(report.summary.total, "deadline")} exported as calendar events.`;
  renderDeadlineCalendar();
}

function hydrateSeasonStrategyOptions() {
  const current = refs.seasonStrategy.value || state.season.strategy;
  refs.seasonStrategy.innerHTML = SEASON_STRATEGIES
    .map((strategy) => `<option>${escapeHtml(strategy)}</option>`)
    .join("");
  refs.seasonStrategy.value = SEASON_STRATEGIES.includes(current) ? current : "Balanced";
}

function updateSeasonState() {
  state.season.budget = Number(refs.seasonBudget.value || 0);
  state.season.targetCount = Number(refs.seasonTargets.value || 5);
  state.season.windowDays = refs.seasonWindow.value;
  state.season.strategy = refs.seasonStrategy.value;
  state.season.region = refs.seasonRegion.value;
}

function getCurrentSeasonPlan() {
  updateSeasonState();
  return buildSubmissionSeasonPlan(getAllFestivals(), state.filmProfile, state.season);
}

function renderSeason() {
  hydrateSeasonStrategyOptions();
  refs.seasonBudget.value = String(state.season.budget);
  refs.seasonTargets.value = String(state.season.targetCount);
  refs.seasonWindow.value = String(state.season.windowDays);
  refs.seasonStrategy.value = state.season.strategy;
  refs.seasonRegion.value = state.season.region;
  const plan = getCurrentSeasonPlan();

  refs.seasonBudgetValue.textContent = `${formatMoney(plan.options.budget).replace("No prize listed", "$0")} budget`;
  refs.seasonSelected.textContent = `${plan.summary.selectedCount}/${plan.options.targetCount}`;
  refs.seasonFees.textContent = formatMoney(plan.summary.totalFees).replace("No prize listed", "$0");
  refs.seasonFit.textContent = `${plan.summary.averageFit}/100`;
  refs.seasonPrize.textContent = formatMoney(plan.summary.prizeUpside).replace("No prize listed", "$0");
  refs.seasonMessage.textContent = state.season.notice || plan.message;
  refs.seasonActions.innerHTML = plan.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join("");

  refs.seasonSlate.innerHTML = plan.selected.length
    ? plan.selected.map((target) => {
      const tone = target.match.tier === "Strong fit" ? "green" : target.match.tier === "Possible fit" ? "amber" : "red";
      return `
        <article class="season-target-card">
          <div class="season-priority">
            <span>${target.priority}</span>
            <small>${target.planningScore}</small>
          </div>
          <div>
            <div class="badge-row">
              <span class="badge ${tone}">${escapeHtml(target.match.tier)}</span>
              <span class="badge blue">${escapeHtml(target.phase)}</span>
              <span class="badge">$${target.fee} fee</span>
            </div>
            <h2>${escapeHtml(target.festival.name)}</h2>
            <p>${escapeHtml(target.reason)}</p>
            <div class="reason-list season-meta">
              <span>${formatShortDate(target.festival.deadline)}</span>
              <span>${target.daysUntil} days left</span>
              <span>${escapeHtml(target.festival.location.region)}</span>
              <span>${formatMoney(target.prizeMoney).replace("No prize listed", "$0")} prize</span>
            </div>
            <p>${escapeHtml(target.action)}</p>
          </div>
          <div class="season-card-actions">
            <button class="secondary-button js-open-intelligence" type="button" data-id="${escapeHtml(target.festival.id)}">Tips</button>
            <button class="secondary-button js-intel-prep" type="button" data-id="${escapeHtml(target.festival.id)}">Prep</button>
            <button class="primary-button js-track" type="button" data-id="${escapeHtml(target.festival.id)}">Track</button>
          </div>
        </article>
      `;
    }).join("")
    : `
      <div class="empty-state">
        <h2>No season targets yet.</h2>
        <p>Try a larger budget, longer window, or Any region.</p>
      </div>
    `;

  refs.seasonMonths.innerHTML = plan.months.length
    ? plan.months.map((month) => `
      <article class="season-month-card">
        <span>${escapeHtml(month.label)}</span>
        <strong>${plural(month.targets.length, "target")}</strong>
        <p>${formatMoney(month.fees).replace("No prize listed", "$0")} planned fees</p>
      </article>
    `).join("")
    : `
      <div class="empty-state">
        <h2>No month groups yet.</h2>
        <p>The slate will group itself once festivals are selected.</p>
      </div>
    `;

  refs.seasonSkipped.innerHTML = plan.skipped.length
    ? plan.skipped.slice(0, 5).map((target) => `
      <article class="season-skip-card">
        <strong>${escapeHtml(target.festival.name)}</strong>
        <p>${escapeHtml(target.skipReason)}</p>
      </article>
    `).join("")
    : "<span>Nothing skipped. This plan fits cleanly inside the selected constraints.</span>";

  const topTarget = plan.selected[0] || null;
  const topInPrep = topTarget && state.prepDraft.festivalId === topTarget.festival.id;
  const queuedCount = plan.selected.filter((target) =>
    state.pipelineItems.some((item) =>
      item.festivalId === target.festival.id &&
      String(item.filmTitle || "").trim().toLowerCase() === String(state.filmProfile.title || "Untitled Film").trim().toLowerCase()
    )
  ).length;
  refs.seasonHandoff.innerHTML = topTarget
    ? `
      <article class="season-handoff-step ${topInPrep ? "ready" : ""}">
        <span>1</span>
        <div>
          <strong>${topInPrep ? "Prep pack loaded" : "Start top prep"}</strong>
          <p>${escapeHtml(topTarget.festival.name)} is priority ${topTarget.priority}. ${topInPrep ? "It is already loaded in Prep Pack." : "Load it into Prep Pack first."}</p>
        </div>
      </article>
      <article class="season-handoff-step ${queuedCount === plan.selected.length ? "ready" : queuedCount ? "partial" : ""}">
        <span>2</span>
        <div>
          <strong>${queuedCount}/${plan.selected.length} queued</strong>
          <p>Send the full season slate to Pipeline so research, prep, and follow-up work stays organized.</p>
        </div>
      </article>
      <article class="season-handoff-step">
        <span>3</span>
        <div>
          <strong>Track the submission</strong>
          <p>Once the prep pack is finished, use Track to record the submission date, status, and notes.</p>
        </div>
      </article>
    `
    : `
      <div class="empty-state">
        <h2>No handoff yet.</h2>
        <p>Create a slate first, then LaurelPilot will show the next workflow step.</p>
      </div>
    `;
  refs.seasonPrep.disabled = !topTarget;
  refs.seasonPipeline.disabled = plan.selected.length === 0;
}

async function copySeasonPlan() {
  const plan = getCurrentSeasonPlan();
  await navigator.clipboard.writeText(seasonPlanToText(plan));
  state.season.notice = "Season plan copied.";
  renderSeason();
}

function downloadSeasonPlan() {
  const plan = getCurrentSeasonPlan();
  const blob = new Blob([seasonPlanToText(plan)], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-season-plan-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  state.season.notice = "Season plan downloaded.";
  renderSeason();
}

function startTopSeasonPrep() {
  const plan = getCurrentSeasonPlan();
  const topTarget = plan.selected[0];
  if (!topTarget) {
    state.season.notice = "Create a season slate before starting a prep pack.";
    renderSeason();
    return;
  }
  state.prepDraft = {
    ...state.prepDraft,
    festivalId: topTarget.festival.id,
    filmTitle: state.filmProfile.title || state.prepDraft.filmTitle || "",
    privateNotes: `Season priority ${topTarget.priority}: ${topTarget.action}`
  };
  savePrepDraft();
  hydratePrepDraft();
  renderPrepPack();
  renderSeason();
  renderLaunch();
  state.view = "prep";
  renderView();
}

function addSeasonPlanToPipeline() {
  const plan = getCurrentSeasonPlan();
  if (!plan.selected.length) {
    state.season.notice = "Create a season slate before sending targets to the pipeline.";
    renderSeason();
    return;
  }
  const filmTitle = state.filmProfile.title || "Untitled Film";
  const incoming = plan.selected.map((target) => normalizePipelineItem({
    festivalId: target.festival.id,
    filmTitle,
    stage: target.phase === "Submit now" ? "Preparing" : "Researching",
    priority: target.priority <= 2 || target.daysUntil <= 14 ? "High" : "Medium",
    dueDate: target.festival.deadline.slice(0, 10),
    notes: `Season plan ${plan.options.strategy}: ${target.action}`
  }));
  const existingKeys = new Set(incoming.map((item) => `${item.festivalId}-${item.filmTitle.toLowerCase()}`));
  state.pipelineItems = [
    ...incoming,
    ...state.pipelineItems.filter((item) => !existingKeys.has(`${item.festivalId}-${String(item.filmTitle || "").toLowerCase()}`))
  ];
  savePipelineItems();
  hydratePipelineForm(incoming[0]);
  state.season.notice = `${plural(incoming.length, "season target")} sent to the pipeline.`;
  state.pipelineNotice = "Season plan loaded into the pipeline.";
  renderSeason();
  renderPipeline();
  renderLaunch();
  state.view = "pipeline";
  renderView();
}

function renderFestivalRow(festival) {
  const urgentClass = isUrgent(festival.deadline) ? " deadline-urgent" : "";
  return `
    <tr>
      <td>
        <input class="compare-check" type="checkbox" data-id="${festival.id}" ${state.selected.has(festival.id) ? "checked" : ""} aria-label="Compare ${escapeHtml(festival.name)}" />
      </td>
      <td>
        <p class="festival-title">${escapeHtml(festival.name)}</p>
        <p class="festival-description">${escapeHtml(festival.description)}</p>
        <div class="badge-row">${statusBadge(festival.status)}${confidenceBadge(festival)}${trustBadge(festival)}</div>
      </td>
      <td class="deadline-cell${urgentClass}">
        <strong>${formatShortDate(festival.deadline)}</strong>
        <span>${deadlineLabel(festival)}</span>
      </td>
      <td>${escapeHtml(festival.location.city)}, ${escapeHtml(festival.location.country)}<br /><span class="badge">${festival.location.mode}</span></td>
      <td>${formatMoney(festival.prizeMoney)}<br /><span class="badge">$${festival.entryFee} fee</span></td>
      <td>${festival.duration.min}-${festival.duration.max} min<br /><span class="badge">${escapeHtml(festival.contentTypes[0])}</span></td>
      <td><p class="festival-description">${escapeHtml(festival.fitSummary)}</p></td>
      <td>
        <div class="badge-row source-badges">
          ${trustBadge(festival)}
          ${freshnessBadge(festival)}
        </div>
        <p class="festival-description">${escapeHtml(festival.sourceType || "Source unlabelled")}</p>
      </td>
      <td>
        <div class="action-row">
          <button class="secondary-button js-detail" type="button" data-id="${festival.id}">View Details</button>
          <button class="secondary-button js-open-intelligence" type="button" data-id="${festival.id}">Tips</button>
          <button class="secondary-button js-calendar" type="button" data-id="${festival.id}">Calendar</button>
          <button class="primary-button js-track" type="button" data-id="${festival.id}">Track</button>
        </div>
      </td>
    </tr>
  `;
}

function renderFestivalCard(festival) {
  const urgent = isUrgent(festival.deadline) ? "red" : "blue";
  return `
    <article class="festival-card">
      <div>
        <div class="badge-row">${statusBadge(festival.status)}${confidenceBadge(festival)}${trustBadge(festival)}</div>
        <h2>${escapeHtml(festival.name)}</h2>
        <p>${escapeHtml(festival.description)}</p>
      </div>
      <div class="badge-row">
        <span class="badge ${urgent}">${deadlineLabel(festival)}</span>
        <span class="badge">${escapeHtml(festival.location.region)}</span>
        <span class="badge">${festival.duration.min}-${festival.duration.max} min</span>
        ${freshnessBadge(festival)}
      </div>
      <p><strong>Best fit:</strong> ${escapeHtml(festival.fitSummary)}</p>
      <p><strong>Prize:</strong> ${formatMoney(festival.prizeMoney)} <span class="badge">$${festival.entryFee} fee</span></p>
      <p><strong>Source:</strong> ${escapeHtml(festival.sourceType || "Source unlabelled")} - verified ${escapeHtml(festival.lastVerified || "unknown")}</p>
      <div class="card-spacer"></div>
      <div class="action-row">
        <button class="secondary-button js-detail" type="button" data-id="${festival.id}">View Details</button>
        <button class="secondary-button js-open-intelligence" type="button" data-id="${festival.id}">Tips</button>
        <button class="secondary-button js-calendar" type="button" data-id="${festival.id}">Calendar</button>
        <button class="primary-button js-track" type="button" data-id="${festival.id}">Track</button>
      </div>
    </article>
  `;
}

function emptyTableRow() {
  return `
    <tr>
      <td colspan="9">
        <div class="empty-state">
          <h2>No festivals match those filters.</h2>
          <p>Clear a filter or switch the deadline range to Any time.</p>
        </div>
      </td>
    </tr>
  `;
}

function emptyCardState() {
  return `
    <div class="empty-state">
      <h2>No festivals match those filters.</h2>
      <p>Clear a filter or switch the deadline range to Any time.</p>
    </div>
  `;
}

function hydrateIntelligenceChoices() {
  const allFestivals = getAllFestivals();
  const current = state.intelligenceFestivalId || refs.intelligenceFestival.value || allFestivals[0]?.id || "";
  refs.intelligenceFestival.innerHTML = allFestivals
    .map((festival) => `<option value="${festival.id}">${escapeHtml(festival.name)}</option>`)
    .join("");
  state.intelligenceFestivalId = allFestivals.some((festival) => festival.id === current)
    ? current
    : allFestivals[0]?.id || "";
  refs.intelligenceFestival.value = state.intelligenceFestivalId;
  refs.intelligenceFocus.value = state.intelligenceFocus;
}

function getCurrentIntelligenceBrief() {
  state.intelligenceFestivalId = refs.intelligenceFestival.value || state.intelligenceFestivalId;
  state.intelligenceFocus = refs.intelligenceFocus.value || state.intelligenceFocus;
  const festival = getFestival(state.intelligenceFestivalId) || getAllFestivals()[0];
  return festival ? buildFestivalIntelligence(festival, state.filmProfile, state.intelligenceFocus) : null;
}

function renderIntelligence() {
  const brief = getCurrentIntelligenceBrief();
  if (!brief) {
    refs.intelligencePreview.innerHTML = `
      <div class="empty-state">
        <h2>No festival selected.</h2>
        <p>Approve or load festival records before generating an intelligence brief.</p>
      </div>
    `;
    return;
  }

  refs.intelMatchScore.textContent = String(brief.scorecards.matchScore);
  refs.intelRiskCount.textContent = String(brief.scorecards.risks);
  refs.intelSignalCount.textContent = String(brief.scorecards.signals);
  refs.intelPrepCount.textContent = String(brief.prepMoves.length);

  const scoreClass = brief.match.tier === "Strong fit" ? "green" : brief.match.tier === "Possible fit" ? "amber" : "red";
  const urgencyClass = brief.urgency === "Act soon" ? "amber" : brief.urgency === "Closed" ? "red" : "blue";
  refs.intelligencePreview.innerHTML = `
    <div class="intelligence-head">
      <div>
        <p class="eyebrow">${escapeHtml(brief.focus)}</p>
        <h2>${escapeHtml(brief.festivalName)}</h2>
        <p>${escapeHtml(brief.valueVerdict)} for ${escapeHtml(state.filmProfile.title || "your current film profile")}.</p>
      </div>
      <div class="intel-score ${scoreClass}">
        <strong>${brief.match.score}</strong>
        <span>${escapeHtml(brief.match.tier)}</span>
      </div>
    </div>

    <div class="badge-row">
      <span class="badge ${scoreClass}">${escapeHtml(brief.match.tier)}</span>
      <span class="badge ${urgencyClass}">${escapeHtml(brief.urgency)}</span>
      <span class="badge blue">${brief.scorecards.confidence}% verified</span>
      <span class="badge">${formatMoney(brief.scorecards.prizeMoney)}</span>
      <span class="badge">$${brief.scorecards.fee} entry fee</span>
    </div>

    <div class="intelligence-sections">
      ${renderIntelligenceList("Acceptance Angles", brief.acceptanceAngles)}
      ${renderIntelligenceList("Programmer Lens", brief.programmerLens)}
      ${renderIntelligenceList("Risk Checks", brief.riskChecks, true)}
      ${renderCommunitySignals(brief.communitySignals)}
      ${renderIntelligenceList("Prep Moves", brief.prepMoves)}
    </div>

    <div class="action-row">
      <button class="secondary-button js-detail" type="button" data-id="${brief.festivalId}">Open Festival Details</button>
      <button class="secondary-button js-intel-prep" type="button" data-id="${brief.festivalId}">Build Prep Pack</button>
      <button class="primary-button js-track" type="button" data-id="${brief.festivalId}">Track Submission</button>
    </div>
  `;
}

function renderIntelligenceList(title, items, caution = false) {
  return `
    <section class="intel-section">
      <h3>${escapeHtml(title)}</h3>
      <ul>
        ${items.map((item) => `<li class="${caution ? "caution" : ""}">${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderCommunitySignals(signals) {
  return `
    <section class="intel-section">
      <h3>Community-Style Signals</h3>
      ${signals.length
        ? signals
            .map((signal) => `
              <div class="signal-card">
                <strong>${escapeHtml(signal.label)} <span class="tone-badge ${escapeHtml(signal.tone)}">${escapeHtml(signal.tone)}</span></strong>
                <p>${escapeHtml(signal.summary)}</p>
              </div>
            `)
            .join("")
        : "<p>No community-style signals recorded yet.</p>"}
    </section>
  `;
}

function renderCompareBar() {
  refs.compareBar.classList.toggle("hidden", state.selected.size === 0);
  refs.compareCopy.textContent = `${plural(state.selected.size, "festival")} selected for comparison`;
  refs.compareButton.disabled = state.selected.size < 2;
}

function renderDetails(festival, mode = "single") {
  const compareFestivals = mode === "compare" ? [...state.selected].map(getFestival).filter(Boolean) : [festival];
  if (mode === "compare") {
    refs.detailContent.innerHTML = renderCompareDetails(compareFestivals);
  } else {
    refs.detailContent.innerHTML = renderFestivalDetails(festival);
  }
  refs.detailModal.classList.remove("hidden");
}

function renderCompareDetails(compareFestivals) {
  return `
    <div class="detail-hero">
      <p class="eyebrow">Festival comparison</p>
      <h2>Side-by-side submission strategy</h2>
      <p>Compare deadlines, fees, fit, prize money, and confidence before deciding where your film belongs.</p>
    </div>
    <div class="detail-body">
      <div class="festival-grid">
        ${compareFestivals
          .map(
            (festival) => `
              <article class="festival-card">
                <div class="badge-row">${statusBadge(festival.status)}${confidenceBadge(festival)}</div>
                <h2>${escapeHtml(festival.name)}</h2>
                <p>${escapeHtml(festival.fitSummary)}</p>
                <dl class="rules-list">
                  <div><dt>Deadline</dt><dd>${formatShortDate(festival.deadline)}</dd></div>
                  <div><dt>Prize</dt><dd>${formatMoney(festival.prizeMoney)}</dd></div>
                  <div><dt>Fee</dt><dd>$${festival.entryFee}</dd></div>
                  <div><dt>Runtime</dt><dd>${festival.duration.min}-${festival.duration.max} min</dd></div>
                </dl>
                <div class="action-row">
                  <button class="secondary-button js-detail" type="button" data-id="${festival.id}">Open Details</button>
                  <button class="primary-button js-track" type="button" data-id="${festival.id}">Track</button>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderFestivalDetails(festival) {
  const report = buildFestivalDetailReport(festival, state.filmProfile, getAllFestivals());
  const scoreClass = report.match.tier === "Strong fit" ? "green" : report.match.tier === "Possible fit" ? "amber" : "red";
  const riskClass = report.riskLevel === "Low" ? "green" : report.riskLevel === "Medium" ? "amber" : "red";
  const trust = report.sourceTrust;
  return `
    <div class="detail-hero detail-hero-premium">
      <div>
        <p class="eyebrow">${escapeHtml(festival.sourceType)} - verified ${escapeHtml(festival.lastVerified)}</p>
        <h2 id="detail-title">${escapeHtml(festival.name)}</h2>
        <p>${escapeHtml(report.summary)}</p>
        <div class="hero-meta">
          ${statusBadge(festival.status)}
          <span class="badge blue">${deadlineLabel(festival)}</span>
          ${confidenceBadge(festival)}
          ${trustBadge(festival)}
          ${freshnessBadge(festival)}
          <span class="badge">${escapeHtml(festival.location.city)}, ${escapeHtml(festival.location.country)}</span>
        </div>
      </div>
      <div class="detail-hero-score">
        <strong>${report.match.score}</strong>
        <span>${escapeHtml(report.match.tier)}</span>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-score-grid">
        ${renderDetailScoreCard("Match", report.match.score, report.match.tier, scoreClass)}
        ${renderDetailScoreCard("Value", report.valueScore, report.valueTier, "blue")}
        ${renderDetailScoreCard("Risk", report.riskScore, report.riskLevel, riskClass)}
        ${renderDetailScoreCard("Readiness", report.readinessScore, "Materials", report.readinessScore >= 75 ? "green" : "amber")}
        ${renderDetailScoreCard("Source", trust.score, trust.tier, trust.tone)}
      </div>

      <div class="detail-action-strip">
        <button class="primary-button js-track" type="button" data-id="${festival.id}">Track Submission</button>
        <button class="secondary-button js-detail-prep" type="button" data-id="${festival.id}">Build Prep Pack</button>
        <button class="secondary-button js-calendar" type="button" data-id="${festival.id}">Add to Calendar</button>
        <button class="secondary-button js-copy-detail" type="button" data-id="${festival.id}">Copy Brief</button>
        <a class="secondary-button" href="${festival.submissionUrl}" target="_blank" rel="noreferrer">Submission Page</a>
      </div>

      <div class="detail-premium-grid">
        <section class="detail-section detail-wide">
          <p class="eyebrow">Decision brief</p>
          <h3>Why this festival might be worth it</h3>
          <p>${escapeHtml(festival.fitSummary)}</p>
          ${renderDetailList("Value Notes", report.valueNotes)}
          ${renderDetailList("Acceptance Strategy", festival.strategyNotes)}
        </section>
        <section class="detail-section">
          <p class="eyebrow">Deadline and money</p>
          <h3>Submission window</h3>
          <div class="rules-list">
            <div><dt>Submit by</dt><dd>${formatShortDate(festival.deadline)}</dd></div>
            <div><dt>Countdown</dt><dd>${deadlineLabel(festival)}</dd></div>
            <div><dt>Notification</dt><dd>${formatShortDate(festival.notificationDate)}</dd></div>
            <div><dt>Event</dt><dd>${formatShortDate(festival.eventDate)}</dd></div>
            <div><dt>Entry fee</dt><dd>$${festival.entryFee}</dd></div>
            <div><dt>Prize</dt><dd>${formatMoney(festival.prizeMoney)}</dd></div>
          </div>
        </section>
        <section class="detail-section">
          <p class="eyebrow">Rules check</p>
          <h3>Official Rules</h3>
          <dl class="rules-list">
            <div><dt>Runtime</dt><dd>${festival.duration.min}-${festival.duration.max} minutes</dd></div>
            <div><dt>Formats</dt><dd>${escapeHtml(festival.formats.join(", "))}</dd></div>
            <div><dt>Aspect ratio</dt><dd>${escapeHtml(festival.aspectRatio.join(", "))}</dd></div>
            <div><dt>Premiere</dt><dd>${escapeHtml(festival.premiereStatus)}</dd></div>
            <div><dt>Language</dt><dd>${escapeHtml(festival.language)}</dd></div>
            <div><dt>Entry fee</dt><dd>$${festival.entryFee}</dd></div>
          </dl>
          <div class="badge-row" style="margin-top: 14px;">
            ${festival.contentTypes.map((type) => `<span class="badge violet">${escapeHtml(type)}</span>`).join("")}
          </div>
        </section>
        <section class="detail-section">
          <p class="eyebrow">Trust proof</p>
          <h3>Source freshness</h3>
          <dl class="rules-list">
            <div><dt>Source type</dt><dd>${escapeHtml(trust.sourceType)}</dd></div>
            <div><dt>Last verified</dt><dd>${trust.lastVerified ? formatShortDate(trust.lastVerified) : "Missing"}</dd></div>
            <div><dt>Freshness</dt><dd>${escapeHtml(trust.freshnessLabel)}${Number.isFinite(trust.verifiedAgeDays) ? ` (${trust.verifiedAgeDays} days)` : ""}</dd></div>
            <div><dt>Website link</dt><dd>${trust.hasWebsite ? "Present" : "Missing"}</dd></div>
            <div><dt>Submission link</dt><dd>${trust.hasSubmission ? "Present" : "Missing"}</dd></div>
          </dl>
          ${renderDetailList("Source Proof Points", trust.proofPoints)}
          ${trust.warnings.length ? renderDetailList("Source Warnings", trust.warnings, true) : ""}
        </section>
        <section class="detail-section">
          ${renderDetailList("Risk Checks", report.riskChecks, true)}
          ${renderDetailList("Proof Points", report.proofPoints)}
        </section>
        <section class="detail-section">
          <h3>Community Signals</h3>
          ${renderDetailSignals(festival.communitySignals)}
        </section>
        <section class="detail-section">
          ${renderDetailList("Prep Actions", report.prepActions)}
          ${renderDetailList("Submission Checklist", festival.checklist)}
        </section>
        <section class="detail-section detail-wide">
          <div class="detail-section-head">
            <div>
              <p class="eyebrow">Nearby opportunities</p>
              <h3>Related Festivals</h3>
            </div>
            <button class="secondary-button js-open-intelligence" type="button" data-id="${festival.id}">Open Strategy Tips</button>
          </div>
          <div class="detail-related-grid">
            ${report.related.length ? report.related.map(renderRelatedFestival).join("") : '<p>No related festivals found in this directory yet.</p>'}
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderDetailScoreCard(label, score, caption, tone) {
  return `
    <article class="detail-score-card ${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${score}</strong>
      <p>${escapeHtml(caption)}</p>
    </article>
  `;
}

function renderDetailList(title, items, caution = false) {
  const list = items?.length ? items : ["No notes recorded yet."];
  return `
    <h3>${escapeHtml(title)}</h3>
    <ul class="${caution ? "detail-caution-list" : ""}">
      ${list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function renderDetailSignals(signals = []) {
  return signals.length
    ? signals.map((signal) => `
      <div class="signal-card">
        <strong>${escapeHtml(signal.label)} <span class="tone-badge ${escapeHtml(signal.tone)}">${escapeHtml(signal.tone)}</span></strong>
        <p>${escapeHtml(signal.summary)}</p>
      </div>
    `).join("")
    : "<p>No community-style signals recorded yet.</p>";
}

function renderRelatedFestival(item) {
  const tone = item.tier === "Strong fit" ? "green" : item.tier === "Possible fit" ? "amber" : "red";
  return `
    <article class="detail-related-card">
      <span class="badge ${tone}">${escapeHtml(item.tier)}</span>
      <h4>${escapeHtml(item.name)}</h4>
      <p>${escapeHtml(item.reason)}</p>
      <div class="detail-related-footer">
        <strong>${item.score}</strong>
        <button class="secondary-button js-detail" type="button" data-id="${escapeHtml(item.id)}">Open</button>
      </div>
    </article>
  `;
}

function renderCalendar(festival) {
  const start = toCalendarStamp(festival.deadline);
  const end = toCalendarStamp(new Date(new Date(festival.deadline).getTime() + 60 * 60 * 1000).toISOString());
  const title = encodeURIComponent(`${festival.name} submission deadline`);
  const details = encodeURIComponent(`Submit via ${festival.submissionUrl}\n\nLaurelPilot notes: ${festival.fitSummary}`);
  const location = encodeURIComponent(`${festival.location.city}, ${festival.location.country}`);
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${encodeURIComponent(new Date(festival.deadline).toISOString())}&enddt=${encodeURIComponent(new Date(new Date(festival.deadline).getTime() + 60 * 60 * 1000).toISOString())}&body=${details}&location=${location}`;

  refs.calendarContent.innerHTML = `
    <p><strong>${escapeHtml(festival.name)}</strong></p>
    <p>Deadline: ${formatShortDate(festival.deadline)} - ${deadlineLabel(festival)}</p>
    <div class="calendar-actions">
      <a class="primary-button" href="${google}" target="_blank" rel="noreferrer">Google Calendar</a>
      <a class="secondary-button" href="${outlook}" target="_blank" rel="noreferrer">Outlook</a>
      <button class="secondary-button js-ics" type="button" data-id="${festival.id}">Apple / ICS</button>
      <button class="secondary-button js-copy-event" type="button" data-id="${festival.id}">Copy Event Link</button>
    </div>
  `;
  refs.calendarModal.classList.remove("hidden");
}

function downloadIcs(festival) {
  const start = toCalendarStamp(festival.deadline);
  const end = toCalendarStamp(new Date(new Date(festival.deadline).getTime() + 60 * 60 * 1000).toISOString());
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LaurelPilot//Festival Deadline//EN",
    "BEGIN:VEVENT",
    `UID:${festival.id}@laurelpilot.local`,
    `DTSTAMP:${toCalendarStamp(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${festival.name} submission deadline`,
    `DESCRIPTION:Submit via ${festival.submissionUrl}`,
    `LOCATION:${festival.location.city}, ${festival.location.country}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  const blob = new Blob([body], { type: "text/calendar" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${festival.id}.ics`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function openSubmissionForm(festival) {
  const existing = state.submissions.find((item) => item.festivalId === festival.id);
  refs.submissionFestivalId.value = festival.id;
  refs.submissionFilmTitle.value = existing?.filmTitle || state.filmProfile.title || "";
  refs.submissionDate.value = existing?.submissionDate || new Date().toISOString().slice(0, 10);
  refs.submissionStatus.value = existing?.status || "Submitted";
  refs.submissionNotes.value = existing?.notes || "";
  refs.submissionModal.classList.remove("hidden");
}

function renderSubmissions() {
  const enriched = state.submissions.map((item) => ({ ...item, festival: getFestival(item.festivalId) })).filter((item) => item.festival);
  refs.submissionTotal.textContent = String(enriched.length);
  refs.submissionPending.textContent = String(enriched.filter((item) => item.status === "Pending" || item.status === "Submitted").length);
  refs.submissionAccepted.textContent = String(enriched.filter((item) => item.status === "Accepted").length);
  refs.submissionFees.textContent = formatMoney(enriched.reduce((total, item) => total + item.festival.entryFee, 0)).replace("No prize listed", "$0");

  if (!enriched.length) {
    refs.submissionsList.innerHTML = `
      <div class="empty-state">
        <h2>No submissions tracked yet.</h2>
        <p>Use Track on any festival to create your personal submission log.</p>
      </div>
    `;
    return;
  }

  refs.submissionsList.innerHTML = enriched
    .map(
      (item) => `
        <article class="submission-card">
          <header>
            <div>
              <h2>${escapeHtml(item.festival.name)}</h2>
              <p>${escapeHtml(item.filmTitle || "Untitled film")} - submitted ${formatShortDate(item.submissionDate)}</p>
            </div>
            <span class="badge ${item.status === "Accepted" ? "green" : item.status === "Rejected" ? "red" : "blue"}">${escapeHtml(item.status)}</span>
          </header>
          <p>${escapeHtml(item.notes || "No notes yet.")}</p>
          <div class="action-row" style="margin-top: 12px;">
            <button class="secondary-button js-track" type="button" data-id="${item.festival.id}">Edit</button>
            <button class="text-button js-remove-submission" type="button" data-id="${item.festival.id}">Remove</button>
          </div>
        </article>
      `
    )
    .join("");
}

function parseImportPreview() {
  const parsed = parseLeadImportText(refs.importText.value);
  state.importCandidates = parsed.candidates;
  state.importErrors = parsed.errors;
  state.importManifest = parsed.manifest || {};
  refs.importMessage.textContent = parsed.candidates.length
    ? `${plural(parsed.candidates.length, "lead")} parsed locally. Review the intake packet before staging.`
    : "No valid leads parsed yet.";
  renderImport();
}

function getImportReviewReport() {
  return buildImportReviewReport(
    state.importCandidates,
    state.importErrors,
    getAllCandidates(),
    getAllFestivals(),
    state.importManifest
  );
}

function stageImportToRadar(mode = "stageable") {
  if (!state.importCandidates.length) {
    refs.importMessage.textContent = "Parse leads before sending them to Radar.";
    return;
  }
  const report = getImportReviewReport();
  const newCandidates = report.rows
    .filter((row) => mode === "clean" ? row.clean : row.stageable)
    .map((row) => row.candidate);
  state.organizerCandidates = [
    ...state.organizerCandidates.filter((item) => !newCandidates.some((candidate) => candidate.id === item.id)),
    ...newCandidates
  ];
  state.rejectedCandidates = state.rejectedCandidates.filter(
    (id) => !newCandidates.some((candidate) => candidate.id === id)
  );
  saveRadarState();
  refs.importMessage.textContent = newCandidates.length
    ? `${plural(newCandidates.length, "lead")} staged in Radar. Duplicates and hard holds stayed out.`
    : mode === "clean"
      ? "No clean, non-duplicate leads are ready to stage."
      : "No non-duplicate reviewed leads are ready to stage.";
  hydratePrepDraft();
  renderDiscover();
  renderMatches();
  renderPrepPack();
  renderScout();
  renderImport();
  renderRadar();
  renderLaunch();
}

function sendImportToRadar() {
  stageImportToRadar("stageable");
}

function stageCleanImportToRadar() {
  stageImportToRadar("clean");
}

async function copyImportReport() {
  await navigator.clipboard.writeText(importReviewReportToText(getImportReviewReport()));
  refs.importMessage.textContent = "Import review report copied.";
}

function clearImportDraft() {
  refs.importText.value = "";
  state.importCandidates = [];
  state.importErrors = [];
  state.importManifest = {};
  refs.importMessage.textContent = "";
  renderImport();
}

function renderImport() {
  const report = getImportReviewReport();
  refs.importValidCount.textContent = String(state.importCandidates.length);
  refs.importCleanCount.textContent = String(report.summary.clean);
  refs.importReviewCount.textContent = String(report.summary.review);
  refs.importDuplicateCount.textContent = String(report.summary.duplicates);
  refs.importRiskCount.textContent = String(report.summary.highRisk);
  refs.importErrorCount.textContent = String(state.importErrors.length);
  refs.stageCleanImport.disabled = report.summary.clean === 0;
  refs.sendImport.disabled = report.summary.stageable === 0;
  refs.copyImportReport.disabled = !state.importCandidates.length && !state.importErrors.length;
  refs.importManifest.innerHTML = renderImportManifest(report);
  refs.importActions.innerHTML = report.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join("");

  if (!state.importCandidates.length && !state.importErrors.length) {
    refs.importPreview.innerHTML = `
      <div class="empty-state">
        <h2>No import preview yet.</h2>
        <p>Paste a JSON array or CSV with at least name and deadline, then parse it locally.</p>
      </div>
    `;
    return;
  }

  const errorMarkup = state.importErrors.length
    ? `
      <article class="candidate-card">
        <header>
          <div>
            <h2>Rows Needing Fixes</h2>
            <p>These rows were skipped and not sent to Radar.</p>
          </div>
          <span class="badge red">${state.importErrors.length} issue${state.importErrors.length === 1 ? "" : "s"}</span>
        </header>
        <ul>${state.importErrors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}</ul>
      </article>
    `
    : "";

  refs.importPreview.innerHTML = [
    errorMarkup,
    ...report.rows.map((row) => renderImportCandidateCard(row))
  ].join("");
}

function renderImportManifest(report) {
  const manifest = report.manifest || {};
  const items = [
    manifest.sourceName ? `Source: ${manifest.sourceName}` : "Source: local paste",
    manifest.runId ? `Run ID: ${manifest.runId}` : "",
    manifest.sourceType ? `Type: ${manifest.sourceType}` : "",
    manifest.capturedAt ? `Captured: ${formatShortDate(manifest.capturedAt)}` : "",
    manifest.sourceUrl ? `Source URL: ${manifest.sourceUrl}` : "",
    report.summary.parsed ? `${report.summary.stageable} stageable of ${report.summary.parsed} parsed` : "No parsed leads yet"
  ].filter(Boolean);
  return items.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
}

function renderImportCandidateCard(row) {
  const { candidate, score: scored } = row;
  const recommendationClass =
    row.stageStatus === "Duplicate"
      ? "blue"
      : row.stageStatus === "Clean"
      ? "green"
      : row.stageStatus === "Review"
        ? "amber"
        : "red";
  const statusLabel =
    row.stageStatus === "Clean" ? "Clean lead"
      : row.stageStatus === "Review" ? "Review first"
        : row.stageStatus === "Duplicate" ? "Duplicate"
          : "Hold";
  const warnings = scored.warnings
    .map((warning) => `<span class="warning">${escapeHtml(warning.label)} <strong>${warning.points}</strong></span>`)
    .join("");
  return `
    <article class="candidate-card">
      <header>
        <div>
          <h2>${escapeHtml(candidate.name)}</h2>
          <p>${escapeHtml(candidate.description)}</p>
        </div>
        <span class="badge ${recommendationClass}">${statusLabel}</span>
      </header>
      <div class="badge-row" style="margin-top: 12px;">
        <span class="badge blue">${scored.score}/100 confidence</span>
        <span class="badge">${escapeHtml(scored.riskLevel)} risk</span>
        <span class="badge">${escapeHtml(candidate.discoverySource)}</span>
        <span class="badge">${formatShortDate(candidate.deadline)} deadline</span>
        ${row.duplicateInRadar ? '<span class="badge blue">Already in Radar</span>' : ""}
        ${row.duplicateInDirectory ? '<span class="badge blue">Already in Directory</span>' : ""}
      </div>
      <p><strong>Fit:</strong> ${escapeHtml(candidate.suggestedFit)}</p>
      <p><strong>Pipeline:</strong> ${escapeHtml(row.reason)}</p>
      <div class="score-breakdown">
        ${scored.positives.filter((item) => item.met).slice(0, 5).map((item) => `<span class="met">${escapeHtml(item.label)} <strong>+${item.points}</strong></span>`).join("")}
        ${scored.positives.filter((item) => !item.met).slice(0, 3).map((item) => `<span class="miss">${escapeHtml(item.label)} <strong>0</strong></span>`).join("")}
        ${warnings || '<span class="met">No warning signals found <strong>+0</strong></span>'}
      </div>
    </article>
  `;
}

function getScoutCandidate(leadId) {
  const lead = scoutLeads.find((item) => item.id === leadId);
  return lead ? normalizeScoutLead(lead) : undefined;
}

function getImportedScoutIds() {
  return new Set(getAllCandidates().map((candidate) => candidate.id));
}

function addScoutLead(leadId) {
  const candidate = getScoutCandidate(leadId);
  if (!candidate) {
    return 0;
  }
  const alreadyImported = getImportedScoutIds().has(candidate.id);
  if (!alreadyImported) {
    state.organizerCandidates = [
      ...state.organizerCandidates.filter((item) => item.id !== candidate.id),
      candidate
    ];
    state.rejectedCandidates = state.rejectedCandidates.filter((id) => id !== candidate.id);
    saveRadarState();
    hydratePrepDraft();
  }
  renderDiscover();
  renderMatches();
  renderPrepPack();
  renderScout();
  renderRadar();
  return alreadyImported ? 0 : 1;
}

function runScoutScan() {
  const importedIds = getImportedScoutIds();
  const newCandidates = scoutLeads
    .map((lead) => normalizeScoutLead(lead))
    .filter((candidate) => !importedIds.has(candidate.id) && !state.rejectedCandidates.includes(candidate.id));

  if (newCandidates.length) {
    state.organizerCandidates = [
      ...state.organizerCandidates,
      ...newCandidates
    ];
    saveRadarState();
  }

  state.scoutRuns = [
    {
      runAt: new Date().toISOString(),
      sources: state.watchSources.filter((source) => source.status === "Active").length,
      leads: scoutLeads.length,
      imported: newCandidates.length
    },
    ...state.scoutRuns
  ].slice(0, 6);
  saveScoutRuns();
  refs.scoutMessage.textContent = newCandidates.length
    ? `${plural(newCandidates.length, "lead")} sent to Radar for review.`
    : "Scout scan complete. No new leads found.";

  hydratePrepDraft();
  renderDiscover();
  renderMatches();
  renderPrepPack();
  renderScout();
  renderRadar();
  renderLaunch();
}

function renderScout() {
  const importedIds = getImportedScoutIds();
  const summary = summarizeScoutLeads(scoutLeads, [...importedIds]);
  refs.scoutLeadCount.textContent = String(summary.total);
  refs.scoutReadyCount.textContent = String(summary.ready);
  refs.scoutReviewCount.textContent = String(summary.review);
  refs.scoutRiskCount.textContent = String(summary.highRisk);
  const lastRun = state.scoutRuns[0]?.runAt || scoutSources.map((source) => source.lastRun).sort().at(-1);
  refs.scoutLastRun.textContent = lastRun ? `Last scan: ${formatShortDate(lastRun)}` : "No scans yet";

  refs.scoutSourceGrid.innerHTML = state.watchSources.map(renderScoutSourceCard).join("");
  refs.scoutLeadGrid.innerHTML = scoutLeads.map((lead) => renderScoutLeadCard(lead, importedIds)).join("");
}

function renderScoutSourceCard(source) {
  const health = source.trustLevel ? getWatchSourceHealth(source) : null;
  const statusLabel = health?.label || source.status;
  const statusClass = health?.tone || (source.status === "Healthy" ? "green" : source.status === "Review Needed" ? "amber" : "blue");
  const lastRun = source.lastChecked || source.lastRun;
  return `
    <article class="radar-card">
      <header>
        <h2>${escapeHtml(source.name)}</h2>
        <span class="badge ${statusClass}">${escapeHtml(statusLabel)}</span>
      </header>
      <p>${escapeHtml(source.note)}</p>
      <div class="badge-row" style="margin-top: 12px;">
        <span class="badge">${escapeHtml(source.cadence)}</span>
        <span class="badge">${lastRun ? `Last run ${formatShortDate(lastRun)}` : "Never checked"}</span>
        ${source.trustLevel ? `<span class="badge blue">${source.trustLevel}/5 trust</span>` : ""}
      </div>
      <div class="reason-list">
        ${source.coverage.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderScoutLeadCard(lead, importedIds) {
  const candidate = normalizeScoutLead(lead);
  const scored = scoreRadarCandidate(candidate);
  const imported = importedIds.has(candidate.id);
  const recommendationClass =
    scored.recommendation === "Auto-publish"
      ? "green"
      : scored.recommendation === "Review"
        ? "amber"
        : "red";
  const signalRows = candidate.extractedSignals
    .slice(0, 3)
    .map((signal) => `<span>${escapeHtml(signal)}</span>`)
    .join("");
  return `
    <article class="candidate-card">
      <header>
        <div>
          <h2>${escapeHtml(candidate.name)}</h2>
          <p>${escapeHtml(candidate.description)}</p>
        </div>
        <span class="badge ${recommendationClass}">${escapeHtml(scored.recommendation)}</span>
      </header>
      <div class="badge-row" style="margin-top: 12px;">
        <span class="badge blue">${scored.score}/100 confidence</span>
        <span class="badge">${escapeHtml(candidate.discoverySource)}</span>
        <span class="badge">${formatShortDate(candidate.discoveredAt)}</span>
        ${imported ? '<span class="badge green">In Radar</span>' : ""}
      </div>
      <p><strong>Fit:</strong> ${escapeHtml(candidate.suggestedFit)}</p>
      <div class="reason-list">
        ${signalRows || "<span>No source signals extracted yet.</span>"}
      </div>
      <div class="action-row" style="margin-top: 14px;">
        <button class="primary-button js-add-scout-lead" type="button" data-id="${candidate.id}" ${imported ? "disabled" : ""}>${imported ? "Added to Radar" : "Send to Radar"}</button>
        <button class="secondary-button js-preview-scout-lead" type="button" data-id="${candidate.id}">Preview</button>
      </div>
    </article>
  `;
}

function getWatchSource(sourceId) {
  return state.watchSources.find((source) => source.id === sourceId);
}

function renderWatchlist() {
  const summary = summarizeWatchSources(state.watchSources);
  const plan = buildWatchScanPlan(state.watchSources);
  refs.watchActiveCount.textContent = String(summary.active);
  refs.watchDueCount.textContent = String(summary.due);
  refs.watchTrustCount.textContent = String(summary.highTrust);
  refs.watchKeywordCount.textContent = String(summary.keywordCount);
  refs.watchPlanTitle.textContent = summary.due ? `${plural(summary.due, "source")} due for review` : "Watchlist is current";
  refs.watchPlanCopy.textContent = plan.summary;
  refs.watchPlanList.innerHTML = plan.queries.length
    ? plan.queries
        .slice(0, 10)
        .map((query) => `<span>${escapeHtml(query.sourceName)} -> ${escapeHtml(query.keyword)}</span>`)
        .join("")
    : "<span>No keyword checks due. Add a source or lower a cadence to create a scan plan.</span>";
  refs.watchRunLog.innerHTML = state.watchRuns.length
    ? state.watchRuns
        .slice(0, 4)
        .map((run) => `
          <article class="audit-item">
            <div>
              <strong>${formatShortDate(run.runAt)}</strong>
              <p>${plural(run.sources, "source")} checked, ${plural(run.queries, "keyword check")} queued.</p>
            </div>
            <span class="badge blue">${escapeHtml(run.mode)}</span>
          </article>
        `)
        .join("")
    : "";
  refs.watchlistGrid.innerHTML = state.watchSources.length
    ? state.watchSources.map(renderWatchSourceCard).join("")
    : `
      <div class="empty-state">
        <h2>No sources yet.</h2>
        <p>Add official festival pages, directories, community sources, or organizer queues to build the curation layer.</p>
      </div>
    `;
}

function renderWatchSourceCard(source) {
  const health = getWatchSourceHealth(source);
  const keywordRows = source.keywords.slice(0, 5).map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("");
  const coverageRows = source.coverage.slice(0, 4).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
  return `
    <article class="watch-card">
      <header>
        <div>
          <h2>${escapeHtml(source.name)}</h2>
          <p>${escapeHtml(source.note || "No internal note yet.")}</p>
        </div>
        <span class="badge ${health.tone}">${escapeHtml(health.label)}</span>
      </header>
      <div class="badge-row">
        <span class="badge blue">${source.trustLevel}/5 trust</span>
        <span class="badge">${escapeHtml(source.sourceType)}</span>
        <span class="badge">${escapeHtml(source.cadence)}</span>
        <span class="badge">${source.lastChecked ? `Checked ${formatShortDate(source.lastChecked)}` : "Never checked"}</span>
      </div>
      <div class="watch-url">${escapeHtml(source.url || "No source target set")}</div>
      <div class="watch-columns">
        <div>
          <strong>Keywords</strong>
          <div class="reason-list">${keywordRows || "<span>No keywords set</span>"}</div>
        </div>
        <div>
          <strong>Coverage</strong>
          <div class="reason-list">${coverageRows || "<span>No coverage notes set</span>"}</div>
        </div>
      </div>
      <div class="action-row">
        <button class="secondary-button js-edit-watch-source" type="button" data-id="${source.id}">Edit</button>
        <button class="secondary-button js-mark-watch-source" type="button" data-id="${source.id}">Mark Checked</button>
        <button class="secondary-button js-toggle-watch-source" type="button" data-id="${source.id}">${source.status === "Paused" ? "Activate" : "Pause"}</button>
        <button class="text-button js-remove-watch-source" type="button" data-id="${source.id}">Remove</button>
      </div>
    </article>
  `;
}

function readWatchForm() {
  return {
    id: refs.watchSourceId.value || undefined,
    name: refs.watchName.value,
    url: refs.watchUrl.value,
    sourceType: refs.watchType.value,
    cadence: refs.watchCadence.value,
    status: refs.watchStatus.value,
    trustLevel: refs.watchTrust.value,
    keywords: refs.watchKeywords.value,
    coverage: refs.watchCoverage.value,
    note: refs.watchNote.value,
    lastChecked: getWatchSource(refs.watchSourceId.value)?.lastChecked || ""
  };
}

function hydrateWatchForm(source) {
  refs.watchSourceId.value = source?.id || "";
  refs.watchName.value = source?.name || "";
  refs.watchUrl.value = source?.url || "";
  refs.watchType.value = source?.sourceType || "Festival directory";
  refs.watchCadence.value = source?.cadence || "Weekly";
  refs.watchStatus.value = source?.status || "Active";
  refs.watchTrust.value = String(source?.trustLevel || 3);
  refs.watchTrustValue.textContent = refs.watchTrust.value;
  refs.watchKeywords.value = (source?.keywords || []).join(", ");
  refs.watchCoverage.value = (source?.coverage || []).join(", ");
  refs.watchNote.value = source?.note || "";
}

function clearWatchForm() {
  refs.watchForm.reset();
  refs.watchSourceId.value = "";
  refs.watchTrust.value = "3";
  refs.watchTrustValue.textContent = "3";
  refs.watchType.value = "Festival directory";
  refs.watchCadence.value = "Weekly";
  refs.watchStatus.value = "Active";
  refs.watchMessage.textContent = "";
}

function saveWatchSource() {
  try {
    const source = normalizeWatchSource(readWatchForm());
    state.watchSources = [
      ...state.watchSources.filter((item) => item.id !== source.id),
      source
    ];
    saveWatchlist();
    refs.watchMessage.textContent = "Source saved to the watchlist.";
    hydrateWatchForm(source);
    renderScout();
    renderWatchlist();
  } catch (error) {
    refs.watchMessage.textContent = error.message;
  }
}

function markWatchSourceChecked(sourceId) {
  const checkedAt = new Date().toISOString();
  state.watchSources = state.watchSources.map((source) =>
    source.id === sourceId ? normalizeWatchSource({ ...source, lastChecked: checkedAt }, new Date(checkedAt)) : source
  );
  saveWatchlist();
  renderScout();
  renderWatchlist();
}

function toggleWatchSource(sourceId) {
  state.watchSources = state.watchSources.map((source) =>
    source.id === sourceId
      ? normalizeWatchSource({ ...source, status: source.status === "Paused" ? "Active" : "Paused" })
      : source
  );
  saveWatchlist();
  renderScout();
  renderWatchlist();
}

function removeWatchSource(sourceId) {
  state.watchSources = state.watchSources.filter((source) => source.id !== sourceId);
  if (refs.watchSourceId.value === sourceId) {
    clearWatchForm();
  }
  saveWatchlist();
  renderScout();
  renderWatchlist();
}

function recordWatchPass() {
  const plan = buildWatchScanPlan(state.watchSources);
  if (!plan.dueSources.length) {
    refs.watchMessage.textContent = "No active sources are due right now.";
    return;
  }
  const checkedAt = new Date().toISOString();
  const dueIds = new Set(plan.dueSources.map((source) => source.id));
  state.watchSources = state.watchSources.map((source) =>
    dueIds.has(source.id) ? normalizeWatchSource({ ...source, lastChecked: checkedAt }, new Date(checkedAt)) : source
  );
  state.watchRuns = [
    {
      runAt: checkedAt,
      mode: "Local watch pass",
      sources: plan.dueSources.length,
      queries: plan.queries.length
    },
    ...state.watchRuns
  ].slice(0, 8);
  saveWatchlist();
  saveWatchRuns();
  refs.watchMessage.textContent = `${plural(plan.dueSources.length, "source")} marked checked.`;
  renderScout();
  renderWatchlist();
}

function exportWatchlist() {
  const payload = {
    exportedAt: new Date().toISOString(),
    product: "LaurelPilot",
    sources: state.watchSources,
    runs: state.watchRuns
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "laurelpilot-watchlist.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderVault() {
  const backupText = getCurrentBackupText();
  const currentSummary = summarizeBackupSections(getCurrentBackup().sections);
  const preview = state.vaultPreview;
  const activeSummary = preview?.summary || currentSummary;
  const warnings = preview ? preview.warnings.length : 0;
  const errors = preview ? preview.errors.length : 0;

  refs.vaultSectionCount.textContent = String(activeSummary.presentSections);
  refs.vaultRecordCount.textContent = String(activeSummary.totalRecords);
  refs.vaultSize.textContent = formatBytes(new Blob([backupText]).size);
  refs.vaultWarningCount.textContent = String(warnings + errors);
  refs.vaultRestore.disabled = !preview || Boolean(errors);

  refs.vaultSummary.innerHTML = `
    <div class="vault-status ${errors ? "red" : warnings ? "amber" : "green"}">
      <strong>${preview ? (errors ? "Backup needs attention" : "Backup ready to restore") : "Current local workspace"}</strong>
      <p>${preview ? `${activeSummary.presentSections} sections and ${activeSummary.totalRecords} records found.` : "Download or copy this workspace before switching machines or clearing browser storage."}</p>
    </div>
    ${preview?.errors.length ? `<div class="reason-list">${preview.errors.map((error) => `<span class="warning">${escapeHtml(error)}</span>`).join("")}</div>` : ""}
    ${preview?.warnings.length ? `<div class="reason-list">${preview.warnings.map((warning) => `<span>${escapeHtml(warning)}</span>`).join("")}</div>` : ""}
    <div class="vault-section-list">
      ${activeSummary.entries
        .map((entry) => `
          <article>
            <span>${escapeHtml(entry.label)}</span>
            <strong>${entry.present ? entry.count : "-"}</strong>
            <small>${entry.present ? entry.kind : "missing"}</small>
          </article>
        `)
        .join("")}
    </div>
  `;

  refs.vaultLog.innerHTML = state.vaultLog.length
    ? state.vaultLog
        .map((entry) => `
          <article class="audit-item">
            <div>
              <strong>${escapeHtml(entry.action)}</strong>
              <p>${escapeHtml(entry.detail)}</p>
            </div>
            <span class="badge blue">${formatShortDate(entry.createdAt)}</span>
          </article>
        `)
        .join("")
    : `
      <div class="empty-state">
        <h2>No vault activity yet.</h2>
        <p>Exports and restores will appear here so the user can see when local data moved.</p>
      </div>
    `;
}

function loadCurrentBackupIntoVault() {
  refs.vaultText.value = getCurrentBackupText();
  state.vaultPreview = parseWorkspaceBackupText(refs.vaultText.value);
  refs.vaultMessage.textContent = "Current workspace backup loaded for preview.";
  renderVault();
}

function parseVaultPreview() {
  state.vaultPreview = parseWorkspaceBackupText(refs.vaultText.value);
  refs.vaultMessage.textContent = state.vaultPreview.errors.length
    ? "Backup could not be restored yet. Review the issues below."
    : "Backup parsed successfully. Review the sections before restoring.";
  renderVault();
}

function applyVaultRestore() {
  const preview = state.vaultPreview || parseWorkspaceBackupText(refs.vaultText.value);
  if (preview.errors.length) {
    state.vaultPreview = preview;
    refs.vaultMessage.textContent = "Fix the backup issues before restoring.";
    renderVault();
    return;
  }

  const sections = preview.sections;
  if (sections.filmProfile !== undefined) {
    state.filmProfile = { ...DEFAULT_PROFILE, ...sections.filmProfile };
  }
  if (sections.filmLibrary !== undefined) {
    state.filmLibrary = normalizeFilmLibrary(sections.filmLibrary, state.filmProfile);
    state.editingFilmId = state.filmLibrary.activeId;
  }
  if (sections.prepDraft !== undefined) {
    state.prepDraft = sections.prepDraft || {};
  }
  if (sections.pipelineItems !== undefined) {
    state.pipelineItems = Array.isArray(sections.pipelineItems) ? sections.pipelineItems.map((item) => normalizePipelineItem(item)) : [];
  }
  if (sections.deviceLabIssues !== undefined) {
    state.deviceLabIssues = Array.isArray(sections.deviceLabIssues) ? sections.deviceLabIssues.map((issue) => normalizeDeviceLabIssue(issue)) : [];
  }
  if (sections.betaFeedbackItems !== undefined) {
    state.betaFeedbackItems = Array.isArray(sections.betaFeedbackItems) ? sections.betaFeedbackItems.map((item) => normalizeBetaFeedbackItem(item)) : [];
  }
  if (sections.roadmapItems !== undefined) {
    state.roadmapItems = Array.isArray(sections.roadmapItems) ? sections.roadmapItems.map((item) => normalizeRoadmapItem(item)) : [];
  }
  if (sections.submissions !== undefined) {
    state.submissions = Array.isArray(sections.submissions) ? sections.submissions : [];
  }
  if (sections.promotedFestivals !== undefined) {
    state.promotedFestivals = Array.isArray(sections.promotedFestivals) ? sections.promotedFestivals : [];
  }
  if (sections.organizerCandidates !== undefined) {
    state.organizerCandidates = Array.isArray(sections.organizerCandidates) ? sections.organizerCandidates : [];
  }
  if (sections.rejectedCandidates !== undefined) {
    state.rejectedCandidates = Array.isArray(sections.rejectedCandidates) ? sections.rejectedCandidates : [];
  }
  if (sections.scoutRuns !== undefined) {
    state.scoutRuns = Array.isArray(sections.scoutRuns) ? sections.scoutRuns : [];
  }
  if (sections.radarAudit !== undefined) {
    state.radarAudit = Array.isArray(sections.radarAudit) ? sections.radarAudit : [];
  }
  if (sections.watchSources !== undefined) {
    state.watchSources = Array.isArray(sections.watchSources) ? sections.watchSources : [];
  }
  if (sections.watchRuns !== undefined) {
    state.watchRuns = Array.isArray(sections.watchRuns) ? sections.watchRuns : [];
  }
  if (sections.accessState !== undefined) {
    state.accessState = normalizeAccessState(sections.accessState);
  }
  if (sections.onboarding !== undefined) {
    state.onboarding = normalizeOnboardingState(sections.onboarding);
  }
  if (sections.preferences !== undefined) {
    state.preferences = normalizeUserPreferences(sections.preferences);
  }

  saveWorkspaceState();
  recordVaultLog("Restore", `${preview.summary.presentSections} sections and ${preview.summary.totalRecords} records restored.`);
  refs.vaultMessage.textContent = "Backup restored into this browser.";
  hydrateFilmProfile();
  hydrateFilmLibraryForm();
  hydrateSettingsForm();
  hydratePrepDraft();
  hydratePipelineForm();
  hydrateDeviceLabForm();
  hydrateFeedbackForm();
  hydrateRoadmapForm();
  hydrateIntelligenceChoices();
  renderAll();
}

function downloadVaultBackup() {
  const backupText = getCurrentBackupText();
  const blob = new Blob([backupText], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  const summary = summarizeBackupSections(getCurrentBackup().sections);
  recordVaultLog("Export", `${summary.presentSections} sections and ${summary.totalRecords} records downloaded.`);
  renderVault();
}

function renderRadar() {
  const visibleCandidates = getVisibleCandidates();
  const visibleIds = new Set(visibleCandidates.map((candidate) => candidate.id));
  state.radarSelected = new Set([...state.radarSelected].filter((id) => visibleIds.has(id)));
  refs.radarGrid.innerHTML = radarSources
    .map(
      (source) => `
        <article class="radar-card">
          <header>
            <h2>${escapeHtml(source.name)}</h2>
            <span class="badge ${source.status === "Healthy" ? "green" : source.status === "Review Needed" ? "amber" : "blue"}">${escapeHtml(source.status)}</span>
          </header>
          <p>${escapeHtml(source.note)}</p>
          <div class="badge-row" style="margin-top: 12px;">
            <span class="badge">${source.found} candidates</span>
            <span class="badge">Last run ${formatShortDate(source.lastRun)}</span>
          </div>
        </article>
      `
    )
    .join("");
  refs.candidateGrid.innerHTML = visibleCandidates.length
    ? visibleCandidates.map(renderCandidateCard).join("")
    : `
      <div class="empty-state">
        <h2>Review queue is clear.</h2>
        <p>Approved candidates are now visible in Discover. Rejected candidates stay hidden until you reset the queue.</p>
      </div>
    `;
  renderRadarBulkBar();
  renderRadarAudit();
}

function approveCandidate(candidateId) {
  const candidate = getCandidate(candidateId);
  if (!candidate) {
    return;
  }
  const festival = {
    ...candidateToFestival(candidate, "2026-05-06"),
    promotedFromCandidateId: candidate.id
  };
  state.promotedFestivals = [
    ...state.promotedFestivals.filter((item) => item.promotedFromCandidateId !== candidate.id),
    festival
  ];
  state.rejectedCandidates = state.rejectedCandidates.filter((id) => id !== candidate.id);
  state.radarSelected.delete(candidate.id);
  recordRadarAudit("approved", candidate, "Approved into Discover.");
  saveRadarState();
  hydratePrepDraft();
  renderDiscover();
  hydrateIntelligenceChoices();
  renderIntelligence();
  renderMatches();
  renderPrepPack();
  renderScout();
  renderImport();
  renderRadar();
  renderLaunch();
}

function rejectCandidate(candidateId) {
  const candidate = getCandidate(candidateId);
  if (!candidate) {
    return;
  }
  if (!state.rejectedCandidates.includes(candidateId)) {
    state.rejectedCandidates.push(candidateId);
  }
  state.promotedFestivals = state.promotedFestivals.filter(
    (festival) => festival.promotedFromCandidateId !== candidateId
  );
  state.radarSelected.delete(candidateId);
  recordRadarAudit("rejected", candidate, "Rejected from the review queue.");
  saveRadarState();
  hydratePrepDraft();
  renderDiscover();
  hydrateIntelligenceChoices();
  renderIntelligence();
  renderMatches();
  renderPrepPack();
  renderScout();
  renderImport();
  renderRadar();
  renderLaunch();
}

function approveSelectedCandidates() {
  const selectedIds = [...state.radarSelected];
  selectedIds.forEach((candidateId) => {
    const candidate = getCandidate(candidateId);
    if (!candidate) {
      return;
    }
    const festival = {
      ...candidateToFestival(candidate, "2026-05-07"),
      promotedFromCandidateId: candidate.id
    };
    state.promotedFestivals = [
      ...state.promotedFestivals.filter((item) => item.promotedFromCandidateId !== candidate.id),
      festival
    ];
    state.rejectedCandidates = state.rejectedCandidates.filter((id) => id !== candidate.id);
    recordRadarAudit("approved", candidate, "Bulk approved into Discover.");
  });
  state.radarSelected.clear();
  saveRadarState();
  hydratePrepDraft();
  renderDiscover();
  hydrateIntelligenceChoices();
  renderIntelligence();
  renderMatches();
  renderPrepPack();
  renderScout();
  renderImport();
  renderRadar();
  renderLaunch();
}

function rejectSelectedCandidates() {
  const selectedIds = [...state.radarSelected];
  selectedIds.forEach((candidateId) => {
    const candidate = getCandidate(candidateId);
    if (!candidate) {
      return;
    }
    if (!state.rejectedCandidates.includes(candidateId)) {
      state.rejectedCandidates.push(candidateId);
    }
    state.promotedFestivals = state.promotedFestivals.filter(
      (festival) => festival.promotedFromCandidateId !== candidateId
    );
    recordRadarAudit("rejected", candidate, "Bulk rejected from Radar.");
  });
  state.radarSelected.clear();
  saveRadarState();
  hydratePrepDraft();
  renderDiscover();
  hydrateIntelligenceChoices();
  renderIntelligence();
  renderMatches();
  renderPrepPack();
  renderScout();
  renderImport();
  renderRadar();
  renderLaunch();
}

function renderRadarBulkBar() {
  const selectedCount = state.radarSelected.size;
  refs.radarBulkBar.classList.toggle("hidden", selectedCount === 0);
  refs.radarBulkCopy.textContent = `${plural(selectedCount, "candidate")} selected`;
  refs.radarBulkApprove.disabled = selectedCount === 0;
  refs.radarBulkReject.disabled = selectedCount === 0;
  const visibleCandidates = getVisibleCandidates();
  refs.radarSelectAll.checked = visibleCandidates.length > 0 && visibleCandidates.every((candidate) => state.radarSelected.has(candidate.id));
}

function renderRadarAudit() {
  refs.radarAuditList.innerHTML = state.radarAudit.length
    ? state.radarAudit
        .slice(0, 8)
        .map((entry) => {
          const tone = entry.action === "approved" ? "green" : entry.action === "rejected" ? "red" : "blue";
          return `
            <article class="audit-item">
              <div>
                <strong>${escapeHtml(entry.candidateName)}</strong>
                <p>${escapeHtml(entry.note || "Review action recorded.")}</p>
              </div>
              <div class="badge-row">
                <span class="badge ${tone}">${escapeHtml(entry.action)}</span>
                <span class="badge">${entry.score}/100</span>
                <span class="badge">${escapeHtml(entry.riskLevel)} risk</span>
                <span class="badge">${formatShortDate(entry.createdAt)}</span>
              </div>
            </article>
          `;
        })
        .join("")
    : `
      <div class="empty-state">
        <h2>No review actions yet.</h2>
        <p>Approvals, rejections, and edits will appear here with the score and risk at the time of review.</p>
      </div>
    `;
}

function renderCandidateCard(candidate) {
  const scored = scoreRadarCandidate(candidate);
  const meterClass = scored.score >= 80 ? "good" : scored.score >= 55 ? "warn" : "bad";
  const recommendationClass =
    scored.recommendation === "Auto-publish"
      ? "green"
      : scored.recommendation === "Review"
        ? "amber"
        : "red";
  const positiveRows = scored.positives
    .filter((item) => item.met)
    .slice(0, 5)
    .map((item) => `<span class="met">${escapeHtml(item.label)} <strong>+${item.points}</strong></span>`)
    .join("");
  const missingRows = scored.positives
    .filter((item) => !item.met)
    .slice(0, 3)
    .map((item) => `<span class="miss">${escapeHtml(item.label)} <strong>0</strong></span>`)
    .join("");
  const warningRows = scored.warnings
    .map((item) => `<span class="warning">${escapeHtml(item.label)} <strong>${item.points}</strong></span>`)
    .join("");

  return `
    <article class="candidate-card">
      <header>
        <label class="candidate-select">
          <input class="radar-select-check" type="checkbox" data-id="${candidate.id}" ${state.radarSelected.has(candidate.id) ? "checked" : ""} />
          <span>Select</span>
        </label>
        <div>
          <h2>${escapeHtml(candidate.name)}</h2>
          <p>${escapeHtml(candidate.description)}</p>
        </div>
        <span class="badge ${recommendationClass}">${escapeHtml(scored.recommendation)}</span>
      </header>
      <div class="score-meter" aria-label="Confidence score ${scored.score}">
        <span class="${meterClass}" style="width: ${scored.score}%"></span>
      </div>
      <div class="badge-row" style="margin-top: 12px;">
        <span class="badge blue">${scored.score}/100 confidence</span>
        <span class="badge">${escapeHtml(scored.riskLevel)} risk</span>
        <span class="badge">${escapeHtml(candidate.discoverySource)}</span>
        <span class="badge">${formatShortDate(candidate.discoveredAt)}</span>
      </div>
      <p><strong>Suggested fit:</strong> ${escapeHtml(candidate.suggestedFit)}</p>
      <div class="score-breakdown">
        ${positiveRows}
        ${missingRows}
        ${warningRows}
      </div>
      <div class="action-row" style="margin-top: 14px;">
        <button class="primary-button js-approve-candidate" type="button" data-id="${candidate.id}">Approve to Directory</button>
        <button class="secondary-button js-edit-candidate" type="button" data-id="${candidate.id}">Edit Facts</button>
        <button class="secondary-button js-preview-candidate" type="button" data-id="${candidate.id}">Preview Details</button>
        <button class="text-button js-reject-candidate" type="button" data-id="${candidate.id}">Reject</button>
      </div>
    </article>
  `;
}

function toLocalDateTimeInput(value) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function openReviewEditor(candidate) {
  if (!candidate) {
    return;
  }
  state.editingCandidateId = candidate.id;
  refs.reviewCandidateId.value = candidate.id;
  refs.reviewName.value = candidate.name || "";
  refs.reviewDeadline.value = toLocalDateTimeInput(candidate.deadline);
  refs.reviewWebsite.value = candidate.websiteUrl || "";
  refs.reviewSubmissionUrl.value = candidate.submissionUrl || "";
  refs.reviewEntryFee.value = String(candidate.entryFee || 0);
  refs.reviewPrizeMoney.value = String(candidate.prizeMoney || 0);
  refs.reviewMaxDuration.value = String(candidate.duration?.max || 10);
  refs.reviewContentTypes.value = (candidate.contentTypes || []).join(", ");
  refs.reviewFormats.value = (candidate.formats || []).join(", ");
  refs.reviewDescription.value = candidate.description || "";
  refs.reviewFit.value = candidate.suggestedFit || "";
  refs.reviewSignals.value = (candidate.extractedSignals || []).join("\n");
  refs.reviewWarnings.value = (candidate.warningSignals || []).join(", ");
  refs.reviewNote.value = "";
  refs.reviewOrganizer.checked = Boolean(candidate.evidence?.namedOrganizers);
  refs.reviewVenue.checked = Boolean(candidate.evidence?.venue);
  refs.reviewRules.checked = Boolean(candidate.evidence?.rulesPage);
  refs.reviewSocial.checked = Boolean(candidate.evidence?.socialPresence);
  refs.reviewPastEdition.checked = Boolean(candidate.evidence?.pastEdition);
  refs.reviewFees.checked = Boolean(candidate.evidence?.transparentFees);
  refs.reviewPrizeDetails.checked = Boolean(candidate.evidence?.prizeDetails);
  refs.reviewModal.classList.remove("hidden");
}

function readReviewPatch() {
  return {
    name: refs.reviewName.value,
    deadline: refs.reviewDeadline.value,
    websiteUrl: refs.reviewWebsite.value,
    submissionUrl: refs.reviewSubmissionUrl.value,
    entryFee: refs.reviewEntryFee.value,
    prizeMoney: refs.reviewPrizeMoney.value,
    maxDuration: refs.reviewMaxDuration.value,
    contentTypes: refs.reviewContentTypes.value,
    formats: refs.reviewFormats.value,
    description: refs.reviewDescription.value,
    suggestedFit: refs.reviewFit.value,
    extractedSignals: refs.reviewSignals.value.split(/\r?\n/u).join(", "),
    warningSignals: refs.reviewWarnings.value,
    evidence: {
      officialWebsite: Boolean(refs.reviewWebsite.value),
      submissionLink: Boolean(refs.reviewSubmissionUrl.value),
      deadline: Boolean(refs.reviewDeadline.value),
      namedOrganizers: refs.reviewOrganizer.checked,
      venue: refs.reviewVenue.checked,
      rulesPage: refs.reviewRules.checked,
      socialPresence: refs.reviewSocial.checked,
      pastEdition: refs.reviewPastEdition.checked,
      transparentFees: refs.reviewFees.checked,
      prizeDetails: refs.reviewPrizeDetails.checked
    }
  };
}

function saveReviewEdit() {
  const candidate = getCandidate(refs.reviewCandidateId.value);
  if (!candidate) {
    return;
  }
  const patched = applyCandidateReviewPatch(candidate, readReviewPatch());
  upsertOrganizerCandidate(patched);
  recordRadarAudit("edited", patched, refs.reviewNote.value.trim() || "Candidate facts edited before publishing.");
  refs.reviewModal.classList.add("hidden");
  hydratePrepDraft();
  renderDiscover();
  hydrateIntelligenceChoices();
  renderIntelligence();
  renderMatches();
  renderPrepPack();
  renderScout();
  renderImport();
  renderRadar();
  renderLaunch();
}

function renderMatches() {
  const matches = rankFestivalMatches(getAllFestivals(), state.filmProfile);
  const openMatches = matches.filter((match) => match.festival.status !== "Closed");
  const strong = openMatches.filter((match) => match.score >= 78);
  const soon = openMatches.filter((match) => daysUntil(match.festival.deadline) >= 0 && daysUntil(match.festival.deadline) <= 14);
  refs.matchStrong.textContent = String(strong.length);
  refs.matchSoon.textContent = String(soon.length);

  const filmName = state.filmProfile.title || "this film";
  const top = openMatches[0];
  if (top) {
    refs.strategyTitle.textContent = `${top.festival.name} is the current top fit`;
    refs.strategyCopy.textContent = `${filmName} is ranking highest for ${state.filmProfile.goal.toLowerCase()} based on runtime, content type, cost, deadline urgency, and confidence signals.`;
  } else {
    refs.strategyTitle.textContent = "No open festivals match yet";
    refs.strategyCopy.textContent = "Adjust the profile or approve more radar candidates into the directory.";
  }

  refs.matchResults.innerHTML = openMatches.length
    ? openMatches.slice(0, 8).map(renderMatchCard).join("")
    : `
      <div class="empty-state">
        <h2>No matches available.</h2>
        <p>Try switching region to Any or increasing the maximum entry fee.</p>
      </div>
    `;
}

function renderMatchCard(match) {
  const tierClass =
    match.tier === "Strong fit" ? "green" : match.tier === "Possible fit" ? "amber" : "red";
  const reasonItems = [
    ...match.reasons.map((reason) => `<span>${escapeHtml(reason)}</span>`),
    ...match.cautions.map((caution) => `<span class="caution">${escapeHtml(caution)}</span>`)
  ].join("");
  return `
    <article class="match-card">
      <div class="match-score" style="--score: ${match.score}">
        <span>${match.score}</span>
      </div>
      <div>
        <div class="badge-row">
          <span class="badge ${tierClass}">${escapeHtml(match.tier)}</span>
          ${confidenceBadge(match.festival)}
          <span class="badge">${deadlineLabel(match.festival)}</span>
        </div>
        <h2>${escapeHtml(match.festival.name)}</h2>
        <p>${escapeHtml(match.festival.fitSummary)}</p>
        <div class="reason-list">
          ${reasonItems || "<span>No strong match signals yet.</span>"}
        </div>
      </div>
      <div class="action-row">
        <button class="secondary-button js-detail" type="button" data-id="${match.festival.id}">Details</button>
        <button class="secondary-button js-open-intelligence" type="button" data-id="${match.festival.id}">Tips</button>
        <button class="secondary-button js-calendar" type="button" data-id="${match.festival.id}">Calendar</button>
        <button class="primary-button js-track" type="button" data-id="${match.festival.id}">Track</button>
      </div>
    </article>
  `;
}

function getCurrentPacket() {
  updatePrepDraft();
  const festival = getFestival(state.prepDraft.festivalId) || getAllFestivals()[0];
  if (!festival) {
    return null;
  }
  const profile = {
    ...state.filmProfile,
    title: state.prepDraft.filmTitle || state.filmProfile.title
  };
  return buildSubmissionPacket(festival, profile, state.prepDraft);
}

function renderPrepPack() {
  const packet = getCurrentPacket();
  if (!packet) {
    refs.packetPreview.innerHTML = `
      <div class="empty-state">
        <h2>No festival selected.</h2>
        <p>Add festivals to the directory before building a prep pack.</p>
      </div>
    `;
    return;
  }
  const readinessGap = packet.readiness.totalCount - packet.readiness.completedCount;
  refs.packetPreview.innerHTML = `
    <div class="prep-pack-hero">
      <div>
        <div class="badge-row">
          <span class="badge ${packet.feeDecision.tone}">${escapeHtml(packet.feeDecision.label)}</span>
          <span class="badge blue">${packet.summary.matchScore}/100 match</span>
        </div>
        <h2>${escapeHtml(packet.title)}</h2>
        <p>${escapeHtml(packet.submissionAngle)}</p>
      </div>
      <div class="readiness-meter" aria-label="Prep readiness score">
        <strong>${packet.readiness.score}</strong>
        <span>${escapeHtml(packet.readiness.tier)}</span>
      </div>
    </div>
    <div class="packet-summary premium-summary">
      <div><span>Readiness</span><strong>${packet.readiness.completedCount}/${packet.readiness.totalCount} ready</strong></div>
      <div><span>Deadline</span><strong>${formatShortDate(packet.summary.deadline)}</strong></div>
      <div><span>Entry fee</span><strong>$${packet.summary.fee}</strong></div>
      <div><span>Days left</span><strong>${deadlineLabel(packet.match.festival)}</strong></div>
    </div>
    <div class="prep-advisor-card ${packet.feeDecision.tone}">
      <span>Fee decision</span>
      <strong>${escapeHtml(packet.feeDecision.label)}</strong>
      <p>${escapeHtml(packet.feeDecision.detail)}</p>
    </div>
    <h3>Readiness Checks</h3>
    <div class="readiness-check-grid">
      ${packet.readiness.checks.map((check) => `
        <article class="readiness-check ${check.ready ? "ready" : "missing"}">
          <span class="badge ${check.ready ? "green" : "amber"}">${check.ready ? "Ready" : "Needed"}</span>
          <strong>${escapeHtml(check.label)}</strong>
          <p>${escapeHtml(check.detail)}</p>
        </article>
      `).join("")}
    </div>
    <h3>Deadline Timeline</h3>
    <div class="prep-timeline">
      ${packet.timeline.map((step) => `
        <article>
          <span>${escapeHtml(step.label)}</span>
          <strong>${escapeHtml(step.date)}</strong>
          <p>${escapeHtml(step.detail)}</p>
        </article>
      `).join("")}
    </div>
    <h3>Phase Checklist</h3>
    <div class="phase-checklist">
      ${packet.materialsByPhase.map((phase) => `
        <article>
          <h4>${escapeHtml(phase.phase)}</h4>
          <ul>${phase.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </article>
      `).join("")}
    </div>
    <h3>Positioning</h3>
    <ul>${packet.positioning.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h3>Export / Rules Notes</h3>
    <ul>${packet.exportNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h3>Watchouts</h3>
    <ul>${packet.watchouts.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h3>Draft Notes</h3>
    <ul>${packet.notes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <p class="prep-pack-footer">${readinessGap ? `${readinessGap} readiness item${readinessGap === 1 ? "" : "s"} still need attention before this feels submission-ready.` : "This packet is ready for a final rules check and submission-page review."}</p>
  `;
}

function statusToPipelineStage(status) {
  if (status === "Accepted") {
    return "Accepted";
  }
  if (status === "Rejected") {
    return "Rejected";
  }
  if (status === "Pending" || status === "Submitted") {
    return "Submitted";
  }
  return "Preparing";
}

function getPipelineReport() {
  return buildSubmissionPipeline(state.pipelineItems, getAllFestivals(), state.filmProfile, state.submissions);
}

function hydratePipelineFestivalOptions() {
  const current = refs.pipelineFestival.value || state.prepDraft.festivalId || getAllFestivals()[0]?.id || "";
  refs.pipelineFestival.innerHTML = getAllFestivals()
    .map((festival) => `<option value="${festival.id}">${escapeHtml(festival.name)}</option>`)
    .join("");
  refs.pipelineFestival.value = getAllFestivals().some((festival) => festival.id === current)
    ? current
    : getAllFestivals()[0]?.id || "";
}

function hydratePipelineForm(item = null) {
  hydratePipelineFestivalOptions();
  const festival = getFestival(item?.festivalId || refs.pipelineFestival.value || state.prepDraft.festivalId);
  refs.pipelineItemId.value = item?.id || "";
  refs.pipelineFestival.value = item?.festivalId || festival?.id || getAllFestivals()[0]?.id || "";
  refs.pipelineFilmTitle.value = item?.filmTitle || state.prepDraft.filmTitle || state.filmProfile.title || "";
  refs.pipelineStage.value = item?.stage || "Researching";
  refs.pipelinePriority.value = item?.priority || "Medium";
  refs.pipelineDueDate.value = item?.dueDate || (festival?.deadline ? festival.deadline.slice(0, 10) : "");
  refs.pipelineNotes.value = item?.notes || "";
}

function readPipelineForm() {
  const existing = state.pipelineItems.find((item) => item.id === refs.pipelineItemId.value);
  return normalizePipelineItem({
    ...existing,
    id: refs.pipelineItemId.value || undefined,
    festivalId: refs.pipelineFestival.value,
    filmTitle: refs.pipelineFilmTitle.value.trim() || state.filmProfile.title || "Untitled Film",
    stage: refs.pipelineStage.value,
    priority: refs.pipelinePriority.value,
    dueDate: refs.pipelineDueDate.value,
    notes: refs.pipelineNotes.value,
    updatedAt: new Date().toISOString()
  });
}

function savePipelineCard(message = "Pipeline card saved.") {
  const item = readPipelineForm();
  const exists = state.pipelineItems.some((candidate) => candidate.id === item.id);
  state.pipelineItems = exists
    ? state.pipelineItems.map((candidate) => candidate.id === item.id ? item : candidate)
    : [item, ...state.pipelineItems];
  state.pipelineNotice = message;
  savePipelineItems();
  renderPipeline();
  renderLaunch();
}

function addCurrentPrepToPipeline() {
  const festival = getFestival(state.prepDraft.festivalId) || getAllFestivals()[0];
  if (!festival) {
    state.pipelineNotice = "Add a festival before creating a pipeline card.";
    renderPipeline();
    return;
  }
  const item = normalizePipelineItem({
    festivalId: festival.id,
    filmTitle: state.prepDraft.filmTitle || state.filmProfile.title || "Untitled Film",
    stage: "Preparing",
    priority: isUrgent(festival.deadline) ? "High" : "Medium",
    dueDate: festival.deadline.slice(0, 10),
    notes: state.prepDraft.privateNotes || state.prepDraft.logline || ""
  });
  state.pipelineItems = [
    item,
    ...state.pipelineItems.filter((candidate) => !(candidate.festivalId === item.festivalId && candidate.filmTitle === item.filmTitle))
  ];
  state.pipelineNotice = `${item.filmTitle} added to the pipeline for ${festival.name}.`;
  savePipelineItems();
  hydratePipelineForm(item);
  renderPipeline();
  renderLaunch();
}

function syncPipelineFromSubmission(payload) {
  const stage = statusToPipelineStage(payload.status);
  const existing = state.pipelineItems.find((item) =>
    item.festivalId === payload.festivalId &&
    String(item.filmTitle || "").trim().toLowerCase() === String(payload.filmTitle || "").trim().toLowerCase()
  );
  const item = normalizePipelineItem({
    ...existing,
    festivalId: payload.festivalId,
    filmTitle: payload.filmTitle || state.filmProfile.title || "Untitled Film",
    stage,
    priority: existing?.priority || "High",
    dueDate: payload.submissionDate,
    notes: payload.notes || existing?.notes || "",
    updatedAt: new Date().toISOString()
  });
  state.pipelineItems = existing
    ? state.pipelineItems.map((candidate) => candidate.id === existing.id ? item : candidate)
    : [item, ...state.pipelineItems];
  savePipelineItems();
}

function movePipelineCard(itemId, direction) {
  const current = state.pipelineItems.find((item) => item.id === itemId);
  if (!current) {
    return;
  }
  const index = PIPELINE_STAGES.indexOf(current.stage);
  const nextStage = PIPELINE_STAGES[Math.max(0, Math.min(PIPELINE_STAGES.length - 1, index + direction))];
  state.pipelineItems = state.pipelineItems.map((item) =>
    item.id === itemId
      ? normalizePipelineItem({ ...item, stage: nextStage, updatedAt: new Date().toISOString() })
      : item
  );
  state.pipelineNotice = `${current.filmTitle} moved to ${nextStage}.`;
  savePipelineItems();
  renderPipeline();
}

function removePipelineCard(itemId) {
  const item = state.pipelineItems.find((candidate) => candidate.id === itemId);
  state.pipelineItems = state.pipelineItems.filter((candidate) => candidate.id !== itemId);
  state.pipelineNotice = item ? `${item.filmTitle} removed from the pipeline.` : "Pipeline card removed.";
  savePipelineItems();
  renderPipeline();
  renderLaunch();
}

function renderPipeline() {
  const report = getPipelineReport();
  hydratePipelineFestivalOptions();
  refs.pipelineTotal.textContent = String(report.summary.total);
  refs.pipelinePreparing.textContent = String(report.summary.preparing);
  refs.pipelineSubmitted.textContent = String(report.summary.submitted);
  refs.pipelineDecisions.textContent = String(report.summary.decisions);
  refs.pipelineFocusNow.textContent = String(report.summary.focus);
  refs.pipelineFeeExposure.textContent = formatMoney(report.summary.feeExposure);
  refs.pipelineBoardScore.textContent = `${report.summary.boardScore}/100`;
  refs.pipelineMessage.textContent = state.pipelineNotice || `${report.summary.total} opportunities staged. Board score ${report.summary.boardScore}/100 with ${report.summary.focus} focus card${report.summary.focus === 1 ? "" : "s"}.`;
  refs.pipelineActions.innerHTML = `
    ${report.actions.map((action) => `<span>${escapeHtml(action)}</span>`).join("")}
    ${report.focusQueue.length ? `
      <div class="pipeline-focus-list">
        ${report.focusQueue.slice(0, 3).map((card) => `
          <article>
            <span class="badge ${card.pressure.tone}">${escapeHtml(card.pressure.label)}</span>
            <strong>${escapeHtml(card.nextAction.label)}</strong>
            <p>${escapeHtml(card.filmTitle)} -> ${escapeHtml(card.festivalName)}</p>
          </article>
        `).join("")}
      </div>
    ` : ""}
  `;

  refs.pipelineBoard.innerHTML = report.columns.map((column) => `
    <section class="pipeline-column ${escapeHtml(column.tone)}">
      <header>
        <div>
          <p class="eyebrow">${escapeHtml(column.stage)}</p>
          <h2>${plural(column.count, "card")}</h2>
        </div>
        <div class="pipeline-column-stats">
          <span class="badge ${column.criticalCount ? "red" : column.urgentCount ? "amber" : "blue"}">${column.urgentCount} urgent</span>
          <span>${column.averageMatch}/100 avg</span>
          <span>${formatMoney(column.feeTotal)} fees</span>
        </div>
      </header>
      <div class="pipeline-card-list">
        ${column.cards.length ? column.cards.map(renderPipelineCard).join("") : `
          <div class="pipeline-empty">
            <span>No cards</span>
          </div>
        `}
      </div>
    </section>
  `).join("");
}

function renderPipelineCard(card) {
  const priorityClass = card.priority === "High" ? "red" : card.priority === "Medium" ? "amber" : "blue";
  const stageIndex = PIPELINE_STAGES.indexOf(card.stage);
  const canMoveBack = card.editable && stageIndex > 0;
  const canMoveNext = card.editable && stageIndex < PIPELINE_STAGES.length - 1;
  return `
    <article class="pipeline-card ${escapeHtml(card.pressure.tone)} ${card.overBudget ? "over-budget" : ""}">
      <div class="badge-row">
        <span class="badge ${priorityClass}">${escapeHtml(card.priority)}</span>
        <span class="badge ${card.pressure.tone}">${escapeHtml(card.pressure.label)}</span>
        <span class="badge ${card.matchScore >= 78 ? "green" : card.matchScore >= 58 ? "amber" : "red"}">${card.matchScore}/100</span>
        ${card.submissionStatus ? `<span class="badge blue">${escapeHtml(card.submissionStatus)}</span>` : ""}
        ${card.editable ? "" : `<span class="badge violet">From tracker</span>`}
      </div>
      <h3>${escapeHtml(card.filmTitle)}</h3>
      <p>${escapeHtml(card.festivalName)}</p>
      <div class="reason-list pipeline-meta">
        <span>${escapeHtml(card.deadlineDate)}</span>
        <span>${card.festival ? deadlineLabel(card.festival) : "No countdown"}</span>
        <span class="${card.overBudget ? "caution" : ""}">${formatMoney(card.fee)} fee</span>
        <span>${escapeHtml(card.source)}</span>
      </div>
      <div class="pipeline-next-action">
        <span>${escapeHtml(card.nextAction.label)}</span>
        <p>${escapeHtml(card.nextAction.detail)}</p>
      </div>
      ${card.notes ? `<p class="pipeline-note">${escapeHtml(card.notes)}</p>` : ""}
      <div class="pipeline-card-actions">
        <button class="secondary-button js-pipeline-move" type="button" data-id="${escapeHtml(card.id)}" data-direction="-1" ${canMoveBack ? "" : "disabled"}>Back</button>
        <button class="secondary-button js-pipeline-edit" type="button" data-id="${escapeHtml(card.id)}" ${card.editable ? "" : "disabled"}>Edit</button>
        <button class="secondary-button js-pipeline-prep" type="button" data-id="${escapeHtml(card.id)}" ${card.editable ? "" : "disabled"}>Prep</button>
        <button class="primary-button js-pipeline-move" type="button" data-id="${escapeHtml(card.id)}" data-direction="1" ${canMoveNext ? "" : "disabled"}>Next</button>
      </div>
      <button class="text-button js-pipeline-remove" type="button" data-id="${escapeHtml(card.id)}" ${card.editable ? "" : "disabled"}>Remove</button>
    </article>
  `;
}

async function copyPipelineBoard() {
  await navigator.clipboard.writeText(pipelineToText(getPipelineReport()));
  state.pipelineNotice = "Pipeline board copied.";
  renderPipeline();
}

function downloadPipelineBoard() {
  const report = getPipelineReport();
  const blob = new Blob([pipelineToCsv(report)], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laurelpilot-pipeline-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  state.pipelineNotice = "Pipeline CSV downloaded.";
  renderPipeline();
}

function exportCsv() {
  const rows = [
    ["Festival", "Film Title", "Submission Date", "Status", "Entry Fee", "Notes"],
    ...state.submissions
      .map((item) => ({ ...item, festival: getFestival(item.festivalId) }))
      .filter((item) => item.festival)
      .map((item) => [
        item.festival.name,
        item.filmTitle,
        item.submissionDate,
        item.status,
        item.festival.entryFee,
        item.notes
      ])
  ];
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "laurelpilot-submissions.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function clearFilters() {
  refs.searchInput.value = "";
  refs.statusFilter.value = "All";
  refs.deadlineFilter.value = "30";
  refs.regionFilter.value = "All";
  refs.typeFilter.value = "All";
  refs.runtimeFilter.value = "All";
  refs.prizeToggle.checked = false;
  refs.prizeFilter.value = "0";
  refs.recurringToggle.checked = false;
  updateFilterState();
  renderDiscover();
}

function readIntakeForm() {
  return {
    name: refs.intakeName.value,
    organizerName: refs.intakeOrganizer.value,
    websiteUrl: refs.intakeWebsite.value,
    submissionUrl: refs.intakeSubmitUrl.value,
    deadline: refs.intakeDeadline.value,
    eventDate: refs.intakeEventDate.value,
    city: refs.intakeCity.value,
    country: refs.intakeCountry.value,
    region: refs.intakeRegion.value,
    mode: refs.intakeMode.value,
    entryFee: refs.intakeFee.value,
    prizeMoney: refs.intakePrize.value,
    maxDuration: refs.intakeMaxDuration.value,
    frequency: refs.intakeFrequency.value,
    description: refs.intakeDescription.value,
    contentTypes: refs.intakeTypes.value,
    formats: refs.intakeFormats.value,
    suggestedFit: refs.intakeFit.value,
    hasClearRules: refs.intakeRules.checked,
    feesTransparent: refs.intakeFeesTransparent.checked,
    prizeDetails: refs.intakePrizeDetails.checked,
    hasPastEdition: refs.intakePastEdition.checked,
    aggressiveDiscounts: refs.intakeDiscounts.checked
  };
}

function clearIntakeForm() {
  refs.intakeForm.reset();
  refs.intakeFee.value = "0";
  refs.intakePrize.value = "0";
  refs.intakeMaxDuration.value = "10";
  refs.intakeMessage.textContent = "";
}

refs.menuButton.addEventListener("click", () => refs.sidebar.classList.add("open"));
refs.closeMenuButton.addEventListener("click", () => refs.sidebar.classList.remove("open"));

$$(".nav-tab").forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    refs.sidebar.classList.remove("open");
    if (state.view === "onboarding") {
      hydrateOnboardingForm();
      renderOnboarding();
    }
    renderView();
  });
});

[
  refs.searchInput,
  refs.statusFilter,
  refs.deadlineFilter,
  refs.regionFilter,
  refs.typeFilter,
  refs.runtimeFilter,
  refs.prizeToggle,
  refs.prizeFilter,
  refs.recurringToggle,
  refs.sortSelect
].forEach((control) => {
  control.addEventListener("input", () => {
    updateFilterState();
    renderDiscover();
  });
});

refs.clearFilters.addEventListener("click", clearFilters);

[
  refs.calendarRange,
  refs.calendarStatus,
  refs.calendarRegion
].forEach((control) => {
  control.addEventListener("input", () => {
    updateDeadlineCalendarState();
    state.calendar.notice = "";
    renderDeadlineCalendar();
  });
});

refs.calendarCopy.addEventListener("click", copyDeadlineCalendarPlan);
refs.calendarDownloadPlan.addEventListener("click", downloadDeadlineCalendarPlan);
refs.calendarDownloadIcs.addEventListener("click", downloadDeadlineCalendarIcs);
[
  refs.seasonBudget,
  refs.seasonTargets,
  refs.seasonWindow,
  refs.seasonStrategy,
  refs.seasonRegion
].forEach((control) => {
  control.addEventListener("input", () => {
    state.season.notice = "";
    renderSeason();
  });
});
refs.seasonCopy.addEventListener("click", copySeasonPlan);
refs.seasonDownload.addEventListener("click", downloadSeasonPlan);
refs.seasonPrep.addEventListener("click", startTopSeasonPrep);
refs.seasonPipeline.addEventListener("click", addSeasonPlanToPipeline);
refs.proofCopy.addEventListener("click", copySourceProof);
refs.proofDownload.addEventListener("click", downloadSourceProof);

refs.filmFee.addEventListener("input", () => {
  refs.filmFeeValue.textContent = `$${refs.filmFee.value} max`;
});
refs.filmNew.addEventListener("click", startNewFilmProject);
refs.filmSave.addEventListener("click", saveFilmProjectFromForm);
refs.filmUseMatch.addEventListener("click", () => {
  state.view = "match";
  hydrateFilmProfile();
  renderMatches();
  renderView();
});
refs.filmCopy.addEventListener("click", copyFilmLibrary);
refs.filmDownload.addEventListener("click", downloadFilmLibrary);

refs.pipelineFestival.addEventListener("input", () => {
  const festival = getFestival(refs.pipelineFestival.value);
  if (festival && !refs.pipelineDueDate.value) {
    refs.pipelineDueDate.value = festival.deadline.slice(0, 10);
  }
});
refs.pipelineSave.addEventListener("click", () => savePipelineCard());
refs.pipelineClear.addEventListener("click", () => {
  hydratePipelineForm({
    festivalId: getAllFestivals()[0]?.id || "",
    filmTitle: state.filmProfile.title || "",
    stage: "Researching",
    priority: "Medium",
    dueDate: "",
    notes: ""
  });
  refs.pipelineItemId.value = "";
  state.pipelineNotice = "Pipeline form cleared.";
  renderPipeline();
});
refs.pipelineAddPrep.addEventListener("click", addCurrentPrepToPipeline);
refs.pipelineCopy.addEventListener("click", copyPipelineBoard);
refs.pipelineDownload.addEventListener("click", downloadPipelineBoard);

$$("[data-display]").forEach((button) => {
  button.addEventListener("click", () => {
    state.display = button.dataset.display;
    $$("[data-display]").forEach((candidate) => candidate.classList.toggle("active", candidate === button));
    renderDiscover();
  });
});

document.addEventListener("click", async (event) => {
  const detailButton = event.target.closest(".js-detail");
  const calendarButton = event.target.closest(".js-calendar");
  const trackButton = event.target.closest(".js-track");
  const removeButton = event.target.closest(".js-remove-submission");
  const icsButton = event.target.closest(".js-ics");
  const copyButton = event.target.closest(".js-copy-event");
  const approveCandidateButton = event.target.closest(".js-approve-candidate");
  const previewCandidateButton = event.target.closest(".js-preview-candidate");
  const rejectCandidateButton = event.target.closest(".js-reject-candidate");
  const editCandidateButton = event.target.closest(".js-edit-candidate");
  const addScoutLeadButton = event.target.closest(".js-add-scout-lead");
  const previewScoutLeadButton = event.target.closest(".js-preview-scout-lead");
  const openIntelligenceButton = event.target.closest(".js-open-intelligence");
  const editWatchButton = event.target.closest(".js-edit-watch-source");
  const markWatchButton = event.target.closest(".js-mark-watch-source");
  const toggleWatchButton = event.target.closest(".js-toggle-watch-source");
  const removeWatchButton = event.target.closest(".js-remove-watch-source");
  const onboardPrepButton = event.target.closest(".js-onboard-prep");
  const intelPrepButton = event.target.closest(".js-intel-prep");
  const calendarPrepButton = event.target.closest(".js-calendar-prep");
  const detailPrepButton = event.target.closest(".js-detail-prep");
  const copyDetailButton = event.target.closest(".js-copy-detail");
  const pipelineEditButton = event.target.closest(".js-pipeline-edit");
  const pipelineMoveButton = event.target.closest(".js-pipeline-move");
  const pipelinePrepButton = event.target.closest(".js-pipeline-prep");
  const pipelineRemoveButton = event.target.closest(".js-pipeline-remove");
  const deviceLogButton = event.target.closest(".js-device-log");
  const deviceEditButton = event.target.closest(".js-device-edit");
  const deviceFixedButton = event.target.closest(".js-device-fixed");
  const deviceRemoveButton = event.target.closest(".js-device-remove");
  const feedbackEditButton = event.target.closest(".js-feedback-edit");
  const feedbackPlanButton = event.target.closest(".js-feedback-plan");
  const feedbackFixedButton = event.target.closest(".js-feedback-fixed");
  const feedbackArchiveButton = event.target.closest(".js-feedback-archive");
  const feedbackRemoveButton = event.target.closest(".js-feedback-remove");
  const roadmapEditButton = event.target.closest(".js-roadmap-edit");
  const roadmapNextButton = event.target.closest(".js-roadmap-next");
  const roadmapShipButton = event.target.closest(".js-roadmap-ship");
  const roadmapPauseButton = event.target.closest(".js-roadmap-pause");
  const roadmapRemoveButton = event.target.closest(".js-roadmap-remove");
  const editFilmButton = event.target.closest(".js-edit-film");
  const activateFilmButton = event.target.closest(".js-activate-film");
  const filmPrepButton = event.target.closest(".js-film-prep");
  const removeFilmButton = event.target.closest(".js-remove-film");
  const setPlanButton = event.target.closest(".js-set-plan");
  const goViewButton = event.target.closest(".js-go-view");
  const trialStepButton = event.target.closest(".js-trial-step");
  const featureTrialButton = event.target.closest(".js-feature-trial");
  const featureUnlockButton = event.target.closest(".js-feature-unlock");

  if (detailButton) {
    renderDetails(getFestival(detailButton.dataset.id));
  }
  if (calendarButton) {
    renderCalendar(getFestival(calendarButton.dataset.id));
  }
  if (trackButton) {
    openSubmissionForm(getFestival(trackButton.dataset.id));
  }
  if (removeButton) {
    state.submissions = state.submissions.filter((item) => item.festivalId !== removeButton.dataset.id);
    saveSubmissions();
    renderSubmissions();
    renderPipeline();
    renderFilmLibrary();
    renderLaunch();
  }
  if (icsButton) {
    downloadIcs(getFestival(icsButton.dataset.id));
  }
  if (copyButton) {
    const festival = getFestival(copyButton.dataset.id);
    await navigator.clipboard.writeText(`${festival.name} deadline: ${formatShortDate(festival.deadline)}\n${festival.submissionUrl}`);
    copyButton.textContent = "Copied";
    setTimeout(() => {
      copyButton.textContent = "Copy Event Link";
    }, 1400);
  }
  if (approveCandidateButton) {
    approveCandidate(approveCandidateButton.dataset.id);
  }
  if (previewCandidateButton) {
    renderDetails(candidateToFestival(getCandidate(previewCandidateButton.dataset.id), "2026-05-06"));
  }
  if (rejectCandidateButton) {
    rejectCandidate(rejectCandidateButton.dataset.id);
  }
  if (editCandidateButton) {
    openReviewEditor(getCandidate(editCandidateButton.dataset.id));
  }
  if (addScoutLeadButton) {
    const added = addScoutLead(addScoutLeadButton.dataset.id);
    refs.scoutMessage.textContent = added ? "Lead sent to Radar for review." : "Lead is already in Radar.";
  }
  if (previewScoutLeadButton) {
    renderDetails(candidateToFestival(getScoutCandidate(previewScoutLeadButton.dataset.id), "2026-05-06"));
  }
  if (openIntelligenceButton) {
    if (state.view === "onboarding") {
      state.onboarding = normalizeOnboardingState({
        ...state.onboarding,
        shortlistReviewed: true,
        completedSteps: [...state.onboarding.completedSteps, "starter-shortlist"]
      });
      saveOnboardingState();
    }
    state.intelligenceFestivalId = openIntelligenceButton.dataset.id;
    hydrateIntelligenceChoices();
    renderIntelligence();
    refs.detailModal.classList.add("hidden");
    state.view = "intelligence";
    renderView();
  }
  if (editWatchButton) {
    hydrateWatchForm(getWatchSource(editWatchButton.dataset.id));
    refs.watchMessage.textContent = "Editing watch source.";
  }
  if (markWatchButton) {
    markWatchSourceChecked(markWatchButton.dataset.id);
  }
  if (toggleWatchButton) {
    toggleWatchSource(toggleWatchButton.dataset.id);
  }
  if (removeWatchButton) {
    removeWatchSource(removeWatchButton.dataset.id);
  }
  if (onboardPrepButton) {
    state.onboarding = normalizeOnboardingState({
      ...state.onboarding,
      shortlistReviewed: true,
      completedSteps: [...state.onboarding.completedSteps, "starter-shortlist"]
    });
    saveOnboardingState();
    state.prepDraft = {
      ...state.prepDraft,
      festivalId: onboardPrepButton.dataset.id,
      filmTitle: state.filmProfile.title || refs.onboardTitle.value.trim()
    };
    savePrepDraft();
    hydratePrepDraft();
    renderPrepPack();
    renderLaunch();
    state.view = "prep";
    renderView();
  }
  if (intelPrepButton) {
    state.prepDraft = {
      ...state.prepDraft,
      festivalId: intelPrepButton.dataset.id,
      filmTitle: state.filmProfile.title || state.prepDraft.filmTitle || ""
    };
    savePrepDraft();
    hydratePrepDraft();
    renderPrepPack();
    renderLaunch();
    state.view = "prep";
    renderView();
  }
  if (calendarPrepButton) {
    state.prepDraft = {
      ...state.prepDraft,
      festivalId: calendarPrepButton.dataset.id,
      filmTitle: state.filmProfile.title || state.prepDraft.filmTitle || ""
    };
    savePrepDraft();
    hydratePrepDraft();
    renderPrepPack();
    renderLaunch();
    state.calendar.notice = "Festival loaded into Prep Pack.";
    state.view = "prep";
    renderView();
  }
  if (detailPrepButton) {
    const festival = getFestival(detailPrepButton.dataset.id);
    state.prepDraft = {
      ...state.prepDraft,
      festivalId: detailPrepButton.dataset.id,
      filmTitle: state.filmProfile.title || state.prepDraft.filmTitle || ""
    };
    savePrepDraft();
    hydratePrepDraft();
    renderPrepPack();
    renderLaunch();
    refs.detailModal.classList.add("hidden");
    state.view = "prep";
    renderView();
    if (festival) {
      state.filmNotice = `${festival.name} loaded into Prep Pack.`;
    }
  }
  if (copyDetailButton) {
    const festival = getFestival(copyDetailButton.dataset.id);
    if (festival) {
      const report = buildFestivalDetailReport(festival, state.filmProfile, getAllFestivals());
      await navigator.clipboard.writeText(festivalDetailToText(report));
      copyDetailButton.textContent = "Copied";
      setTimeout(() => {
        copyDetailButton.textContent = "Copy Brief";
      }, 1400);
    }
  }
  if (pipelineEditButton) {
    const item = state.pipelineItems.find((candidate) => candidate.id === pipelineEditButton.dataset.id);
    if (item) {
      hydratePipelineForm(item);
      state.pipelineNotice = "Editing pipeline card.";
      renderPipeline();
    }
  }
  if (pipelineMoveButton) {
    movePipelineCard(pipelineMoveButton.dataset.id, Number(pipelineMoveButton.dataset.direction || 0));
  }
  if (pipelinePrepButton) {
    const item = state.pipelineItems.find((candidate) => candidate.id === pipelinePrepButton.dataset.id);
    if (item) {
      state.prepDraft = {
        ...state.prepDraft,
        festivalId: item.festivalId,
        filmTitle: item.filmTitle,
        privateNotes: item.notes || state.prepDraft.privateNotes || ""
      };
      savePrepDraft();
      hydratePrepDraft();
      renderPrepPack();
      state.pipelineNotice = "Pipeline card loaded into Prep Pack.";
      state.view = "prep";
      renderView();
    }
  }
  if (pipelineRemoveButton) {
    removePipelineCard(pipelineRemoveButton.dataset.id);
  }
  if (deviceLogButton) {
    hydrateDeviceLabForm({
      device: deviceLogButton.dataset.device,
      view: state.view === "device" ? "Product" : state.view,
      severity: "Polish",
      status: "Open",
      title: "",
      notes: ""
    });
    refs.deviceIssueId.value = "";
    state.deviceLabNotice = "Ready to log a device note.";
    renderDeviceLab();
  }
  if (deviceEditButton) {
    const issue = state.deviceLabIssues.find((candidate) => candidate.id === deviceEditButton.dataset.id);
    if (issue) {
      hydrateDeviceLabForm(issue);
      state.deviceLabNotice = "Editing Device Lab note.";
      renderDeviceLab();
    }
  }
  if (deviceFixedButton) {
    state.deviceLabIssues = state.deviceLabIssues.map((issue) =>
      issue.id === deviceFixedButton.dataset.id
        ? normalizeDeviceLabIssue({ ...issue, status: "Fixed", updatedAt: new Date().toISOString() })
        : issue
    );
    state.deviceLabNotice = "Device Lab note marked fixed.";
    saveDeviceLabIssues();
    renderDeviceLab();
    renderLaunch();
  }
  if (deviceRemoveButton) {
    const issue = state.deviceLabIssues.find((candidate) => candidate.id === deviceRemoveButton.dataset.id);
    state.deviceLabIssues = state.deviceLabIssues.filter((candidate) => candidate.id !== deviceRemoveButton.dataset.id);
    state.deviceLabNotice = issue ? `${issue.title} removed from Device Lab.` : "Device Lab note removed.";
    saveDeviceLabIssues();
    renderDeviceLab();
    renderLaunch();
  }
  if (feedbackEditButton) {
    const item = state.betaFeedbackItems.find((candidate) => candidate.id === feedbackEditButton.dataset.id);
    if (item) {
      hydrateFeedbackForm(item);
      state.betaFeedbackNotice = "Editing beta feedback note.";
      renderBetaFeedback();
    }
  }
  if (feedbackPlanButton) {
    state.betaFeedbackItems = state.betaFeedbackItems.map((item) =>
      item.id === feedbackPlanButton.dataset.id
        ? normalizeBetaFeedbackItem({ ...item, status: "Planned", updatedAt: new Date().toISOString() })
        : item
    );
    state.betaFeedbackNotice = "Feedback note moved to planned.";
    saveBetaFeedbackItems();
    renderBetaFeedback();
    renderLaunch();
  }
  if (feedbackFixedButton) {
    state.betaFeedbackItems = state.betaFeedbackItems.map((item) =>
      item.id === feedbackFixedButton.dataset.id
        ? normalizeBetaFeedbackItem({ ...item, status: "Fixed", updatedAt: new Date().toISOString() })
        : item
    );
    state.betaFeedbackNotice = "Feedback note marked fixed.";
    saveBetaFeedbackItems();
    renderBetaFeedback();
    renderLaunch();
  }
  if (feedbackArchiveButton) {
    state.betaFeedbackItems = state.betaFeedbackItems.map((item) =>
      item.id === feedbackArchiveButton.dataset.id
        ? normalizeBetaFeedbackItem({ ...item, status: "Archived", updatedAt: new Date().toISOString() })
        : item
    );
    state.betaFeedbackNotice = "Feedback note archived.";
    saveBetaFeedbackItems();
    renderBetaFeedback();
    renderLaunch();
  }
  if (feedbackRemoveButton) {
    const item = state.betaFeedbackItems.find((candidate) => candidate.id === feedbackRemoveButton.dataset.id);
    state.betaFeedbackItems = state.betaFeedbackItems.filter((candidate) => candidate.id !== feedbackRemoveButton.dataset.id);
    state.betaFeedbackNotice = item ? `${item.title} removed from feedback.` : "Feedback note removed.";
    saveBetaFeedbackItems();
    renderBetaFeedback();
    renderLaunch();
  }
  if (roadmapEditButton) {
    const item = state.roadmapItems.find((candidate) => candidate.id === roadmapEditButton.dataset.id);
    if (item) {
      hydrateRoadmapForm(item);
      state.roadmapNotice = "Editing roadmap item.";
      renderRoadmap();
    }
  }
  if (roadmapNextButton) {
    state.roadmapItems = state.roadmapItems.map((item) =>
      item.id === roadmapNextButton.dataset.id
        ? normalizeRoadmapItem({ ...item, status: "Next", updatedAt: new Date().toISOString() })
        : item
    );
    state.roadmapNotice = "Roadmap item moved to Next.";
    saveRoadmapItems();
    renderRoadmap();
    renderLaunch();
  }
  if (roadmapShipButton) {
    state.roadmapItems = state.roadmapItems.map((item) =>
      item.id === roadmapShipButton.dataset.id
        ? normalizeRoadmapItem({ ...item, status: "Shipped", shippedAt: item.shippedAt || new Date().toISOString(), updatedAt: new Date().toISOString() })
        : item
    );
    state.roadmapNotice = "Roadmap item shipped into the changelog.";
    saveRoadmapItems();
    renderRoadmap();
    renderLaunch();
  }
  if (roadmapPauseButton) {
    state.roadmapItems = state.roadmapItems.map((item) =>
      item.id === roadmapPauseButton.dataset.id
        ? normalizeRoadmapItem({ ...item, status: "Paused", updatedAt: new Date().toISOString() })
        : item
    );
    state.roadmapNotice = "Roadmap item paused.";
    saveRoadmapItems();
    renderRoadmap();
    renderLaunch();
  }
  if (roadmapRemoveButton) {
    const item = state.roadmapItems.find((candidate) => candidate.id === roadmapRemoveButton.dataset.id);
    state.roadmapItems = state.roadmapItems.filter((candidate) => candidate.id !== roadmapRemoveButton.dataset.id);
    state.roadmapNotice = item ? `${item.title} removed from roadmap.` : "Roadmap item removed.";
    saveRoadmapItems();
    renderRoadmap();
    renderLaunch();
  }
  if (editFilmButton) {
    state.editingFilmId = editFilmButton.dataset.id;
    state.filmNotice = "Editing film project.";
    hydrateFilmLibraryForm(getEditingFilmProject());
    renderFilmLibrary();
  }
  if (activateFilmButton) {
    activateFilmProject(activateFilmButton.dataset.id);
  }
  if (filmPrepButton) {
    activateFilmProject(filmPrepButton.dataset.id, "Film activated and loaded into Prep Pack.");
    state.view = "prep";
    renderView();
  }
  if (removeFilmButton) {
    removeFilmProject(removeFilmButton.dataset.id);
  }
  if (setPlanButton) {
    setAccessPlan(setPlanButton.dataset.planId, {
      status: setPlanButton.dataset.planId === "preview" ? "Preview" : "Active"
    });
  }
  if (featureTrialButton) {
    activateLocalTrial();
  }
  if (featureUnlockButton) {
    activateLaunchPass();
  }
  if (trialStepButton) {
    state.view = trialStepButton.dataset.viewTarget;
    renderView();
  }
  if (goViewButton) {
    state.view = goViewButton.dataset.viewTarget;
    if (state.view === "onboarding") {
      hydrateOnboardingForm();
      renderOnboarding();
    }
    renderView();
  }
});

document.addEventListener("change", (event) => {
  const checkbox = event.target.closest(".compare-check");
  const radarCheckbox = event.target.closest(".radar-select-check");
  if (radarCheckbox) {
    if (radarCheckbox.checked) {
      state.radarSelected.add(radarCheckbox.dataset.id);
    } else {
      state.radarSelected.delete(radarCheckbox.dataset.id);
    }
    renderRadarBulkBar();
    return;
  }
  if (!checkbox) {
    return;
  }
  if (checkbox.checked) {
    state.selected.add(checkbox.dataset.id);
  } else {
    state.selected.delete(checkbox.dataset.id);
  }
  renderCompareBar();
});

refs.compareButton.addEventListener("click", () => renderDetails(null, "compare"));
refs.clearCompareButton.addEventListener("click", () => {
  state.selected.clear();
  renderDiscover();
});

refs.detailClose.addEventListener("click", () => refs.detailModal.classList.add("hidden"));
refs.calendarClose.addEventListener("click", () => refs.calendarModal.classList.add("hidden"));
refs.submissionClose.addEventListener("click", () => refs.submissionModal.classList.add("hidden"));
refs.reviewClose.addEventListener("click", () => refs.reviewModal.classList.add("hidden"));

[refs.detailModal, refs.calendarModal, refs.submissionModal, refs.reviewModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  });
});

refs.reviewForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveReviewEdit();
});

refs.submissionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const festivalId = refs.submissionFestivalId.value;
  const existingIndex = state.submissions.findIndex((item) => item.festivalId === festivalId);
  const payload = {
    festivalId,
    filmTitle: refs.submissionFilmTitle.value.trim(),
    submissionDate: refs.submissionDate.value,
    status: refs.submissionStatus.value,
    notes: refs.submissionNotes.value.trim(),
    updatedAt: new Date().toISOString()
  };
  if (existingIndex >= 0) {
    state.submissions[existingIndex] = {
      ...state.submissions[existingIndex],
      ...payload
    };
  } else {
    state.submissions.push({
      ...payload,
      createdAt: new Date().toISOString()
    });
  }
  saveSubmissions();
  syncPipelineFromSubmission(payload);
  refs.submissionModal.classList.add("hidden");
  renderSubmissions();
  renderPipeline();
  renderFilmLibrary();
  renderLaunch();
});

[
  refs.profileTitle,
  refs.profileRuntime,
  refs.profileType,
  refs.profileGoal,
  refs.profileRegion,
  refs.profileMode,
  refs.profileFee,
  refs.profilePublic
].forEach((control) => {
  control.addEventListener("input", () => {
    updateFilmProfile();
    renderIntelligence();
    renderMatches();
    renderSeason();
    renderPrepPack();
    renderLaunch();
  });
});

refs.saveProfile.addEventListener("click", () => {
  updateFilmProfile();
  saveFilmProfile();
  syncActiveFilmFromProfile("Match profile saved to Film Library.");
  hydrateOnboardingForm();
  renderOnboarding();
  renderFilmLibrary();
  renderSeason();
  refs.saveProfile.textContent = "Saved";
  setTimeout(() => {
    refs.saveProfile.textContent = "Save Film Profile";
  }, 1400);
});

refs.intakeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const candidate = normalizeOrganizerSubmission(readIntakeForm());
    state.organizerCandidates = [
      ...state.organizerCandidates.filter((item) => item.id !== candidate.id),
      candidate
    ];
    saveRadarState();
    refs.intakeMessage.textContent = "Festival sent to the Radar queue for scoring and review.";
    state.view = "radar";
    renderView();
    renderRadar();
  } catch (error) {
    refs.intakeMessage.textContent = error.message;
  }
});

refs.clearIntake.addEventListener("click", clearIntakeForm);

[
  refs.prepFestival,
  refs.prepFilmTitle,
  refs.prepLogline,
  refs.prepSynopsis,
  refs.prepDirector,
  refs.prepTools,
  refs.prepNotes
].forEach((control) => {
  control.addEventListener("input", () => {
    updatePrepDraft();
    savePrepDraft();
    renderPrepPack();
    renderLaunch();
  });
});

refs.copyPacket.addEventListener("click", async () => {
  const packet = getCurrentPacket();
  if (!packet) {
    return;
  }
  await navigator.clipboard.writeText(packetToText(packet));
  refs.copyPacket.textContent = "Copied";
  setTimeout(() => {
    refs.copyPacket.textContent = "Copy Pack";
  }, 1400);
});

refs.prepPipeline.addEventListener("click", () => {
  updatePrepDraft();
  addCurrentPrepToPipeline();
  state.view = "pipeline";
  renderView();
});

refs.downloadPacket.addEventListener("click", () => {
  const packet = getCurrentPacket();
  if (!packet) {
    return;
  }
  const blob = new Blob([packetToText(packet)], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${packet.summary.festival.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "")}-prep-pack.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
});

refs.exportCsv.addEventListener("click", exportCsv);
refs.runScout.addEventListener("click", runScoutScan);
refs.intelligenceFestival.addEventListener("input", renderIntelligence);
refs.intelligenceFocus.addEventListener("input", renderIntelligence);
refs.copyIntelligence.addEventListener("click", async () => {
  const brief = getCurrentIntelligenceBrief();
  if (!brief) {
    return;
  }
  await navigator.clipboard.writeText(intelligenceToText(brief));
  refs.copyIntelligence.textContent = "Copied";
  setTimeout(() => {
    refs.copyIntelligence.textContent = "Copy Brief";
  }, 1400);
});
refs.downloadIntelligence.addEventListener("click", () => {
  const brief = getCurrentIntelligenceBrief();
  if (!brief) {
    return;
  }
  const blob = new Blob([intelligenceToText(brief)], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${brief.festivalName.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "")}-intelligence.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
});
[
  refs.onboardTitle,
  refs.onboardRuntime,
  refs.onboardType,
  refs.onboardGoal,
  refs.onboardRegion,
  refs.onboardMode,
  refs.onboardFee,
  refs.onboardPublic
].forEach((control) => {
  control.addEventListener("input", renderOnboarding);
});
refs.onboardSave.addEventListener("click", () => saveOnboardingProfile());
refs.onboardSample.addEventListener("click", loadOnboardingSample);
refs.onboardComplete.addEventListener("click", completeOnboarding);
refs.onboardReset.addEventListener("click", resetOnboarding);
refs.demoLoad.addEventListener("click", loadDemoWorkspace);
refs.demoReset.addEventListener("click", resetDemoWorkspace);
refs.demoCopy.addEventListener("click", copyDemoTour);
refs.installButton.addEventListener("click", requestInstallApp);
refs.installRunCheck.addEventListener("click", () => {
  refreshInstallStatus("Install readiness refreshed.");
});
refs.installClearLog.addEventListener("click", () => {
  state.installLog = [];
  state.installNotice = "Install activity log cleared.";
  saveInstallLog();
  renderInstall();
});
refs.launchRun.addEventListener("click", runLaunchAudit);
refs.launchCopy.addEventListener("click", copyLaunchBrief);
refs.launchDownload.addEventListener("click", downloadLaunchChecklist);
refs.launchClearLog.addEventListener("click", () => {
  state.launchAudits = [];
  state.launchNotice = "Launch audit log cleared.";
  saveLaunchAudits();
  renderLaunch();
});
refs.deviceSave.addEventListener("click", () => saveDeviceLabIssue());
refs.deviceClear.addEventListener("click", clearDeviceLabForm);
refs.deviceMarkFixed.addEventListener("click", markCurrentDeviceIssueFixed);
refs.deviceCopy.addEventListener("click", copyDeviceLabReport);
refs.deviceDownload.addEventListener("click", downloadDeviceLabReport);
refs.feedbackSave.addEventListener("click", () => saveFeedbackItem());
refs.feedbackPlan.addEventListener("click", () => setFeedbackFormStatus("Planned", "Feedback note moved to planned."));
refs.feedbackResolve.addEventListener("click", () => setFeedbackFormStatus("Fixed", "Feedback note marked fixed."));
refs.feedbackClear.addEventListener("click", clearFeedbackForm);
refs.feedbackCopy.addEventListener("click", copyFeedbackReport);
refs.feedbackDownload.addEventListener("click", downloadFeedbackReport);
refs.roadmapSave.addEventListener("click", () => saveRoadmapItem());
refs.roadmapShip.addEventListener("click", () => setRoadmapFormStatus("Shipped", "Roadmap item shipped into the changelog."));
refs.roadmapPause.addEventListener("click", () => setRoadmapFormStatus("Paused", "Roadmap item paused."));
refs.roadmapClear.addEventListener("click", clearRoadmapForm);
refs.roadmapCopy.addEventListener("click", copyRoadmapReport);
refs.roadmapDownload.addEventListener("click", downloadRoadmapReport);
refs.guideWorkflow.addEventListener("input", () => {
  state.guideWorkflow = refs.guideWorkflow.value;
  state.guideNotice = "";
  renderGuide();
});
refs.guidePhase.addEventListener("input", () => {
  state.guidePhase = refs.guidePhase.value;
  state.guideNotice = "";
  renderGuide();
});
refs.guideCopy.addEventListener("click", copyProductGuide);
refs.guideDownload.addEventListener("click", downloadProductGuide);
[
  refs.settingsStartView,
  refs.settingsProductMode,
  refs.settingsRegion,
  refs.settingsMode,
  refs.settingsType,
  refs.settingsGoal,
  refs.settingsRuntime,
  refs.settingsFee,
  refs.settingsPublic,
  refs.settingsLocalOnly,
  refs.settingsExportReminder
].forEach((control) => {
  control.addEventListener("input", () => {
    state.preferences = readSettingsForm();
    refs.settingsFeeValue.textContent = `$${refs.settingsFee.value} max`;
    state.settingsNotice = "Unsaved preference changes.";
    renderSettings();
  });
});
refs.settingsSave.addEventListener("click", () => saveSettingsFromForm());
refs.settingsApplyProfile.addEventListener("click", applySettingsToProfile);
refs.settingsCopy.addEventListener("click", copySettingsSummary);
refs.settingsDownload.addEventListener("click", downloadSettingsSummary);
refs.settingsReset.addEventListener("click", resetSettings);
refs.accessStartTrial.addEventListener("click", activateLocalTrial);
refs.accessActivateLaunch.addEventListener("click", activateLaunchPass);
refs.accessCopyBrief.addEventListener("click", copyAccessBrief);
refs.accessDownloadBrief.addEventListener("click", downloadAccessBrief);
refs.trialCopy.addEventListener("click", copyTrialPlan);
refs.trialReset.addEventListener("click", resetTrialTour);
refs.accessReset.addEventListener("click", () => {
  state.trialProgress = normalizeTrialProgress({});
  saveTrialProgress();
  setAccessPlan("preview", { status: "Preview" });
});
refs.vaultLoad.addEventListener("click", loadCurrentBackupIntoVault);
refs.vaultParse.addEventListener("click", parseVaultPreview);
refs.vaultRestore.addEventListener("click", applyVaultRestore);
refs.vaultDownload.addEventListener("click", downloadVaultBackup);
refs.vaultClear.addEventListener("click", () => {
  refs.vaultText.value = "";
  state.vaultPreview = null;
  refs.vaultMessage.textContent = "";
  renderVault();
});
refs.vaultCopy.addEventListener("click", async () => {
  const backupText = getCurrentBackupText();
  await navigator.clipboard.writeText(backupText);
  const summary = summarizeBackupSections(getCurrentBackup().sections);
  recordVaultLog("Copy", `${summary.presentSections} sections and ${summary.totalRecords} records copied.`);
  refs.vaultCopy.textContent = "Copied";
  setTimeout(() => {
    refs.vaultCopy.textContent = "Copy Backup";
  }, 1400);
  renderVault();
});
refs.watchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveWatchSource();
});
refs.watchTrust.addEventListener("input", () => {
  refs.watchTrustValue.textContent = refs.watchTrust.value;
});
refs.watchClear.addEventListener("click", clearWatchForm);
refs.watchRun.addEventListener("click", recordWatchPass);
refs.watchExport.addEventListener("click", exportWatchlist);
refs.watchDefaults.addEventListener("click", () => {
  state.watchSources = getDefaultWatchSources();
  state.watchRuns = [];
  saveWatchlist();
  saveWatchRuns();
  clearWatchForm();
  refs.watchMessage.textContent = "Default source watchlist restored.";
  renderScout();
  renderWatchlist();
});
refs.radarSelectAll.addEventListener("change", () => {
  if (refs.radarSelectAll.checked) {
    getVisibleCandidates().forEach((candidate) => state.radarSelected.add(candidate.id));
  } else {
    state.radarSelected.clear();
  }
  renderRadar();
});
refs.radarBulkApprove.addEventListener("click", approveSelectedCandidates);
refs.radarBulkReject.addEventListener("click", rejectSelectedCandidates);
refs.parseImport.addEventListener("click", parseImportPreview);
refs.sendImport.addEventListener("click", sendImportToRadar);
refs.stageCleanImport.addEventListener("click", stageCleanImportToRadar);
refs.copyImportReport.addEventListener("click", copyImportReport);
refs.clearImport.addEventListener("click", clearImportDraft);
refs.sampleImport.addEventListener("click", () => {
  refs.importText.value = IMPORT_SAMPLE;
  parseImportPreview();
});
refs.resetRadar.addEventListener("click", () => {
  state.promotedFestivals = [];
  state.rejectedCandidates = [];
  state.organizerCandidates = [];
  state.scoutRuns = [];
  state.radarSelected.clear();
  saveRadarState();
  saveScoutRuns();
  hydratePrepDraft();
  renderDiscover();
  hydrateIntelligenceChoices();
  renderIntelligence();
  renderMatches();
  renderPrepPack();
  renderScout();
  renderImport();
  renderRadar();
  renderLaunch();
});

updateFilterState();
hydrateFilmProfile();
hydrateOnboardingForm();
hydrateSettingsForm();
hydratePrepDraft();
hydrateDeviceLabForm();
hydrateFeedbackForm();
hydrateRoadmapForm();
renderAll();
openInitialDetailFromRoute();
registerAppShell();
refreshInstallStatus();

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.installPrompt = event;
  state.installNotice = "Your browser is ready to install LaurelPilot.";
  state.installStatus.installPromptReady = true;
  recordInstallLog("Install prompt ready", "Browser offered an install prompt.");
  renderInstall();
  renderLaunch();
});

window.addEventListener("appinstalled", () => {
  state.installPrompt = null;
  state.installStatus.installed = true;
  state.installNotice = "LaurelPilot was installed successfully.";
  recordInstallLog("Installed", "LaurelPilot is now available as an installed browser app.");
  renderInstall();
  renderLaunch();
});

window.addEventListener("online", () => {
  refreshInstallStatus("Connection restored. Offline shell remains available.");
});

window.addEventListener("offline", () => {
  refreshInstallStatus("Offline mode detected. Cached workspace files are being used.");
});
