const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDate(value) {
  return new Date(value);
}

export function daysUntil(value, now = new Date()) {
  return Math.ceil((parseDate(value).getTime() - now.getTime()) / DAY_MS);
}

export function isUrgent(value, now = new Date()) {
  const days = daysUntil(value, now);
  return days >= 0 && days <= 7;
}

export function formatMoney(value) {
  const amount = Number(value || 0);
  if (amount <= 0) {
    return "No prize listed";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatShortDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(parseDate(value));
}

export function matchesRuntime(festival, runtime) {
  if (runtime === "All") {
    return true;
  }
  if (runtime === "short") {
    return festival.duration.max <= 10;
  }
  if (runtime === "medium") {
    return festival.duration.max >= 10 && festival.duration.min <= 30;
  }
  if (runtime === "long") {
    return festival.duration.max > 30;
  }
  return true;
}

export function searchableText(festival) {
  return [
    festival.name,
    festival.shortName,
    festival.description,
    festival.fitSummary,
    festival.location.city,
    festival.location.country,
    festival.location.region,
    festival.contentTypes.join(" "),
    festival.strategyNotes.join(" "),
    festival.greenFlags.join(" "),
    festival.redFlags.join(" ")
  ]
    .join(" ")
    .toLowerCase();
}

export function filterFestivals(festivals, filters, now = new Date()) {
  const query = String(filters.search || "").trim().toLowerCase();
  const deadlineDays = filters.deadline === "any" ? Infinity : Number(filters.deadline);
  const maxDeadlineTime = now.getTime() + deadlineDays * DAY_MS;

  return festivals.filter((festival) => {
    const deadline = parseDate(festival.deadline).getTime();
    if (query && !searchableText(festival).includes(query)) {
      return false;
    }
    if (filters.status !== "All" && festival.status !== filters.status) {
      return false;
    }
    if (filters.deadline !== "any" && (deadline < now.getTime() || deadline > maxDeadlineTime)) {
      return false;
    }
    if (filters.region !== "All" && festival.location.region !== filters.region) {
      return false;
    }
    if (filters.type !== "All" && !festival.contentTypes.includes(filters.type)) {
      return false;
    }
    if (!matchesRuntime(festival, filters.runtime)) {
      return false;
    }
    if (filters.prizeOnly && festival.prizeMoney <= 0) {
      return false;
    }
    if (festival.prizeMoney < filters.minPrize) {
      return false;
    }
    if (filters.recurringOnly && !["Annual", "Monthly", "Recurring"].includes(festival.frequency)) {
      return false;
    }
    return true;
  });
}

export function sortFestivals(festivals, sortKey) {
  return [...festivals].sort((a, b) => {
    if (sortKey === "confidence") {
      return b.confidence - a.confidence;
    }
    if (sortKey === "prize") {
      return b.prizeMoney - a.prizeMoney;
    }
    if (sortKey === "fee") {
      return a.entryFee - b.entryFee;
    }
    return parseDate(a.deadline).getTime() - parseDate(b.deadline).getTime();
  });
}

export function summarizeFestivals(festivals, now = new Date()) {
  return {
    accepting: festivals.filter((festival) => festival.status === "Accepting Submissions").length,
    urgent: festivals.filter((festival) => isUrgent(festival.deadline, now)).length,
    prizeTotal: festivals.reduce((total, festival) => total + festival.prizeMoney, 0),
    highConfidence: festivals.filter((festival) => festival.confidence >= 80).length
  };
}

function daysSince(value, now = new Date()) {
  if (!value) {
    return Infinity;
  }
  const timestamp = parseDate(value).getTime();
  if (!Number.isFinite(timestamp)) {
    return Infinity;
  }
  return Math.max(0, Math.floor((now.getTime() - timestamp) / DAY_MS));
}

function sourceFreshness(ageDays) {
  if (!Number.isFinite(ageDays)) {
    return {
      label: "No verification date",
      tone: "red",
      fresh: false,
      points: -12
    };
  }
  if (ageDays <= 14) {
    return {
      label: "Current",
      tone: "green",
      fresh: true,
      points: 18
    };
  }
  if (ageDays <= 45) {
    return {
      label: "Recent",
      tone: "blue",
      fresh: true,
      points: 12
    };
  }
  if (ageDays <= 90) {
    return {
      label: "Aging",
      tone: "amber",
      fresh: false,
      points: 3
    };
  }
  return {
    label: "Stale",
    tone: "red",
    fresh: false,
    points: -14
  };
}

function sourceTypePoints(sourceType = "") {
  const source = sourceType.toLowerCase();
  if (source.includes("official")) {
    return 14;
  }
  if (source.includes("demo verified")) {
    return 12;
  }
  if (source.includes("radar")) {
    return 8;
  }
  if (source.includes("platform")) {
    return 6;
  }
  return 2;
}

function trustTier(score) {
  if (score >= 86) {
    return {
      label: "Verified",
      tone: "green"
    };
  }
  if (score >= 72) {
    return {
      label: "Strong proof",
      tone: "blue"
    };
  }
  if (score >= 56) {
    return {
      label: "Watch",
      tone: "amber"
    };
  }
  return {
    label: "Needs review",
    tone: "red"
  };
}

export function evaluateFestivalSourceTrust(festival = {}, now = new Date()) {
  const verifiedAgeDays = daysSince(festival.lastVerified, now);
  const freshness = sourceFreshness(verifiedAgeDays);
  const greenFlags = Array.isArray(festival.greenFlags) ? festival.greenFlags.length : 0;
  const redFlags = Array.isArray(festival.redFlags) ? festival.redFlags.length : 0;
  const communitySignals = Array.isArray(festival.communitySignals) ? festival.communitySignals.length : 0;
  const hasWebsite = Boolean(festival.websiteUrl);
  const hasSubmission = Boolean(festival.submissionUrl);
  const evidenceScore =
    Math.min(12, greenFlags * 3) +
    Math.min(8, communitySignals * 4) +
    (hasWebsite ? 5 : -8) +
    (hasSubmission ? 7 : -10);
  const score = clamp(
    Math.round(
      Number(festival.confidence || 0) * 0.58 +
      freshness.points +
      sourceTypePoints(festival.sourceType) +
      evidenceScore -
      redFlags * 7
    ),
    0,
    100
  );
  const tier = trustTier(score);
  const warnings = [
    ...(!Number.isFinite(verifiedAgeDays) ? ["No last-verified date is stored."] : []),
    ...(Number.isFinite(verifiedAgeDays) && verifiedAgeDays > 90 ? [`Source was last verified ${verifiedAgeDays} days ago.`] : []),
    ...(!hasWebsite ? ["Festival website URL is missing."] : []),
    ...(!hasSubmission ? ["Submission URL is missing."] : []),
    ...(redFlags ? [`${redFlags} red flag${redFlags === 1 ? "" : "s"} recorded.`] : [])
  ];
  const proofPoints = [
    festival.sourceType ? `${festival.sourceType} source.` : "Source type not labelled.",
    Number.isFinite(verifiedAgeDays) ? `Verified ${verifiedAgeDays} days ago.` : "Verification age unknown.",
    hasWebsite && hasSubmission ? "Website and submission links are both present." : "One or more required links need review.",
    greenFlags ? `${greenFlags} positive proof signal${greenFlags === 1 ? "" : "s"} recorded.` : "No positive proof signals recorded yet.",
    communitySignals ? `${communitySignals} community-style signal${communitySignals === 1 ? "" : "s"} attached.` : "No community-style signals attached."
  ];
  return {
    festivalId: festival.id,
    festivalName: festival.name,
    score,
    tier: tier.label,
    tone: tier.tone,
    freshnessLabel: freshness.label,
    freshnessTone: freshness.tone,
    fresh: freshness.fresh,
    verifiedAgeDays,
    lastVerified: festival.lastVerified || "",
    sourceType: festival.sourceType || "Unlabelled source",
    hasWebsite,
    hasSubmission,
    redFlags,
    greenFlags,
    communitySignals,
    warnings,
    proofPoints,
    summary: `${festival.name || "This festival"} has ${tier.label.toLowerCase()} source proof at ${score}/100.`
  };
}

export function buildSourceTrustReport(festivals = [], now = new Date()) {
  const rows = festivals
    .map((festival) => ({
      ...evaluateFestivalSourceTrust(festival, now),
      deadline: festival.deadline,
      status: festival.status,
      location: festival.location,
      confidence: festival.confidence,
      entryFee: festival.entryFee
    }))
    .sort((a, b) => a.score - b.score || (b.verifiedAgeDays || 0) - (a.verifiedAgeDays || 0));
  const stale = rows.filter((row) => row.freshnessLabel === "Stale" || row.freshnessLabel === "No verification date");
  const needsReview = rows.filter((row) =>
    row.tone === "red" ||
    row.freshnessLabel === "Stale" ||
    row.freshnessLabel === "No verification date" ||
    !row.hasWebsite ||
    !row.hasSubmission
  );
  const verified = rows.filter((row) => row.tier === "Verified");
  const averageScore = rows.length
    ? Math.round(rows.reduce((total, row) => total + row.score, 0) / rows.length)
    : 0;
  const missingLinks = rows.filter((row) => !row.hasWebsite || !row.hasSubmission);
  const actions = [
    stale.length
      ? `Re-check ${stale.length} stale source${stale.length === 1 ? "" : "s"} before presenting them as premium data.`
      : "No stale source records are currently in the directory.",
    missingLinks.length
      ? `Add or verify missing website/submission links for ${missingLinks.length} festival${missingLinks.length === 1 ? "" : "s"}.`
      : "Every festival has both website and submission links.",
    needsReview.length
      ? `Review ${needsReview.length} listing${needsReview.length === 1 ? "" : "s"} with warnings before launch.`
      : "No trust warnings are pressuring the directory right now."
  ];
  return {
    generatedAt: now.toISOString(),
    rows,
    actions,
    summary: {
      total: rows.length,
      averageScore,
      verified: verified.length,
      stale: stale.length,
      needsReview: needsReview.length,
      missingLinks: missingLinks.length
    },
    message: averageScore >= 86
      ? "Festival source proof is strong enough to support a premium promise."
      : averageScore >= 72
        ? "Festival source proof is credible, with a few records needing freshness checks."
        : "Festival source proof needs focused review before this feels subscriber-grade."
  };
}

export function sourceTrustToText(report) {
  const lines = [
    "LaurelPilot Source Trust Proof",
    `Generated: ${formatShortDate(report.generatedAt)}`,
    `Average trust: ${report.summary.averageScore}/100`,
    `Verified listings: ${report.summary.verified}`,
    `Stale listings: ${report.summary.stale}`,
    `Needs review: ${report.summary.needsReview}`,
    "",
    "Recommended Actions",
    ...report.actions.map((action) => `- ${action}`),
    "",
    "Festival Proof Rows",
    ...report.rows.map((row) =>
      `- ${row.festivalName}: ${row.score}/100 ${row.tier}, ${row.freshnessLabel}, ${row.sourceType}${row.warnings.length ? `, warnings: ${row.warnings.join("; ")}` : ""}`
    )
  ];
  return lines.join("\n");
}

function hasText(value) {
  return String(value || "").trim().length > 0;
}

function listSize(value) {
  return Array.isArray(value) ? value.filter((item) => hasText(typeof item === "string" ? item : JSON.stringify(item))).length : 0;
}

function qualityTier(score) {
  if (score >= 86) {
    return { label: "Subscriber-ready", tone: "green" };
  }
  if (score >= 74) {
    return { label: "Publishable", tone: "blue" };
  }
  if (score >= 60) {
    return { label: "Needs enrichment", tone: "amber" };
  }
  return { label: "Hold for review", tone: "red" };
}

export function evaluateFestivalDataQuality(festival = {}, now = new Date()) {
  const trust = evaluateFestivalSourceTrust(festival, now);
  const hasDeadline = Number.isFinite(parseDate(festival.deadline || "").getTime());
  const hasLocation = hasText(festival.location?.city) && hasText(festival.location?.country) && hasText(festival.location?.mode);
  const hasRuntime = Number.isFinite(Number(festival.duration?.min)) && Number.isFinite(Number(festival.duration?.max)) && Number(festival.duration?.max) > 0;
  const hasEntryFee = Number.isFinite(Number(festival.entryFee));
  const hasPrize = Number.isFinite(Number(festival.prizeMoney));
  const strategyNotes = listSize(festival.strategyNotes);
  const checklistItems = listSize(festival.checklist);
  const communitySignals = listSize(festival.communitySignals);
  const greenFlags = listSize(festival.greenFlags);
  const redFlags = listSize(festival.redFlags);
  const requirementScore = clamp(
    (hasRuntime ? 6 : 0) +
      (listSize(festival.contentTypes) ? 5 : 0) +
      (listSize(festival.formats) ? 4 : 0) +
      (listSize(festival.aspectRatio) ? 3 : 0) +
      (hasText(festival.language) ? 3 : 0) +
      (hasText(festival.premiereStatus) ? 4 : 0),
    0,
    25
  );
  const strategyScore = clamp(
    (hasText(festival.fitSummary) ? 7 : 0) +
      Math.min(9, strategyNotes * 3) +
      Math.min(5, checklistItems * 2) +
      Math.min(4, communitySignals * 2),
    0,
    25
  );
  const utilityScore = clamp(
    (hasText(festival.description) ? 4 : 0) +
      (hasDeadline ? 4 : 0) +
      (hasLocation ? 4 : 0) +
      (hasEntryFee ? 2 : 0) +
      (hasPrize ? 2 : 0) +
      (hasText(festival.status) ? 2 : 0) +
      (hasText(festival.frequency) ? 2 : 0) +
      (hasText(festival.notificationDate) ? 2 : 0) +
      (hasText(festival.eventDate) ? 2 : 0),
    0,
    15
  );
  const proofDepthScore = clamp(Math.min(8, greenFlags * 2) + Math.min(5, communitySignals * 2) - Math.min(8, redFlags * 2), 0, 13);
  const score = clamp(
    Math.round(trust.score * 0.35 + requirementScore + strategyScore + utilityScore + proofDepthScore),
    0,
    100
  );
  const tier = qualityTier(score);
  const missing = [
    ...(!trust.hasWebsite ? ["website link"] : []),
    ...(!trust.hasSubmission ? ["submission link"] : []),
    ...(!hasDeadline ? ["valid deadline"] : []),
    ...(!hasLocation ? ["complete location"] : []),
    ...(!hasRuntime ? ["runtime limits"] : []),
    ...(listSize(festival.contentTypes) ? [] : ["content categories"]),
    ...(listSize(festival.formats) ? [] : ["accepted formats"]),
    ...(hasText(festival.language) ? [] : ["language rules"]),
    ...(hasText(festival.premiereStatus) ? [] : ["premiere rules"]),
    ...(strategyNotes >= 3 ? [] : ["three strategy notes"]),
    ...(checklistItems >= 3 ? [] : ["submission checklist"]),
    ...(communitySignals ? [] : ["community-style signal"])
  ];
  const warnings = [
    ...trust.warnings,
    ...(strategyNotes < 2 ? ["Strategy guidance is too thin for a premium listing."] : []),
    ...(checklistItems < 3 ? ["Prep checklist needs more concrete submission actions."] : []),
    ...(redFlags >= 3 ? ["Multiple red flags should be resolved or clearly framed before publishing."] : [])
  ];

  return {
    festivalId: festival.id,
    festivalName: festival.name || "Untitled festival",
    score,
    tier: tier.label,
    tone: tier.tone,
    trustScore: trust.score,
    requirementScore,
    strategyScore,
    utilityScore,
    proofDepthScore,
    strategyDepth: clamp(Math.round(((strategyNotes + checklistItems + communitySignals) / 8) * 100), 0, 100),
    missing,
    warnings,
    publishable: score >= 74 && !missing.includes("website link") && !missing.includes("submission link"),
    summary: `${festival.name || "This festival"} is ${tier.label.toLowerCase()} at ${score}/100, with ${missing.length} enrichment gap${missing.length === 1 ? "" : "s"}.`
  };
}

export function buildFestivalDataQualityReport(festivals = [], now = new Date()) {
  const rows = festivals
    .map((festival) => evaluateFestivalDataQuality(festival, now))
    .sort((a, b) => a.score - b.score || b.warnings.length - a.warnings.length);
  const averageScore = rows.length
    ? Math.round(rows.reduce((total, row) => total + row.score, 0) / rows.length)
    : 0;
  const averageStrategyDepth = rows.length
    ? Math.round(rows.reduce((total, row) => total + row.strategyDepth, 0) / rows.length)
    : 0;
  const subscriberReady = rows.filter((row) => row.tier === "Subscriber-ready").length;
  const needsEnrichment = rows.filter((row) => row.tier === "Needs enrichment" || row.tier === "Hold for review").length;
  const hold = rows.filter((row) => row.tier === "Hold for review").length;
  const topGaps = rows
    .flatMap((row) => row.missing)
    .reduce((counts, gap) => {
      counts[gap] = (counts[gap] || 0) + 1;
      return counts;
    }, {});
  const gapList = Object.entries(topGaps)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([gap, count]) => `${gap}: ${count}`);
  const actions = [
    needsEnrichment
      ? `Enrich ${needsEnrichment} listing${needsEnrichment === 1 ? "" : "s"} before treating the full directory as subscriber-ready.`
      : "Every listing is at least publishable.",
    gapList.length ? `Most common gaps: ${gapList.join(", ")}.` : "No recurring data gaps detected.",
    hold ? `Hold ${hold} listing${hold === 1 ? "" : "s"} for manual review.` : "No records are currently held for manual review."
  ];

  return {
    generatedAt: now.toISOString(),
    rows,
    actions,
    summary: {
      total: rows.length,
      averageScore,
      averageStrategyDepth,
      subscriberReady,
      publishable: rows.filter((row) => row.publishable).length,
      needsEnrichment,
      hold
    },
    message: averageScore >= 86
      ? "Festival records are deep enough to feel like a premium intelligence product."
      : averageScore >= 74
        ? "Festival records are useful, with enrichment work needed on the weaker listings."
        : "Festival records need more source proof, requirements, and strategy before launch."
  };
}

export function festivalDataQualityToText(report) {
  const lines = [
    "LaurelPilot Festival Data Quality",
    `Generated: ${formatShortDate(report.generatedAt)}`,
    `Average quality: ${report.summary.averageScore}/100`,
    `Subscriber-ready: ${report.summary.subscriberReady}`,
    `Publishable: ${report.summary.publishable}`,
    `Needs enrichment: ${report.summary.needsEnrichment}`,
    `Strategy depth: ${report.summary.averageStrategyDepth}%`,
    "",
    "Recommended Actions",
    ...report.actions.map((action) => `- ${action}`),
    "",
    "Quality Rows",
    ...report.rows.map((row) =>
      `- ${row.festivalName}: ${row.score}/100 ${row.tier}; gaps: ${row.missing.length ? row.missing.join(", ") : "none"}`
    )
  ];
  return lines.join("\n");
}

export function toCalendarStamp(value) {
  return parseDate(value)
    .toISOString()
    .replace(/[-:]/gu, "")
    .replace(/\.\d{3}/u, "");
}

function monthKey(value) {
  return parseDate(value).toISOString().slice(0, 7);
}

function monthLabel(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(parseDate(value));
}

function deadlineTone(days) {
  if (days < 0) {
    return { label: "Closed", tone: "red" };
  }
  if (days <= 7) {
    return { label: "This week", tone: "red" };
  }
  if (days <= 30) {
    return { label: "This month", tone: "amber" };
  }
  return { label: "Planning", tone: "blue" };
}

function calendarRangeLabel(windowDays) {
  if (windowDays === Infinity) {
    return "All upcoming deadlines";
  }
  return `Next ${windowDays} days`;
}

export function buildDeadlineCalendar(festivals, options = {}, now = new Date()) {
  const windowDays = options.windowDays === "all" ? Infinity : Number(options.windowDays || 90);
  const status = options.status || "All";
  const region = options.region || "All";
  const maxTime = now.getTime() + windowDays * DAY_MS;
  const rows = festivals
    .map((festival) => {
      const days = daysUntil(festival.deadline, now);
      const deadlineTime = parseDate(festival.deadline).getTime();
      const tone = deadlineTone(days);
      return {
        id: festival.id,
        name: festival.name,
        shortName: festival.shortName || festival.name,
        deadline: festival.deadline,
        deadlineDate: formatShortDate(festival.deadline),
        daysUntil: days,
        urgency: tone.label,
        tone: tone.tone,
        monthKey: monthKey(festival.deadline),
        monthLabel: monthLabel(festival.deadline),
        status: festival.status,
        region: festival.location.region,
        location: `${festival.location.city}, ${festival.location.country}`,
        mode: festival.location.mode || festival.location.region || "Unknown",
        entryFee: Number(festival.entryFee || 0),
        prizeMoney: Number(festival.prizeMoney || 0),
        confidence: Number(festival.confidence || 0),
        fitSummary: festival.fitSummary,
        submissionUrl: festival.submissionUrl,
        deadlineTime
      };
    })
    .filter((row) => row.daysUntil >= 0)
    .filter((row) => windowDays === Infinity || row.deadlineTime <= maxTime)
    .filter((row) => status === "All" || row.status === status)
    .filter((row) => region === "All" || row.region === region)
    .sort((a, b) => a.deadlineTime - b.deadlineTime || b.confidence - a.confidence);

  const monthMap = new Map();
  rows.forEach((row) => {
    if (!monthMap.has(row.monthKey)) {
      monthMap.set(row.monthKey, {
        key: row.monthKey,
        label: row.monthLabel,
        rows: [],
        feeTotal: 0,
        prizeTotal: 0
      });
    }
    const group = monthMap.get(row.monthKey);
    group.rows.push(row);
    group.feeTotal += row.entryFee;
    group.prizeTotal += row.prizeMoney;
  });
  const months = [...monthMap.values()].map((group) => ({
    ...group,
    deadlineCount: group.rows.length
  }));
  const summary = {
    total: rows.length,
    next7: rows.filter((row) => row.daysUntil <= 7).length,
    next30: rows.filter((row) => row.daysUntil <= 30).length,
    freeEntries: rows.filter((row) => row.entryFee === 0).length,
    feeTotal: rows.reduce((total, row) => total + row.entryFee, 0),
    prizeTotal: rows.reduce((total, row) => total + row.prizeMoney, 0),
    rangeLabel: calendarRangeLabel(windowDays)
  };
  return {
    generatedAt: now.toISOString(),
    options: {
      windowDays: options.windowDays || 90,
      status,
      region
    },
    rows,
    months,
    summary,
    nextDeadline: rows[0] || null,
    actions: [
      rows[0] ? `Prepare ${rows[0].name} first; its deadline is ${rows[0].deadlineDate}.` : "No matching deadlines in this window.",
      summary.next30 ? `${summary.next30} deadlines land inside 30 days; only submit where materials are ready.` : "No deadlines inside 30 days; use the time to build better prep packs.",
      summary.feeTotal > 0 ? `Budget ${formatMoney(summary.feeTotal)} if submitting to every paid festival in this view.` : "This view contains no listed entry fees."
    ]
  };
}

