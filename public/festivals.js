export const festivals = [
  {
    id: "runway-aif-2026",
    name: "Runway AI Film Festival",
    shortName: "AIF by Runway",
    status: "Accepting Submissions",
    deadline: "2026-06-05T23:59:00-04:00",
    notificationDate: "2026-06-25",
    eventDate: "2026-07-18",
    location: {
      city: "New York",
      country: "United States",
      region: "North America",
      mode: "Hybrid"
    },
    prizeMoney: 60000,
    entryFee: 0,
    frequency: "Annual",
    duration: { min: 1, max: 10 },
    contentTypes: ["Experimental", "Animation", "Hybrid", "Music Video"],
    formats: ["MP4", "MOV", "H.264"],
    premiereStatus: "Any premiere status accepted",
    language: "English subtitles required for non-English dialogue",
    aspectRatio: ["16:9", "1:1", "9:16"],
    description:
      "A high-profile showcase for films made with generative tools, emphasizing craft, originality, and strong visual authorship.",
    websiteUrl: "https://aif.runwayml.com/",
    submissionUrl: "https://aif.runwayml.com/",
    sourceType: "Official website",
    lastVerified: "2026-05-04",
    confidence: 96,
    fitSummary:
      "Best for polished AI-native shorts with a strong concept, clear authorship, and enough craft to stand beside traditional festival work.",
    strategyNotes: [
      "Lead with story and emotional clarity rather than only showing tool novelty.",
      "A tight runtime helps the film feel programmed rather than demoed.",
      "Use your director statement to explain why AI was essential to the piece."
    ],
    greenFlags: [
      "Named organizer with visible track record",
      "Past editions and winners are easy to find",
      "Clear submission window",
      "Strong press and industry visibility"
    ],
    redFlags: [],
    communitySignals: [
      {
        label: "Visibility",
        tone: "positive",
        summary:
          "Public discussion treats this as one of the most visible AI film showcases, especially for creators already working with generative video tools."
      },
      {
        label: "Competition",
        tone: "mixed",
        summary:
          "Expect high submission volume and polished entries; weaker narrative pieces may struggle even with impressive visuals."
      }
    ],
    checklist: [
      "Prepare a concise tool disclosure",
      "Export a clean MP4 under 10 minutes",
      "Write a director statement focused on intent",
      "Confirm creator rights for all generated assets"
    ],
    pastWinners: ["Get Me Out", "PLSTC", "Dear Mom"]
  },
  {
    id: "hk-aiiff-2026",
    name: "Hong Kong AI International Film Festival",
    shortName: "HKAIIFF",
    status: "Accepting Submissions",
    deadline: "2026-07-12T23:59:00+08:00",
    notificationDate: "2026-08-10",
    eventDate: "2026-09-20",
    location: {
      city: "Hong Kong",
      country: "Hong Kong",
      region: "Asia",
      mode: "Physical"
    },
    prizeMoney: 25000,
    entryFee: 35,
    frequency: "Annual",
    duration: { min: 2, max: 20 },
    contentTypes: ["Animation", "Live Action", "Hybrid", "Documentary"],
    formats: ["MP4", "MOV"],
    premiereStatus: "Asian premiere preferred",
    language: "English subtitles required",
    aspectRatio: ["16:9", "2.39:1"],
    description:
      "International festival focused on AI-assisted cinema, digital culture, and emerging screen languages across Asia.",
    websiteUrl: "https://www.hkaiiff.org/",
    submissionUrl: "https://www.hkaiiff.org/",
    sourceType: "Official website",
    lastVerified: "2026-05-03",
    confidence: 89,
    fitSummary:
      "Best for ambitious shorts that combine AI craft with a broader cultural, social, or cinematic point of view.",
    strategyNotes: [
      "Frame the project as cinema first and AI technique second.",
      "If the film has cultural specificity, make that clear in the synopsis.",
      "Double-check subtitle quality; international festivals are unforgiving here."
    ],
    greenFlags: [
      "Named city and event footprint",
      "Rules include eligibility notes",
      "International positioning is clear"
    ],
    redFlags: ["Prize breakdown needs confirmation close to deadline"],
    communitySignals: [
      {
        label: "Regional fit",
        tone: "positive",
        summary:
          "AI filmmakers discussing Asian festival strategy often value regionally focused events for networking and press angles."
      }
    ],
    checklist: [
      "Prepare English subtitles",
      "Confirm premiere status",
      "Include a director biography",
      "Save payment and submission confirmation"
    ],
    pastWinners: ["Synthetic Memory", "Neon Samsara"]
  },
  {
    id: "lifeart-ai-2026",
    name: "LifeArt AI Film Festival",
    shortName: "LifeArt AI",
    status: "Accepting Submissions",
    deadline: "2026-09-01T23:59:00-07:00",
    notificationDate: "2026-09-20",
    eventDate: "2026-10-02",
    location: {
      city: "Los Angeles",
      country: "United States",
      region: "North America",
      mode: "Hybrid"
    },
    prizeMoney: 12000,
    entryFee: 30,
    frequency: "Annual",
    duration: { min: 1, max: 15 },
    contentTypes: ["Animation", "Experimental", "Hybrid", "Documentary"],
    formats: ["MP4", "MOV", "ProRes"],
    premiereStatus: "Any premiere status accepted",
    language: "English subtitles recommended",
    aspectRatio: ["16:9", "2.39:1", "9:16"],
    description:
      "A festival program for films, video art, and experimental screen work made with AI-assisted production methods.",
    websiteUrl: "https://www.lifeartfestival.com/ai",
    submissionUrl: "https://www.lifeartfestival.com/ai",
    sourceType: "Official website",
    lastVerified: "2026-05-07",
    confidence: 84,
    fitSummary:
      "Best for art-forward AI work, poetic shorts, fashion films, and hybrid pieces that would sit comfortably in a gallery or screening room.",
    strategyNotes: [
      "A clear visual thesis will matter more than plot complexity.",
      "Mention exhibition history if the piece has already screened.",
      "Keep the logline simple; experimental films benefit from accessible framing."
    ],
    greenFlags: [
      "Dedicated AI page",
      "Clear event identity",
      "Hybrid format increases accessibility"
    ],
    redFlags: ["Official page includes conflicting deadline language across sections", "Category boundaries may shift year to year"],
    communitySignals: [
      {
        label: "Art focus",
        tone: "positive",
        summary:
          "Creators often point to art-led events as a better fit for surreal AI pieces than traditional narrative festivals."
      }
    ],
    checklist: [
      "Prepare a 50-word artist statement",
      "Create a still image pack",
      "Confirm whether vertical video is eligible",
      "Add the notification date to your calendar"
    ],
    pastWinners: ["The Garden Remembers", "Latent Bodies"]
  },
  {
    id: "aimagica-2026",
    name: "AIMagica Film Festival",
    shortName: "AIMagica",
    status: "Not Yet Open",
    deadline: "2026-07-02T23:59:00-07:00",
    notificationDate: "2026-09-02",
    eventDate: "2026-09-02",
    location: {
      city: "Online",
      country: "Global",
      region: "Online",
      mode: "Online"
    },
    prizeMoney: 5000,
    entryFee: 15,
    frequency: "Recurring",
    duration: { min: 1, max: 8 },
    contentTypes: ["Animation", "Music Video", "Experimental"],
    formats: ["MP4", "H.264"],
    premiereStatus: "Any premiere status accepted",
    language: "Any language accepted with English subtitles",
    aspectRatio: ["16:9", "9:16", "1:1"],
    description:
      "Online festival celebrating short-form AI animation, music videos, and experimental visual storytelling.",
    websiteUrl: "https://www.aimagica.org/",
    submissionUrl: "https://filmfreeway.com/",
    sourceType: "Official website",
    lastVerified: "2026-05-07",
    confidence: 77,
    fitSummary:
      "Best for short, visually immediate AI pieces that can grab attention quickly in an online program.",
    strategyNotes: [
      "Open with your strongest image or beat; online juries may move quickly.",
      "Music-video pacing can work well here.",
      "Avoid overlong credits on very short pieces."
    ],
    greenFlags: [
      "Low entry fee",
      "Online format is clear",
      "Good fit for short-form creators"
    ],
    redFlags: [
      "Official schedule labels require re-checking before the June opening",
      "Prize details should be rechecked when submissions open",
      "Online-only festivals may offer less networking value"
    ],
    communitySignals: [
      {
        label: "Access",
        tone: "mixed",
        summary:
          "Online AI festivals are useful for early laurels, but filmmakers often weigh them carefully against live-screening opportunities."
      }
    ],
    checklist: [
      "Create a strong thumbnail",
      "Keep runtime tight",
      "Prepare social handles",
      "Verify current-year rules before paying"
    ],
    pastWinners: ["Dream Compression", "Signal Bloom"]
  },
  {
    id: "ai-zone-festival-2026",
    name: "AI Zone Film Festival",
    shortName: "AI Zone",
    status: "Closed",
    deadline: "2026-03-15T23:59:00Z",
    notificationDate: "2026-03-25",
    eventDate: "2026-04-10",
    location: {
      city: "Online",
      country: "Global",
      region: "Online",
      mode: "Online"
    },
    prizeMoney: 50,
    entryFee: 25,
    frequency: "Annual",
    duration: { min: 1, max: 12 },
    contentTypes: ["Animation", "Live Action", "Hybrid", "Music Video", "Other"],
    formats: ["MP4", "FilmFreeway upload"],
    premiereStatus: "Any premiere status accepted",
    language: "Any language accepted",
    aspectRatio: ["16:9", "9:16", "1:1"],
    description:
      "Online festival for AI-generated mini movies, episodes, music videos, and shorts created with AI tools.",
    websiteUrl: "https://ai-zone.net/festival/",
    submissionUrl: "https://filmfreeway.com/AIZONEInternationalAIFilmFestival2026",
    sourceType: "Official website",
    lastVerified: "2026-05-07",
    confidence: 78,
    fitSummary:
      "Best for completed AI shorts where the goal is online visibility, quick audience feedback, and a low-stakes laurel rather than premiere prestige.",
    strategyNotes: [
      "Keep this as a next-cycle watchlist item because the 2026 deadline has passed.",
      "Use it for work that feels like a film, not a tool demo.",
      "Prioritize narrative or conceptual intent in the submission copy."
    ],
    greenFlags: [
      "Official page lists categories and dates",
      "Submission link points to FilmFreeway",
      "Results page is linked from the festival page"
    ],
    redFlags: ["Current listed 2026 submission deadline has passed", "Prize pool is modest"],
    communitySignals: [
      {
        label: "Online visibility",
        tone: "mixed",
        summary:
          "Online AI festivals can be useful for early public proof, but filmmakers should weigh the laurel value against fee and premiere goals."
      }
    ],
    checklist: [
      "Move this to next-cycle monitoring",
      "Review official results before resubmitting future work",
      "Confirm FilmFreeway page before paying",
      "Use for public-ready shorts"
    ],
    pastWinners: []
  },
  {
    id: "aliholly-ai-film-awards-2026",
    name: "Aliholly AI Film Awards",
    shortName: "Aliholly",
    status: "Accepting Submissions",
    deadline: "2026-08-01T23:59:00-07:00",
    notificationDate: "2026-08-28",
    eventDate: "2026-09-16",
    location: {
      city: "Online",
      country: "Global",
      region: "Online",
      mode: "Online"
    },
    prizeMoney: 3000,
    entryFee: 20,
    frequency: "Monthly",
    duration: { min: 1, max: 6 },
    contentTypes: ["Animation", "Music Video", "Experimental", "Other"],
    formats: ["MP4"],
    premiereStatus: "Any premiere status accepted",
    language: "Any language accepted",
    aspectRatio: ["16:9", "9:16"],
    description:
      "A recurring online awards program for short AI-generated video work, music videos, and experimental clips.",
    websiteUrl: "https://aliholly.com/festival",
    submissionUrl: "https://aliholly.com/festival",
    sourceType: "Official website",
    lastVerified: "2026-05-02",
    confidence: 69,
    fitSummary:
      "Best for creators seeking low-friction online recognition for very short AI videos rather than a major festival premiere.",
    strategyNotes: [
      "Use this type of event strategically; do not burn major premiere goals on small online awards.",
      "Submit pieces that are already public or unlikely to need premiere protection.",
      "Treat laurels as secondary to audience-building."
    ],
    greenFlags: [
      "Low runtime barrier",
      "Frequent submission windows",
      "Good for social-first work"
    ],
    redFlags: [
      "Monthly awards can carry less prestige",
      "Verify judging and screening details before submitting",
      "May not add meaningful industry exposure"
    ],
    communitySignals: [
      {
        label: "Laurel value",
        tone: "caution",
        summary:
          "Filmmaker communities often warn that frequent online awards can become laurel mills if they lack clear juries and real programming."
      }
    ],
    checklist: [
      "Decide whether premiere status matters",
      "Check organizer and jury details",
      "Use a project that fits short social formats",
      "Record the fee in your submission tracker"
    ],
    pastWinners: ["Microdream 04", "Artificial Weather"]
  },
  {
    id: "curious-refuge-ai-showcase-2026",
    name: "Curious Refuge AI Film Showcase",
    shortName: "Curious Refuge",
    status: "Closed",
    deadline: "2026-04-15T23:59:00-05:00",
    notificationDate: "2026-05-10",
    eventDate: "2026-05-25",
    location: {
      city: "Online",
      country: "Global",
      region: "Online",
      mode: "Online"
    },
    prizeMoney: 0,
    entryFee: 0,
    frequency: "Recurring",
    duration: { min: 1, max: 5 },
    contentTypes: ["Animation", "Experimental", "Music Video"],
    formats: ["MP4", "YouTube/Vimeo link"],
    premiereStatus: "Public links accepted",
    language: "Any language accepted with English subtitles recommended",
    aspectRatio: ["16:9", "9:16"],
    description:
      "Community-oriented showcase for AI filmmaking experiments, tutorials, and creator-led shorts.",
    websiteUrl: "https://curiousrefuge.com/",
    submissionUrl: "https://curiousrefuge.com/",
    sourceType: "Community source",
    lastVerified: "2026-04-16",
    confidence: 73,
    fitSummary:
      "Best for early public-facing work where audience feedback and creator visibility matter more than premiere strategy.",
    strategyNotes: [
      "Use a piece that demonstrates a clear workflow or visual idea.",
      "Strong behind-the-scenes notes may help the project travel online.",
      "Do not submit a film you are saving for strict-premiere festivals."
    ],
    greenFlags: [
      "Creator community reach",
      "Low barrier to entry",
      "Good educational audience"
    ],
    redFlags: ["Closed for the current cycle", "Not a traditional festival market"],
    communitySignals: [
      {
        label: "Community reach",
        tone: "positive",
        summary:
          "Creator-led showcases can produce useful feedback and attention even when they are not traditional festival stops."
      }
    ],
    checklist: [
      "Prepare workflow notes",
      "Use a public-ready link",
      "Clip strong moments for social sharing",
      "Watch for the next cycle"
    ],
    pastWinners: ["Tutorial Ghosts", "The Last Render"]
  },
  {
    id: "synthetic-cinema-days-2026",
    name: "Synthetic Cinema Days",
    shortName: "Synthetic Cinema",
    status: "Accepting Submissions",
    deadline: "2026-05-18T23:59:00+02:00",
    notificationDate: "2026-06-03",
    eventDate: "2026-06-28",
    location: {
      city: "Berlin",
      country: "Germany",
      region: "Europe",
      mode: "Physical"
    },
    prizeMoney: 15000,
    entryFee: 40,
    frequency: "One-Time",
    duration: { min: 4, max: 25 },
    contentTypes: ["Documentary", "Hybrid", "Live Action", "Experimental"],
    formats: ["MP4", "MOV", "DCP by request"],
    premiereStatus: "European premiere preferred",
    language: "English subtitles required",
    aspectRatio: ["16:9", "1.85:1", "2.39:1"],
    description:
      "A one-time Berlin event focused on synthetic media, documentary ethics, and AI-assisted cinema.",
    websiteUrl: "https://example.com/synthetic-cinema-days",
    submissionUrl: "https://example.com/synthetic-cinema-days/submit",
    sourceType: "Radar candidate",
    lastVerified: "2026-05-05",
    confidence: 58,
    fitSummary:
      "Potentially strong fit for documentary or hybrid films about AI ethics, but verify legitimacy before paying.",
    strategyNotes: [
      "This is a candidate record: confirm venue, organizer, and jury details first.",
      "If verified, emphasize ethical production practices in your materials.",
      "A European premiere could make the submission more attractive."
    ],
    greenFlags: [
      "Specific city and theme",
      "Clear documentary angle",
      "Defined event date"
    ],
    redFlags: [
      "Low confidence until venue is independently verified",
      "One-time events can disappear after announcements",
      "Submission page should be checked before payment"
    ],
    communitySignals: [
      {
        label: "Verification needed",
        tone: "caution",
        summary:
          "One-time festivals can be legitimate, but filmmakers often recommend checking venue proof, organizer names, and past institutional partners before paying fees."
      }
    ],
    checklist: [
      "Verify venue independently",
      "Look up organizer history",
      "Archive the rules before submitting",
      "Use a project that benefits from European exposure"
    ],
    pastWinners: []
  },
  {
    id: "reply-ai-film-festival-2026",
    name: "Reply AI Film Festival",
    shortName: "Reply AIFF",
    status: "Accepting Submissions",
    deadline: "2026-06-01T23:59:00+02:00",
    notificationDate: "2026-08-08",
    eventDate: "2026-09-02",
    location: {
      city: "Venice",
      country: "Italy",
      region: "Europe",
      mode: "Physical"
    },
    prizeMoney: 15000,
    entryFee: 0,
    frequency: "Annual",
    duration: { min: 1, max: 10 },
    contentTypes: ["Animation", "Live Action", "Hybrid", "Experimental"],
    formats: ["MP4", "MOV", "FilmFreeway upload"],
    premiereStatus: "Any premiere status accepted",
    language: "English subtitles recommended for non-English dialogue",
    aspectRatio: ["16:9", "2.39:1"],
    description:
      "International AI short-film competition from Reply, with finalists connected to a Venice event and special categories around AI for Good and AI studio innovation.",
    websiteUrl: "https://www.reply.com/en/artificial-intelligence/reply-ai-film-festival",
    submissionUrl: "https://aiff.reply.com/",
    sourceType: "Official website and rules PDF",
    lastVerified: "2026-05-07",
    confidence: 93,
    fitSummary:
      "Best for polished AI-enabled shorts that can stand on creativity, craft, and AI impact in front of a high-profile industry jury.",
    strategyNotes: [
      "Treat the AI workflow as part of the creative argument, not just production trivia.",
      "A short film with a clear emotional hook should be stronger than a longer visual reel.",
      "If the film has a social impact angle, evaluate whether the AI for Good category creates a stronger path."
    ],
    greenFlags: [
      "Named international jury announced",
      "Rules describe evaluation criteria",
      "Cash prizes listed for the main competition",
      "Finalist screening opportunity tied to Venice dates"
    ],
    redFlags: ["Identity verification is required for finalists", "Long-form spotlight is conditional on submission volume"],
    communitySignals: [
      {
        label: "Prestige signal",
        tone: "positive",
        summary:
          "A corporate-backed AI film competition with a visible jury can carry more industry value than generic monthly online awards."
      },
      {
        label: "Selection pressure",
        tone: "mixed",
        summary:
          "The strong jury and prize structure suggest a competitive pool; weaker craft will not be rescued by novelty alone."
      }
    ],
    checklist: [
      "Review the Reply rules PDF before submitting",
      "Prepare a concise AI workflow disclosure",
      "Check identity and team-member requirements",
      "Frame the submission around creativity, craft, and AI impact"
    ],
    pastWinners: []
  },
  {
    id: "aimf-ai-media-festival-2026",
    name: "Artificial Intelligence Media Festival",
    shortName: "AIMF",
    status: "Accepting Submissions",
    deadline: "2026-08-31T23:59:00-07:00",
    notificationDate: "2026-09-15",
    eventDate: "2026-10-02",
    location: {
      city: "Los Angeles",
      country: "United States",
      region: "North America",
      mode: "Physical"
    },
    prizeMoney: 0,
    entryFee: 35,
    frequency: "Annual",
    duration: { min: 1, max: 30 },
    contentTypes: ["Animation", "Live Action", "Hybrid", "Music Video", "Experimental"],
    formats: ["MP4", "MOV", "FilmFreeway upload"],
    premiereStatus: "Any premiere status accepted",
    language: "English subtitles recommended",
    aspectRatio: ["16:9", "2.39:1", "9:16"],
    description:
      "AI-focused media festival covering film, music, art, screenings, networking events, awards, and digital art experiences.",
    websiteUrl: "https://aimediafestival.org/",
    submissionUrl: "https://filmfreeway.com/",
    sourceType: "Official website",
    lastVerified: "2026-05-07",
    confidence: 80,
    fitSummary:
      "Best for creators who want a broader AI media environment rather than a purely film-only competition.",
    strategyNotes: [
      "Position the film as part of a larger AI media practice if the project crosses music, art, or immersive work.",
      "Prioritize projects that benefit from networking and live audience context.",
      "Verify the exact FilmFreeway category and deadline before paying."
    ],
    greenFlags: [
      "Official site lists festival dates",
      "Submission call links out from the festival homepage",
      "Broader media programming can create networking value"
    ],
    redFlags: ["Prize money is not clearly listed on the captured festival page", "Exact submission deadline should be confirmed on FilmFreeway"],
    communitySignals: [
      {
        label: "Networking value",
        tone: "positive",
        summary:
          "Multi-disciplinary AI festivals can be useful when the filmmaker wants collaborators, visibility, and creative community beyond laurels."
      }
    ],
    checklist: [
      "Confirm the current FilmFreeway deadline",
      "Prepare a project description that connects film, AI, and media practice",
      "Decide whether networking value justifies the fee",
      "Add event dates to the submission calendar"
    ],
    pastWinners: []
  },
  {
    id: "kcaif-2026",
    name: "K-Culture AI International Film Festival",
    shortName: "KCAIF",
    status: "Accepting Submissions",
    deadline: "2026-07-31T23:59:00+09:00",
    notificationDate: "2026-08-20",
    eventDate: "2026-09-06",
    location: {
      city: "Seoul",
      country: "South Korea",
      region: "Asia",
      mode: "Physical"
    },
    prizeMoney: 0,
    entryFee: 20,
    frequency: "Annual",
    duration: { min: 1, max: 15 },
    contentTypes: ["Animation", "Music Video", "Commercial", "Hybrid", "Experimental"],
    formats: ["MP4", "FilmFreeway upload"],
    premiereStatus: "Any premiere status accepted",
    language: "English or Korean subtitles recommended",
    aspectRatio: ["16:9", "9:16", "1:1"],
    description:
      "Seoul-based AI film festival connecting K-Culture, global filmmakers, AI cinema, music videos, and commercial film categories.",
    websiteUrl: "https://www.kcaif.net/",
    submissionUrl: "https://filmfreeway.com/",
    sourceType: "Official website",
    lastVerified: "2026-05-07",
    confidence: 82,
    fitSummary:
      "Best for AI films with music, culture, commercial, or visual identity angles that could benefit from a Seoul-based program.",
    strategyNotes: [
      "If the film has a music or culture angle, make that explicit in the synopsis.",
      "Translate or subtitle carefully because the event is positioned for international participation.",
      "Use this for projects where Asian festival exposure is strategically useful."
    ],
    greenFlags: [
      "Official site lists organizer details",
      "Venue and contact emails are visible",
      "Categories and award levels are described"
    ],
    redFlags: ["Exact FilmFreeway fees and deadline should be confirmed", "Prize money is not clearly listed on the captured page"],
    communitySignals: [
      {
        label: "Regional positioning",
        tone: "positive",
        summary:
          "A region-specific AI film festival can be valuable when the film's theme, audience, or team has a cultural reason to be there."
      }
    ],
    checklist: [
      "Confirm FilmFreeway category and fee",
      "Prepare English or Korean subtitles",
      "Highlight music, culture, or commercial relevance",
      "Track the September event date"
    ],
    pastWinners: []
  },
  {
    id: "kerala-international-ai-film-festival-2026",
    name: "AI International Film Festival of Kerala",
    shortName: "AIFF Kerala",
    status: "Not Yet Open",
    deadline: "2026-07-20T23:59:00+05:30",
    notificationDate: "2026-08-31",
    eventDate: "2026-09-18",
    location: {
      city: "Thiruvananthapuram",
      country: "India",
      region: "Asia",
      mode: "Physical"
    },
    prizeMoney: 0,
    entryFee: 25,
    frequency: "Annual",
    duration: { min: 2, max: 20 },
    contentTypes: ["Animation", "Hybrid", "Documentary", "Experimental"],
    formats: ["MP4", "MOV"],
    premiereStatus: "Any premiere status accepted",
    language: "English subtitles recommended",
    aspectRatio: ["16:9", "2.39:1"],
    description:
      "Kerala AI film festival focused on short audiovisual work using AI technologies in conception, design, or production.",
    websiteUrl: "https://sostorytelling.com/ai-film-festival/",
    submissionUrl: "https://sostorytelling.com/ai-film-festival/",
    sourceType: "Official website",
    lastVerified: "2026-05-07",
    confidence: 81,
    fitSummary:
      "Best for short AI-assisted films that can speak to filmmakers, technologists, artists, media teams, and startup audiences.",
    strategyNotes: [
      "Prepare the submission for a cross-disciplinary audience, not only a film jury.",
      "Explain how AI was used in conception, design, or production.",
      "Plan ahead because submissions open June 1 and the deadline follows quickly."
    ],
    greenFlags: [
      "Submission opening and deadline are listed",
      "Festival dates are listed",
      "Minimum duration and broad categories are stated"
    ],
    redFlags: ["Maximum runtime and fees need confirmation before paying", "Submission platform details are not fully visible on the captured page"],
    communitySignals: [
      {
        label: "Cross-industry value",
        tone: "positive",
        summary:
          "Events that mix film, technology, and startups can be useful for filmmakers seeking collaborators or client-facing visibility."
      }
    ],
    checklist: [
      "Return on June 1 when submissions open",
      "Confirm maximum duration and fee",
      "Prepare a concise AI process note",
      "Add July 20 deadline to the calendar"
    ],
    pastWinners: []
  },
  {
    id: "biaiff-2026",
    name: "Bochnia International AI Film Festival",
    shortName: "BIAIFF",
    status: "Accepting Submissions",
    deadline: "2026-08-27T23:59:00+02:00",
    notificationDate: "2026-09-05",
    eventDate: "2026-09-17",
    location: {
      city: "Bochnia",
      country: "Poland",
      region: "Europe",
      mode: "Physical"
    },
    prizeMoney: 2500,
    entryFee: 25,
    frequency: "Annual",
    duration: { min: 1, max: 10 },
    contentTypes: ["Animation", "Hybrid", "Experimental", "Documentary"],
    formats: ["MP4", "MOV", "H.264", "ProRes"],
    premiereStatus: "Any premiere status accepted",
    language: "Polish films need English subtitles; other films need Polish or English subtitles",
    aspectRatio: ["16:9", "Minimum 1920x1080"],
    description:
      "International short-film competition in Bochnia for filmmakers using artificial intelligence, with formal rules, jury criteria, and a cash prize pool.",
    websiteUrl: "https://www.biaiff.pl/",
    submissionUrl: "https://filmfreeway.com/",
    sourceType: "Official regulations PDF",
    lastVerified: "2026-05-07",
    confidence: 91,
    fitSummary:
      "Best for compact AI shorts with clear craft, story, technical polish, and enough AI use to satisfy formal eligibility rules.",
    strategyNotes: [
      "Keep the film under 10 minutes including credits.",
      "Be ready to explain the AI contribution because the rules require meaningful AI use.",
      "Use subtitles carefully; language compliance is explicit in the regulations."
    ],
    greenFlags: [
      "Named organizers and artistic director",
      "Runtime, format, subtitle, fee, and prize rules are published",
      "Jury criteria and key dates are listed",
      "Cash prize pool is broken down by award"
    ],
    redFlags: ["Identity verification and bank-transfer requirements apply to winners"],
    communitySignals: [
      {
        label: "Rule clarity",
        tone: "positive",
        summary:
          "Festivals with detailed rules, fee windows, and jury criteria reduce the uncertainty that usually slows submission decisions."
      }
    ],
    checklist: [
      "Check whether early, regular, late, or extended fee applies",
      "Confirm film uses at least two AI tools or a significant AI process",
      "Prepare subtitles as required",
      "Export MP4 or MOV at Full HD or better"
    ],
    pastWinners: []
  }
];