function escapeIcsText(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

export function deadlineCalendarToIcs(report) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LaurelPilot//Deadline Calendar//EN"
  ];
  report.rows.forEach((row) => {
    const start = toCalendarStamp(row.deadline);
    const end = toCalendarStamp(new Date(parseDate(row.deadline).getTime() + 60 * 60 * 1000).toISOString());
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeIcsText(row.id)}@laurelpilot.local`,
      `DTSTAMP:${toCalendarStamp(report.generatedAt)}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcsText(`${row.name} submission deadline`)}`,
      `DESCRIPTION:${escapeIcsText(`${row.fitSummary || "Festival deadline"} Submit: ${row.submissionUrl || ""}`)}`,
      `LOCATION:${escapeIcsText(row.location)}`,
      "END:VEVENT"
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function deadlineCalendarToText(report) {
  const lines = [
    "LaurelPilot Deadline Calendar",
    `Generated: ${formatShortDate(report.generatedAt)}`,
    `Window: ${report.summary.rangeLabel}`,
    `Deadlines: ${report.summary.total}`,
    `Estimated fees: ${formatMoney(report.summary.feeTotal).replace("No prize listed", "$0")}`,
    `Prize pool: ${formatMoney(report.summary.prizeTotal).replace("No prize listed", "$0")}`,
    "",
    "Planning Actions",
    ...report.actions.map((action) => `- ${action}`),
    "",
    "Deadlines",
    ...report.months.flatMap((month) => [
      month.label,
      ...month.rows.map((row) => `- ${row.deadlineDate}: ${row.name} (${row.urgency}, ${row.location}, fee $${row.entryFee})`)
    ])
  ];
  return lines.join("\n");
}

export function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\n\r]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const CONFIDENCE_WEIGHTS = {
  officialWebsite: 18,
  submissionLink: 14,
  deadline: 14,
  namedOrganizers: 12,
  venue: 10,
  rulesPage: 10,
  socialPresence: 6,
  pastEdition: 8,
  transparentFees: 6,
  prizeDetails: 4
};

const WARNING_PENALTIES = {
  vagueAwards: -10,
  noOrganizer: -15,
  aggressiveDiscounts: -10,
  brokenSubmissionLink: -18,
  tooManyCategories: -8,
  noVenue: -8
};

const WARNING_LABELS = {
  vagueAwards: "Vague or inflated award language",
  noOrganizer: "No named organizer found",
  aggressiveDiscounts: "Aggressive discount pressure",
  brokenSubmissionLink: "Submission link appears broken",
  tooManyCategories: "Unusually broad category list",
  noVenue: "No venue or screening footprint found"
};

export function scoreRadarCandidate(candidate) {
  const positives = Object.entries(CONFIDENCE_WEIGHTS).map(([key, weight]) => ({
    key,
    label: key.replace(/([A-Z])/gu, " $1").replace(/^./u, (char) => char.toUpperCase()),
    met: Boolean(candidate.evidence?.[key]),
    points: candidate.evidence?.[key] ? weight : 0,
    weight
  }));
  const warnings = (candidate.warningSignals || []).map((key) => ({
    key,
    label: WARNING_LABELS[key] || key,
    points: WARNING_PENALTIES[key] || -5
  }));
  const rawScore =
    positives.reduce((total, item) => total + item.points, 0) +
    warnings.reduce((total, item) => total + item.points, 0);
  const score = Math.max(0, Math.min(100, rawScore));
  const recommendation =
    score >= 80 ? "Auto-publish" : score >= 55 ? "Review" : "Reject";
  const riskLevel = score >= 80 ? "Low" : score >= 55 ? "Medium" : "High";
  return {
    score,
    recommendation,
    riskLevel,
    positives,
    warnings
  };
}

export function candidateToFestival(candidate, verifiedDate = new Date().toISOString().slice(0, 10)) {
  const scored = scoreRadarCandidate(candidate);
  return {
    id: `promoted-${candidate.id}`,
    name: candidate.name,
    shortName: candidate.name,
    status: "Accepting Submissions",
    deadline: candidate.deadline,
    notificationDate: candidate.notificationDate,
    eventDate: candidate.eventDate,
    location: candidate.location,
    prizeMoney: candidate.prizeMoney,
    entryFee: candidate.entryFee,
    frequency: candidate.frequency,
    duration: candidate.duration,
    contentTypes: candidate.contentTypes,
    formats: candidate.formats,
    premiereStatus: candidate.premiereStatus,
    language: candidate.language,
    aspectRatio: candidate.aspectRatio,
    description: candidate.description,
    websiteUrl: candidate.websiteUrl,
    submissionUrl: candidate.submissionUrl,
    sourceType: "Radar promoted",
    lastVerified: verifiedDate,
    confidence: scored.score,
    fitSummary: candidate.suggestedFit,
    strategyNotes: candidate.suggestedStrategy,
    greenFlags: candidate.extractedSignals || [],
    redFlags: scored.warnings.map((warning) => warning.label),
    communitySignals: [
      {
        label: "Radar review",
        tone: scored.recommendation === "Auto-publish" ? "positive" : scored.recommendation === "Review" ? "mixed" : "caution",
        summary: `Radar scored this candidate ${scored.score}/100 with ${scored.riskLevel.toLowerCase()} risk.`
      }
    ],
    checklist: [
      "Archive the rules page before submitting",
      "Verify current-year deadline and entry fee",
      "Confirm organizer identity and screening details",
      "Add confirmation email to your tracker"
    ],
    pastWinners: []
  };
}

export function normalizeScoutLead(lead, now = new Date()) {
  const name = String(lead.name || "").trim();
  if (!name) {
    throw new Error("Scout lead name is required.");
  }
  if (!lead.deadline) {
    throw new Error("Scout lead deadline is required.");
  }

  const mode = lead.location?.mode || "Online";
  const location = {
    city: lead.location?.city || (mode === "Online" ? "Online" : "Unknown"),
    country: lead.location?.country || (mode === "Online" ? "Global" : "Unknown"),
    region: lead.location?.region || (mode === "Online" ? "Online" : "North America"),
    mode
  };
  const contentTypes = Array.isArray(lead.contentTypes) && lead.contentTypes.length
    ? lead.contentTypes
    : ["Experimental"];
  const formats = Array.isArray(lead.formats) && lead.formats.length ? lead.formats : ["MP4"];
  const evidence = {
    officialWebsite: Boolean(lead.evidence?.officialWebsite || lead.websiteUrl),
    submissionLink: Boolean(lead.evidence?.submissionLink || lead.submissionUrl),
    deadline: Boolean(lead.evidence?.deadline || lead.deadline),
    namedOrganizers: Boolean(lead.evidence?.namedOrganizers),
    venue: Boolean(lead.evidence?.venue || mode === "Online"),
    rulesPage: Boolean(lead.evidence?.rulesPage),
    socialPresence: Boolean(lead.evidence?.socialPresence),
    pastEdition: Boolean(lead.evidence?.pastEdition),
    transparentFees: Boolean(lead.evidence?.transparentFees),
    prizeDetails: Boolean(lead.evidence?.prizeDetails)
  };
  const warningSignals = new Set(lead.warningSignals || []);
  if (!evidence.namedOrganizers) {
    warningSignals.add("noOrganizer");
  }
  if (!evidence.venue) {
    warningSignals.add("noVenue");
  }
  if (contentTypes.length > 5) {
    warningSignals.add("tooManyCategories");
  }

  return {
    id: lead.id || `scout-${slugify(name)}-${new Date(lead.deadline).toISOString().slice(0, 10)}`,
    name,
    discoveredAt: lead.capturedAt || lead.discoveredAt || now.toISOString(),
    discoverySource: lead.discoverySource || "Source Scout",
    sourceUrl: String(lead.sourceUrl || lead.websiteUrl || "").trim(),
    websiteUrl: String(lead.websiteUrl || "").trim(),
    submissionUrl: String(lead.submissionUrl || "").trim(),
    description: String(lead.description || "Scout-discovered AI film festival candidate.").trim(),
    deadline: new Date(lead.deadline).toISOString(),
    notificationDate: lead.notificationDate || lead.deadline,
    eventDate: lead.eventDate || lead.deadline,
    location,
    prizeMoney: Number(lead.prizeMoney || 0),
    entryFee: Number(lead.entryFee || 0),
    frequency: lead.frequency || "Annual",
    duration: {
      min: Number(lead.duration?.min || 1),
      max: Number(lead.duration?.max || lead.maxDuration || 10)
    },
    contentTypes,
    formats,
    premiereStatus: lead.premiereStatus || "Verify on rules page",
    language: lead.language || "Verify on rules page",
    aspectRatio: Array.isArray(lead.aspectRatio) && lead.aspectRatio.length ? lead.aspectRatio : ["16:9"],
    evidence,
    warningSignals: [...warningSignals],
    extractedSignals: lead.extractedSignals || [],
    suggestedFit:
      lead.suggestedFit ||
      `Best for ${contentTypes.join(", ").toLowerCase()} work up to ${lead.duration?.max || lead.maxDuration || 10} minutes.`,
    suggestedStrategy: lead.suggestedStrategy || [
      "Verify current-year rules before submitting.",
      "Confirm organizer identity and screening format.",
      "Check whether the event protects or harms premiere strategy."
    ]
  };
}

export function summarizeScoutLeads(leads, importedIds = []) {
  const imported = new Set(importedIds);
  const candidates = leads.map((lead) => normalizeScoutLead(lead));
  const scored = candidates.map((candidate) => ({
    candidate,
    score: scoreRadarCandidate(candidate)
  }));
  return {
    total: candidates.length,
    imported: scored.filter((item) => imported.has(item.candidate.id)).length,
    ready: scored.filter((item) => item.score.recommendation === "Auto-publish").length,
    review: scored.filter((item) => item.score.recommendation === "Review").length,
    highRisk: scored.filter((item) => item.score.riskLevel === "High").length
  };
}

export function scoreFestivalMatch(festival, profile, now = new Date()) {
  const reasons = [];
  const cautions = [];
  let score = 0;

  const runtime = Number(profile.runtime || 0);
  if (runtime && runtime >= festival.duration.min && runtime <= festival.duration.max) {
    score += 24;
    reasons.push(`Runtime fits the ${festival.duration.min}-${festival.duration.max} minute window.`);
  } else if (runtime) {
    score -= 18;
    cautions.push(`Runtime is outside the ${festival.duration.min}-${festival.duration.max} minute window.`);
  }

  if (profile.contentType && festival.contentTypes.includes(profile.contentType)) {
    score += 20;
    reasons.push(`${profile.contentType} is an accepted content type.`);
  } else if (profile.contentType) {
    score -= 10;
    cautions.push(`${profile.contentType} is not listed as a primary accepted type.`);
  }

  if (profile.region && profile.region !== "Any" && festival.location.region === profile.region) {
    score += 12;
    reasons.push(`Matches your target region: ${profile.region}.`);
  } else if (profile.region && profile.region !== "Any" && festival.location.region !== profile.region) {
    score -= 4;
    cautions.push(`Outside your preferred region: ${profile.region}.`);
  }

  if (profile.mode && profile.mode !== "Any" && festival.location.mode === profile.mode) {
    score += 8;
    reasons.push(`Matches your preferred festival mode: ${profile.mode}.`);
  } else if (profile.mode && profile.mode !== "Any" && festival.location.mode !== profile.mode) {
    score -= 2;
  }

  const maxFee = Number(profile.maxFee || 0);
  if (festival.entryFee <= maxFee) {
    score += 10;
    reasons.push(`Entry fee is within your $${maxFee} comfort zone.`);
  } else {
    score -= 8;
    cautions.push(`Entry fee is above your $${maxFee} comfort zone.`);
  }

  if (profile.goal === "Prize money" && festival.prizeMoney > 0) {
    score += Math.min(14, Math.ceil(festival.prizeMoney / 5000));
    reasons.push(`Prize pool listed at ${formatMoney(festival.prizeMoney)}.`);
  }

  if (profile.goal === "Prestige" && festival.confidence >= 85) {
    score += 12;
    reasons.push("High confidence and stronger legitimacy signals.");
  }

  if (profile.goal === "Audience feedback" && ["Online", "Hybrid"].includes(festival.location.mode)) {
    score += 8;
    reasons.push("Online or hybrid format can help with faster audience feedback.");
  }

  if (profile.goal === "Networking" && ["Physical", "Hybrid"].includes(festival.location.mode)) {
    score += 10;
    reasons.push("Physical or hybrid event gives better networking potential.");
  }

  if (profile.publicAlready && /premiere preferred|premiere only/iu.test(festival.premiereStatus)) {
    score -= 12;
    cautions.push(`Premiere language may conflict with an already-public film: ${festival.premiereStatus}.`);
  } else if (!profile.publicAlready && /premiere preferred/iu.test(festival.premiereStatus)) {
    score += 6;
    reasons.push("Premiere preference could help if your film has not been widely shown.");
  }

  if (festival.status === "Closed") {
    score -= 35;
    cautions.push("Festival is currently closed.");
  }

  const days = daysUntil(festival.deadline, now);
  if (days >= 0 && days <= 14) {
    score += 6;
    reasons.push("Deadline is soon, so it belongs on an immediate action list.");
  } else if (days < 0) {
    score -= 20;
  }

  if (festival.confidence < 70) {
    score -= 10;
    cautions.push("Lower confidence record; verify organizer and rules before paying.");
  } else if (festival.confidence >= 80) {
    score += 8;
  }

  if (festival.redFlags.length) {
    score -= Math.min(12, festival.redFlags.length * 4);
    cautions.push(`${festival.redFlags.length} red flag${festival.redFlags.length === 1 ? "" : "s"} recorded.`);
  }

  const normalized = Math.max(0, Math.min(100, score + 30));
  const tier = normalized >= 78 ? "Strong fit" : normalized >= 58 ? "Possible fit" : "Weak fit";
  return {
    festival,
    score: normalized,
    tier,
    reasons: reasons.slice(0, 4),
    cautions: cautions.slice(0, 4)
  };
}

export function rankFestivalMatches(festivals, profile, now = new Date()) {
  return festivals
    .map((festival) => scoreFestivalMatch(festival, profile, now))
    .sort((a, b) => b.score - a.score);
}

export const SEASON_STRATEGIES = ["Balanced", "Prestige first", "Budget saver", "Prize upside", "Fast deadlines"];

function normalizeSeasonStrategy(value) {
  return SEASON_STRATEGIES.includes(value) ? value : "Balanced";
}

export function normalizeSeasonPlanOptions(input = {}) {
  const windowDays = input.windowDays === "all" ? "all" : clamp(Number(input.windowDays || 180), 30, 365);
  return {
    budget: clamp(Number(input.budget ?? 120), 0, 2000),
    targetCount: clamp(Number(input.targetCount || 5), 1, 12),
    windowDays,
    strategy: normalizeSeasonStrategy(input.strategy),
    region: ["Any", "North America", "Europe", "Asia", "Online"].includes(input.region) ? input.region : "Any"
  };
}

function seasonPhase(days) {
  if (days <= 14) {
    return "Submit now";
  }
  if (days <= 45) {
    return "Prepare this month";
  }
  if (days <= 90) {
    return "Build materials";
  }
  return "Watch and refine";
}

function seasonStrategyBoost(match, strategy, remainingBudget, now = new Date()) {
  const festival = match.festival;
  const days = daysUntil(festival.deadline, now);
  const fee = Number(festival.entryFee || 0);
  const prize = Number(festival.prizeMoney || 0);
  const confidence = Number(festival.confidence || 0);
  if (strategy === "Prestige first") {
    return (confidence >= 85 ? 16 : confidence >= 75 ? 8 : 0) + (match.tier === "Strong fit" ? 8 : 0);
  }
  if (strategy === "Budget saver") {
    return (fee === 0 ? 24 : Math.max(0, 16 - fee / 4)) + (fee <= remainingBudget ? 6 : -12);
  }
  if (strategy === "Prize upside") {
    return Math.min(24, prize / 1000) + (fee <= remainingBudget ? 4 : -10);
  }
  if (strategy === "Fast deadlines") {
    return (days >= 0 && days <= 14 ? 24 : days <= 45 ? 14 : days <= 90 ? 6 : 0) + (fee <= remainingBudget ? 4 : -8);
  }
  return (confidence >= 80 ? 8 : 0) + (fee <= remainingBudget ? 6 : -8) + (prize > 0 ? 4 : 0);
}

function buildSeasonAction(match, phase) {
  const festival = match.festival;
  if (phase === "Submit now") {
    return `Open Prep Pack, confirm rules, and submit before ${formatShortDate(festival.deadline)}.`;
  }
  if (phase === "Prepare this month") {
    return "Build the packet now, then wait for final proof or budget confirmation.";
  }
  if (match.score >= 78) {
    return "Shortlist as a strong fit and polish materials around this festival's stated focus.";
  }
  return "Keep as a backup target unless the strategy notes feel unusually aligned.";
}

export function buildSubmissionSeasonPlan(festivals, profile = {}, input = {}, now = new Date()) {
  const options = normalizeSeasonPlanOptions(input);
  const maxDeadline = options.windowDays === "all" ? Infinity : now.getTime() + Number(options.windowDays) * DAY_MS;
  const matches = rankFestivalMatches(festivals, profile, now)
    .filter((match) => {
      const festival = match.festival;
      const deadlineTime = parseDate(festival.deadline).getTime();
      return festival.status !== "Closed" &&
        deadlineTime >= now.getTime() &&
        deadlineTime <= maxDeadline &&
        (options.region === "Any" || festival.location.region === options.region);
    })
    .map((match) => {
      const festival = match.festival;
      const fee = Number(festival.entryFee || 0);
      const days = daysUntil(festival.deadline, now);
      const strategyBoost = seasonStrategyBoost(match, options.strategy, options.budget, now);
      const planningScore = clamp(Math.round(match.score * 0.72 + strategyBoost + Math.min(10, Number(festival.confidence || 0) / 12)), 0, 100);
      const phase = seasonPhase(days);
      return {
        festival,
        match,
        planningScore,
        fee,
        prizeMoney: Number(festival.prizeMoney || 0),
        daysUntil: days,
        phase,
        action: buildSeasonAction(match, phase),
        reason: match.reasons[0] || festival.fitSummary || "Festival aligns with the current planning profile."
      };
    })
    .sort((a, b) => b.planningScore - a.planningScore || a.daysUntil - b.daysUntil);

  const selected = [];
  const skipped = [];
  let remainingBudget = options.budget;

  for (const target of matches) {
    if (selected.length >= options.targetCount) {
      skipped.push({ ...target, skipReason: "Outside the target count for this plan." });
      continue;
    }
    if (target.fee <= remainingBudget) {
      selected.push({
        ...target,
        priority: selected.length + 1,
        budgetAfter: remainingBudget - target.fee
      });
      remainingBudget -= target.fee;
    } else {
      skipped.push({ ...target, skipReason: `Entry fee would exceed the ${formatMoney(options.budget).replace("No prize listed", "$0")} plan budget.` });
    }
  }

  const selectedByDeadline = [...selected].sort((a, b) => parseDate(a.festival.deadline).getTime() - parseDate(b.festival.deadline).getTime());
  const monthMap = new Map();
  selectedByDeadline.forEach((target) => {
    const deadline = parseDate(target.festival.deadline);
    const key = `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap.has(key)) {
      monthMap.set(key, {
        key,
        label: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(deadline),
        targets: [],
        fees: 0
      });
    }
    const month = monthMap.get(key);
    month.targets.push(target);
    month.fees += target.fee;
  });

  const totalFees = selected.reduce((total, target) => total + target.fee, 0);
  const prizeUpside = selected.reduce((total, target) => total + target.prizeMoney, 0);
  const averageFit = selected.length
    ? Math.round(selected.reduce((total, target) => total + target.match.score, 0) / selected.length)
    : 0;
  const urgentCount = selected.filter((target) => target.daysUntil <= 14).length;
  const freeCount = selected.filter((target) => target.fee === 0).length;
  const topTarget = selected[0] || null;
  const overBudgetCount = skipped.filter((target) => target.skipReason?.includes("exceed")).length;
  const actions = [
    topTarget ? `${topTarget.festival.name} is priority ${topTarget.priority}; ${topTarget.action}` : "No festivals fit the current season settings.",
    urgentCount ? `${urgentCount} selected target${urgentCount === 1 ? "" : "s"} need action inside 14 days.` : "No selected targets are emergency submissions.",
    overBudgetCount ? `${overBudgetCount} good option${overBudgetCount === 1 ? " was" : "s were"} skipped for budget discipline.` : `Plan stays inside budget with ${formatMoney(remainingBudget).replace("No prize listed", "$0")} left.`
  ];

  return {
    generatedAt: now.toISOString(),
    options,
    selected,
    skipped,
    months: [...monthMap.values()],
    actions,
    summary: {
      selectedCount: selected.length,
      candidateCount: matches.length,
      totalFees,
      remainingBudget,
      prizeUpside,
      averageFit,
      urgentCount,
      freeCount,
      rangeLabel: options.windowDays === "all" ? "All upcoming deadlines" : calendarRangeLabel(options.windowDays)
    },
    message: selected.length
      ? `${selected.length} festival${selected.length === 1 ? "" : "s"} planned within a ${formatMoney(options.budget).replace("No prize listed", "$0")} ${options.strategy.toLowerCase()} season.`
      : "No season plan matches the current film, budget, window, and region."
  };
}

export function seasonPlanToText(plan) {
  const lines = [
    "LaurelPilot Submission Season Plan",
    `Generated: ${formatShortDate(plan.generatedAt)}`,
    `Strategy: ${plan.options.strategy}`,
    `Window: ${plan.summary.rangeLabel}`,
    `Budget: ${formatMoney(plan.options.budget).replace("No prize listed", "$0")}`,
    `Selected: ${plan.summary.selectedCount}/${plan.options.targetCount}`,
    `Planned fees: ${formatMoney(plan.summary.totalFees).replace("No prize listed", "$0")}`,
    `Remaining budget: ${formatMoney(plan.summary.remainingBudget).replace("No prize listed", "$0")}`,
    `Prize upside: ${formatMoney(plan.summary.prizeUpside).replace("No prize listed", "$0")}`,
    "",
    "Planning Actions",
    ...plan.actions.map((action) => `- ${action}`),
    "",
    "Selected Festivals",
    ...(plan.selected.length
      ? plan.selected.map((target) => `${target.priority}. ${target.festival.name} - ${formatShortDate(target.festival.deadline)}, fee $${target.fee}, fit ${target.match.score}/100, ${target.phase}`)
      : ["- No selected festivals."]),
    "",
    "Skipped For Discipline",
    ...(plan.skipped.length
      ? plan.skipped.slice(0, 6).map((target) => `- ${target.festival.name}: ${target.skipReason}`)
      : ["- Nothing skipped."])
  ];
  return lines.join("\n");
}

const FILM_CONTENT_TYPES = ["Animation", "Live Action", "Hybrid", "Documentary", "Experimental", "Music Video"];
const FILM_GOALS = ["Prestige", "Networking", "Prize money", "Audience feedback"];
const FILM_REGIONS = ["Any", "North America", "Europe", "Asia", "Online"];
const FILM_MODES = ["Any", "Physical", "Hybrid", "Online"];
const FILM_STAGES = ["Development", "Festival strategy", "Submitting", "Submitted", "Released"];

function normalizeFilmOption(value, options, fallback) {
  return options.includes(value) ? value : fallback;
}

function createFilmId(title, now = new Date()) {
  const slug = String(title || "film")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")
    .slice(0, 36) || "film";
  const stamp = now.toISOString().replace(/\D/gu, "").slice(0, 12);
  return `film-${slug}-${stamp}`;
}

export function filmProjectToProfile(project = {}) {
  return {
    title: project.title || "",
    runtime: clamp(Number(project.runtime || 8), 1, 180),
    contentType: normalizeFilmOption(project.contentType, FILM_CONTENT_TYPES, "Animation"),
    goal: normalizeFilmOption(project.goal, FILM_GOALS, "Prestige"),
    region: normalizeFilmOption(project.region, FILM_REGIONS, "Any"),
    mode: normalizeFilmOption(project.mode, FILM_MODES, "Any"),
    maxFee: clamp(Number(project.maxFee ?? 35), 0, 150),
    publicAlready: Boolean(project.publicAlready)
  };
}

export function normalizeFilmProject(input = {}, fallbackProfile = {}, now = new Date()) {
  const source = { ...fallbackProfile, ...input };
  const title = String(source.title || "Untitled Film").trim() || "Untitled Film";
  const createdAt = input.createdAt || now.toISOString();
  return {
    id: input.id || createFilmId(title, now),
    title,
    runtime: clamp(Number(source.runtime || 8), 1, 180),
    contentType: normalizeFilmOption(source.contentType, FILM_CONTENT_TYPES, "Animation"),
    goal: normalizeFilmOption(source.goal, FILM_GOALS, "Prestige"),
    region: normalizeFilmOption(source.region, FILM_REGIONS, "Any"),
    mode: normalizeFilmOption(source.mode, FILM_MODES, "Any"),
    maxFee: clamp(Number(source.maxFee ?? 35), 0, 150),
    publicAlready: Boolean(source.publicAlready),
    stage: normalizeFilmOption(source.stage, FILM_STAGES, "Festival strategy"),
    logline: String(source.logline || "").trim(),
    notes: String(source.notes || "").trim(),
    createdAt,
    updatedAt: input.updatedAt || now.toISOString()
  };
}

export function normalizeFilmLibrary(input = {}, fallbackProfile = {}, now = new Date()) {
  const rawProjects = Array.isArray(input)
    ? input
    : Array.isArray(input.projects)
      ? input.projects
      : [];
  const baseProjects = rawProjects.length
    ? rawProjects
    : [{
      id: "film-current",
      ...fallbackProfile,
      title: fallbackProfile.title || "Untitled Film",
      stage: fallbackProfile.title ? "Festival strategy" : "Development"
    }];
  const seen = new Map();
  const projects = baseProjects.map((project) => {
    const normalized = normalizeFilmProject(project, fallbackProfile, now);
    const count = seen.get(normalized.id) || 0;
    seen.set(normalized.id, count + 1);
    return count ? { ...normalized, id: `${normalized.id}-${count + 1}` } : normalized;
  });
  const activeId = projects.some((project) => project.id === input.activeId)
    ? input.activeId
    : projects[0]?.id || "film-current";
  return {
    activeId,
    projects
  };
}

function projectSubmissionCount(project, submissions = []) {
  const title = String(project.title || "").trim().toLowerCase();
  if (!title) {
    return 0;
  }
  return submissions.filter((submission) =>
    String(submission.filmTitle || "").trim().toLowerCase() === title
  ).length;
}

export function buildFilmLibraryReport(library = {}, festivals = [], submissions = [], now = new Date()) {
  const normalized = normalizeFilmLibrary(library, {}, now);
  const active = normalized.projects.find((project) => project.id === normalized.activeId) || normalized.projects[0] || null;
  const activeMatches = active
    ? rankFestivalMatches(festivals, filmProjectToProfile(active), now).filter((match) => match.festival.status !== "Closed")
    : [];
  const projects = normalized.projects.map((project) => {
    const matches = rankFestivalMatches(festivals, filmProjectToProfile(project), now)
      .filter((match) => match.festival.status !== "Closed");
    const topMatch = matches[0] || null;
    const submissionCount = projectSubmissionCount(project, submissions);
    const ready = Boolean(project.title && project.title !== "Untitled Film" && Number(project.runtime) > 0);
    return {
      ...project,
      active: project.id === normalized.activeId,
      ready,
      submissionCount,
      matchCount: matches.length,
      topMatch: topMatch
        ? {
          festivalId: topMatch.festival.id,
          festivalName: topMatch.festival.name,
          score: topMatch.score,
          tier: topMatch.tier
        }
        : null
    };
  });
  const activeStrongFits = activeMatches.filter((match) => match.score >= 78).length;
  const submittedCount = projects.filter((project) =>
    project.stage === "Submitted" || project.submissionCount > 0
  ).length;
  const summary = {
    projectCount: projects.length,
    readyCount: projects.filter((project) => project.ready).length,
    submittedCount,
    activeStrongFits,
    activeTitle: active?.title || "Untitled Film"
  };
  const actions = [
    activeMatches[0]
      ? `${summary.activeTitle} currently ranks highest for ${activeMatches[0].festival.name} at ${activeMatches[0].score}/100.`
      : "Add festival records or complete the active film profile to generate matches.",
    summary.readyCount < summary.projectCount
      ? `${summary.projectCount - summary.readyCount} film profile${summary.projectCount - summary.readyCount === 1 ? "" : "s"} still need title and runtime details.`
      : "Every film profile has the minimum details needed for matching.",
    submittedCount
      ? `${submittedCount} film project${submittedCount === 1 ? "" : "s"} already have submission activity.`
      : "No film project has submission activity yet; use Prep or My Submissions when ready."
  ];
  return {
    active,
    activeMatches: activeMatches.slice(0, 4),
    projects,
    summary,
    actions
  };
}

export function filmLibraryToText(report) {
  const lines = [
    "LaurelPilot Film Library",
    `Active film: ${report.summary.activeTitle}`,
    `Projects: ${report.summary.projectCount}`,
    `Ready profiles: ${report.summary.readyCount}`,
    `Submitted projects: ${report.summary.submittedCount}`,
    "",
    "Active Matches",
    ...(report.activeMatches.length
      ? report.activeMatches.map((match) => `- ${match.festival.name}: ${match.score}/100 ${match.tier}`)
      : ["- No active matches yet."]),
    "",
    "Projects",
    ...report.projects.map((project) =>
      `- ${project.title} (${project.stage}): ${project.runtime} min ${project.contentType}, ${project.goal}, top match ${project.topMatch ? `${project.topMatch.festivalName} ${project.topMatch.score}/100` : "none"}`
    ),
    "",
    "Suggested Actions",
    ...report.actions.map((action) => `- ${action}`)
  ];
  return lines.join("\n");
}

function feeVerdict(entryFee, maxFee) {
  if (entryFee <= 0) {
    return "Free entry";
  }
  if (entryFee <= maxFee) {
    return "Inside fee comfort zone";
  }
  return "Above fee comfort zone";
}

function detailRiskLevel(score) {
  if (score >= 70) {
    return "High";
  }
  if (score >= 38) {
    return "Medium";
  }
  return "Low";
}

function detailValueTier(score) {
  if (score >= 78) {
    return "Premium target";
  }
  if (score >= 58) {
    return "Selective target";
  }
  return "Research first";
}

export function buildFestivalDetailReport(festival, profile = {}, festivals = [], now = new Date()) {
  const match = scoreFestivalMatch(festival, profile, now);
  const days = daysUntil(festival.deadline, now);
  const sourceTrust = evaluateFestivalSourceTrust(festival, now);
  const maxFee = Number(profile.maxFee ?? 35);
  const riskScore =
    (festival.confidence < 70 ? 26 : festival.confidence < 82 ? 12 : 0) +
    (festival.redFlags || []).length * 12 +
    (days < 0 ? 30 : days <= 7 ? 12 : 0) +
    (festival.entryFee > maxFee ? 10 : 0) +
    (profile.publicAlready && /premiere preferred|premiere only/iu.test(festival.premiereStatus || "") ? 14 : 0);
  const readinessScore =
    (festival.submissionUrl ? 20 : 0) +
    (festival.websiteUrl ? 15 : 0) +
    (festival.duration?.max ? 12 : 0) +
    ((festival.formats || []).length ? 10 : 0) +
    (festival.deadline ? 15 : 0) +
    (festival.confidence >= 80 ? 18 : 8) +
    ((festival.greenFlags || []).length ? 10 : 0);
  const valueScore = clamp(
    Math.round(match.score * 0.52 + Math.min(25, Number(festival.prizeMoney || 0) / 1000) + (festival.entryFee <= maxFee ? 14 : 0) + (festival.confidence >= 80 ? 9 : 0)),
    0,
    100
  );
  const related = festivals
    .filter((candidate) => candidate.id !== festival.id && candidate.status !== "Closed")
    .map((candidate) => {
      const candidateMatch = scoreFestivalMatch(candidate, profile, now);
      const sharedTypes = candidate.contentTypes.filter((type) => festival.contentTypes.includes(type));
      const relatedScore =
        candidateMatch.score +
        sharedTypes.length * 8 +
        (candidate.location.region === festival.location.region ? 5 : 0);
      return {
        id: candidate.id,
        name: candidate.name,
        score: candidateMatch.score,
        tier: candidateMatch.tier,
        deadline: candidate.deadline,
        relatedScore,
        reason: sharedTypes.length
          ? `Shares ${sharedTypes.slice(0, 2).join(", ")} programming.`
          : `Similar ${candidate.location.region} opportunity.`
      };
    })
    .sort((a, b) => b.relatedScore - a.relatedScore)
    .slice(0, 3);
  const riskChecks = [
    ...(match.cautions || []),
    ...(festival.redFlags || []),
    ...(festival.confidence < 70 ? ["Verify organizer, rules, and payment path before spending money."] : []),
    ...(days <= 7 && days >= 0 ? ["Deadline is inside a week; submit only if the package is already close."] : []),
    ...(days < 0 ? ["Deadline has passed; keep this for research or next edition tracking."] : [])
  ];
  const valueNotes = [
    `${feeVerdict(Number(festival.entryFee || 0), maxFee)} at $${Number(festival.entryFee || 0)}.`,
    Number(festival.prizeMoney || 0) > 0 ? `Prize upside listed at ${formatMoney(festival.prizeMoney)}.` : "No listed prize upside; judge this as exposure, credibility, or networking value.",
    `${festival.confidence}% confidence based on stored verification signals.`
  ];
  const prepActions = [
    `Confirm ${festival.duration.min}-${festival.duration.max} minute runtime eligibility.`,
    `Prepare ${festival.formats?.slice(0, 3).join(", ") || "festival-required"} export format.`,
    "Review premiere and public release language before paying.",
    "Save submission confirmation in My Submissions after applying."
  ];
  return {
    festivalId: festival.id,
    festivalName: festival.name,
    match,
    daysUntil: days,
    urgency: days < 0 ? "Closed" : days <= 7 ? "Immediate" : days <= 30 ? "Soon" : "Planned",
    riskLevel: detailRiskLevel(riskScore),
    riskScore: clamp(riskScore, 0, 100),
    readinessScore: clamp(readinessScore, 0, 100),
    valueScore,
    valueTier: detailValueTier(valueScore),
    sourceTrust,
    valueNotes,
    riskChecks: uniqueList(riskChecks).slice(0, 6),
    prepActions,
    proofPoints: uniqueList([
      ...(festival.greenFlags || []),
      `${festival.sourceType || "Stored source"} record verified ${festival.lastVerified || "locally"}.`,
      ...(festival.communitySignals || []).map((signal) => `${signal.label}: ${signal.summary}`)
    ]).slice(0, 6),
    related,
    summary: `${festival.name} is a ${match.tier.toLowerCase()} for ${profile.title || "the active film"}, with ${detailRiskLevel(riskScore).toLowerCase()} risk and ${detailValueTier(valueScore).toLowerCase()} value.`
  };
}

export function festivalDetailToText(report) {
  const lines = [
    "LaurelPilot Festival Decision Brief",
    report.festivalName,
    report.summary,
    "",
    "Scores",
    `- Match: ${report.match.score}/100 ${report.match.tier}`,
    `- Value: ${report.valueScore}/100 ${report.valueTier}`,
    `- Risk: ${report.riskScore}/100 ${report.riskLevel}`,
    `- Readiness: ${report.readinessScore}/100`,
    `- Source proof: ${report.sourceTrust.score}/100 ${report.sourceTrust.tier}`,
    "",
    "Source Proof",
    ...report.sourceTrust.proofPoints.map((item) => `- ${item}`),
    ...(report.sourceTrust.warnings.length ? report.sourceTrust.warnings.map((item) => `- Warning: ${item}`) : ["- No source warnings recorded."]),
    "",
    "Value Notes",
    ...report.valueNotes.map((item) => `- ${item}`),
    "",
    "Risk Checks",
    ...report.riskChecks.map((item) => `- ${item}`),
    "",
    "Prep Actions",
    ...report.prepActions.map((item) => `- [ ] ${item}`),
    "",
    "Related Festivals",
    ...(report.related.length
      ? report.related.map((item) => `- ${item.name}: ${item.score}/100 ${item.tier}. ${item.reason}`)
      : ["- No related festivals found in the current directory."])
  ];
  return lines.join("\n");
}

export const PIPELINE_STAGES = [
  "Researching",
  "Preparing",
  "Submitted",
  "Accepted",
  "Rejected",
  "Follow Up"
];

const PIPELINE_PRIORITIES = ["Low", "Medium", "High"];

function createPipelineId(item = {}, now = new Date()) {
  const base = [item.filmTitle, item.festivalId, item.stage]
    .map((part) => String(part || "").toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, ""))
    .filter(Boolean)
    .join("-");
  const stamp = now.toISOString().replace(/\D/gu, "").slice(0, 12);
  return `pipe-${base || "card"}-${stamp}`;
}

function normalizePipelineStage(stage) {
  return PIPELINE_STAGES.includes(stage) ? stage : "Researching";
}

function normalizePipelinePriority(priority) {
  return PIPELINE_PRIORITIES.includes(priority) ? priority : "Medium";
}