export const radarSources = [
  {
    name: "Official Festival Watchlist",
    status: "Healthy",
    lastRun: "2026-05-06T02:00:00Z",
    found: 3,
    note: "Known official AI festival pages checked for deadline changes."
  },
  {
    name: "Web Discovery Queries",
    status: "Review Needed",
    lastRun: "2026-05-06T02:05:00Z",
    found: 7,
    note: "New candidate pages require source confidence scoring before publishing."
  },
  {
    name: "Community Signal Monitor",
    status: "Healthy",
    lastRun: "2026-05-06T02:15:00Z",
    found: 4,
    note: "Public discussion summarized into non-verbatim sentiment signals."
  },
  {
    name: "Organizer Self-Submissions",
    status: "Quiet",
    lastRun: "2026-05-06T02:20:00Z",
    found: 0,
    note: "No new organizer-submitted festivals in the review queue."
  }
];

export const scoutSources = [
  {
    id: "official-watchlist",
    name: "Official Festival Watchlist",
    status: "Healthy",
    cadence: "Daily",
    lastRun: "2026-05-06T02:00:00Z",
    coverage: ["Known AI festival pages", "Current-year rules", "Deadline changes"],
    note: "High-trust festival pages with recurring AI programs and visible organizer footprints."
  },
  {
    id: "directory-sweep",
    name: "Festival Directory Sweep",
    status: "Review Needed",
    cadence: "Daily",
    lastRun: "2026-05-06T02:08:00Z",
    coverage: ["AI film keywords", "New festival listings", "Submission platform pages"],
    note: "Broader discovery source. Strong for finding new leads, weaker until organizer details are confirmed."
  },
  {
    id: "community-signal-scan",
    name: "Community Signal Scan",
    status: "Healthy",
    cadence: "Weekly",
    lastRun: "2026-05-06T02:18:00Z",
    coverage: ["Filmmaker discussion", "Acceptance reports", "Laurel value warnings"],
    note: "Turns public filmmaker chatter into non-verbatim signals for strategy and caution notes."
  },
  {
    id: "organizer-inbox",
    name: "Organizer Inbox",
    status: "Quiet",
    cadence: "Live",
    lastRun: "2026-05-06T02:24:00Z",
    coverage: ["Self-submitted festivals", "Correction requests", "New program announcements"],
    note: "Organizer-supplied records are staged for scoring before they can appear in Discover."
  }
];

export const scoutLeads = [
  {
    id: "scout-lumen-ai-cinema-prize-2026",
    name: "Lumen AI Cinema Prize",
    sourceId: "official-watchlist",
    discoverySource: "Official Festival Watchlist",
    sourceUrl: "https://example.com/lumen-ai-cinema-prize",
    capturedAt: "2026-05-06T02:32:00Z",
    websiteUrl: "https://example.com/lumen-ai-cinema-prize",
    submissionUrl: "https://example.com/lumen-ai-cinema-prize/submit",
    description:
      "A curated prize program for AI-assisted short films with a named jury, public rules, and a live screening night.",
    deadline: "2026-06-24T23:59:00-04:00",
    notificationDate: "2026-07-14",
    eventDate: "2026-08-02",
    location: {
      city: "Toronto",
      country: "Canada",
      region: "North America",
      mode: "Hybrid"
    },
    prizeMoney: 18000,
    entryFee: 22,
    frequency: "Annual",
    duration: { min: 2, max: 12 },
    contentTypes: ["Animation", "Hybrid", "Experimental"],
    formats: ["MP4", "MOV"],
    premiereStatus: "North American premiere preferred",
    language: "English subtitles required",
    aspectRatio: ["16:9", "2.39:1"],
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
    warningSignals: [],
    extractedSignals: [
      "Named jury and organizer listed",
      "Rules page includes AI disclosure requirements",
      "Prize categories have public cash amounts"
    ],
    suggestedFit:
      "Best for polished AI-assisted shorts that can compete for craft, concept, and live audience impact.",
    suggestedStrategy: [
      "Use premiere language if the film has not screened in North America.",
      "Lead with the finished film, not the tool stack.",
      "Prepare a concise AI workflow disclosure before paying the entry fee."
    ]
  },
  {
    id: "scout-synthetic-realities-showcase-2026",
    name: "Synthetic Realities Showcase",
    sourceId: "directory-sweep",
    discoverySource: "Festival Directory Sweep",
    sourceUrl: "https://example.com/synthetic-realities-showcase",
    capturedAt: "2026-05-06T02:35:00Z",
    websiteUrl: "https://example.com/synthetic-realities-showcase",
    submissionUrl: "https://example.com/synthetic-realities-showcase/submit",
    description:
      "A new mixed-media program for synthetic documentaries, hybrid shorts, and experimental AI cinema.",
    deadline: "2026-07-04T23:59:00+02:00",
    notificationDate: "2026-07-22",
    eventDate: "2026-08-16",
    location: {
      city: "Amsterdam",
      country: "Netherlands",
      region: "Europe",
      mode: "Physical"
    },
    prizeMoney: 7000,
    entryFee: 32,
    frequency: "One-Time",
    duration: { min: 3, max: 20 },
    contentTypes: ["Documentary", "Hybrid", "Experimental"],
    formats: ["MP4", "MOV", "DCP by request"],
    premiereStatus: "European premiere preferred",
    language: "English subtitles required",
    aspectRatio: ["16:9", "1.85:1", "2.39:1"],
    evidence: {
      officialWebsite: true,
      submissionLink: true,
      deadline: true,
      namedOrganizers: true,
      venue: false,
      rulesPage: true,
      socialPresence: false,
      pastEdition: false,
      transparentFees: true,
      prizeDetails: true
    },
    warningSignals: ["noVenue"],
    extractedSignals: [
      "Organizer name found",
      "Rules page mentions documentary ethics",
      "Venue not confirmed on the listing"
    ],
    suggestedFit:
      "Possible fit for documentary and hybrid work about AI culture, identity, labor, or synthetic media ethics.",
    suggestedStrategy: [
      "Verify the venue before paying.",
      "Position the film around theme and argument, not only visual novelty.",
      "Check whether a European premiere would strengthen the submission."
    ]
  },
  {
    id: "scout-neon-prompt-awards-2026",
    name: "Neon Prompt Awards",
    sourceId: "community-signal-scan",
    discoverySource: "Community Signal Scan",
    sourceUrl: "https://example.com/neon-prompt-awards",
    capturedAt: "2026-05-06T02:42:00Z",
    websiteUrl: "https://example.com/neon-prompt-awards",
    submissionUrl: "https://example.com/neon-prompt-awards/pay",
    description:
      "A high-volume online awards program for short AI videos, social edits, and prompt experiments.",
    deadline: "2026-05-31T23:59:00Z",
    notificationDate: "2026-06-04",
    eventDate: "2026-06-07",
    location: {
      city: "Online",
      country: "Global",
      region: "Online",
      mode: "Online"
    },
    prizeMoney: 0,
    entryFee: 39,
    frequency: "Monthly",
    duration: { min: 1, max: 45 },
    contentTypes: ["Animation", "Live Action", "Hybrid", "Documentary", "Music Video", "Experimental", "Other"],
    formats: ["MP4"],
    premiereStatus: "Any premiere status accepted",
    language: "Any language accepted",
    aspectRatio: ["Any"],
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
    warningSignals: ["vagueAwards", "noOrganizer", "aggressiveDiscounts", "tooManyCategories", "noVenue"],
    extractedSignals: [
      "Many award categories listed",
      "Fee discount language repeats across the page",
      "No named jury or screening footprint found"
    ],
    suggestedFit:
      "Weak strategic fit for filmmakers seeking credible festival exposure or meaningful industry signals.",
    suggestedStrategy: [
      "Keep this out of serious submission plans unless the goal is low-stakes online recognition.",
      "Do not spend a limited festival budget here before better-fit programs.",
      "Require organizer and jury details before approving."
    ]
  },
  {
    id: "scout-future-frame-student-ai-2026",
    name: "Future Frame Student AI Fest",
    sourceId: "organizer-inbox",
    discoverySource: "Organizer Inbox",
    sourceUrl: "https://example.com/future-frame-student-ai",
    capturedAt: "2026-05-06T02:47:00Z",
    websiteUrl: "https://example.com/future-frame-student-ai",
    submissionUrl: "https://example.com/future-frame-student-ai/apply",
    description:
      "A student-focused online festival for AI-assisted shorts, classroom projects, and first-time filmmakers.",
    deadline: "2026-08-18T23:59:00Z",
    notificationDate: "2026-09-01",
    eventDate: "2026-09-15",
    location: {
      city: "Online",
      country: "Global",
      region: "Online",
      mode: "Online"
    },
    prizeMoney: 1500,
    entryFee: 0,
    frequency: "Annual",
    duration: { min: 1, max: 10 },
    contentTypes: ["Animation", "Hybrid", "Documentary", "Experimental"],
    formats: ["MP4", "YouTube/Vimeo link"],
    premiereStatus: "Public links accepted",
    language: "English subtitles recommended",
    aspectRatio: ["16:9", "9:16"],
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
      prizeDetails: true
    },
    warningSignals: [],
    extractedSignals: [
      "Student eligibility is clear",
      "No entry fee listed",
      "Organizer contact is visible"
    ],
    suggestedFit:
      "Best for student, first-time, or workshop-based AI films that benefit from accessible online screening.",
    suggestedStrategy: [
      "Use for early credibility and feedback rather than prestige positioning.",
      "Confirm student eligibility language before recommending it to paid subscribers.",
      "Good candidate for a low-cost opportunities filter."
    ]
  }
];