function pipelineStageFromStatus(status) {
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

export function normalizePipelineItem(input = {}, now = new Date()) {
  const draft = {
    festivalId: String(input.festivalId || "").trim(),
    filmTitle: String(input.filmTitle || "Untitled Film").trim() || "Untitled Film",
    stage: normalizePipelineStage(input.stage),
    priority: normalizePipelinePriority(input.priority),
    dueDate: String(input.dueDate || "").trim(),
    notes: String(input.notes || "").trim()
  };
  return {
    id: input.id || createPipelineId(draft, now),
    ...draft,
    createdAt: input.createdAt || now.toISOString(),
    updatedAt: input.updatedAt || now.toISOString()
  };
}

function pipelineKey(item) {
  return `${item.festivalId}::${String(item.filmTitle || "").trim().toLowerCase()}`;
}

function submissionToPipelineItem(submission = {}, now = new Date()) {
  return normalizePipelineItem({
    id: `pipe-submission-${submission.festivalId}-${String(submission.filmTitle || "film").toLowerCase().replace(/[^a-z0-9]+/gu, "-")}`,
    festivalId: submission.festivalId,
    filmTitle: submission.filmTitle || "Untitled Film",
    stage: pipelineStageFromStatus(submission.status),
    priority: submission.status === "Accepted" ? "High" : "Medium",
    dueDate: submission.submissionDate || "",
    notes: submission.notes || "",
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt
  }, now);
}

function pipelineStageRank(stage) {
  const index = PIPELINE_STAGES.indexOf(stage);
  return index >= 0 ? index : 0;
}

function pipelinePriorityRank(priority) {
  return { High: 0, Medium: 1, Low: 2 }[priority] ?? 1;
}

function pipelineCardPressure(card) {
  if (card.stage === "Accepted") {
    return { label: "Deliverables", tone: "green", rank: 2 };
  }
  if (card.stage === "Rejected") {
    return { label: "Archive", tone: "blue", rank: 5 };
  }
  if (card.daysUntil !== null && card.daysUntil < 0) {
    return { label: "Closed", tone: "red", rank: 0 };
  }
  if (card.daysUntil !== null && card.daysUntil <= 3) {
    return { label: "Critical", tone: "red", rank: 0 };
  }
  if (card.daysUntil !== null && card.daysUntil <= 14) {
    return { label: "Act soon", tone: "amber", rank: 1 };
  }
  if (card.priority === "High") {
    return { label: "Priority", tone: "amber", rank: 2 };
  }
  if (card.stage === "Submitted" || card.stage === "Follow Up") {
    return { label: "Monitor", tone: "blue", rank: 3 };
  }
  return { label: "Calm", tone: "green", rank: 4 };
}

function pipelineCardNextAction(card, profile = {}) {
  const maxFee = Number(profile.maxFee || 0);
  const overBudget = maxFee && card.fee > maxFee && ["Researching", "Preparing"].includes(card.stage);
  if (!card.festival) {
    return {
      label: "Verify listing",
      detail: "This card is not tied to a known festival record. Pick a festival before trusting deadlines or fees."
    };
  }
  if (card.daysUntil !== null && card.daysUntil < 0 && !["Submitted", "Accepted", "Rejected"].includes(card.stage)) {
    return {
      label: "Close or replace",
      detail: "Deadline has passed. Move it out of active planning unless the festival reopened."
    };
  }
  if (overBudget) {
    return {
      label: "Fee check",
      detail: `Entry fee is ${formatMoney(card.fee)}, above the $${maxFee} comfort zone. Keep only if the strategic upside is clear.`
    };
  }
  if (card.stage === "Researching") {
    return card.matchScore >= 78
      ? {
          label: "Move to prep",
          detail: "Strong fit. Build the prep packet and verify the rules before the fee step."
        }
      : {
          label: "Verify fit",
          detail: "Check runtime, content type, premiere language, and source proof before spending time here."
        };
  }
  if (card.stage === "Preparing") {
    return card.urgent
      ? {
          label: "Finish today",
          detail: "Deadline pressure is active. Complete screener, synopsis, statement, stills, and AI disclosure before paying."
        }
      : {
          label: "Polish materials",
          detail: "Use the Prep Pack to tighten positioning, then move this card to Submitted after confirmation."
        };
  }
  if (card.stage === "Submitted") {
    return {
      label: "Archive proof",
      detail: "Save the receipt, confirmation email, submitted version, and notification date."
    };
  }
  if (card.stage === "Accepted") {
    return {
      label: "Prepare laurels",
      detail: "Capture deliverables, public announcement timing, and award assets."
    };
  }
  if (card.stage === "Rejected") {
    return {
      label: "Log learning",
      detail: "Record any useful feedback, then recycle the strategy into better-fit festivals."
    };
  }
  return {
    label: "Follow up",
    detail: "Check notification timing and send a concise follow-up only if the festival's rules allow it."
  };
}

function pipelineColumnTone(stage) {
  return {
    Researching: "blue",
    Preparing: "amber",
    Submitted: "blue",
    Accepted: "green",
    Rejected: "red",
    "Follow Up": "amber"
  }[stage] || "blue";
}

export function buildSubmissionPipeline(items = [], festivals = [], profile = {}, submissions = [], now = new Date()) {
  const festivalMap = new Map(festivals.map((festival) => [festival.id, festival]));
  const normalizedItems = items.map((item) => normalizePipelineItem(item, now));
  const editableIds = new Set(normalizedItems.map((item) => item.id));
  const knownKeys = new Set(normalizedItems.map(pipelineKey));
  const submissionItems = submissions
    .map((submission) => submissionToPipelineItem(submission, now))
    .filter((item) => item.festivalId && !knownKeys.has(pipelineKey(item)));
  const cards = [...normalizedItems, ...submissionItems]
    .map((item) => {
      const festival = festivalMap.get(item.festivalId);
      const match = festival ? scoreFestivalMatch(festival, profile, now) : null;
      const days = festival ? daysUntil(festival.deadline, now) : null;
      const submission = submissions.find((entry) =>
        entry.festivalId === item.festivalId &&
        String(entry.filmTitle || "").trim().toLowerCase() === String(item.filmTitle || "").trim().toLowerCase()
      );
      const baseCard = {
        ...item,
        festival,
        festivalName: festival?.name || "Unknown festival",
        deadline: festival?.deadline || item.dueDate,
        deadlineDate: festival ? formatShortDate(festival.deadline) : item.dueDate || "No due date",
        daysUntil: days,
        urgent: Number.isFinite(days) && days >= 0 && days <= 14,
        fee: Number(festival?.entryFee || 0),
        prizeMoney: Number(festival?.prizeMoney || 0),
        matchScore: match?.score || 0,
        matchTier: match?.tier || "Unmatched",
        submissionStatus: submission?.status || "",
        source: festival?.sourceType || "Manual",
        editable: editableIds.has(item.id)
      };
      const pressure = pipelineCardPressure(baseCard);
      const nextAction = pipelineCardNextAction(baseCard, profile);
      const maxFee = Number(profile.maxFee || 0);
      const overBudget = Boolean(maxFee && baseCard.fee > maxFee && ["Researching", "Preparing"].includes(baseCard.stage));
      return {
        ...baseCard,
        pressure,
        nextAction,
        overBudget,
        readySignal: baseCard.matchScore >= 78 && baseCard.stage === "Preparing" && !pressure.label.includes("Closed"),
        actionRequired: ["Critical", "Act soon", "Priority", "Deliverables"].includes(pressure.label) || overBudget
      };
    })
    .sort((a, b) => {
      const stageDelta = pipelineStageRank(a.stage) - pipelineStageRank(b.stage);
      if (stageDelta !== 0) {
        return stageDelta;
      }
      const pressureDelta = a.pressure.rank - b.pressure.rank;
      if (pressureDelta !== 0) {
        return pressureDelta;
      }
      const priorityDelta = pipelinePriorityRank(a.priority) - pipelinePriorityRank(b.priority);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return (a.daysUntil ?? 9999) - (b.daysUntil ?? 9999);
    });
  const columns = PIPELINE_STAGES.map((stage) => {
    const stageCards = cards.filter((card) => card.stage === stage);
    return {
      stage,
      cards: stageCards,
      count: stageCards.length,
      urgentCount: stageCards.filter((card) => card.urgent).length,
      criticalCount: stageCards.filter((card) => card.pressure.tone === "red" || card.pressure.label === "Critical").length,
      highPriorityCount: stageCards.filter((card) => card.priority === "High").length,
      averageMatch: stageCards.length
        ? Math.round(stageCards.reduce((total, card) => total + card.matchScore, 0) / stageCards.length)
        : 0,
      feeTotal: stageCards.reduce((total, card) => total + card.fee, 0),
      tone: pipelineColumnTone(stage)
    };
  });
  const decisionCount = cards.filter((card) => card.stage === "Accepted" || card.stage === "Rejected").length;
  const activeCards = cards.filter((card) => !["Accepted", "Rejected"].includes(card.stage));
  const focusQueue = activeCards
    .filter((card) => card.actionRequired || card.stage === "Preparing")
    .sort((a, b) => a.pressure.rank - b.pressure.rank || pipelinePriorityRank(a.priority) - pipelinePriorityRank(b.priority) || (a.daysUntil ?? 9999) - (b.daysUntil ?? 9999))
    .slice(0, 5);
  const overBudgetCards = activeCards.filter((card) => card.overBudget);
  const readyToSubmit = activeCards.filter((card) => card.readySignal);
  const averageMatch = cards.length
    ? Math.round(cards.reduce((total, card) => total + card.matchScore, 0) / cards.length)
    : 0;
  const boardScore = clamp(
    Math.round(
      70 +
      readyToSubmit.length * 5 +
      decisionCount * 3 -
      cards.filter((card) => card.pressure.label === "Critical" || card.pressure.label === "Closed").length * 8 -
      overBudgetCards.length * 5 +
      Math.max(0, averageMatch - 60) * 0.35
    ),
    0,
    100
  );
  const summary = {
    total: cards.length,
    researching: columns.find((column) => column.stage === "Researching")?.count || 0,
    preparing: columns.find((column) => column.stage === "Preparing")?.count || 0,
    submitted: columns.find((column) => column.stage === "Submitted")?.count || 0,
    decisions: decisionCount,
    urgent: cards.filter((card) => card.urgent).length,
    focus: focusQueue.length,
    overBudget: overBudgetCards.length,
    readyToSubmit: readyToSubmit.length,
    averageMatch,
    boardScore,
    feeExposure: cards.reduce((total, card) => total + (["Researching", "Preparing"].includes(card.stage) ? card.fee : 0), 0)
  };
  const actions = [
    focusQueue.length
      ? `Today: work ${focusQueue[0].filmTitle} for ${focusQueue[0].festivalName} - ${focusQueue[0].nextAction.label.toLowerCase()}.`
      : "No urgent pipeline card needs immediate action.",
    readyToSubmit.length
      ? `${readyToSubmit.length} strong-fit prep card${readyToSubmit.length === 1 ? "" : "s"} can move toward submission after a final rules check.`
      : summary.preparing ? `${summary.preparing} card${summary.preparing === 1 ? "" : "s"} need materials before submission.` : "No cards are currently in preparation.",
    overBudgetCards.length
      ? `${overBudgetCards.length} active card${overBudgetCards.length === 1 ? "" : "s"} exceed the fee comfort zone.`
      : "No active card exceeds the fee comfort zone.",
    summary.feeExposure ? `Potential fee exposure before submission: ${formatMoney(summary.feeExposure)}.` : "No pre-submission fee exposure in this board."
  ];
  return {
    generatedAt: now.toISOString(),
    cards,
    columns,
    focusQueue,
    overBudgetCards,
    readyToSubmit,
    summary,
    actions
  };
}

export function pipelineToText(report) {
  const lines = [
    "LaurelPilot Submission Pipeline",
    `Generated: ${formatShortDate(report.generatedAt)}`,
    `Cards: ${report.summary.total}`,
    `Preparing: ${report.summary.preparing}`,
    `Submitted: ${report.summary.submitted}`,
    `Decisions: ${report.summary.decisions}`,
    `Focus now: ${report.summary.focus}`,
    `Ready to submit: ${report.summary.readyToSubmit}`,
    `Over budget: ${report.summary.overBudget}`,
    `Board score: ${report.summary.boardScore}/100`,
    `Fee exposure: ${formatMoney(report.summary.feeExposure)}`,
    "",
    "Suggested Actions",
    ...report.actions.map((action) => `- ${action}`),
    "",
    "Focus Queue",
    ...(report.focusQueue.length
      ? report.focusQueue.map((card) => `- ${card.filmTitle} -> ${card.festivalName}: ${card.nextAction.label} (${card.pressure.label})`)
      : ["- No immediate focus cards."]),
    "",
    "Board"
  ];
  report.columns.forEach((column) => {
    lines.push("", column.stage);
    if (!column.cards.length) {
      lines.push("- No cards");
      return;
    }
    column.cards.forEach((card) => {
      lines.push(`- ${card.filmTitle} -> ${card.festivalName}: ${card.priority}, ${card.deadlineDate}, ${card.matchScore}/100, ${card.nextAction.label}`);
    });
  });
  return lines.join("\n");
}

export function pipelineToCsv(report) {
  const rows = [
    ["Stage", "Priority", "Pressure", "Next Action", "Film", "Festival", "Deadline", "Match Score", "Fee", "Over Budget", "Status", "Editable", "Notes"],
    ...report.cards.map((card) => [
      card.stage,
      card.priority,
      card.pressure.label,
      card.nextAction.label,
      card.filmTitle,
      card.festivalName,
      card.deadlineDate,
      card.matchScore,
      card.fee,
      card.overBudget ? "Yes" : "No",
      card.submissionStatus,
      card.editable ? "Yes" : "No",
      card.notes
    ])
  ];
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export const DEVICE_PROFILES = [
  {
    id: "desktop-command",
    label: "Desktop Command",
    width: 1365,
    height: 900,
    focus: "Premium density, sidebar navigation, tables, and modal positioning."
  },
  {
    id: "laptop-review",
    label: "Laptop Review",
    width: 1280,
    height: 800,
    focus: "Fold visibility, toolbar wrapping, and card rhythm."
  },
  {
    id: "tablet-drawer",
    label: "Tablet Drawer",
    width: 820,
    height: 1180,
    focus: "Collapsed sidebar, form flow, and split layouts."
  },
  {
    id: "mobile-stack",
    label: "Mobile Stack",
    width: 390,
    height: 844,
    focus: "Single-column hierarchy, button fit, and touch targets."
  },
  {
    id: "narrow-mobile",
    label: "Narrow Mobile",
    width: 360,
    height: 740,
    focus: "Longest labels, card actions, and scroll comfort."
  }
];

export const DEVICE_QA_VIEWS = [
  "Product",
  "Start",
  "Films",
  "Discover",
  "Calendar",
  "Intelligence",
  "Match",
  "Prep Pack",
  "Pipeline",
  "My Submissions",
  "Scout",
  "Watchlist",
  "Radar",
  "Settings",
  "Access",
  "Data Vault"
];

const DEVICE_SEVERITIES = ["Polish", "Important", "Blocker"];
const DEVICE_STATUSES = ["Open", "Fixed"];

function createDeviceIssueId(issue = {}, now = new Date()) {
  const base = [issue.device, issue.view, issue.title]
    .map((part) => String(part || "").toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, ""))
    .filter(Boolean)
    .join("-");
  return `device-${base || "issue"}-${now.getTime()}`;
}

function normalizeDeviceSeverity(severity) {
  return DEVICE_SEVERITIES.includes(severity) ? severity : "Polish";
}

function normalizeDeviceStatus(status) {
  return DEVICE_STATUSES.includes(status) ? status : "Open";
}

export function normalizeDeviceLabIssue(input = {}, now = new Date()) {
  const device = DEVICE_PROFILES.some((profile) => profile.id === input.device)
    ? input.device
    : DEVICE_PROFILES[0].id;
  const view = DEVICE_QA_VIEWS.includes(input.view) ? input.view : "Product";
  const title = String(input.title || "Untitled QA note").trim() || "Untitled QA note";
  const issue = {
    device,
    view,
    severity: normalizeDeviceSeverity(input.severity),
    status: normalizeDeviceStatus(input.status),
    title,
    notes: String(input.notes || "").trim()
  };
  return {
    id: input.id || createDeviceIssueId(issue, now),
    ...issue,
    createdAt: input.createdAt || now.toISOString(),
    updatedAt: input.updatedAt || now.toISOString()
  };
}

export function buildDeviceLabReport(issues = [], snapshot = {}, now = new Date()) {
  const normalizedIssues = issues.map((issue) => normalizeDeviceLabIssue(issue, now));
  const openIssues = normalizedIssues.filter((issue) => issue.status === "Open");
  const fixedIssues = normalizedIssues.filter((issue) => issue.status === "Fixed");
  const blockers = openIssues.filter((issue) => issue.severity === "Blocker");
  const important = openIssues.filter((issue) => issue.severity === "Important");
  const polish = openIssues.filter((issue) => issue.severity === "Polish");
  const coveredDevices = new Set(normalizedIssues.map((issue) => issue.device));
  const coveredViews = new Set(normalizedIssues.map((issue) => issue.view));
  const uncoveredDevices = DEVICE_PROFILES.filter((profile) => !coveredDevices.has(profile.id));
  const score = Math.max(
    0,
    Math.min(100, 100 - blockers.length * 20 - important.length * 9 - polish.length * 4 - uncoveredDevices.length * 7)
  );
  const deviceRows = DEVICE_PROFILES.map((profile) => {
    const profileIssues = normalizedIssues.filter((issue) => issue.device === profile.id);
    const profileOpen = profileIssues.filter((issue) => issue.status === "Open");
    return {
      ...profile,
      issueCount: profileIssues.length,
      openCount: profileOpen.length,
      blockerCount: profileOpen.filter((issue) => issue.severity === "Blocker").length,
      status: profileIssues.length ? (profileOpen.length ? "Needs review" : "Cleared") : "Untested"
    };
  });
  const checklist = [
    {
      id: "mobile",
      label: "Mobile stack reviewed",
      ready: coveredDevices.has("mobile-stack") || coveredDevices.has("narrow-mobile"),
      detail: "At least one phone-sized viewport has a logged pass or issue."
    },
    {
      id: "tablet",
      label: "Tablet drawer reviewed",
      ready: coveredDevices.has("tablet-drawer"),
      detail: "The collapsed navigation and split layouts have been checked."
    },
    {
      id: "desktop",
      label: "Desktop command view reviewed",
      ready: coveredDevices.has("desktop-command") || coveredDevices.has("laptop-review"),
      detail: "The premium desktop surface has been inspected."
    },
    {
      id: "blockers",
      label: "No open visual blockers",
      ready: blockers.length === 0,
      detail: `${blockers.length} open blocker${blockers.length === 1 ? "" : "s"} logged.`
    },
    {
      id: "coverage",
      label: "Core sections covered",
      ready: coveredViews.size >= Math.min(5, DEVICE_QA_VIEWS.length),
      detail: `${coveredViews.size} section${coveredViews.size === 1 ? "" : "s"} have QA notes.`
    },
    {
      id: "launch",
      label: "Launch score context available",
      ready: Number(snapshot.launchScore || 0) >= 70,
      detail: snapshot.launchScore ? `Launch QA is currently ${snapshot.launchScore}/100.` : "Run Launch QA for product context."
    }
  ];
  const actions = [
    blockers.length
      ? `Fix ${blockers.length} blocker${blockers.length === 1 ? "" : "s"} before showing this to paid users.`
      : "No open visual blockers are logged.",
    uncoveredDevices.length
      ? `Review ${uncoveredDevices.map((profile) => profile.label).join(", ")} next.`
      : "Every target device profile has at least one QA note.",
    coveredViews.size < 5
      ? "Cover at least five high-value sections: Product, Discover, Prep Pack, Pipeline, and Access."
      : "Core section coverage is strong enough for the next polish pass."
  ];
  const summary = {
    total: normalizedIssues.length,
    open: openIssues.length,
    fixed: fixedIssues.length,
    blockers: blockers.length,
    important: important.length,
    polish: polish.length,
    score,
    coverage: Math.round((coveredDevices.size / DEVICE_PROFILES.length) * 100),
    coveredViews: coveredViews.size,
    coveredDevices: coveredDevices.size
  };
  return {
    generatedAt: now.toISOString(),
    issues: normalizedIssues,
    deviceRows,
    checklist,
    actions,
    summary,
    message: score >= 90
      ? "Device readiness looks premium enough for a public pass."
      : score >= 70
        ? "Device readiness is close, but a few responsive checks still need attention."
        : "Device readiness needs a focused responsive pass before this feels launch-grade."
  };
}

export function deviceLabToText(report) {
  const lines = [
    "LaurelPilot Device Lab",
    `Generated: ${formatShortDate(report.generatedAt)}`,
    `Score: ${report.summary.score}/100`,
    `Open issues: ${report.summary.open}`,
    `Blockers: ${report.summary.blockers}`,
    `Device coverage: ${report.summary.coverage}%`,
    "",
    "Suggested Actions",
    ...report.actions.map((action) => `- ${action}`),
    "",
    "Checklist",
    ...report.checklist.map((item) => `- ${item.ready ? "Ready" : "Needs work"}: ${item.label} - ${item.detail}`),
    "",
    "Issues",
    ...(report.issues.length
      ? report.issues.map((issue) => `- ${issue.status} / ${issue.severity}: ${issue.view} on ${issue.device} - ${issue.title}`)
      : ["- No issues logged yet."])
  ];
  return lines.join("\n");
}

export function deviceLabToCsv(report) {
  const rows = [
    ["Status", "Severity", "View", "Device", "Title", "Notes", "Updated At"],
    ...report.issues.map((issue) => [
      issue.status,
      issue.severity,
      issue.view,
      issue.device,
      issue.title,
      issue.notes,
      issue.updatedAt
    ])
  ];
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export const FEEDBACK_TYPES = [
  "Bug",
  "UX note",
  "Feature request",
  "Pricing objection",
  "Data correction",
  "Praise"
];

export const FEEDBACK_PRIORITIES = ["Low", "Medium", "High", "Launch blocker"];
export const FEEDBACK_STATUSES = ["New", "Triaged", "Planned", "Fixed", "Archived"];

function createFeedbackId(item = {}, now = new Date()) {
  const base = [item.source, item.type, item.title]
    .map((part) => String(part || "").toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, ""))
    .filter(Boolean)
    .join("-");
  return `feedback-${base || "note"}-${now.getTime()}`;
}

function normalizeFeedbackOption(value, options, fallback) {
  return options.includes(value) ? value : fallback;
}

export function normalizeBetaFeedbackItem(input = {}, now = new Date()) {
  const item = {
    source: String(input.source || "Private beta").trim() || "Private beta",
    view: String(input.view || "Product").trim() || "Product",
    type: normalizeFeedbackOption(input.type, FEEDBACK_TYPES, "UX note"),
    priority: normalizeFeedbackOption(input.priority, FEEDBACK_PRIORITIES, "Medium"),
    status: normalizeFeedbackOption(input.status, FEEDBACK_STATUSES, "New"),
    title: String(input.title || "Untitled feedback").trim() || "Untitled feedback",
    notes: String(input.notes || "").trim()
  };
  return {
    id: input.id || createFeedbackId(item, now),
    ...item,
    createdAt: input.createdAt || now.toISOString(),
    updatedAt: input.updatedAt || now.toISOString()
  };
}

export function buildBetaFeedbackReport(items = [], snapshot = {}, now = new Date()) {
  const normalizedItems = items.map((item) => normalizeBetaFeedbackItem(item, now));
  const openItems = normalizedItems.filter((item) => !["Fixed", "Archived"].includes(item.status));
  const blockers = openItems.filter((item) => item.priority === "Launch blocker");
  const highPriority = openItems.filter((item) => item.priority === "High");
  const newItems = openItems.filter((item) => item.status === "New");
  const fixedItems = normalizedItems.filter((item) => item.status === "Fixed");
  const score = Math.max(
    0,
    Math.min(100, 100 - blockers.length * 24 - highPriority.length * 10 - newItems.length * 5 - Math.max(0, openItems.length - 8) * 4)
  );
  const columns = FEEDBACK_STATUSES.map((status) => {
    const cards = normalizedItems
      .filter((item) => item.status === status)
      .sort((a, b) => {
        const priorityRank = { "Launch blocker": 0, High: 1, Medium: 2, Low: 3 };
        const priorityDelta = priorityRank[a.priority] - priorityRank[b.priority];
        if (priorityDelta !== 0) {
          return priorityDelta;
        }
        return parseDate(b.updatedAt).getTime() - parseDate(a.updatedAt).getTime();
      });
    return {
      status,
      cards,
      count: cards.length,
      blockerCount: cards.filter((item) => item.priority === "Launch blocker").length
    };
  });
  const themes = FEEDBACK_TYPES.map((type) => {
    const matches = normalizedItems.filter((item) => item.type === type);
    const openMatches = matches.filter((item) => !["Fixed", "Archived"].includes(item.status));
    return {
      type,
      count: matches.length,
      openCount: openMatches.length,
      blockerCount: openMatches.filter((item) => item.priority === "Launch blocker").length
    };
  }).filter((theme) => theme.count > 0);
  const launchScore = Number(snapshot.launchScore || 0);
  const actions = [
    blockers.length
      ? `Resolve ${blockers.length} launch blocker${blockers.length === 1 ? "" : "s"} before paid beta.`
      : "No launch-blocking beta feedback is open.",
    newItems.length
      ? `Triage ${newItems.length} new note${newItems.length === 1 ? "" : "s"} into planned, fixed, or archived.`
      : "All beta notes have been triaged.",
    launchScore >= 80
      ? "Launch QA is strong enough to pair feedback review with polish passes."
      : "Run Launch QA after the next feedback pass to keep the product score honest."
  ];
  const summary = {
    total: normalizedItems.length,
    open: openItems.length,
    blockers: blockers.length,
    highPriority: highPriority.length,
    fixed: fixedItems.length,
    score,
    planned: columns.find((column) => column.status === "Planned")?.count || 0,
    triaged: columns.find((column) => column.status === "Triaged")?.count || 0
  };
  return {
    generatedAt: now.toISOString(),
    items: normalizedItems,
    columns,
    themes,
    actions,
    summary,
    message: score >= 90
      ? "Beta feedback is controlled and ready for a tighter tester loop."
      : score >= 70
        ? "Beta feedback is manageable, with a few notes still needing decisions."
        : "Beta feedback needs focused triage before the product feels ready for more testers."
  };
}

export function betaFeedbackToText(report) {
  const lines = [
    "LaurelPilot Beta Feedback Desk",
    `Generated: ${formatShortDate(report.generatedAt)}`,
    `Score: ${report.summary.score}/100`,
    `Open notes: ${report.summary.open}`,
    `Launch blockers: ${report.summary.blockers}`,
    "",
    "Suggested Actions",
    ...report.actions.map((action) => `- ${action}`),
    "",
    "Themes",
    ...(report.themes.length
      ? report.themes.map((theme) => `- ${theme.type}: ${theme.openCount} open of ${theme.count}`)
      : ["- No feedback themes logged yet."]),
    "",
    "Feedback Board"
  ];
  report.columns.forEach((column) => {
    lines.push("", column.status);
    if (!column.cards.length) {
      lines.push("- No notes");
      return;
    }
    column.cards.forEach((item) => {
      lines.push(`- ${item.priority}: ${item.title} (${item.type}, ${item.view}, ${item.source})`);
    });
  });
  return lines.join("\n");
}

export function betaFeedbackToCsv(report) {
  const rows = [
    ["Status", "Priority", "Type", "View", "Source", "Title", "Notes", "Updated At"],
    ...report.items.map((item) => [
      item.status,
      item.priority,
      item.type,
      item.view,
      item.source,
      item.title,
      item.notes,
      item.updatedAt
    ])
  ];
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export const ROADMAP_STATUSES = ["Backlog", "Next", "In Progress", "Shipped", "Paused"];
export const ROADMAP_TYPES = ["Feature", "Polish", "Data", "Monetization", "Reliability", "Marketing"];
export const ROADMAP_IMPACTS = ["Low", "Medium", "High", "Revenue critical"];

function createRoadmapId(item = {}, now = new Date()) {
  const base = [item.release, item.type, item.title]
    .map((part) => String(part || "").toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, ""))
    .filter(Boolean)
    .join("-");
  return `roadmap-${base || "item"}-${now.getTime()}`;
}

function normalizeRoadmapOption(value, options, fallback) {
  return options.includes(value) ? value : fallback;
}

export function normalizeRoadmapItem(input = {}, now = new Date()) {
  const status = normalizeRoadmapOption(input.status, ROADMAP_STATUSES, "Backlog");
  const item = {
    title: String(input.title || "Untitled roadmap item").trim() || "Untitled roadmap item",
    type: normalizeRoadmapOption(input.type, ROADMAP_TYPES, "Feature"),
    status,
    impact: normalizeRoadmapOption(input.impact, ROADMAP_IMPACTS, "Medium"),
    release: String(input.release || "Beta").trim() || "Beta",
    owner: String(input.owner || "Raymond").trim() || "Raymond",
    notes: String(input.notes || "").trim()
  };
  return {
    id: input.id || createRoadmapId(item, now),
    ...item,
    createdAt: input.createdAt || now.toISOString(),
    updatedAt: input.updatedAt || now.toISOString(),
    shippedAt: input.shippedAt || (status === "Shipped" ? now.toISOString() : "")
  };
}

export function buildRoadmapReport(items = [], snapshot = {}, now = new Date()) {
  const normalizedItems = items.map((item) => normalizeRoadmapItem(item, now));
  const activeItems = normalizedItems.filter((item) => ["Next", "In Progress"].includes(item.status));
  const shippedItems = normalizedItems.filter((item) => item.status === "Shipped");
  const pausedItems = normalizedItems.filter((item) => item.status === "Paused");
  const revenueCritical = normalizedItems.filter((item) => item.impact === "Revenue critical" && item.status !== "Shipped");
  const releases = [...new Set(normalizedItems.map((item) => item.release).filter(Boolean))];
  const feedbackBlockers = Number(snapshot.feedbackBlockers || 0);
  const launchScore = Number(snapshot.launchScore || 0);
  const score = Math.max(
    0,
    Math.min(100, 72 + shippedItems.length * 6 + activeItems.length * 4 - revenueCritical.length * 8 - pausedItems.length * 3 - feedbackBlockers * 10)
  );
  const columns = ROADMAP_STATUSES.map((status) => {
    const cards = normalizedItems
      .filter((item) => item.status === status)
      .sort((a, b) => {
        const impactRank = { "Revenue critical": 0, High: 1, Medium: 2, Low: 3 };
        const impactDelta = impactRank[a.impact] - impactRank[b.impact];
        if (impactDelta !== 0) {
          return impactDelta;
        }
        return parseDate(b.updatedAt).getTime() - parseDate(a.updatedAt).getTime();
      });
    return {
      status,
      cards,
      count: cards.length,
      revenueCount: cards.filter((item) => item.impact === "Revenue critical").length
    };
  });
  const changelog = shippedItems
    .sort((a, b) => parseDate(b.shippedAt || b.updatedAt).getTime() - parseDate(a.shippedAt || a.updatedAt).getTime())
    .map((item) => ({
      ...item,
      shippedDate: formatShortDate(item.shippedAt || item.updatedAt)
    }));
  const actions = [
    activeItems.length
      ? `${activeItems.length} roadmap item${activeItems.length === 1 ? "" : "s"} are actively moving.`
      : "Pick one Next item before adding more roadmap ideas.",
    revenueCritical.length
      ? `${revenueCritical.length} revenue-critical item${revenueCritical.length === 1 ? "" : "s"} still need shipment.`
      : "No open revenue-critical items are blocking the roadmap.",
    feedbackBlockers
      ? `Fold ${feedbackBlockers} beta blocker${feedbackBlockers === 1 ? "" : "s"} into the roadmap.`
      : "Beta blockers are not currently pressuring the roadmap.",
    launchScore >= 80
      ? "Launch QA is strong enough to publish a small changelog after the next shipped item."
      : "Raise Launch QA before using the changelog as public-facing release proof."
  ];
  const summary = {
    total: normalizedItems.length,
    active: activeItems.length,
    shipped: shippedItems.length,
    paused: pausedItems.length,
    revenueCritical: revenueCritical.length,
    releaseCount: releases.length,
    score
  };
  return {
    generatedAt: now.toISOString(),
    items: normalizedItems,
    columns,
    changelog,
    actions,
    summary,
    message: score >= 90
      ? "Roadmap discipline is strong enough for a public beta rhythm."
      : score >= 74
        ? "Roadmap discipline is solid, but the next release needs sharper ownership."
        : "Roadmap discipline needs focus before the next batch of features."
  };
}

export function roadmapToText(report) {
  const lines = [
    "LaurelPilot Roadmap And Changelog",
    `Generated: ${formatShortDate(report.generatedAt)}`,
    `Score: ${report.summary.score}/100`,
    `Active: ${report.summary.active}`,
    `Shipped: ${report.summary.shipped}`,
    `Releases: ${report.summary.releaseCount}`,
    "",
    "Suggested Actions",
    ...report.actions.map((action) => `- ${action}`),
    "",
    "Changelog",
    ...(report.changelog.length
      ? report.changelog.map((item) => `- ${item.shippedDate}: ${item.title} (${item.release})`)
      : ["- No shipped items yet."]),
    "",
    "Roadmap"
  ];
  report.columns.forEach((column) => {
    lines.push("", column.status);
    if (!column.cards.length) {
      lines.push("- No items");
      return;
    }
    column.cards.forEach((item) => {
      lines.push(`- ${item.impact}: ${item.title} (${item.type}, ${item.release}, ${item.owner})`);
    });
  });
  return lines.join("\n");
}

export function roadmapToCsv(report) {
  const rows = [
    ["Status", "Impact", "Type", "Release", "Owner", "Title", "Notes", "Shipped At", "Updated At"],
    ...report.items.map((item) => [
      item.status,
      item.impact,
      item.type,
      item.release,
      item.owner,
      item.title,
      item.notes,
      item.shippedAt,
      item.updatedAt
    ])
  ];
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

function hasDraftText(value, minLength = 1) {
  return String(value || "").trim().length >= minLength;
}

function sentenceCase(value, fallback = "the festival fit") {
  const text = String(value || fallback).trim();
  if (!text) {
    return fallback;
  }
  return `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

function buildPacketReadiness(festival, profile, draft, match, now) {
  const runtime = Number(profile.runtime || 0);
  const days = daysUntil(festival.deadline, now);
  const filmTitle = draft.filmTitle || profile.title || "";
  const checks = [
    {
      id: "title",
      label: "Film title",
      ready: hasDraftText(filmTitle) && filmTitle !== "Untitled film",
      detail: hasDraftText(filmTitle) && filmTitle !== "Untitled film"
        ? `${filmTitle} is ready to appear on submission forms.`
        : "Add the exact festival-facing title."
    },
    {
      id: "logline",
      label: "Logline",
      ready: hasDraftText(draft.logline, 24),
      detail: hasDraftText(draft.logline, 24)
        ? "The packet has a concise hook to shape the submission angle."
        : "Add a one-sentence hook before paying a fee."
    },
    {
      id: "synopsis",
      label: "Synopsis",
      ready: hasDraftText(draft.synopsis, 40),
      detail: hasDraftText(draft.synopsis, 40)
        ? "A short synopsis draft is attached."
        : "Draft the short synopsis that most festival forms request."
    },
    {
      id: "statement",
      label: "Director statement",
      ready: hasDraftText(draft.directorStatement, 40),
      detail: hasDraftText(draft.directorStatement, 40)
        ? "The director statement is ready for festival tailoring."
        : "Write the human reason behind the film and the AI workflow."
    },
    {
      id: "ai-tools",
      label: "AI disclosure",
      ready: hasDraftText(draft.aiTools, 8),
      detail: hasDraftText(draft.aiTools, 8)
        ? "AI tools are disclosed clearly enough for transparency fields."
        : "List the AI tools and what they contributed."
    },
    {
      id: "runtime",
      label: "Runtime fit",
      ready: Boolean(runtime && runtime >= festival.duration.min && runtime <= festival.duration.max),
      detail: runtime
        ? `${runtime} min against a ${festival.duration.min}-${festival.duration.max} min requirement.`
        : "Add runtime in Match or Film Library."
    },
    {
      id: "match",
      label: "Festival fit",
      ready: match.score >= 58,
      detail: `${match.tier} at ${match.score}/100.`
    },
    {
      id: "deadline",
      label: "Deadline pressure",
      ready: days >= 2,
      detail: days < 0
        ? "Deadline appears closed."
        : days <= 1
          ? "Submission window is too tight for anything unfinished."
          : `${days} days left to prepare and verify rules.`
    }
  ];
  const completedCount = checks.filter((check) => check.ready).length;
  const score = clamp(Math.round((completedCount / checks.length) * 100), 0, 100);
  const tier = score >= 88
    ? "Submission ready"
    : score >= 68
      ? "Almost ready"
      : "Needs drafting";
  return {
    score,
    tier,
    completedCount,
    totalCount: checks.length,
    checks
  };
}

function buildSubmissionAngle(festival, profile, draft, filmTitle) {
  const contentType = profile.contentType || festival.contentTypes?.[0] || "AI film";
  const goal = profile.goal || "festival visibility";
  const logline = hasDraftText(draft.logline, 16)
    ? ` Lead with: ${draft.logline}`
    : " Lead with the cleanest story hook before mentioning tools.";
  const tools = hasDraftText(draft.aiTools, 8)
    ? ` Frame the AI workflow as an intentional craft choice using ${draft.aiTools}.`
    : " Keep the AI disclosure honest and specific once the tools list is complete.";
  return `${filmTitle} should be positioned as a ${contentType.toLowerCase()} built for ${sentenceCase(festival.fitSummary)} at ${festival.name}. The submission should serve the ${goal.toLowerCase()} goal without sounding like a generic tool demo.${logline}${tools}`;
}

function buildFeeDecision(festival, profile, match, readiness, now) {
  const maxFee = Number(profile.maxFee || 0);
  const fee = Number(festival.entryFee || 0);
  const days = daysUntil(festival.deadline, now);
  if (days < 0 || festival.status === "Closed") {
    return {
      label: "Hold payment",
      tone: "red",
      detail: "The deadline appears closed, so do not spend on this submission unless the festival reopens."
    };
  }
  if (readiness.score < 68) {
    return {
      label: "Draft before paying",
      tone: "amber",
      detail: `Readiness is ${readiness.score}/100. Finish the missing materials before opening the payment step.`
    };
  }
  if (maxFee && fee > maxFee) {
    return {
      label: "Fee exception",
      tone: "amber",
      detail: `Entry fee is $${fee}, above the $${maxFee} comfort zone. Pay only if this is a strategic target.`
    };
  }
  if (match.score >= 78 && readiness.score >= 88) {
    return {
      label: "Clear to submit",
      tone: "green",
      detail: "Fit and materials are strong enough to move into the submission flow after a final rules check."
    };
  }
  if (match.score >= 58) {
    return {
      label: "Shortlist carefully",
      tone: "blue",
      detail: "This can be worth submitting, but verify requirements and sharpen the positioning first."
    };
  }
  return {
    label: "Skip for now",
    tone: "red",
    detail: "The match score is weak enough that the fee is probably better saved for stronger targets."
  };
}

function buildPacketMaterialsByPhase(festival, match, readiness) {
  const missing = readiness.checks
    .filter((check) => !check.ready)
    .map((check) => `Resolve ${check.label.toLowerCase()}: ${check.detail}`);
  return [
    {
      phase: "Must finish before submission",
      items: [
        ...(missing.length ? missing.slice(0, 4) : ["Run a final pass on title, logline, synopsis, statement, and AI disclosure."]),
        "Confirm the screener link or upload file plays cleanly from a private browser window.",
        "Check the current festival rules page before paying."
      ]
    },
    {
      phase: "Polish before paying",
      items: [
        ...match.reasons.slice(0, 2).map((reason) => `Use as positioning proof: ${reason}`),
        ...(festival.checklist || []).slice(0, 3),
        "Prepare poster, stills, director bio, and contact details in one folder."
      ]
    },
    {
      phase: "Archive after submitting",
      items: [
        "Save the confirmation receipt, tracking number, and submitted cut version.",
        "Store a copy of the final synopsis, statement, and AI disclosure used.",
        "Add the festival to the Pipeline with the notification date or follow-up note."
      ]
    }
  ].map((phase) => ({
    ...phase,
    items: uniqueList(phase.items)
  }));
}

function timelineDateFromOffset(deadline, offsetDays, now) {
  const target = new Date(parseDate(deadline).getTime() - offsetDays * DAY_MS);
  return target.getTime() < now.getTime() ? "Today" : formatShortDate(target);
}

function buildPacketTimeline(festival, readiness, now) {
  const days = daysUntil(festival.deadline, now);
  return [
    {
      label: "Today",
      date: formatShortDate(now),
      detail: readiness.score >= 88
        ? "Do a final rules and playback check."
        : `Close ${readiness.totalCount - readiness.completedCount} readiness gap${readiness.totalCount - readiness.completedCount === 1 ? "" : "s"} before paying.`
    },
    {
      label: "Before upload",
      date: days > 3 ? timelineDateFromOffset(festival.deadline, 2, now) : "Before payment",
      detail: "Export final files, gather images, confirm duration, and keep every answer consistent across forms."
    },
    {
      label: "Deadline",
      date: formatShortDate(festival.deadline),
      detail: days < 0 ? "Submission window appears closed." : "Submit before the final-day rush and save all confirmation evidence."
    },
    {
      label: "After submit",
      date: festival.notificationDate ? formatShortDate(festival.notificationDate) : "After confirmation",
      detail: festival.notificationDate
        ? "Track the notification date and prepare follow-up assets."
        : "Add a follow-up reminder once the festival publishes notification timing."
    }
  ];
}

export function buildSubmissionPacket(festival, profile, draft = {}, now = new Date()) {
  const match = scoreFestivalMatch(festival, profile, now);
  const filmTitle = draft.filmTitle || profile.title || "Untitled film";
  const readiness = buildPacketReadiness(festival, profile, draft, match, now);
  const submissionAngle = buildSubmissionAngle(festival, profile, draft, filmTitle);
  const feeDecision = buildFeeDecision(festival, profile, match, readiness, now);
  const materialsByPhase = buildPacketMaterialsByPhase(festival, match, readiness);
  const timeline = buildPacketTimeline(festival, readiness, now);
  const materials = [
    "Final screener link or upload file",
    "50-word synopsis",
    "250-word synopsis",
    "Director biography",
    "Director statement",
    "Poster or key art",
    "Three production stills",
    "AI tools disclosure",
    "English subtitles or captions if required",
    "Payment method for entry fee"
  ];
  const exportNotes = [
    `Runtime target: ${festival.duration.min}-${festival.duration.max} minutes`,
    `Accepted formats: ${(festival.formats || ["Verify on festival rules page"]).join(", ")}`,
    `Aspect ratios: ${(festival.aspectRatio || ["Verify on festival rules page"]).join(", ")}`,
    `Language requirement: ${festival.language || "Verify on festival rules page"}`,
    `Premiere note: ${festival.premiereStatus || "Verify on festival rules page"}`
  ];
  const watchouts = [
    ...match.cautions,
    ...festival.redFlags,
    ...(daysUntil(festival.deadline, now) <= 7 && daysUntil(festival.deadline, now) >= 0
      ? ["Deadline is inside the next 7 days; submit only if all materials are ready."]
      : [])
  ];
  const positioning = [
    `${filmTitle} should be positioned around ${festival.fitSummary.charAt(0).toLowerCase()}${festival.fitSummary.slice(1)}`,
    ...festival.strategyNotes.slice(0, 3),
    ...(draft.aiTools ? [`Be transparent about AI workflow: ${draft.aiTools}.`] : []),
    ...(draft.logline ? [`Lead with this logline angle: ${draft.logline}.`] : [])
  ];

  return {
    title: `${filmTitle} -> ${festival.name} Submission Prep Pack`,
    match,
    summary: {
      festival: festival.name,
      deadline: festival.deadline,
      fee: festival.entryFee,
      prizeMoney: festival.prizeMoney,
      matchTier: match.tier,
      matchScore: match.score,
      readinessScore: readiness.score,
      readinessTier: readiness.tier,
      feeDecision: feeDecision.label
    },
    readiness,
    submissionAngle,
    feeDecision,
    materialsByPhase,
    timeline,
    materials,
    exportNotes,
    positioning,
    watchouts: watchouts.length ? watchouts : ["No major cautions recorded, but verify current rules before submitting."],
    notes: [
      draft.synopsis ? `Synopsis draft: ${draft.synopsis}` : "Synopsis draft: not added yet.",
      draft.directorStatement ? `Director statement draft: ${draft.directorStatement}` : "Director statement draft: not added yet.",
      draft.privateNotes ? `Private notes: ${draft.privateNotes}` : "Private notes: none."
    ]
  };
}

function uniqueList(items) {
  return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))];
}

export function buildFestivalIntelligence(festival, profile = {}, focus = "Acceptance strategy", now = new Date()) {
  const match = scoreFestivalMatch(festival, profile, now);
  const days = daysUntil(festival.deadline, now);
  const contentType = profile.contentType || festival.contentTypes[0] || "AI film";
  const runtime = Number(profile.runtime || 0);
  const feeLimit = Number(profile.maxFee || 0);
  const title = profile.title || "your film";
  const urgent = days >= 0 && days <= 14;
  const closed = days < 0 || festival.status === "Closed";

  const acceptanceAngles = uniqueList([
    match.tier === "Strong fit"
      ? `${title} already lines up with the strongest eligibility signals; spend the effort on positioning and polish.`
      : `${title} needs a sharper submission angle before this becomes a confident target.`,
    runtime && runtime <= festival.duration.max
      ? `Use the ${runtime}-minute runtime as a programming advantage because it fits the ${festival.duration.min}-${festival.duration.max} minute window.`
      : runtime
        ? `Runtime is a concern; verify whether the festival will accept a ${runtime}-minute cut before paying.`
        : `Confirm the final runtime against the ${festival.duration.min}-${festival.duration.max} minute window.`,
    festival.contentTypes.includes(contentType)
      ? `${contentType} is listed by the festival, so frame the film inside that category rather than as a generic AI experiment.`
      : `The festival does not clearly list ${contentType}; lead with story, craft, and the nearest accepted category.`,
    ...(festival.strategyNotes || []).slice(0, 3)
  ]);

  const programmerLens = uniqueList([
    festival.confidence >= 85
      ? "Expect a more competitive pool; the submission needs to feel like finished cinema, not just a tool demo."
      : "Verify the event footprint first, then decide whether the listing is worth the fee.",
    festival.location.mode === "Online"
      ? "Online programs often reward immediate clarity, strong thumbnails, and concise statements."
      : festival.location.mode === "Hybrid"
        ? "Hybrid programs can value both online accessibility and live-screening polish."
        : "Physical screenings usually put more weight on audience readiness, sound mix, and festival-room pacing.",
    festival.prizeMoney > 0
      ? `Prize money is listed at ${formatMoney(festival.prizeMoney)}, so make sure the awards language and payout rules are current.`
      : "No prize money is listed; judge the value by visibility, networking, feedback, or laurels."
  ]);

  const riskChecks = uniqueList([
    ...match.cautions,
    ...(festival.redFlags || []),
    feeLimit && festival.entryFee > feeLimit
      ? `Entry fee is above your $${feeLimit} comfort zone.`
      : "",
    urgent ? "Deadline is close; submit only if materials are already clean." : "",
    closed ? "Submission window appears closed." : "",
    profile.publicAlready && /premiere preferred|premiere only/iu.test(festival.premiereStatus)
      ? `Premiere language may conflict with a film that is already public: ${festival.premiereStatus}.`
      : "",
    festival.confidence < 75 ? "Confidence is below premium-directory level; re-check organizer, rules, and submission URL." : ""
  ]);

  const prepMoves = uniqueList([
    ...(festival.checklist || []).slice(0, 4),
    "Write a one-paragraph submission note that explains why AI was necessary to the piece.",
    "Save a screenshot or PDF of the current rules before paying the entry fee.",
    urgent ? "Prepare the upload, poster, stills, synopsis, and AI disclosure before opening the submission page." : ""
  ]);

  const communitySignals = (festival.communitySignals || []).map((signal) => ({
    label: signal.label,
    tone: signal.tone,
    summary: signal.summary
  }));

  const valueVerdict =
    closed ? "Do not submit right now"
      : festival.entryFee === 0 ? "Strong value"
        : feeLimit && festival.entryFee > feeLimit ? "Submit selectively"
          : match.score >= 78 ? "Worth shortlisting"
            : "Verify before paying";

  return {
    festivalId: festival.id,
    festivalName: festival.name,
    focus,
    match,
    daysUntilDeadline: days,
    urgency: closed ? "Closed" : urgent ? "Act soon" : "Planning window",
    valueVerdict,
    acceptanceAngles,
    programmerLens,
    riskChecks: riskChecks.length ? riskChecks : ["No major risks recorded, but always verify current rules before paying."],
    prepMoves,
    communitySignals,
    scorecards: {
      matchScore: match.score,
      confidence: festival.confidence,
      fee: festival.entryFee,
      prizeMoney: festival.prizeMoney,
      risks: riskChecks.length,
      signals: communitySignals.length
    }
  };
}

export function intelligenceToText(brief) {
  const lines = [
    `${brief.festivalName} Intelligence Brief`,
    "",
    `Focus: ${brief.focus}`,
    `Fit: ${brief.match.tier} (${brief.match.score}/100)`,
    `Urgency: ${brief.urgency}`,
    `Value: ${brief.valueVerdict}`,
    "",
    "Acceptance Angles",
    ...brief.acceptanceAngles.map((item) => `- ${item}`),
    "",
    "Programmer Lens",
    ...brief.programmerLens.map((item) => `- ${item}`),
    "",
    "Risk Checks",
    ...brief.riskChecks.map((item) => `- ${item}`),
    "",
    "Prep Moves",
    ...brief.prepMoves.map((item) => `- [ ] ${item}`),
    "",
    "Community-Style Signals",
    ...(brief.communitySignals.length
      ? brief.communitySignals.map((signal) => `- ${signal.label} (${signal.tone}): ${signal.summary}`)
      : ["- No community-style signals recorded yet."])
  ];
  return lines.join("\n");
}

const BACKUP_SECTION_LABELS = {
  filmProfile: "Film profile",
  filmLibrary: "Film library",
  prepDraft: "Prep draft",
  pipelineItems: "Submission pipeline",
  deviceLabIssues: "Device lab issues",
  betaFeedbackItems: "Beta feedback",
  roadmapItems: "Roadmap and changelog",
  submissions: "Submission tracker",
  promotedFestivals: "Promoted festivals",
  organizerCandidates: "Radar candidates",
  rejectedCandidates: "Rejected candidate IDs",
  scoutRuns: "Scout run log",
  radarAudit: "Radar audit trail",
  watchSources: "Watch sources",
  watchRuns: "Watch pass log",
  accessState: "Access state",
  onboarding: "Onboarding state",
  preferences: "User preferences"
};

export const BACKUP_SECTION_KEYS = Object.keys(BACKUP_SECTION_LABELS);

function cloneJson(value, fallback) {
  return JSON.parse(JSON.stringify(value ?? fallback));
}

function countBackupSection(value) {
  if (Array.isArray(value)) {
    return value.length;
  }
  if (value && typeof value === "object") {
    return Object.keys(value).length ? 1 : 0;
  }
  return value ? 1 : 0;
}

export function summarizeBackupSections(sections = {}) {
  const entries = BACKUP_SECTION_KEYS.map((key) => {
    const value = sections[key];
    const present = value !== undefined;
    return {
      key,
      label: BACKUP_SECTION_LABELS[key],
      present,
      count: present ? countBackupSection(value) : 0,
      kind: Array.isArray(value) ? "list" : value && typeof value === "object" ? "record" : "value"
    };
  });
  return {
    entries,
    presentSections: entries.filter((entry) => entry.present).length,
    totalRecords: entries.reduce((total, entry) => total + entry.count, 0)
  };
}

export function createWorkspaceBackup(snapshot = {}, now = new Date()) {
  const sections = {
    filmProfile: cloneJson(snapshot.filmProfile, {}),
    filmLibrary: cloneJson(snapshot.filmLibrary, {}),
    prepDraft: cloneJson(snapshot.prepDraft, {}),
    pipelineItems: cloneJson(snapshot.pipelineItems, []),
    deviceLabIssues: cloneJson(snapshot.deviceLabIssues, []),
    betaFeedbackItems: cloneJson(snapshot.betaFeedbackItems, []),
    roadmapItems: cloneJson(snapshot.roadmapItems, []),
    submissions: cloneJson(snapshot.submissions, []),
    promotedFestivals: cloneJson(snapshot.promotedFestivals, []),
    organizerCandidates: cloneJson(snapshot.organizerCandidates, []),
    rejectedCandidates: cloneJson(snapshot.rejectedCandidates, []),
    scoutRuns: cloneJson(snapshot.scoutRuns, []),
    radarAudit: cloneJson(snapshot.radarAudit, []),
    watchSources: cloneJson(snapshot.watchSources, []),
    watchRuns: cloneJson(snapshot.watchRuns, []),
    accessState: cloneJson(snapshot.accessState, {}),
    onboarding: cloneJson(snapshot.onboarding, {}),
    preferences: cloneJson(snapshot.preferences, {})
  };
  const summary = summarizeBackupSections(sections);
  return {
    product: "LaurelPilot",
    schemaVersion: 1,
    exportedAt: now.toISOString(),
    summary: {
      sections: summary.presentSections,
      records: summary.totalRecords
    },
    sections
  };
}

export function parseWorkspaceBackupText(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return {
      backup: null,
      sections: {},
      summary: summarizeBackupSections({}),
      errors: ["Paste a LaurelPilot backup JSON file before restoring."],
      warnings: []
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    return {
      backup: null,
      sections: {},
      summary: summarizeBackupSections({}),
      errors: [`Backup JSON could not be parsed: ${error.message}`],
      warnings: []
    };
  }

  const warnings = [];
  if (parsed.product && parsed.product !== "LaurelPilot") {
    warnings.push(`Backup product is "${parsed.product}", not LaurelPilot.`);
  }
  if (parsed.schemaVersion && Number(parsed.schemaVersion) > 1) {
    warnings.push(`Backup schema version ${parsed.schemaVersion} is newer than this app expects.`);
  }

  const sourceSections = parsed.sections && typeof parsed.sections === "object" ? parsed.sections : parsed;
  const sections = {};
  BACKUP_SECTION_KEYS.forEach((key) => {
    if (sourceSections[key] !== undefined) {
      sections[key] = sourceSections[key];
    }
  });

  const unknownKeys = Object.keys(sourceSections).filter(
    (key) => !BACKUP_SECTION_KEYS.includes(key) && !["product", "schemaVersion", "exportedAt", "summary", "sections"].includes(key)
  );
  if (unknownKeys.length) {
    warnings.push(`Ignored unknown sections: ${unknownKeys.slice(0, 6).join(", ")}.`);
  }
  if (!Object.keys(sections).length) {
    return {
      backup: parsed,
      sections,
      summary: summarizeBackupSections(sections),
      errors: ["Backup did not contain any restorable LaurelPilot sections."],
      warnings
    };
  }

  return {
    backup: parsed,
    sections,
    summary: summarizeBackupSections(sections),
    errors: [],
    warnings
  };
}

export const DEMO_WORKSPACE_ID = "laurelpilot-demo-2026";

export const DEMO_TOUR_STEPS = [
  {
    view: "films",
    label: "Film Library",
    title: "Start with a believable film slate",
    detail: "Shows how one active film can drive matching, prep, pipeline, and strategy tools."
  },
  {
    view: "match",
    label: "Match",
    title: "Show the fit engine",
    detail: "Ranks festivals against runtime, region, mode, fee comfort, goal, and premiere risk."
  },
  {
    view: "intelligence",
    label: "Intelligence",
    title: "Open a festival strategy brief",
    detail: "Turns a festival listing into positioning tips, risk checks, and programmer-facing angles."
  },
  {
    view: "prep",
    label: "Prep Pack",
    title: "Export submission materials",
    detail: "Builds a festival-specific checklist, notes packet, and positioning guide."
  },
  {
    view: "pipeline",
    label: "Pipeline",
    title: "Track every opportunity",
    detail: "Makes the product feel like a submission command board instead of a directory."
  },
  {
    view: "launch",
    label: "Launch QA",
    title: "Close with product readiness",
    detail: "Uses the seeded workspace to show that backups, sources, access, and workflows are launchable."
  }
];

function demoDate(now, dayOffset = 0) {
  return new Date(now.getTime() + dayOffset * DAY_MS).toISOString();
}

function withDemoFlag(record) {
  return {
    ...record,
    demo: true
  };
}

function createDemoFestival({
  id,
  name,
  shortName,
  deadline,
  city,
  country,
  region,
  mode,
  prizeMoney,
  entryFee,
  duration,
  contentTypes,
  description,
  fitSummary,
  confidence,
  strategyNotes,
  greenFlags,
  redFlags = [],
  communitySignals = []
}) {
  return {
    id,
    name,
    shortName,
    status: "Accepting Submissions",
    deadline,
    notificationDate: deadline.slice(0, 10),
    eventDate: deadline.slice(0, 10),
    location: {
      city,
      country,
      region,
      mode
    },
    prizeMoney,
    entryFee,
    frequency: "Annual",
    duration,
    contentTypes,
    formats: ["MP4", "MOV", "H.264"],
    premiereStatus: "Any premiere status accepted",
    language: "English subtitles required for non-English dialogue",
    aspectRatio: ["16:9", "2.39:1"],
    description,
    websiteUrl: `https://example.com/${id}`,
    submissionUrl: `https://example.com/${id}/submit`,
    sourceType: "Demo verified source",
    lastVerified: "2026-05-07",
    confidence,
    fitSummary,
    strategyNotes,
    greenFlags,
    redFlags,
    communitySignals,
    checklist: [
      "Confirm current-year rules before paying",
      "Prepare final export and subtitles",
      "Save confirmation after submission",
      "Export a Data Vault backup"
    ],
    pastWinners: ["Afterimage Choir", "The Machine Dreams in Color"],
    promotedFromCandidateId: `${id}-candidate`,
    demo: true
  };
}

export function createDemoWorkspace(now = new Date("2026-05-07T12:00:00Z")) {
  const createdAt = now.toISOString();
  const filmProfile = {
    title: "Signal Bloom",
    runtime: 8,
    contentType: "Animation",
    goal: "Prestige",
    region: "North America",
    mode: "Hybrid",
    maxFee: 35,
    publicAlready: false
  };
  const signalBloom = withDemoFlag(normalizeFilmProject({
    id: "demo-film-signal-bloom",
    ...filmProfile,
    stage: "Festival strategy",
    logline: "A botanist uses a failing machine to translate plant memory into moving images.",
    notes: "Premium demo film built to show matching, prep, and submission planning.",
    createdAt,
    updatedAt: createdAt
  }, filmProfile, now));
  const liminalGarden = withDemoFlag(normalizeFilmProject({
    id: "demo-film-liminal-garden",
    title: "Liminal Garden",
    runtime: 13,
    contentType: "Hybrid",
    goal: "Networking",
    region: "Europe",
    mode: "Physical",
    maxFee: 45,
    publicAlready: true,
    stage: "Submitting",
    logline: "A city garden becomes a shared hallucination after every visitor dreams the same image.",
    notes: "Useful for showing a second film with different region and premiere constraints.",
    createdAt,
    updatedAt: createdAt
  }, filmProfile, now));
  const promotedFestivals = [
    createDemoFestival({
      id: "demo-festival-synthetic-stories-2026",
      name: "Synthetic Stories Showcase",
      shortName: "Synthetic Stories",
      deadline: "2026-06-18T23:59:00-04:00",
      city: "Toronto",
      country: "Canada",
      region: "North America",
      mode: "Hybrid",
      prizeMoney: 8000,
      entryFee: 22,
      duration: { min: 1, max: 12 },
      contentTypes: ["Animation", "Hybrid", "Experimental"],
      confidence: 88,
      description: "Curated showcase for short AI-assisted films that still lead with character, theme, and clear authorship.",
      fitSummary: "Strong demo target for polished AI-native shorts with a human emotional core.",
      strategyNotes: [
        "Lead with the memory and ecology angle, not the tool chain.",
        "Mention the short runtime as a programming advantage.",
        "Use a concise AI process disclosure to reduce jury skepticism."
      ],
      greenFlags: ["Named curators", "Clear rules page", "Hybrid screening path"],
      communitySignals: [
        {
          label: "Programming fit",
          tone: "positive",
          summary: "Festival chatter favors compact AI shorts that feel authored rather than prompt-driven."
        }
      ]
    }),
    createDemoFestival({
      id: "demo-festival-latent-lens-2026",
      name: "Latent Lens Festival",
      shortName: "Latent Lens",
      deadline: "2026-08-02T23:59:00+01:00",
      city: "London",
      country: "United Kingdom",
      region: "Europe",
      mode: "Physical",
      prizeMoney: 12000,
      entryFee: 35,
      duration: { min: 3, max: 20 },
      contentTypes: ["Hybrid", "Documentary", "Experimental"],
      confidence: 82,
      description: "European program focused on AI cinema, media art, documentary experiments, and artist-led moving image work.",
      fitSummary: "Useful for demoing festival strategy when a film is already public and needs careful premiere positioning.",
      strategyNotes: [
        "Position the piece as media art with a festival-room sound mix.",
        "Check whether prior online release affects special program eligibility.",
        "Use the director statement to separate the project from novelty reels."
      ],
      greenFlags: ["Physical venue listed", "Curator names available", "Past selections archived"],
      redFlags: ["Premiere language should be verified before payment"],
      communitySignals: [
        {
          label: "Premiere caution",
          tone: "mixed",
          summary: "Creators often warn that physical European programs may ask tighter premiere questions."
        }
      ]
    })
  ];
  const organizerCandidate = withDemoFlag({
    ...normalizeOrganizerSubmission({
      name: "North Star AI Shorts",
      organizerName: "North Star Screen Lab",
      websiteUrl: "https://example.com/north-star-ai-shorts",
      submissionUrl: "https://example.com/north-star-ai-shorts/submit",
      deadline: "2026-07-24T23:59:00Z",
      eventDate: "2026-09-14",
      city: "Online",
      country: "Global",
      region: "Online",
      mode: "Online",
      entryFee: 12,
      prizeMoney: 1500,
      maxDuration: 10,
      frequency: "Annual",
      description: "Organizer-submitted online AI shorts festival with clear rules and a small prize pool.",
      contentTypes: "Animation, Hybrid, Experimental",
      formats: "MP4, MOV",
      suggestedFit: "Best for short AI films that can be judged quickly online.",
      hasClearRules: true,
      feesTransparent: true,
      prizeDetails: true,
      hasPastEdition: true
    }, now),
    id: "demo-candidate-north-star-ai-shorts"
  });
  const pipelineItems = [
    withDemoFlag(normalizePipelineItem({
      id: "demo-pipeline-runway-signal-bloom",
      festivalId: "runway-aif-2026",
      filmTitle: "Signal Bloom",
      stage: "Preparing",
      priority: "High",
      dueDate: "2026-06-05",
      notes: "Finish director statement, subtitle check, and still pack before opening the submission page.",
      createdAt,
      updatedAt: createdAt
    }, now)),
    withDemoFlag(normalizePipelineItem({
      id: "demo-pipeline-synthetic-signal-bloom",
      festivalId: "demo-festival-synthetic-stories-2026",
      filmTitle: "Signal Bloom",
      stage: "Researching",
      priority: "Medium",
      dueDate: "2026-06-18",
      notes: "Compare against Runway AIF after prep pack export.",
      createdAt,
      updatedAt: createdAt
    }, now)),
    withDemoFlag(normalizePipelineItem({
      id: "demo-pipeline-lifeart-signal-bloom",
      festivalId: "lifeart-ai-2026",
      filmTitle: "Signal Bloom",
      stage: "Submitted",
      priority: "High",
      dueDate: "2026-05-02",
      notes: "Confirmation saved. Follow up after notification date.",
      createdAt,
      updatedAt: createdAt
    }, now))
  ];
  const submissions = [
    {
      festivalId: "lifeart-ai-2026",
      filmTitle: "Signal Bloom",
      submissionDate: "2026-05-02",
      status: "Submitted",
      notes: "Submitted with gallery-focused artist statement and tool disclosure.",
      createdAt,
      updatedAt: createdAt,
      demo: true
    },
    {
      festivalId: "hk-aiiff-2026",
      filmTitle: "Liminal Garden",
      submissionDate: "2026-04-28",
      status: "Pending",
      notes: "Waiting on premiere eligibility clarification before final payment record is archived.",
      createdAt,
      updatedAt: createdAt,
      demo: true
    }
  ];
  const deviceLabIssues = [
    withDemoFlag(normalizeDeviceLabIssue({
      id: "demo-device-mobile-product-pass",
      device: "mobile-stack",
      view: "Product",
      severity: "Polish",
      status: "Fixed",
      title: "Demo hero remains readable on phone viewport",
      notes: "Sample workspace CTA and logo remain visible without crowding the first screen.",
      createdAt,
      updatedAt: createdAt
    }, now)),
    withDemoFlag(normalizeDeviceLabIssue({
      id: "demo-device-tablet-pipeline-note",
      device: "tablet-drawer",
      view: "Pipeline",
      severity: "Important",
      status: "Open",
      title: "Pipeline cards need one more tablet spacing pass",
      notes: "Useful demo QA note to show how issues can graduate into roadmap work.",
      createdAt,
      updatedAt: createdAt
    }, now))
  ];
  const betaFeedbackItems = [
    withDemoFlag(normalizeBetaFeedbackItem({
      id: "demo-feedback-premium-proof",
      source: "Private filmmaker beta",
      view: "Demo",
      type: "Praise",
      priority: "Medium",
      status: "Fixed",
      title: "Sample workspace makes the product value obvious",
      notes: "Tester understood the subscription value faster after seeing a full festival plan.",
      createdAt,
      updatedAt: createdAt
    }, now)),
    withDemoFlag(normalizeBetaFeedbackItem({
      id: "demo-feedback-calendar-export",
      source: "Private filmmaker beta",
      view: "Calendar",
      type: "Feature request",
      priority: "High",
      status: "Planned",
      title: "Show calendar export before the paywall pitch",
      notes: "Potential conversion helper for filmmakers who live by festival deadlines.",
      createdAt,
      updatedAt: createdAt
    }, now)),
    withDemoFlag(normalizeBetaFeedbackItem({
      id: "demo-feedback-reset-confidence",
      source: "Founder walkthrough",
      view: "Demo",
      type: "UX note",
      priority: "Low",
      status: "Triaged",
      title: "Keep demo reset visibly separate from real records",
      notes: "Demo reset should reassure users that their non-demo planning data is left alone.",
      createdAt,
      updatedAt: createdAt
    }, now))
  ];
  const roadmapItems = [
    withDemoFlag(normalizeRoadmapItem({
      id: "demo-roadmap-demo-mode",
      title: "Demo Mode and Sample Workspace",
      type: "Feature",
      status: "Shipped",
      impact: "High",
      release: "Beta 0.9",
      owner: "Raymond",
      notes: "One-click sample data for product demos and beta walkthroughs.",
      createdAt: demoDate(now, -2),
      updatedAt: createdAt,
      shippedAt: createdAt
    }, now)),
    withDemoFlag(normalizeRoadmapItem({
      id: "demo-roadmap-billing-copy",
      title: "Tighten launch pricing proof",
      type: "Monetization",
      status: "Next",
      impact: "Revenue critical",
      release: "Beta 1.0",
      owner: "Raymond",
      notes: "Make the paid value ladder obvious without adding payment APIs yet.",
      createdAt,
      updatedAt: createdAt
    }, now)),
    withDemoFlag(normalizeRoadmapItem({
      id: "demo-roadmap-source-proof",
      title: "Source freshness proof cards",
      type: "Data",
      status: "In Progress",
      impact: "High",
      release: "Beta 1.0",
      owner: "Raymond",
      notes: "Show how recently festival sources were checked inside Discover and Detail views.",
      createdAt,
      updatedAt: createdAt
    }, now))
  ];
  const watchSources = [
    withDemoFlag(normalizeWatchSource({
      id: "demo-watch-official-ai-festival-sites",
      name: "Official AI Festival Sites",
      url: "Local source notebook",
      sourceType: "Official festival site",
      status: "Active",
      cadence: "Weekly",
      trustLevel: 5,
      keywords: "AI film festival, generative film submissions, AI shorts deadline",
      coverage: "Official rules, deadlines, prize updates, organizer names",
      note: "Best source type for subscriber-grade confidence.",
      lastChecked: "2026-05-06T10:00:00Z",
      createdAt
    }, now)),
    withDemoFlag(normalizeWatchSource({
      id: "demo-watch-submission-platforms",
      name: "Submission Platform Sweeps",
      url: "Manual platform search queue",
      sourceType: "Submission platform search",
      status: "Active",
      cadence: "Twice weekly",
      trustLevel: 4,
      keywords: "AI, artificial intelligence, generative video, machine cinema",
      coverage: "New listings, changed deadlines, submission page status",
      note: "Use after official source checks to catch new festival listings.",
      lastChecked: "2026-05-03T10:00:00Z",
      createdAt
    }, now)),
    withDemoFlag(normalizeWatchSource({
      id: "demo-watch-community-signals",
      name: "Community Signal Scan",
      url: "Local community digest",
      sourceType: "Community discussion",
      status: "Active",
      cadence: "Weekly",
      trustLevel: 3,
      keywords: "AI filmmaking festival experience, submission feedback, festival legitimacy",
      coverage: "Acceptance stories, fee concerns, organizer reputation",
      note: "Turns public filmmaker chatter into value-added strategy notes.",
      lastChecked: "2026-04-27T10:00:00Z",
      createdAt
    }, now))
  ];
  const watchRuns = [
    {
      id: "demo-watch-run-2026-05-06",
      runAt: "2026-05-06T10:00:00Z",
      mode: "Demo local watch pass",
      sources: 3,
      queries: 9,
      demo: true
    }
  ];
  const scoutRuns = [
    {
      id: "demo-scout-run-2026-05-06",
      runAt: "2026-05-06T10:20:00Z",
      sources: 3,
      leads: 4,
      imported: 1,
      demo: true
    }
  ];
  const radarAudit = [
    createReviewAuditEntry("approved", organizerCandidate, "Demo candidate reviewed and held for Radar walkthrough.", now),
    {
      id: "demo-radar-audit-rejected-discount-page",
      action: "rejected",
      candidateId: "demo-candidate-awards-discount-page",
      candidateName: "Global AI Awards Discount Page",
      score: 38,
      recommendation: "Reject",
      riskLevel: "High",
      note: "Rejected because rules, organizer identity, and prize details were too vague.",
      createdAt: demoDate(now, -1),
      demo: true
    }
  ].map(withDemoFlag);
  const sections = {
    filmProfile,
    filmLibrary: {
      activeId: signalBloom.id,
      projects: [signalBloom, liminalGarden]
    },
    prepDraft: {
      festivalId: "runway-aif-2026",
      filmTitle: "Signal Bloom",
      logline: signalBloom.logline,
      synopsis: "Signal Bloom is an eight-minute AI-assisted animated short about memory, ecology, and the images people leave behind.",
      directorStatement: "The film uses generative video as a translation layer between organic memory and cinematic abstraction.",
      aiTools: "Runway, Midjourney, ElevenLabs, DaVinci Resolve",
      privateNotes: "Demo prep packet should show why the film belongs in AI-native festivals without sounding like a tool demo.",
      demo: true
    },
    pipelineItems,
    deviceLabIssues,
    betaFeedbackItems,
    roadmapItems,
    submissions,
    promotedFestivals,
    organizerCandidates: [organizerCandidate],
    rejectedCandidates: ["demo-candidate-awards-discount-page"],
    scoutRuns,
    radarAudit,
    watchSources,
    watchRuns,
    accessState: withDemoFlag(normalizeAccessState({
      planId: "launch",
      status: "Active",
      activatedAt: createdAt
    }, now)),
    onboarding: withDemoFlag(normalizeOnboardingState({
      completedSteps: ["film-profile", "starter-shortlist", "first-action"],
      shortlistReviewed: true,
      completedAt: createdAt
    }, now)),
    preferences: withDemoFlag(normalizeUserPreferences({
      startView: "demo",
      productMode: "Filmmaker",
      defaultRegion: "North America",
      defaultMode: "Hybrid",
      defaultContentType: "Animation",
      defaultGoal: "Prestige",
      defaultRuntime: 8,
      maxFee: 35,
      includePublicFilms: false,
      localOnlyReminder: true,
      exportReminder: true
    }, now))
  };
  const summary = summarizeBackupSections(sections);
  return {
    id: DEMO_WORKSPACE_ID,
    title: "Signal Bloom Festival Launch Demo",
    createdAt,
    summary: {
      sections: summary.presentSections,
      records: summary.totalRecords,
      activeFilm: filmProfile.title,
      festivalTargets: promotedFestivals.length + 3,
      tourSteps: DEMO_TOUR_STEPS.length
    },
    sections,
    tour: DEMO_TOUR_STEPS
  };
}

export function buildDemoWorkspaceReport(workspace = createDemoWorkspace(), snapshot = {}) {
  const summary = summarizeBackupSections(workspace.sections || {});
  const currentBackup = summarizeBackupSections(snapshot || {});
  const sectionRows = summary.entries
    .filter((entry) => entry.present)
    .map((entry) => ({
      ...entry,
      label: BACKUP_SECTION_LABELS[entry.key] || entry.key
    }));
  const loadedDemoRecords = sectionRows.reduce((total, entry) => total + entry.count, 0);
  const metrics = {
    sections: summary.presentSections,
    records: loadedDemoRecords,
    activeFilm: workspace.summary?.activeFilm || workspace.sections?.filmProfile?.title || "Demo film",
    targetFestivals: workspace.summary?.festivalTargets || 0,
    tourSteps: workspace.tour?.length || 0,
    currentRecords: currentBackup.totalRecords || 0
  };
  const actions = [
    `Load ${metrics.records} sample records across ${metrics.sections} product areas.`,
    `Start the walkthrough with ${metrics.activeFilm}, then open Match, Intelligence, Prep Pack, and Pipeline.`,
    "Use Reset Demo Records when you want a cleaner workspace without touching non-demo records."
  ];
  return {
    id: workspace.id || DEMO_WORKSPACE_ID,
    title: workspace.title || "LaurelPilot Demo Workspace",
    generatedAt: workspace.createdAt || new Date().toISOString(),
    metrics,
    sectionRows,
    tour: workspace.tour || DEMO_TOUR_STEPS,
    actions,
    message: `${metrics.activeFilm} is ready to seed a complete product walkthrough.`
  };
}

export function demoWorkspaceToText(report) {
  const lines = [
    "LaurelPilot Demo Workspace",
    report.title,
    `Generated: ${formatShortDate(report.generatedAt)}`,
    `Sections: ${report.metrics.sections}`,
    `Records: ${report.metrics.records}`,
    `Active film: ${report.metrics.activeFilm}`,
    "",
    "Presenter Tour",
    ...report.tour.map((step, index) => `${index + 1}. ${step.label}: ${step.title} - ${step.detail}`),
    "",
    "Seeded Sections",
    ...report.sectionRows.map((entry) => `- ${entry.label}: ${entry.count} ${entry.kind}`),
    "",
    "Recommended Actions",
    ...report.actions.map((action) => `- ${action}`)
  ];
  return lines.join("\n");
}

export const ACCESS_PLANS = [
  {
    id: "preview",
    name: "Preview",
    price: 0,
    billing: "Free preview",
    badge: "Preview",
    featureLimit: "Limited planning workspace",
    promise: "Let filmmakers see the shape of the product before the paid ask.",
    highlights: ["Festival browsing", "Basic strategy view", "Starter matching"],
    features: ["discover", "intelligence", "match"]
  },
  {
    id: "launch",
    name: "Launch Pass",
    price: 29,
    billing: "$29/year",
    badge: "Best value",
    featureLimit: "Full local festival strategy desk",
    promise: "The full solo-filmmaker planning desk: find festivals, judge fit, prep submissions, and track proof.",
    highlights: ["Source proof", "Submission prep", "Deadline and tracker exports"],
    features: ["discover", "intelligence", "match", "proof", "calendar", "season", "prep", "submissions", "watchlist", "vault", "radar", "import", "organizer", "guide", "exports"]
  },
  {
    id: "studio",
    name: "Studio",
    price: 79,
    billing: "$79/year",
    badge: "Teams later",
    featureLimit: "Multi-film planning and expanded exports",
    promise: "A later studio tier for teams managing several films and heavier release calendars.",
    highlights: ["Multi-film workflow", "Priority review queue", "Team-ready exports"],
    features: ["discover", "intelligence", "match", "proof", "calendar", "season", "prep", "submissions", "watchlist", "vault", "radar", "import", "organizer", "guide", "exports", "multiFilm", "priority", "collaboration"]
  }
];

export const ACCESS_FEATURES = [
  { id: "discover", label: "Festival directory", description: "Search and filter the local festival catalog." },
  { id: "intelligence", label: "Strategy tips", description: "Read positioning notes, risk checks, and acceptance context." },
  { id: "match", label: "Film matching", description: "Rank festivals against a saved film profile." },
  { id: "proof", label: "Source proof", description: "Audit freshness, links, and warning signals before trusting a listing." },
  { id: "calendar", label: "Deadline calendar", description: "Turn deadlines into a submission planning window." },
  { id: "season", label: "Season planner", description: "Choose a budget-smart festival slate for one film." },
  { id: "prep", label: "Prep pack exports", description: "Create festival-specific checklists and positioning packets." },
  { id: "submissions", label: "Submission tracker", description: "Track submissions, statuses, notes, and follow-up work." },
  { id: "watchlist", label: "Source watchlist", description: "Keep a local queue of festival sources to review." },
  { id: "vault", label: "Data Vault", description: "Back up and restore the browser workspace." },
  { id: "radar", label: "Radar review queue", description: "Review new leads before they enter the directory." },
  { id: "import", label: "Lead import", description: "Parse local CSV or JSON festival leads." },
  { id: "organizer", label: "Organizer intake", description: "Normalize organizer-submitted festival leads." },
  { id: "guide", label: "Workflow guide", description: "Walk through first-submission, launch, and power-user paths." },
  { id: "exports", label: "TXT and CSV exports", description: "Copy or download planning artifacts from the browser." }
];

export const VIEW_ACCESS_GATES = [
  {
    view: "proof",
    featureId: "proof",
    label: "Source Proof",
    title: "Source proof is a subscriber trust tool.",
    detail: "Preview users can see the section exists, while Launch Pass unlocks freshness scoring, proof exports, and warnings.",
    bullets: ["Freshness score", "Verified link checks", "Proof report export"]
  },
  {
    view: "calendar",
    featureId: "calendar",
    label: "Deadline Calendar",
    title: "Deadline planning unlocks with Launch Pass.",
    detail: "The paid workflow turns festival dates into a submission calendar with copy, TXT, and ICS exports.",
    bullets: ["Deadline windows", "Budget planning", "Calendar exports"]
  },
  {
    view: "season",
    featureId: "season",
    label: "Season Planner",
    title: "Season planning is part of the paid submission desk.",
    detail: "Launch Pass turns match scores, deadlines, fees, and strategy goals into a practical festival slate.",
    bullets: ["Budget planner", "Priority order", "Pipeline handoff"]
  },
  {
    view: "prep",
    featureId: "prep",
    label: "Prep Pack",
    title: "Prep packs are part of the paid submission desk.",
    detail: "Subscribers can generate festival-specific checklist, positioning, risk, and export notes from local data.",
    bullets: ["Checklist builder", "Positioning notes", "Submission packet export"]
  },
  {
    view: "pipeline",
    featureId: "submissions",
    label: "Submission Pipeline",
    title: "Pipeline tracking is a paid workflow.",
    detail: "Launch Pass unlocks the board that moves festivals from research to prep, submitted, follow-up, and results.",
    bullets: ["Board view", "Stage tracking", "CSV/TXT exports"]
  },
  {
    view: "submissions",
    featureId: "submissions",
    label: "My Submissions",
    title: "Submission history unlocks with Launch Pass.",
    detail: "Subscribers can keep a local record of what was submitted, when, and what happened next.",
    bullets: ["Status tracking", "Notes", "Submission history"]
  },
  {
    view: "scout",
    featureId: "watchlist",
    label: "Source Scout",
    title: "Scout runs are part of the paid curation desk.",
    detail: "Launch Pass unlocks source review plans for finding and checking new festival leads.",
    bullets: ["Source readiness", "Lead review", "Curation queue"]
  },
  {
    view: "watchlist",
    featureId: "watchlist",
    label: "Watchlist",
    title: "The source watchlist unlocks with Launch Pass.",
    detail: "Subscribers can maintain local source cadences and export the next review plan.",
    bullets: ["Review cadence", "Keyword checks", "Source health"]
  },
  {
    view: "vault",
    featureId: "vault",
    label: "Data Vault",
    title: "Workspace backup is a paid trust feature.",
    detail: "Launch Pass unlocks local backup, restore, and private workspace portability tools.",
    bullets: ["Backup", "Restore", "Local archive"]
  },
  {
    view: "import",
    featureId: "import",
    label: "Lead Import",
    title: "Lead import is for subscribers building the directory.",
    detail: "Launch Pass unlocks local CSV/JSON parsing so new leads can enter Radar cleanly.",
    bullets: ["CSV import", "JSON import", "Row-level validation"]
  },
  {
    view: "radar",
    featureId: "radar",
    label: "Radar",
    title: "Radar review is a paid curation workflow.",
    detail: "Subscribers can review, promote, reject, and audit festival leads before they reach Discover.",
    bullets: ["Review queue", "Bulk actions", "Audit log"]
  },
  {
    view: "submit",
    featureId: "organizer",
    label: "Organizer Intake",
    title: "Organizer intake unlocks with Launch Pass.",
    detail: "Launch Pass lets organizers or admins normalize submitted festivals into Radar candidates.",
    bullets: ["Organizer form", "Normalization", "Radar handoff"]
  }
];

export function getAccessPlan(planId = "preview") {
  return ACCESS_PLANS.find((plan) => plan.id === planId) || ACCESS_PLANS[0];
}

export function normalizeAccessState(input = {}, now = new Date()) {
  const plan = getAccessPlan(input.planId);
  const trialStartedAt = input.trialStartedAt || (input.trialActive ? now.toISOString() : "");
  const activatedAt = input.activatedAt || (plan.id !== "preview" ? now.toISOString() : "");
  const expiresAt = input.expiresAt || (plan.id !== "preview"
    ? new Date(now.getTime() + 365 * DAY_MS).toISOString()
    : "");
  return {
    planId: plan.id,
    trialActive: Boolean(input.trialActive),
    trialStartedAt,
    activatedAt,
    expiresAt,
    status: input.status || (plan.id === "preview" ? "Preview" : "Active"),
    updatedAt: now.toISOString()
  };
}

export function getAccessSummary(accessState = {}, now = new Date()) {
  const normalized = normalizeAccessState(accessState, now);
  const plan = getAccessPlan(normalized.planId);
  const trialEndsAt = normalized.trialStartedAt
    ? new Date(parseDate(normalized.trialStartedAt).getTime() + 14 * DAY_MS).toISOString()
    : "";
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((parseDate(trialEndsAt).getTime() - now.getTime()) / DAY_MS))
    : 0;
  const renewalDaysLeft = normalized.expiresAt
    ? Math.max(0, Math.ceil((parseDate(normalized.expiresAt).getTime() - now.getTime()) / DAY_MS))
    : 0;
  const activeFeatureIds = new Set(plan.features);
  const featureRows = ACCESS_FEATURES.map((feature) => ({
    ...feature,
    included: activeFeatureIds.has(feature.id)
  }));
  return {
    plan,
    status: normalized.trialActive ? "Trial" : normalized.status,
    isPaid: plan.id !== "preview",
    trialEndsAt,
    trialDaysLeft,
    renewalDaysLeft,
    includedCount: featureRows.filter((feature) => feature.included).length,
    lockedCount: featureRows.filter((feature) => !feature.included).length,
    featureRows
  };
}

export function canUseAccessFeature(accessState = {}, featureId) {
  return getAccessPlan(accessState.planId).features.includes(featureId);
}

export function getViewAccessGate(view, accessState = {}) {
  const rule = VIEW_ACCESS_GATES.find((gate) => gate.view === view);
  if (!rule) {
    return null;
  }
  const locked = !canUseAccessFeature(accessState, rule.featureId);
  return {
    ...rule,
    locked,
    requiredPlan: "Launch Pass"
  };
}

export function buildAccessConversionPreview(accessState = {}, snapshot = {}, now = new Date()) {
  const summary = getAccessSummary(accessState, now);
  const targetPlan = getAccessPlan(snapshot.targetPlanId || "launch");
  const currentFeatures = new Set(summary.plan.features);
  const targetFeatures = new Set(targetPlan.features);
  const upgradeFeatures = ACCESS_FEATURES.filter((feature) =>
    targetFeatures.has(feature.id) && !currentFeatures.has(feature.id)
  );
  const targetFeatureRows = ACCESS_FEATURES.filter((feature) => targetFeatures.has(feature.id)).map((feature) => ({
    ...feature,
    includedNow: currentFeatures.has(feature.id),
    unlockedByUpgrade: !currentFeatures.has(feature.id)
  }));
  const festivalCount = Number(snapshot.festivalCount || 0);
  const sourceCount = Number(snapshot.sourceCount || festivalCount || 0);
  const verifiedSources = Number(snapshot.verifiedSources || 0);
  const averageSourceTrust = Number(snapshot.averageSourceTrust || 0);
  const plannedSubmissions = Number(snapshot.plannedSubmissions || 0);
  const activeProjects = Number(snapshot.activeProjects || 0);
  const annualPrice = Number(targetPlan.price || 0);
  const monthlyEquivalent = annualPrice ? Number((annualPrice / 12).toFixed(2)) : 0;
  const annualHoursSaved = Math.max(24, Math.round(
    festivalCount * 1.5 +
    targetFeatureRows.length * 3 +
    verifiedSources * 2 +
    plannedSubmissions * 1.5
  ));
  const valueScore = clamp(Math.round(
    42 +
    Math.min(18, festivalCount * 1.6) +
    Math.min(16, verifiedSources * 2.2) +
    Math.min(16, upgradeFeatures.length * 1.8) +
    Math.min(10, averageSourceTrust / 10) +
    Math.min(8, activeProjects * 2) +
    Math.min(8, plannedSubmissions * 2)
  ), 0, 100);
  const valueTier = valueScore >= 86 ? "Launch-ready" : valueScore >= 72 ? "Strong" : valueScore >= 58 ? "Needs proof" : "Thin";
  const statusTone = summary.isPaid ? "green" : summary.status === "Trial" ? "blue" : "amber";
  const message = summary.isPaid
    ? `${targetPlan.name} is active locally. The paywall story now shows the paid product as a complete planning desk.`
    : summary.status === "Trial"
      ? `Trial mode is active locally. The page can show what subscribers unlock before real billing exists.`
      : `${targetPlan.name} should feel like paying for fewer missed deadlines, stronger fit decisions, and cleaner submission prep.`;
  const receiptRows = [
    {
      label: "Directory intelligence",
      value: festivalCount ? `${festivalCount} festival records` : "Local catalog",
      detail: "Searchable AI festival data with deadlines, fees, rules, and requirements."
    },
    {
      label: "Source confidence",
      value: sourceCount ? `${verifiedSources}/${sourceCount} verified` : "Proof layer",
      detail: `Average source trust is ${averageSourceTrust || 0}/100.`
    },
    {
      label: "Unlocked workflow",
      value: `${targetFeatureRows.length} subscriber tools`,
      detail: `${upgradeFeatures.length} more tools open when moving from ${summary.plan.name} to ${targetPlan.name}.`
    },
    {
      label: "Time saved",
      value: `${annualHoursSaved}+ hours/year`,
      detail: "A conservative planning value estimate from search, proof checks, exports, and tracking."
    }
  ];
  const previewCards = [
    {
      label: "Paywall moment",
      title: "Show value before blocking",
      detail: "Let visitors inspect the workflow, then lock the planning tools that turn the directory into a submission system."
    },
    {
      label: "Launch offer",
      title: `${targetPlan.name} at ${formatMoney(annualPrice)}/year`,
      detail: monthlyEquivalent ? `Equivalent to about $${monthlyEquivalent}/month while the product earns trust.` : "Use preview mode until launch pricing is final."
    },
    {
      label: "Subscriber promise",
      title: "A festival strategy desk",
      detail: targetPlan.promise
    }
  ];
  const objections = [
    {
      title: "I can search festival sites myself.",
      response: "True, but the paid value is the organized proof, deadline context, fit scoring, and prep work in one place."
    },
    {
      title: "How do I know listings are current?",
      response: "The Proof layer shows source age, verified links, confidence, and warnings before a listing is subscriber-grade."
    },
    {
      title: "Will this guarantee acceptance?",
      response: "No. It helps filmmakers choose better-fit festivals, avoid weak listings, and prepare cleaner submissions."
    }
  ];
  const actions = summary.isPaid
    ? ["Keep polishing paid-only workflows.", "Next real-world step is payment connection and account persistence."]
    : ["Keep the preview generous enough to prove value.", "Use the local activation button to review the paid experience.", "Connect real payment processing only after the offer feels obvious."];

  return {
    generatedAt: now.toISOString(),
    currentPlan: summary.plan,
    targetPlan,
    status: summary.status,
    statusTone,
    message,
    valueScore,
    valueTier,
    annualPrice,
    monthlyEquivalent,
    annualHoursSaved,
    upgradeFeatureCount: upgradeFeatures.length,
    includedNowCount: targetFeatureRows.filter((feature) => feature.includedNow).length,
    targetFeatureRows,
    upgradeFeatures,
    receiptRows,
    previewCards,
    objections,
    actions,
    metrics: {
      festivalCount,
      sourceCount,
      verifiedSources,
      averageSourceTrust,
      plannedSubmissions,
      activeProjects
    }
  };
}