export const radarCandidates = [
  {
    id: "neuraframe-awards-2026",
    name: "NeuraFrame AI Film Awards",
    discoveredAt: "2026-05-06T02:05:00Z",
    discoverySource: "Web Discovery Queries",
    websiteUrl: "https://example.com/neuraframe-awards",
    submissionUrl: "https://example.com/neuraframe-awards/submit",
    description:
      "A new London-based showcase for AI-assisted shorts, synthetic actors, and hybrid animation.",
    deadline: "2026-05-29T23:59:00+01:00",
    notificationDate: "2026-06-12",
    eventDate: "2026-07-05",
    location: {
      city: "London",
      country: "United Kingdom",
      region: "Europe",
      mode: "Physical"
    },
    prizeMoney: 10000,
    entryFee: 28,
    frequency: "Annual",
    duration: { min: 2, max: 14 },
    contentTypes: ["Animation", "Hybrid", "Experimental"],
    formats: ["MP4", "MOV"],
    premiereStatus: "UK premiere preferred",
    language: "English subtitles required",
    aspectRatio: ["16:9", "2.39:1"],
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
      prizeDetails: true
    },
    warningSignals: [],
    extractedSignals: [
      "Venue named on event page",
      "Rules include AI disclosure language",
      "Submission form lists entry fee before checkout"
    ],
    suggestedFit:
      "Best for polished UK or Europe-facing AI shorts with clear craft and a festival-ready presentation.",
    suggestedStrategy: [
      "Use UK premiere language if the film has not screened there.",
      "Highlight the production workflow and authorship in the director statement.",
      "Treat it as promising but recheck first-year event logistics before paying."
    ]
  },
  {
    id: "prompt-screen-weekender-2026",
    name: "Prompt Screen Weekender",
    discoveredAt: "2026-05-06T02:08:00Z",
    discoverySource: "Community Signal Monitor",
    websiteUrl: "https://example.com/prompt-screen-weekender",
    submissionUrl: "https://example.com/prompt-screen-weekender/apply",
    description:
      "Weekend online showcase for AI shorts, music videos, and rapid-turnaround prompt films.",
    deadline: "2026-06-14T23:59:00Z",
    notificationDate: "2026-06-21",
    eventDate: "2026-06-28",
    location: {
      city: "Online",
      country: "Global",
      region: "Online",
      mode: "Online"
    },
    prizeMoney: 500,
    entryFee: 9,
    frequency: "Monthly",
    duration: { min: 1, max: 5 },
    contentTypes: ["Music Video", "Experimental", "Animation"],
    formats: ["MP4", "YouTube/Vimeo link"],
    premiereStatus: "Public links accepted",
    language: "Any language accepted",
    aspectRatio: ["16:9", "9:16", "1:1"],
    evidence: {
      officialWebsite: true,
      submissionLink: true,
      deadline: true,
      namedOrganizers: false,
      venue: false,
      rulesPage: true,
      socialPresence: true,
      pastEdition: true,
      transparentFees: true,
      prizeDetails: false
    },
    warningSignals: ["noVenue", "noOrganizer"],
    extractedSignals: [
      "Past online selections are listed",
      "Organizer names are not visible",
      "No live screening footprint found"
    ],
    suggestedFit:
      "Best for public-ready experiments and social-first AI videos that do not need premiere protection.",
    suggestedStrategy: [
      "Avoid submitting films planned for strict premiere festivals.",
      "Use it for audience feedback, not prestige strategy.",
      "Verify organizer identity before submitting anything sensitive."
    ]
  },
  {
    id: "global-ai-laurel-circuit-2026",
    name: "Global AI Laurel Circuit",
    discoveredAt: "2026-05-06T02:11:00Z",
    discoverySource: "Web Discovery Queries",
    websiteUrl: "https://example.com/global-ai-laurel-circuit",
    submissionUrl: "https://example.com/global-ai-laurel-circuit/pay",
    description:
      "Online awards circuit promising guaranteed laurels across hundreds of AI video categories.",
    deadline: "2026-05-30T23:59:00Z",
    notificationDate: "2026-06-02",
    eventDate: "2026-06-05",
    location: {
      city: "Online",
      country: "Global",
      region: "Online",
      mode: "Online"
    },
    prizeMoney: 0,
    entryFee: 49,
    frequency: "Monthly",
    duration: { min: 1, max: 60 },
    contentTypes: ["Animation", "Live Action", "Hybrid", "Documentary", "Music Video", "Experimental", "Other"],
    formats: ["MP4"],
    premiereStatus: "Any premiere status accepted",
    language: "Any language accepted",
    aspectRatio: ["Any"],
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
    warningSignals: ["vagueAwards", "noOrganizer", "aggressiveDiscounts", "tooManyCategories", "noVenue"],
    extractedSignals: [
      "Hundreds of categories listed",
      "Discount countdown appears repeatedly",
      "No named jury, venue, or previous selections found"
    ],
    suggestedFit:
      "Poor strategic fit for filmmakers seeking credible festival recognition or industry exposure.",
    suggestedStrategy: [
      "Do not prioritize this unless you only need a low-value online laurel.",
      "Spend the fee on a better-fit festival with named organizers or a real screening.",
      "Keep it rejected until organizer and venue details are verified."
    ]
  }
];