export function accessConversionToText(report) {
  const lines = [
    "LaurelPilot Access Conversion Preview",
    `Generated: ${formatShortDate(report.generatedAt)}`,
    "",
    "Offer",
    `Current plan: ${report.currentPlan.name}`,
    `Target plan: ${report.targetPlan.name}`,
    `Status: ${report.status}`,
    `Value score: ${report.valueScore}/100 (${report.valueTier})`,
    `Price: ${formatMoney(report.annualPrice)}/year`,
    `Monthly equivalent: $${report.monthlyEquivalent}`,
    `Estimated time saved: ${report.annualHoursSaved}+ hours/year`,
    "",
    "Subscriber Receipt",
    ...report.receiptRows.map((row) => `- ${row.label}: ${row.value} - ${row.detail}`),
    "",
    "Upgrade Unlocks",
    ...(report.upgradeFeatures.length
      ? report.upgradeFeatures.map((feature) => `- ${feature.label}: ${feature.description}`)
      : ["- Current local plan already includes the target-plan tools."]),
    "",
    "Objection Handling",
    ...report.objections.map((item) => `- ${item.title} ${item.response}`),
    "",
    "Next Actions",
    ...report.actions.map((action) => `- ${action}`)
  ];
  return lines.join("\n");
}

export const TRIAL_ONBOARDING_STEPS = [
  {
    id: "proof",
    view: "proof",
    featureId: "proof",
    label: "Trust the listings",
    title: "Audit festival source proof",
    detail: "Check freshness, links, and warnings so the subscriber understands why the directory is worth trusting.",
    outcome: "Confidence before planning"
  },
  {
    id: "calendar",
    view: "calendar",
    featureId: "calendar",
    label: "See the calendar",
    title: "Turn deadlines into a plan",
    detail: "Show the submission window, upcoming pressure, estimated fees, and calendar exports.",
    outcome: "Fewer missed deadlines"
  },
  {
    id: "prep",
    view: "prep",
    featureId: "prep",
    label: "Prepare one submission",
    title: "Generate a prep packet",
    detail: "Build a festival-specific checklist and positioning packet before the filmmaker pays a submission fee.",
    outcome: "Cleaner submission decisions"
  },
  {
    id: "pipeline",
    view: "pipeline",
    featureId: "submissions",
    label: "Track the plan",
    title: "Move it into the pipeline",
    detail: "Capture the chosen festival in the submission board so follow-up does not live in scattered notes.",
    outcome: "Visible progress"
  }
];

export function normalizeTrialProgress(input = {}, now = new Date()) {
  const validIds = new Set(TRIAL_ONBOARDING_STEPS.map((step) => step.id));
  const visited = Array.isArray(input.visited)
    ? input.visited.filter((id, index, list) => validIds.has(id) && list.indexOf(id) === index)
    : [];
  return {
    visited,
    startedAt: input.startedAt || "",
    updatedAt: input.updatedAt || now.toISOString()
  };
}

export function buildTrialOnboardingFlow(accessState = {}, progress = {}, snapshot = {}, now = new Date()) {
  const summary = getAccessSummary(accessState, now);
  const normalized = normalizeTrialProgress(progress, now);
  const visited = new Set(normalized.visited);
  const steps = TRIAL_ONBOARDING_STEPS.map((step, index) => {
    const gate = getViewAccessGate(step.view, accessState);
    const complete = visited.has(step.id);
    const previousComplete = index === 0 || visited.has(TRIAL_ONBOARDING_STEPS[index - 1].id);
    return {
      ...step,
      number: index + 1,
      complete,
      locked: Boolean(gate?.locked),
      ready: !gate?.locked && !complete && previousComplete,
      status: complete ? "Complete" : gate?.locked ? "Locked" : previousComplete ? "Next" : "Queued"
    };
  });
  const completedCount = steps.filter((step) => step.complete).length;
  const nextStep = steps.find((step) => !step.complete && !step.locked) || steps.find((step) => !step.complete) || null;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  const sourceTrust = Number(snapshot.sourceTrust || 0);
  const calendarItems = Number(snapshot.calendarItems || 0);
  const prepReady = Boolean(snapshot.prepReady);
  const pipelineItems = Number(snapshot.pipelineItems || 0);
  const trialLive = summary.status === "Trial" || summary.isPaid;
  const message = !trialLive
    ? "Start the local trial to unlock the guided paid-feature walkthrough."
    : completedCount === steps.length
      ? "Trial walkthrough complete. The paid workflow has been experienced end to end."
      : `Trial walkthrough is live. Next: ${nextStep?.title || "review the paid workflow"}.`;

  return {
    generatedAt: now.toISOString(),
    status: summary.status,
    trialLive,
    trialDaysLeft: summary.status === "Trial" ? summary.trialDaysLeft : 0,
    progressPercent,
    completedCount,
    totalSteps: steps.length,
    nextStep,
    steps,
    message,
    metrics: {
      sourceTrust,
      calendarItems,
      prepReady,
      pipelineItems
    },
    actions: trialLive
      ? ["Start with Proof to establish trust.", "Use Calendar to make urgency visible.", "Build one Prep Pack before tracking it in Pipeline."]
      : ["Start the local trial from Access.", "Use the locked previews to explain what unlocks.", "Do not connect real billing until the trial path feels obvious."]
  };
}

export function trialOnboardingToText(flow) {
  const lines = [
    "LaurelPilot Trial Onboarding Flow",
    `Generated: ${formatShortDate(flow.generatedAt)}`,
    `Status: ${flow.status}`,
    `Progress: ${flow.completedCount}/${flow.totalSteps} (${flow.progressPercent}%)`,
    `Next: ${flow.nextStep?.title || "Complete"}`,
    "",
    "Trial Steps",
    ...flow.steps.map((step) => `${step.number}. ${step.title} [${step.status}] - ${step.detail}`),
    "",
    "Trial Metrics",
    `Source trust: ${flow.metrics.sourceTrust}/100`,
    `Calendar items: ${flow.metrics.calendarItems}`,
    `Prep ready: ${flow.metrics.prepReady ? "Yes" : "No"}`,
    `Pipeline items: ${flow.metrics.pipelineItems}`,
    "",
    "Actions",
    ...flow.actions.map((action) => `- ${action}`)
  ];
  return lines.join("\n");
}

export const DEFAULT_USER_PREFERENCES = {
  startView: "product",
  productMode: "Filmmaker",
  defaultRegion: "Any",
  defaultMode: "Any",
  defaultContentType: "Animation",
  defaultGoal: "Prestige",
  defaultRuntime: 8,
  maxFee: 35,
  includePublicFilms: false,
  localOnlyReminder: true,
  exportReminder: true
};

const PREFERENCE_OPTIONS = {
  startView: ["product", "onboarding", "demo", "films", "guide", "discover", "proof", "calendar", "season", "match", "launch", "device", "feedback", "roadmap"],
  productMode: ["Filmmaker", "Curator", "Launch QA", "Studio"],
  defaultRegion: ["Any", "North America", "Europe", "Asia", "Online"],
  defaultMode: ["Any", "Physical", "Hybrid", "Online"],
  defaultContentType: ["Animation", "Live Action", "Hybrid", "Documentary", "Experimental", "Music Video"],
  defaultGoal: ["Prestige", "Networking", "Prize money", "Audience feedback"]
};

const START_VIEW_LABELS = {
  product: "Product",
  onboarding: "Start",
  demo: "Demo",
  films: "Films",
  guide: "Guide",
  discover: "Discover",
  proof: "Proof",
  calendar: "Calendar",
  season: "Season Plan",
  match: "Match",
  launch: "Launch QA",
  device: "Device Lab",
  feedback: "Feedback",
  roadmap: "Roadmap"
};

function normalizeOption(value, key) {
  return PREFERENCE_OPTIONS[key].includes(value) ? value : DEFAULT_USER_PREFERENCES[key];
}

export function normalizeUserPreferences(input = {}, now = new Date()) {
  return {
    startView: normalizeOption(input.startView, "startView"),
    productMode: normalizeOption(input.productMode, "productMode"),
    defaultRegion: normalizeOption(input.defaultRegion, "defaultRegion"),
    defaultMode: normalizeOption(input.defaultMode, "defaultMode"),
    defaultContentType: normalizeOption(input.defaultContentType, "defaultContentType"),
    defaultGoal: normalizeOption(input.defaultGoal, "defaultGoal"),
    defaultRuntime: clamp(Number(input.defaultRuntime || DEFAULT_USER_PREFERENCES.defaultRuntime), 1, 180),
    maxFee: clamp(Number(input.maxFee ?? DEFAULT_USER_PREFERENCES.maxFee), 0, 150),
    includePublicFilms: Boolean(input.includePublicFilms),
    localOnlyReminder: input.localOnlyReminder !== false,
    exportReminder: input.exportReminder !== false,
    updatedAt: input.updatedAt || now.toISOString()
  };
}

export function preferencesToFilmProfile(preferences = {}, currentProfile = {}) {
  const normalized = normalizeUserPreferences(preferences);
  return {
    title: currentProfile.title || "",
    runtime: normalized.defaultRuntime,
    contentType: normalized.defaultContentType,
    goal: normalized.defaultGoal,
    region: normalized.defaultRegion,
    mode: normalized.defaultMode,
    maxFee: normalized.maxFee,
    publicAlready: normalized.includePublicFilms
  };
}

export function buildSettingsSummary(preferences = {}, snapshot = {}) {
  const normalized = normalizeUserPreferences(preferences);
  const profileSeed = preferencesToFilmProfile(normalized, snapshot.currentProfile || {});
  const localDataCount = Number(snapshot.localDataCount || 0);
  const launchScore = Number(snapshot.launchScore || 0);
  const privacyScore =
    (normalized.localOnlyReminder ? 40 : 0) +
    (normalized.exportReminder ? 25 : 0) +
    (localDataCount > 0 ? 20 : 0) +
    (normalized.startView ? 15 : 0);
  const cards = [
    {
      id: "startup",
      label: "Startup workspace",
      value: START_VIEW_LABELS[normalized.startView] || normalized.startView,
      detail: `Open ${START_VIEW_LABELS[normalized.startView] || normalized.startView} when no route is specified.`
    },
    {
      id: "profile",
      label: "Default film profile",
      value: `${normalized.defaultContentType}, ${normalized.defaultRuntime} min`,
      detail: `${normalized.defaultGoal} goal in ${normalized.defaultRegion}.`
    },
    {
      id: "fees",
      label: "Fee tolerance",
      value: `$${normalized.maxFee}`,
      detail: normalized.maxFee <= 25 ? "Cost-conscious targeting." : normalized.maxFee <= 60 ? "Balanced festival spend." : "Premium submission tolerance."
    },
    {
      id: "privacy",
      label: "Local data posture",
      value: `${privacyScore}/100`,
      detail: normalized.localOnlyReminder ? "Local-only reminders are visible." : "Local-only reminder is hidden."
    }
  ];
  const actions = [
    `Apply ${normalized.defaultContentType} defaults to the Match profile when starting a new film.`,
    normalized.exportReminder ? "Export a Data Vault backup before demos or browser storage cleanup." : "Consider turning backup reminders on before public testing.",
    launchScore >= 74 ? "Use Launch QA as a periodic readiness check." : "Run Launch QA again after preferences and onboarding are set."
  ];
  return {
    preferences: normalized,
    profileSeed,
    cards,
    privacyScore,
    localDataCount,
    actions,
    summary: `${normalized.productMode} mode, ${normalized.defaultRegion} focus, $${normalized.maxFee} fee ceiling.`
  };
}

export function settingsSummaryToText(summary) {
  const lines = [
    "LaurelPilot Preferences",
    summary.summary,
    "",
    "Defaults",
    `- Start view: ${START_VIEW_LABELS[summary.preferences.startView] || summary.preferences.startView}`,
    `- Product mode: ${summary.preferences.productMode}`,
    `- Region: ${summary.preferences.defaultRegion}`,
    `- Content type: ${summary.preferences.defaultContentType}`,
    `- Runtime: ${summary.preferences.defaultRuntime} minutes`,
    `- Fee ceiling: $${summary.preferences.maxFee}`,
    "",
    "Suggested Actions",
    ...summary.actions.map((action) => `- ${action}`)
  ];
  return lines.join("\n");
}

export const ONBOARDING_STEPS = [
  {
    id: "film-profile",
    label: "Film profile",
    description: "Add title, runtime, and format so matching has something real to work with."
  },
  {
    id: "submission-goals",
    label: "Submission goals",
    description: "Pick the goal, region, mode, and fee comfort zone."
  },
  {
    id: "starter-shortlist",
    label: "Starter shortlist",
    description: "Review the first recommended festivals before building a prep pack."
  },
  {
    id: "first-action",
    label: "First action",
    description: "Choose the next workspace: Intelligence, Prep Pack, Discover, or Submissions."
  }
];

export function normalizeOnboardingState(input = {}, now = new Date()) {
  const completedSteps = Array.isArray(input.completedSteps) ? input.completedSteps : [];
  return {
    completedSteps: [...new Set(completedSteps.filter((step) => ONBOARDING_STEPS.some((item) => item.id === step)))],
    shortlistReviewed: Boolean(input.shortlistReviewed),
    dismissed: Boolean(input.dismissed),
    startedAt: input.startedAt || now.toISOString(),
    completedAt: input.completedAt || "",
    updatedAt: now.toISOString()
  };
}

export function buildOnboardingGuide(festivals, profile = {}, onboardingState = {}, now = new Date()) {
  const normalized = normalizeOnboardingState(onboardingState, now);
  const topMatches = rankFestivalMatches(festivals, profile, now)
    .filter((match) => match.festival.status !== "Closed")
    .slice(0, 3);
  const profileReady = Boolean(profile.title && Number(profile.runtime) > 0 && profile.contentType);
  const goalsReady = Boolean(profile.goal && profile.region && profile.mode && Number(profile.maxFee) >= 0);
  const stepRows = ONBOARDING_STEPS.map((step) => {
    const complete =
      normalized.completedSteps.includes(step.id) ||
      (step.id === "film-profile" && profileReady) ||
      (step.id === "submission-goals" && goalsReady) ||
      (step.id === "starter-shortlist" && normalized.shortlistReviewed) ||
      (step.id === "first-action" && Boolean(normalized.completedAt));
    return {
      ...step,
      complete
    };
  });
  const completedCount = stepRows.filter((step) => step.complete).length;
  const nextStep = stepRows.find((step) => !step.complete) || stepRows.at(-1);
  const strongFits = topMatches.filter((match) => match.score >= 78).length;
  const urgentMatches = topMatches.filter((match) => {
    const days = daysUntil(match.festival.deadline, now);
    return days >= 0 && days <= 14;
  }).length;

  return {
    progress: Math.round((completedCount / stepRows.length) * 100),
    completedCount,
    totalSteps: stepRows.length,
    nextStep,
    steps: stepRows,
    topMatches,
    strongFits,
    urgentMatches,
    suggestedActions: [
      topMatches[0] ? `Open Strategy Tips for ${topMatches[0].festival.name}.` : "Add or approve festival records before shortlisting.",
      topMatches[0] ? `Build a prep pack for ${topMatches[0].festival.name}.` : "Use Discover to browse the starter directory.",
      "Export a Data Vault backup after setup so the workspace can be moved later."
    ]
  };
}

export const APP_SHELL_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/logic.js",
  "/festivals.js",
  "/manifest.webmanifest",
  "/assets/laurelpilot-logo.svg"
];

export function buildAppShellReport(status = {}) {
  const checks = [
    {
      id: "manifest",
      label: "Install metadata",
      ready: Boolean(status.manifestLinked),
      detail: "Manifest file is linked in the document head."
    },
    {
      id: "service-worker",
      label: "Offline worker",
      ready: Boolean(status.serviceWorkerAvailable && status.serviceWorkerRegistered),
      detail: status.serviceWorkerAvailable ? "Browser supports service workers." : "Browser does not support service workers."
    },
    {
      id: "cache",
      label: "App shell cache",
      ready: Boolean(status.cacheReady),
      detail: `${Number(status.cachedAssets || 0)}/${APP_SHELL_ASSETS.length} shell files available locally.`
    },
    {
      id: "network",
      label: "No external API dependency",
      ready: Boolean(status.noExternalApi),
      detail: "The app shell runs from local browser storage and static files."
    },
    {
      id: "install",
      label: "Install mode",
      ready: Boolean(status.installPromptReady || status.installed),
      detail: status.installed ? "Running as an installed app." : status.installPromptReady ? "Install prompt is ready." : "Install prompt may appear after browser eligibility checks."
    }
  ];
  const readyCount = checks.filter((check) => check.ready).length;
  return {
    checks,
    readyCount,
    totalChecks: checks.length,
    readiness: Math.round((readyCount / checks.length) * 100),
    installed: Boolean(status.installed),
    online: status.online !== false,
    mode: status.installed ? "Installed" : status.online === false ? "Offline capable" : "Browser tab",
    summary: readyCount === checks.length
      ? "LaurelPilot is ready as an installable local-first app."
      : `${readyCount}/${checks.length} install checks are ready.`
  };
}

export function buildLaunchReadinessReport(snapshot = {}, now = new Date()) {
  const festivalList = Array.isArray(snapshot.festivals) ? snapshot.festivals : [];
  const candidateList = Array.isArray(snapshot.candidates) ? snapshot.candidates : [];
  const submissions = Array.isArray(snapshot.submissions) ? snapshot.submissions : [];
  const watchSources = Array.isArray(snapshot.watchSources) ? snapshot.watchSources : [];
  const radarAudit = Array.isArray(snapshot.radarAudit) ? snapshot.radarAudit : [];
  const prepDraft = snapshot.prepDraft || {};
  const festivalSummary = summarizeFestivals(festivalList, now);
  const watchSummary = summarizeWatchSources(watchSources, now);
  const backupSummary = summarizeBackupSections(snapshot.backupSections || snapshot.backup?.sections || {});
  const accessPlan = ACCESS_PLANS.find((plan) => plan.id === "launch") || ACCESS_PLANS[1];
  const onboarding = buildOnboardingGuide(
    festivalList,
    snapshot.filmProfile || {},
    snapshot.onboarding || {},
    now
  );
  const appShell = buildAppShellReport(snapshot.installStatus || {});
  const highConfidence = festivalList.filter((festival) => Number(festival.confidence || 0) >= 80).length;
  const lowConfidence = festivalList.filter((festival) => Number(festival.confidence || 0) < 60).length;
  const candidateScores = candidateList.map((candidate) => scoreRadarCandidate(candidate));
  const reviewableCandidates = candidateScores.filter((score) => score.recommendation !== "Reject").length;
  const profileReady = Boolean(snapshot.filmProfile?.title && Number(snapshot.filmProfile?.runtime) > 0 && snapshot.filmProfile?.contentType);
  const prepReady = Boolean(prepDraft.festivalId || prepDraft.filmTitle || submissions.length);

  const checks = [
    {
      id: "directory",
      area: "Festival Directory",
      weight: 14,
      ready: festivalList.length >= 6 && festivalSummary.accepting >= 2,
      score: Math.round(14 * Math.min(1, (festivalList.length / 6) * 0.65 + (festivalSummary.accepting / 2) * 0.35)),
      metric: `${festivalList.length} records`,
      detail: `${festivalSummary.accepting} accepting submissions, ${festivalSummary.urgent} urgent deadlines.`,
      nextAction: "Approve or import more festival leads until the directory has enough live choices."
    },
    {
      id: "quality",
      area: "Data Quality",
      weight: 12,
      ready: highConfidence >= Math.min(3, festivalList.length) && lowConfidence <= 1,
      score: Math.round(12 * Math.min(1, (highConfidence / 3) * 0.8 + (lowConfidence <= 1 ? 0.2 : 0))),
      metric: `${highConfidence} strong records`,
      detail: `${lowConfidence} public records are below 60% confidence.`,
      nextAction: "Use Radar to reject weak records or verify their official rules, organizer, and submission links."
    },
    {
      id: "onboarding",
      area: "Filmmaker Setup",
      weight: 12,
      ready: onboarding.progress >= 75 || (profileReady && onboarding.topMatches.length > 0),
      score: Math.round(12 * Math.min(1, onboarding.progress / 100)),
      metric: `${onboarding.progress}% setup`,
      detail: `${onboarding.strongFits} strong starter matches and ${onboarding.urgentMatches} time-sensitive matches.`,
      nextAction: "Complete the first-run profile and review the starter shortlist."
    },
    {
      id: "submission-utility",
      area: "Submission Utility",
      weight: 12,
      ready: prepReady || onboarding.topMatches.length > 0,
      score: Math.round(12 * Math.min(1, (onboarding.topMatches.length / 3) * 0.7 + (prepReady ? 0.3 : 0))),
      metric: `${onboarding.topMatches.length} match options`,
      detail: `${submissions.length} tracked submissions and ${prepReady ? "prep data present" : "prep data not started"}.`,
      nextAction: "Generate one prep pack and mark a sample submission so the paid workflow feels complete."
    },
    {
      id: "discovery-pipeline",
      area: "Discovery Pipeline",
      weight: 14,
      ready: watchSummary.active >= 3 && watchSummary.highTrust >= 2 && watchSummary.keywordCount >= 6,
      score: Math.round(14 * Math.min(1, (watchSummary.active / 3) * 0.45 + (watchSummary.highTrust / 2) * 0.35 + (watchSummary.keywordCount / 6) * 0.2)),
      metric: `${watchSummary.active} active sources`,
      detail: `${watchSummary.highTrust} high-trust sources and ${watchSummary.keywordCount} tracked keywords.`,
      nextAction: "Add more high-trust official festival sources and keyword coverage."
    },
    {
      id: "curation",
      area: "Curation Workflow",
      weight: 12,
      ready: candidateList.length >= 2 && (reviewableCandidates >= 1 || radarAudit.length >= 1),
      score: Math.round(12 * Math.min(1, (candidateList.length / 2) * 0.55 + (reviewableCandidates / 1) * 0.25 + (radarAudit.length ? 0.2 : 0))),
      metric: `${candidateList.length} candidates`,
      detail: `${reviewableCandidates} candidates can pass review, ${radarAudit.length} review actions logged.`,
      nextAction: "Run a Radar review pass so the product shows a credible curation trail."
    },
    {
      id: "access",
      area: "Access And Pricing",
      weight: 12,
      ready: Boolean(accessPlan?.price) && accessPlan.features.length >= 8,
      score: Math.round(12 * Math.min(1, (Number(accessPlan?.price || 0) > 0 ? 0.35 : 0) + (accessPlan.features.length / 8) * 0.65)),
      metric: accessPlan ? accessPlan.billing : "No plan",
      detail: `${accessPlan?.name || "Launch plan"} includes ${accessPlan?.features.length || 0} product capabilities.`,
      nextAction: "Keep pricing simple and connect the real payment layer only when the product is worth charging for."
    },
    {
      id: "local-reliability",
      area: "Local Reliability",
      weight: 12,
      ready: appShell.readyCount >= 4 && backupSummary.presentSections >= 10,
      score: Math.round(12 * Math.min(1, (appShell.readyCount / appShell.totalChecks) * 0.58 + (backupSummary.presentSections / 10) * 0.42)),
      metric: `${appShell.readyCount}/${appShell.totalChecks} shell checks`,
      detail: `${backupSummary.presentSections} backup sections and ${backupSummary.totalRecords} local records covered.`,
      nextAction: "Run the install check and export a Data Vault backup before public testing."
    }
  ];
  const score = Math.min(100, checks.reduce((total, check) => total + check.score, 0));
  const readyCount = checks.filter((check) => check.ready).length;
  const blockers = checks.filter((check) => !check.ready);
  const stage =
    score >= 88 && blockers.length <= 1 ? "Launch candidate" :
    score >= 74 ? "Private beta" :
    score >= 58 ? "Buildout" :
    "Foundation";

  return {
    generatedAt: now.toISOString(),
    score,
    stage,
    readyCount,
    totalChecks: checks.length,
    blockerCount: blockers.length,
    checks,
    blockers,
    nextActions: blockers.length
      ? blockers.map((check) => check.nextAction)
      : ["Run one full user walkthrough, then start a small private beta."],
    metrics: {
      festivals: festivalList.length,
      accepting: festivalSummary.accepting,
      highConfidence,
      activeSources: watchSummary.active,
      candidates: candidateList.length,
      backupRecords: backupSummary.totalRecords,
      accessPlan: accessPlan?.name || "Launch plan",
      appShellReady: appShell.readyCount
    },
    summary: blockers.length
      ? `${readyCount}/${checks.length} launch areas are ready. ${blockers.length} areas need attention.`
      : "All launch areas are ready for a private launch pass."
  };
}

export function launchReadinessToText(report) {
  const lines = [
    "LaurelPilot Launch Readiness",
    `Generated: ${formatShortDate(report.generatedAt)}`,
    `Stage: ${report.stage}`,
    `Score: ${report.score}/100`,
    `Ready: ${report.readyCount}/${report.totalChecks}`,
    "",
    "Checks",
    ...report.checks.map((check) => `- ${check.ready ? "Ready" : "Needs work"}: ${check.area} (${check.score}/${check.weight}) - ${check.detail}`),
    "",
    "Next Actions",
    ...report.nextActions.map((action) => `- ${action}`)
  ];
  return lines.join("\n");
}

export const PRODUCT_GUIDE_TOOLS = [
  {
    id: "discover",
    label: "Discover",
    view: "discover",
    purpose: "Build a shortlist from verified AI film festivals instead of searching scattered listings.",
    bestFor: "Finding open calls, comparing deadlines, and spotting stronger-fit opportunities."
  },
  {
    id: "intelligence",
    label: "Intelligence",
    view: "intelligence",
    purpose: "Turn a festival record into submission strategy, risks, positioning notes, and acceptance-minded tips.",
    bestFor: "Understanding how to approach a festival before paying an entry fee."
  },
  {
    id: "match",
    label: "Match",
    view: "match",
    purpose: "Rank festivals against a film profile by runtime, content type, goal, fee comfort, and deadline pressure.",
    bestFor: "Choosing where a specific film belongs."
  },
  {
    id: "season",
    label: "Season Plan",
    view: "season",
    purpose: "Turn match scores, deadlines, fees, and goals into a budget-aware festival slate.",
    bestFor: "Deciding where to spend submission money first."
  },
  {
    id: "prep",
    label: "Prep Pack",
    view: "prep",
    purpose: "Create a festival-specific checklist and positioning packet for a submission.",
    bestFor: "Getting materials, notes, and export guidance ready before submitting."
  },
  {
    id: "submissions",
    label: "My Submissions",
    view: "submissions",
    purpose: "Track where films were submitted, what they cost, and what happened next.",
    bestFor: "Managing a season without rebuilding a spreadsheet."
  },
  {
    id: "watchlist",
    label: "Watchlist",
    view: "watchlist",
    purpose: "Maintain a local source map for places LaurelPilot should monitor or manually review.",
    bestFor: "Keeping the festival discovery pipeline organized."
  },
  {
    id: "radar",
    label: "Radar",
    view: "radar",
    purpose: "Review incoming festival candidates before they graduate into the directory.",
    bestFor: "Protecting subscribers from weak, vague, or low-trust festival listings."
  },
  {
    id: "vault",
    label: "Data Vault",
    view: "vault",
    purpose: "Export or restore the local workspace as a portable backup.",
    bestFor: "Protecting local data before testing, clearing storage, or switching machines."
  }
];

export const PRODUCT_GUIDE_WORKFLOWS = [
  {
    id: "first-submission",
    label: "Plan a first submission",
    promise: "Move from a film idea to a ranked, prepared festival target without guesswork.",
    tools: ["onboarding", "match", "season", "intelligence", "prep", "submissions"],
    steps: [
      {
        title: "Define the film profile",
        view: "onboarding",
        requirement: "profile",
        detail: "Add runtime, content type, goal, region, and fee comfort so every recommendation has context."
      },
      {
        title: "Rank the first shortlist",
        view: "match",
        requirement: "matches",
        detail: "Use fit scores to separate good opportunities from expensive distractions."
      },
      {
        title: "Read the festival strategy",
        view: "intelligence",
        requirement: "festival-data",
        detail: "Check positioning, risks, rules language, and submission notes before committing."
      },
      {
        title: "Choose the season slate",
        view: "season",
        requirement: "matches",
        detail: "Balance budget, deadline pressure, and strategic upside before committing entry fees."
      },
      {
        title: "Build the prep pack",
        view: "prep",
        requirement: "prep",
        detail: "Collect the festival-specific materials and notes you need before opening the submission page."
      },
      {
        title: "Track the outcome",
        view: "submissions",
        requirement: "submissions",
        detail: "Record the submission date, film title, status, and notes so the season stays organized."
      }
    ]
  },
  {
    id: "scout-festivals",
    label: "Grow the festival database",
    promise: "Keep the directory useful without manually rebuilding research from scratch.",
    tools: ["watchlist", "scout", "import", "radar", "discover"],
    steps: [
      {
        title: "Maintain source coverage",
        view: "watchlist",
        requirement: "sources",
        detail: "Keep official sites, directories, and community sources organized by trust level and keywords."
      },
      {
        title: "Run a local scout pass",
        view: "scout",
        requirement: "scout",
        detail: "Send known lead examples into Radar so the review workflow stays active."
      },
      {
        title: "Import fresh leads",
        view: "import",
        requirement: "candidates",
        detail: "Paste CSV, TSV, or JSON leads from research and normalize them into review-ready candidates."
      },
      {
        title: "Review before publishing",
        view: "radar",
        requirement: "radar",
        detail: "Approve only candidates with clear organizer, rules, deadline, and submission signals."
      },
      {
        title: "Confirm the public list",
        view: "discover",
        requirement: "festival-data",
        detail: "Make sure approved festivals appear cleanly in the directory with useful filters."
      }
    ]
  },
  {
    id: "private-beta",
    label: "Prepare for private beta",
    promise: "Check whether LaurelPilot is credible enough to show to early filmmakers.",
    tools: ["launch", "install", "access", "vault", "product"],
    steps: [
      {
        title: "Run product QA",
        view: "launch",
        requirement: "launch",
        detail: "Use the launch score and blockers to decide whether the product is ready for testers."
      },
      {
        title: "Confirm local reliability",
        view: "install",
        requirement: "install",
        detail: "Verify the installable app shell, cached files, and offline-readiness status."
      },
      {
        title: "Check the value ladder",
        view: "access",
        requirement: "access",
        detail: "Review the launch pass and locked features before connecting any real billing layer."
      },
      {
        title: "Export a backup",
        view: "vault",
        requirement: "vault",
        detail: "Download a Data Vault backup before demos, experiments, or browser storage changes."
      },
      {
        title: "Walk the product story",
        view: "product",
        requirement: "festival-data",
        detail: "Make sure the first impression explains why this saves a filmmaker time and money."
      }
    ]
  }
];

function getGuideWorkflow(workflowId) {
  return PRODUCT_GUIDE_WORKFLOWS.find((workflow) => workflow.id === workflowId) || PRODUCT_GUIDE_WORKFLOWS[0];
}

function guideRequirementMet(requirement, snapshot = {}) {
  const launchReport = snapshot.launchReport || {};
  const installReport = snapshot.installReport || {};
  const profile = snapshot.filmProfile || {};
  const prepDraft = snapshot.prepDraft || {};
  if (requirement === "profile") {
    return Boolean(profile.title && Number(profile.runtime) > 0 && profile.contentType);
  }
  if (requirement === "matches") {
    return Number(snapshot.matchCount || 0) > 0;
  }
  if (requirement === "prep") {
    return Boolean(prepDraft.festivalId || prepDraft.filmTitle);
  }
  if (requirement === "submissions") {
    return Number(snapshot.submissionCount || 0) > 0;
  }
  if (requirement === "sources") {
    return Number(snapshot.activeSourceCount || 0) >= 3;
  }
  if (requirement === "scout") {
    return Number(snapshot.scoutRunCount || 0) > 0;
  }
  if (requirement === "candidates") {
    return Number(snapshot.candidateCount || 0) > 0;
  }
  if (requirement === "radar") {
    return Number(snapshot.radarAuditCount || 0) > 0 || Number(snapshot.candidateCount || 0) >= 2;
  }
  if (requirement === "festival-data") {
    return Number(snapshot.festivalCount || 0) >= 6;
  }
  if (requirement === "launch") {
    return Number(launchReport.score || 0) >= 74;
  }
  if (requirement === "install") {
    return Number(installReport.readyCount || 0) >= 4;
  }
  if (requirement === "access") {
    return Boolean(snapshot.accessPlan && snapshot.accessPlan !== "Preview");
  }
  if (requirement === "vault") {
    return Number(snapshot.backupRecords || 0) > 0;
  }
  return true;
}

export function buildProductGuide(options = {}, snapshot = {}) {
  const workflow = getGuideWorkflow(options.workflowId);
  const phase = options.phase || "Explore";
  const steps = workflow.steps.map((step, index) => ({
    ...step,
    number: index + 1,
    ready: guideRequirementMet(step.requirement, snapshot)
  }));
  const readyCount = steps.filter((step) => step.ready).length;
  const selectedToolIds = new Set(workflow.tools);
  const toolCards = PRODUCT_GUIDE_TOOLS.filter((tool) => selectedToolIds.has(tool.id));
  const nextStep = steps.find((step) => !step.ready) || steps.at(-1);
  const phaseCopy = {
    Explore: "Use this when a filmmaker is still deciding where the film belongs.",
    Submit: "Use this when the filmmaker is preparing materials and choosing submission targets.",
    Maintain: "Use this when the product owner is keeping the directory fresh and credible.",
    Launch: "Use this when you are checking whether the product is ready for early users."
  }[phase] || "Use this as the current product guide.";

  return {
    workflow,
    phase,
    phaseCopy,
    steps,
    readyCount,
    totalSteps: steps.length,
    progress: Math.round((readyCount / steps.length) * 100),
    nextStep,
    toolCards,
    heroStats: [
      { label: "Workflow", value: workflow.label },
      { label: "Progress", value: `${readyCount}/${steps.length}` },
      { label: "Launch stage", value: snapshot.launchReport?.stage || "Not checked" },
      { label: "Festival records", value: String(snapshot.festivalCount || 0) }
    ],
    recommendations: [
      nextStep ? `Next best move: ${nextStep.title}.` : "The workflow is complete.",
      snapshot.launchReport?.blockerCount ? `${snapshot.launchReport.blockerCount} launch blockers still need attention.` : "No launch blockers currently reported.",
      "Before asking anyone to pay, run this workflow once as a filmmaker and once as the product owner."
    ],
    summary: `${workflow.label}: ${readyCount}/${steps.length} steps are ready.`
  };
}

export function productGuideToText(guide) {
  const lines = [
    "LaurelPilot Product Guide",
    `Workflow: ${guide.workflow.label}`,
    `Phase: ${guide.phase}`,
    `Progress: ${guide.readyCount}/${guide.totalSteps}`,
    "",
    guide.workflow.promise,
    "",
    "Steps",
    ...guide.steps.map((step) => `${step.number}. ${step.ready ? "Ready" : "Next"} - ${step.title}: ${step.detail}`),
    "",
    "Tools",
    ...guide.toolCards.map((tool) => `- ${tool.label}: ${tool.purpose}`),
    "",
    "Recommendations",
    ...guide.recommendations.map((item) => `- ${item}`)
  ];
  return lines.join("\n");
}

export function packetToText(packet) {
  const lines = [
    packet.title,
    "",
    `Match: ${packet.summary.matchTier} (${packet.summary.matchScore}/100)`,
    `Readiness: ${packet.readiness.tier} (${packet.readiness.score}/100, ${packet.readiness.completedCount}/${packet.readiness.totalCount})`,
    `Deadline: ${formatShortDate(packet.summary.deadline)}`,
    `Entry fee: $${packet.summary.fee}`,
    `Fee decision: ${packet.feeDecision.label} - ${packet.feeDecision.detail}`,
    `Prize money: ${formatMoney(packet.summary.prizeMoney)}`,
    "",
    "Submission Angle",
    packet.submissionAngle,
    "",
    "Readiness Checks",
    ...packet.readiness.checks.map((check) => `- ${check.ready ? "[x]" : "[ ]"} ${check.label}: ${check.detail}`),
    "",
    "Timeline",
    ...packet.timeline.map((step) => `- ${step.label} (${step.date}): ${step.detail}`),
    "",
    "Phase Checklist",
    ...packet.materialsByPhase.flatMap((phase) => [
      phase.phase,
      ...phase.items.map((item) => `- [ ] ${item}`),
      ""
    ]),
    "Positioning",
    ...packet.positioning.map((item) => `- ${item}`),
    "",
    "Materials Checklist",
    ...packet.materials.map((item) => `- [ ] ${item}`),
    "",
    "Export / Rules Notes",
    ...packet.exportNotes.map((item) => `- ${item}`),
    "",
    "Watchouts",
    ...packet.watchouts.map((item) => `- ${item}`),
    "",
    "Draft Notes",
    ...packet.notes.map((item) => `- ${item}`)
  ];
  return lines.join("\n");
}

function slugify(value) {
  return String(value || "festival")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")
    .slice(0, 64);
}

function splitList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readField(row, keys, fallback = "") {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return row[key];
    }
  }
  return fallback;
}

function readBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }
  const text = String(value || "").trim().toLowerCase();
  return ["1", "yes", "true", "y", "checked", "found"].includes(text);
}

function splitDelimitedLine(line, delimiter) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseDelimitedRows(text) {
  const lines = String(text || "")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    throw new Error("CSV import needs a header row and at least one lead row.");
  }
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = splitDelimitedLine(lines[0], delimiter).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = splitDelimitedLine(line, delimiter);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

function normalizeRawImportRow(row, index, now) {
  const name = readField(row, ["name", "festivalName", "Festival Name"]);
  const deadline = readField(row, ["deadline", "submissionDeadline", "Submission Deadline"]);
  const websiteUrl = readField(row, ["websiteUrl", "website", "officialWebsite", "Website"]);
  const submissionUrl = readField(row, ["submissionUrl", "submitUrl", "submissionLink", "Submission URL"]);
  const mode = readField(row, ["mode", "festivalMode"], row.location?.mode || "Online");
  const contentTypes = splitList(readField(row, ["contentTypes", "types", "contentType"], "Experimental"));
  const formats = splitList(readField(row, ["formats", "acceptedFormats"], "MP4"));
  const organizerName = readField(row, ["organizerName", "organizer"]);
  const venueName = readField(row, ["venueName", "venue"]);
  const prizeMoney = Number(readField(row, ["prizeMoney", "prize", "prizePool"], 0));
  const lead = {
    id: readField(row, ["id"], `import-${slugify(name)}-${now.toISOString().slice(0, 10)}-${index + 1}`),
    name,
    capturedAt: readField(row, ["capturedAt", "discoveredAt"], now.toISOString()),
    discoverySource: readField(row, ["discoverySource", "source"], "Local Import"),
    sourceUrl: readField(row, ["sourceUrl"], websiteUrl),
    websiteUrl,
    submissionUrl,
    description: readField(row, ["description"], "Imported AI film festival lead."),
    deadline,
    notificationDate: readField(row, ["notificationDate"], deadline),
    eventDate: readField(row, ["eventDate"], deadline),
    location: {
      city: readField(row, ["city"], row.location?.city || (mode === "Online" ? "Online" : "")),
      country: readField(row, ["country"], row.location?.country || (mode === "Online" ? "Global" : "")),
      region: readField(row, ["region"], row.location?.region || (mode === "Online" ? "Online" : "North America")),
      mode
    },
    prizeMoney,
    entryFee: Number(readField(row, ["entryFee", "fee"], 0)),
    frequency: readField(row, ["frequency"], "Annual"),
    duration: {
      min: Number(readField(row, ["minDuration", "durationMin"], 1)),
      max: Number(readField(row, ["maxDuration", "durationMax"], 10))
    },
    contentTypes,
    formats,
    premiereStatus: readField(row, ["premiereStatus"], "Verify on rules page"),
    language: readField(row, ["language"], "Verify on rules page"),
    aspectRatio: splitList(readField(row, ["aspectRatio"], "16:9")),
    evidence: {
      officialWebsite: Boolean(websiteUrl) || Boolean(row.evidence?.officialWebsite),
      submissionLink: Boolean(submissionUrl) || Boolean(row.evidence?.submissionLink),
      deadline: Boolean(deadline) || Boolean(row.evidence?.deadline),
      namedOrganizers: Boolean(organizerName) || readBoolean(row.namedOrganizers) || Boolean(row.evidence?.namedOrganizers),
      venue: mode === "Online" || Boolean(venueName) || readBoolean(row.venue) || Boolean(row.evidence?.venue),
      rulesPage: readBoolean(readField(row, ["rulesPage", "hasClearRules", "rulesUrl"])) || Boolean(row.evidence?.rulesPage),
      socialPresence: readBoolean(readField(row, ["socialPresence", "socialUrl"])) || Boolean(row.evidence?.socialPresence),
      pastEdition: readBoolean(readField(row, ["pastEdition", "hasPastEdition"])) || Boolean(row.evidence?.pastEdition),
      transparentFees: readBoolean(readField(row, ["transparentFees", "feesTransparent"])) || Boolean(row.evidence?.transparentFees),
      prizeDetails: (prizeMoney > 0 && readBoolean(readField(row, ["prizeDetails"]))) || Boolean(row.evidence?.prizeDetails)
    },
    warningSignals: splitList(readField(row, ["warningSignals", "warnings"])),
    extractedSignals: splitList(row.extractedSignals).length
      ? splitList(row.extractedSignals)
      : [
          organizerName ? `Organizer listed: ${organizerName}` : "",
          venueName ? `Venue listed: ${venueName}` : "",
          readField(row, ["sourceUrl"]) ? `Source URL: ${readField(row, ["sourceUrl"])}` : ""
        ].filter(Boolean),
    suggestedFit: readField(row, ["suggestedFit", "fit"]),
    suggestedStrategy: splitList(readField(row, ["suggestedStrategy", "strategy"]))
  };
  return normalizeScoutLead(lead, now);
}

export function parseLeadImportText(text, now = new Date()) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return {
      candidates: [],
      errors: ["Paste JSON or CSV leads before importing."],
      manifest: {}
    };
  }

  let rows;
  let manifest = {};
  try {
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        rows = parsed;
      } else if (Array.isArray(parsed.leads)) {
        rows = parsed.leads;
        manifest = {
          runId: parsed.runId || parsed.id || "",
          sourceName: parsed.sourceName || parsed.source || parsed.name || "",
          sourceType: parsed.sourceType || parsed.type || "",
          capturedAt: parsed.capturedAt || parsed.runAt || parsed.generatedAt || now.toISOString(),
          sourceUrl: parsed.sourceUrl || parsed.url || "",
          notes: parsed.notes || parsed.note || ""
        };
      } else {
        rows = [parsed];
      }
    } else {
      rows = parseDelimitedRows(trimmed);
    }
  } catch (error) {
    return {
      candidates: [],
      errors: [`Import could not be parsed: ${error.message}`],
      manifest: {}
    };
  }

  const candidates = [];
  const errors = [];
  rows.forEach((row, index) => {
    try {
      candidates.push(normalizeRawImportRow({
        ...row,
        discoverySource: row.discoverySource || row.source || manifest.sourceName || "Local Import",
        sourceUrl: row.sourceUrl || manifest.sourceUrl || row.websiteUrl,
        capturedAt: row.capturedAt || row.discoveredAt || manifest.capturedAt || now.toISOString()
      }, index, now));
    } catch (error) {
      errors.push(`Row ${index + 1}: ${error.message}`);
    }
  });

  return {
    candidates,
    errors,
    manifest
  };
}

function candidateFingerprint(candidate = {}) {
  const deadline = candidate.deadline ? parseDate(candidate.deadline).toISOString().slice(0, 10) : "no-date";
  return `${slugify(candidate.name || "")}-${deadline}`;
}

function urlKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//u, "")
    .replace(/^www\./u, "")
    .replace(/\/$/u, "");
}

export function buildImportReviewReport(candidates = [], errors = [], existingCandidates = [], existingFestivals = [], manifest = {}, now = new Date()) {
  const existingCandidateIds = new Set(existingCandidates.map((candidate) => candidate.id));
  const existingCandidateFingerprints = new Set(existingCandidates.map(candidateFingerprint));
  const existingFestivalNames = new Set(existingFestivals.map((festival) => slugify(festival.name || "")));
  const existingFestivalUrls = new Set(
    existingFestivals
      .flatMap((festival) => [festival.websiteUrl, festival.submissionUrl])
      .map(urlKey)
      .filter(Boolean)
  );
  const rows = candidates.map((candidate) => {
    const score = scoreRadarCandidate(candidate);
    const duplicateInRadar = existingCandidateIds.has(candidate.id) || existingCandidateFingerprints.has(candidateFingerprint(candidate));
    const duplicateInDirectory =
      existingFestivalNames.has(slugify(candidate.name || "")) ||
      [candidate.websiteUrl, candidate.submissionUrl].map(urlKey).filter(Boolean).some((url) => existingFestivalUrls.has(url));
    const duplicate = duplicateInRadar || duplicateInDirectory;
    const stageStatus = duplicate
      ? "Duplicate"
      : score.recommendation === "Auto-publish"
        ? "Clean"
        : score.recommendation === "Review"
          ? "Review"
          : "Hold";
    return {
      candidate,
      score,
      duplicate,
      duplicateInRadar,
      duplicateInDirectory,
      stageStatus,
      stageable: !duplicate && stageStatus !== "Hold",
      clean: !duplicate && stageStatus === "Clean",
      reason: duplicateInDirectory
        ? "Already appears to exist in the subscriber directory."
        : duplicateInRadar
          ? "Already staged in Radar."
          : stageStatus === "Clean"
            ? "Enough proof signals to stage confidently."
            : stageStatus === "Review"
              ? "Useful lead, but a reviewer should verify missing proof."
              : "Hold until major risk signals are resolved."
    };
  });
  const summary = {
    parsed: rows.length,
    clean: rows.filter((row) => row.stageStatus === "Clean").length,
    review: rows.filter((row) => row.stageStatus === "Review").length,
    hold: rows.filter((row) => row.stageStatus === "Hold").length,
    duplicates: rows.filter((row) => row.duplicate).length,
    highRisk: rows.filter((row) => row.score.riskLevel === "High").length,
    errors: errors.length,
    stageable: rows.filter((row) => row.stageable).length
  };
  const actions = [
    summary.clean
      ? `Stage ${summary.clean} clean lead${summary.clean === 1 ? "" : "s"} into Radar.`
      : "No clean leads are ready for staging yet.",
    summary.review
      ? `Review ${summary.review} useful lead${summary.review === 1 ? "" : "s"} before staging.`
      : "No mid-confidence leads need review.",
    summary.duplicates
      ? `Skip ${summary.duplicates} duplicate lead${summary.duplicates === 1 ? "" : "s"}.`
      : "No duplicates detected against Radar or the directory.",
    summary.hold
      ? `Hold ${summary.hold} lead${summary.hold === 1 ? "" : "s"} with major risk.`
      : "No parsed leads require a hard hold."
  ];

  return {
    generatedAt: now.toISOString(),
    manifest,
    rows,
    errors,
    actions,
    summary,
    message: summary.parsed
      ? `${summary.stageable} of ${summary.parsed} parsed lead${summary.parsed === 1 ? "" : "s"} can be staged into Radar.`
      : "Paste or load a scraper packet to preview the intake pipeline."
  };
}

export function importReviewReportToText(report) {
  const manifestLines = [
    report.manifest?.sourceName ? `Source: ${report.manifest.sourceName}` : "",
    report.manifest?.runId ? `Run ID: ${report.manifest.runId}` : "",
    report.manifest?.capturedAt ? `Captured: ${formatShortDate(report.manifest.capturedAt)}` : ""
  ].filter(Boolean);
  const lines = [
    "LaurelPilot Import Review Pipeline",
    `Generated: ${formatShortDate(report.generatedAt)}`,
    ...manifestLines,
    `Parsed: ${report.summary.parsed}`,
    `Clean: ${report.summary.clean}`,
    `Review: ${report.summary.review}`,
    `Hold: ${report.summary.hold}`,
    `Duplicates: ${report.summary.duplicates}`,
    `Errors: ${report.summary.errors}`,
    "",
    "Recommended Actions",
    ...report.actions.map((action) => `- ${action}`),
    "",
    "Lead Rows",
    ...(report.rows.length
      ? report.rows.map((row) => `- ${row.candidate.name}: ${row.score.score}/100 ${row.stageStatus}; ${row.reason}`)
      : ["- No valid leads parsed."]),
    ...(report.errors.length ? ["", "Import Errors", ...report.errors.map((error) => `- ${error}`)] : [])
  ];
  return lines.join("\n");
}

export function applyCandidateReviewPatch(candidate, patch = {}, now = new Date()) {
  const contentTypes = splitList(patch.contentTypes).length
    ? splitList(patch.contentTypes)
    : candidate.contentTypes;
  const formats = splitList(patch.formats).length ? splitList(patch.formats) : candidate.formats;
  const warningSignals = splitList(patch.warningSignals);
  const extractedSignals = splitList(patch.extractedSignals);
  const entryFee = patch.entryFee === undefined || patch.entryFee === "" ? candidate.entryFee : Number(patch.entryFee);
  const prizeMoney = patch.prizeMoney === undefined || patch.prizeMoney === "" ? candidate.prizeMoney : Number(patch.prizeMoney);
  const maxDuration = patch.maxDuration === undefined || patch.maxDuration === ""
    ? candidate.duration?.max
    : Number(patch.maxDuration);
  const minDuration = patch.minDuration === undefined || patch.minDuration === ""
    ? candidate.duration?.min
    : Number(patch.minDuration);
  const evidence = {
    ...candidate.evidence,
    ...(patch.evidence || {})
  };

  return {
    ...candidate,
    name: String(patch.name || candidate.name).trim(),
    description: String(patch.description || candidate.description || "").trim(),
    deadline: patch.deadline ? new Date(patch.deadline).toISOString() : candidate.deadline,
    websiteUrl: String(patch.websiteUrl ?? candidate.websiteUrl ?? "").trim(),
    submissionUrl: String(patch.submissionUrl ?? candidate.submissionUrl ?? "").trim(),
    prizeMoney,
    entryFee,
    frequency: patch.frequency || candidate.frequency,
    duration: {
      min: minDuration,
      max: maxDuration
    },
    contentTypes,
    formats,
    premiereStatus: patch.premiereStatus || candidate.premiereStatus,
    language: patch.language || candidate.language,
    evidence,
    warningSignals,
    extractedSignals,
    suggestedFit: String(patch.suggestedFit || candidate.suggestedFit || "").trim(),
    suggestedStrategy: splitList(patch.suggestedStrategy).length
      ? splitList(patch.suggestedStrategy)
      : candidate.suggestedStrategy,
    reviewedAt: now.toISOString()
  };
}

export function createReviewAuditEntry(action, candidate, note = "", now = new Date()) {
  const scored = scoreRadarCandidate(candidate);
  return {
    id: `${now.getTime()}-${slugify(candidate.id || candidate.name)}-${action}`,
    action,
    candidateId: candidate.id,
    candidateName: candidate.name,
    score: scored.score,
    recommendation: scored.recommendation,
    riskLevel: scored.riskLevel,
    note,
    createdAt: now.toISOString()
  };
}

const CADENCE_DAYS = {
  Live: 0,
  Daily: 1,
  "Twice weekly": 4,
  Weekly: 7,
  Monthly: 30,
  Manual: Infinity
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeWatchSource(input, now = new Date()) {
  const name = String(input.name || "").trim();
  if (!name) {
    throw new Error("Source name is required.");
  }

  const keywords = splitList(input.keywords).length
    ? splitList(input.keywords)
    : ["AI film festival", "AI filmmaking submissions"];
  const coverage = splitList(input.coverage).length
    ? splitList(input.coverage)
    : keywords;
  const trustLevel = clamp(Number(input.trustLevel || 3), 1, 5);
  const cadence = CADENCE_DAYS[input.cadence] !== undefined ? input.cadence : "Weekly";
  const status = input.status === "Paused" ? "Paused" : "Active";

  return {
    id: input.id || `watch-${slugify(name)}`,
    name,
    url: String(input.url || input.sourceUrl || "").trim(),
    sourceType: input.sourceType || input.type || "Festival directory",
    status,
    cadence,
    trustLevel,
    keywords,
    coverage,
    note: String(input.note || "").trim(),
    lastChecked: input.lastChecked || input.lastRun || "",
    createdAt: input.createdAt || now.toISOString(),
    updatedAt: now.toISOString()
  };
}

export function getWatchSourceHealth(source, now = new Date()) {
  if (source.status === "Paused") {
    return {
      label: "Paused",
      tone: "blue",
      due: false,
      daysSince: null,
      nextRun: "Paused"
    };
  }

  const cadenceDays = CADENCE_DAYS[source.cadence] ?? 7;
  if (cadenceDays === Infinity) {
    return {
      label: "Manual",
      tone: "blue",
      due: false,
      daysSince: null,
      nextRun: "Manual"
    };
  }

  if (!source.lastChecked) {
    return {
      label: "Due",
      tone: "amber",
      due: true,
      daysSince: null,
      nextRun: "Now"
    };
  }

  const daysSince = Math.max(0, Math.floor((now.getTime() - parseDate(source.lastChecked).getTime()) / DAY_MS));
  const due = cadenceDays === 0 || daysSince >= cadenceDays;
  const overdue = cadenceDays > 0 && daysSince >= cadenceDays * 2;
  const lowTrust = Number(source.trustLevel || 0) <= 2;
  return {
    label: overdue ? "Overdue" : due ? "Due" : lowTrust ? "Watch" : "Healthy",
    tone: overdue ? "red" : due ? "amber" : lowTrust ? "amber" : "green",
    due,
    daysSince,
    nextRun: due ? "Now" : `${cadenceDays - daysSince}d`
  };
}

export function summarizeWatchSources(sources, now = new Date()) {
  const normalized = sources.map((source) => normalizeWatchSource(source, now));
  const activeSources = normalized.filter((source) => source.status === "Active");
  const keywordSet = new Set(normalized.flatMap((source) => source.keywords.map((keyword) => keyword.toLowerCase())));
  return {
    total: normalized.length,
    active: activeSources.length,
    paused: normalized.length - activeSources.length,
    highTrust: activeSources.filter((source) => source.trustLevel >= 4).length,
    due: activeSources.filter((source) => getWatchSourceHealth(source, now).due).length,
    keywordCount: keywordSet.size,
    averageTrust: activeSources.length
      ? Math.round((activeSources.reduce((total, source) => total + source.trustLevel, 0) / activeSources.length) * 10) / 10
      : 0
  };
}

export function buildWatchScanPlan(sources, now = new Date()) {
  const dueSources = sources
    .map((source) => normalizeWatchSource(source, now))
    .filter((source) => source.status === "Active" && getWatchSourceHealth(source, now).due)
    .sort((a, b) => b.trustLevel - a.trustLevel || a.name.localeCompare(b.name));
  const queries = dueSources.flatMap((source) =>
    source.keywords.map((keyword) => ({
      sourceId: source.id,
      sourceName: source.name,
      keyword,
      target: source.url || source.name,
      trustLevel: source.trustLevel
    }))
  );

  return {
    dueSources,
    queries,
    summary: dueSources.length
      ? `${dueSources.length} sources and ${queries.length} keyword checks are due.`
      : "No active sources are due right now."
  };
}

export function normalizeOrganizerSubmission(input, now = new Date()) {
  const name = String(input.name || "").trim();
  if (!name) {
    throw new Error("Festival name is required.");
  }
  if (!input.deadline) {
    throw new Error("Submission deadline is required.");
  }

  const mode = input.mode || "Online";
  const city = String(input.city || (mode === "Online" ? "Online" : "")).trim();
  const country = String(input.country || (mode === "Online" ? "Global" : "")).trim();
  const region = input.region || (mode === "Online" ? "Online" : "North America");
  const entryFee = Number(input.entryFee || 0);
  const prizeMoney = Number(input.prizeMoney || 0);
  const maxDuration = Number(input.maxDuration || 10);
  const organizerName = String(input.organizerName || "").trim();
  const venueName = String(input.venueName || "").trim();
  const formats = splitList(input.formats).length ? splitList(input.formats) : ["MP4"];
  const contentTypes = splitList(input.contentTypes).length
    ? splitList(input.contentTypes)
    : [input.primaryType || "Experimental"];

  const warningSignals = [];
  if (!organizerName) {
    warningSignals.push("noOrganizer");
  }
  if (mode !== "Online" && !venueName) {
    warningSignals.push("noVenue");
  }
  if (input.aggressiveDiscounts) {
    warningSignals.push("aggressiveDiscounts");
  }
  if (contentTypes.length > 5) {
    warningSignals.push("tooManyCategories");
  }
  if (String(input.awardsLanguage || "").toLowerCase().includes("guaranteed")) {
    warningSignals.push("vagueAwards");
  }

  const id = `organizer-${slugify(name)}-${now.toISOString().slice(0, 10)}`;
  return {
    id,
    name,
    discoveredAt: now.toISOString(),
    discoverySource: "Organizer Self-Submission",
    websiteUrl: String(input.websiteUrl || "").trim(),
    submissionUrl: String(input.submissionUrl || "").trim(),
    description: String(input.description || "Organizer-submitted AI film festival candidate.").trim(),
    deadline: new Date(input.deadline).toISOString(),
    notificationDate: input.notificationDate || input.deadline,
    eventDate: input.eventDate || input.deadline,
    location: {
      city,
      country,
      region,
      mode
    },
    prizeMoney,
    entryFee,
    frequency: input.frequency || "Annual",
    duration: {
      min: Number(input.minDuration || 1),
      max: maxDuration
    },
    contentTypes,
    formats,
    premiereStatus: input.premiereStatus || "Verify on rules page",
    language: input.language || "Verify on rules page",
    aspectRatio: splitList(input.aspectRatio).length ? splitList(input.aspectRatio) : ["16:9"],
    evidence: {
      officialWebsite: Boolean(input.websiteUrl),
      submissionLink: Boolean(input.submissionUrl),
      deadline: Boolean(input.deadline),
      namedOrganizers: Boolean(organizerName),
      venue: mode === "Online" || Boolean(venueName),
      rulesPage: Boolean(input.rulesUrl || input.hasClearRules),
      socialPresence: Boolean(input.socialUrl),
      pastEdition: Boolean(input.hasPastEdition),
      transparentFees: Boolean(input.feesTransparent),
      prizeDetails: prizeMoney > 0 && Boolean(input.prizeDetails)
    },
    warningSignals,
    extractedSignals: [
      organizerName ? `Organizer listed: ${organizerName}` : "Organizer name not provided",
      venueName ? `Venue listed: ${venueName}` : mode === "Online" ? "Online event" : "Venue not provided",
      input.rulesUrl ? `Rules URL provided: ${input.rulesUrl}` : "Rules URL not provided",
      input.socialUrl ? `Social presence provided: ${input.socialUrl}` : "Social link not provided"
    ],
    suggestedFit:
      input.suggestedFit ||
      `Best for ${contentTypes.join(", ").toLowerCase()} work up to ${maxDuration} minutes.`,
    suggestedStrategy: [
      "Verify current-year rules before submitting.",
      "Confirm organizer identity and screening format.",
      "Check whether the event protects or harms premiere strategy."
    ]
  };
}
