// Every project page is generated from this file.
//
//   slug, name, shortName?, tagline, kind, year, role, stack, links[{ label, href, primary? }]
//   cover       { type: 'image' | 'video', src, alt, fit?: 'contain', bg? }  (omit → pipeline diagram)
//   context     { heading, paragraphs[], facts?[{ value, label }] }
//   pipeline    steps[{ name, text }]                       scroll-scrubbed diagram
//   highlights  [{ title, text, metric?, metricLabel? }]    numbers only where they matter
//   gallery     [{ ...media, caption?, wide?, ar? }]
//   caveat?     one honest line under the highlights
//
// Media lives in public/media/<slug>/; reference it without a leading slash.

import { sharpeningSVG } from '../diagram.js';

const GH = 'https://github.com/YaokaiZhang/';

export const projects = [
  {
    slug: 'rehabflow',
    name: 'RehabFlow',
    tagline: 'A multi-agent rehab assistant that triages safely, remembers each patient and keeps a clinician in the loop.',
    kind: 'Agent system',
    year: '2025 – 2026',
    role: 'Lead developer',
    stack: ['LangGraph', 'Claude', 'FastAPI', 'Qdrant', 'Postgres', 'Langfuse', 'Next.js', 'MediaPipe'],
    links: [{ label: 'GitHub', href: GH + 'RehabFlow', primary: true }],
    cover: { type: 'image', src: 'media/rehabflow/demo-walkthrough.gif', alt: 'RehabFlow walkthrough', fit: 'contain', bg: '#fff' },
    context: {
      heading: 'Rehab happens at home, mostly unsupervised.',
      paragraphs: [
        'Clinic hours cover about 2% of a patient’s week. The rest is home exercise, where adherence can fall to half.',
        'RehabFlow covers that gap: safety-gated triage, daily exercises from a curated catalog, live pose coaching, and one Care Episode a clinician can follow.',
      ],
      facts: [
        { value: '1,622', label: 'exercises in the retrieval catalog' },
        { value: '41', label: 'evaluation cases against live services' },
      ],
    },
    pipeline: [
      { name: 'Context integrity', text: 'Authenticate and scope every request to its episode; failures go to a safe fallback.' },
      { name: 'Router', text: 'Red flags stop the flow, ambiguity pauses at a checkpoint, the rest goes to the Consultant.' },
      { name: 'Context assembly', text: 'Patient memory plus three-level episode memory, packed per node under a 256k-token ceiling.' },
      { name: 'Planned retrieval', text: 'Plan first, then tools: parallel when independent, sequenced when not.' },
      { name: 'Parallel review', text: 'Safety and grounding reviewers check the draft at the same time.' },
      { name: 'Repair or fall back', text: 'One bounded repair pass, then a safe answer pointing to a professional.' },
      { name: 'Background memory', text: 'Memory and compaction agents update documents; every trace goes to Langfuse.' },
    ],
    highlights: [
      { title: 'Progressive memory recall', text: 'Keyword index → maintained episode detail → raw conversation search, opened only as needed.' },
      { title: 'Drafting never judges itself', text: 'Six single-purpose agents; reviewer disagreement allows one repair, never an open loop.' },
      { title: 'Checkable evidence', text: 'Web search limited to nine clinical sources; unsupported claims are withheld.' },
      { title: 'Evaluation on live services', text: 'Each case runs against its own backend, database and vector store, scored by an LLM judge in Langfuse.' },
      { title: 'Pose feedback in the browser', text: 'MediaPipe on the patient’s camera streams a movement score to the clinician; video stays on the device.' },
    ],
    gallery: [
      { type: 'image', src: 'media/rehabflow/ai-triage-intake.gif', alt: 'Triage intake', caption: 'Triage intake', fit: 'contain', bg: '#fff' },
      { type: 'image', src: 'media/rehabflow/ai-daily-rehab-pose.gif', alt: 'Exercise with pose overlay', caption: 'Daily rehab with pose overlay', fit: 'contain', bg: '#fff' },
      { type: 'image', src: 'media/rehabflow/professional-care.gif', alt: 'Clinician view', caption: 'Clinician view on the same Care Episode', fit: 'contain', bg: '#fff', wide: true },
    ],
  },

  {
    slug: 'chainrisk',
    name: 'Chainrisk',
    tagline: 'Graph neural networks that screen Ethereum addresses and tokens for scams, served from one CPU API.',
    kind: 'Graph ML',
    year: '2026',
    role: 'Team of three',
    stack: ['PyTorch', 'GraphSAGE', 'DuckDB', 'FastAPI', 'Vue', 'Docker', 'Modal'],
    links: [{ label: 'GitHub', href: GH + 'ds-crypto-project', primary: true }],
    cover: { type: 'image', src: 'media/chainrisk/app-token-analysis-graph.jpg', alt: 'Token analysis with transaction graph and risk scores' },
    context: {
      heading: 'Fraud on Ethereum is public, just scattered.',
      paragraphs: [
        'The signs of a scam are spread across hundreds of transfers and counterparties.',
        'Chainrisk turns an address’s history into a point-in-time graph and scores it per task — phishing, Ponzi, honeypot, rug pull — plus a forecast of whether a new token keeps trading.',
      ],
      facts: [
        { value: '988,383', label: 'first-week swaps across 2,720 pools' },
        { value: '11 ms', label: 'median CPU inference per token' },
      ],
    },
    pipeline: [
      { name: 'Sources and labels', text: 'Etherscan, RPC and Uniswap subgraphs; labels kept with source and version.' },
      { name: 'Point-in-time graphs', text: 'Two hops, ≤512 nodes and 4,096 edges, only events before the cutoff.' },
      { name: 'Leak-free splits', text: 'Grouped, stratified splits; scalers fit on training data only.' },
      { name: 'Training', text: 'Two-layer GraphSAGE; AP picks the checkpoint, macro-F1 the threshold.' },
      { name: 'Release', text: 'Five checksummed model bundles, pinned in one manifest.' },
      { name: 'Serve', text: 'FastAPI on Modal; queued jobs stream progress to a Vue app.' },
    ],
    highlights: [
      { metric: '0.942', metricLabel: 'ROC-AUC on later-launched tokens · baseline 0.887', title: 'Graphs beat features on a time split', text: 'Trained before 2024, tested on 2025–26 launches.' },
      { metric: '0.87–1.00', metricLabel: 'validation AP across four detectors', title: 'One model per scam type', text: 'Separate labels, graphs and thresholds — no single “scam probability”.' },
      { title: 'Train only on what production has', text: 'Retrained without historical USD prices, which the live service can’t fetch; accuracy held.' },
      { title: 'Production parity', text: 'One script builds the image, verifies checksums and replays recorded requests — in CI too.' },
    ],
    caveat: 'Scam-task scores are validation-only and uncalibrated.',
    gallery: [
      { type: 'image', src: 'media/chainrisk/app-home-live-transactions.jpg', alt: 'Live transactions feed', caption: 'Live mainnet feed', wide: true },
      { type: 'image', src: 'media/chainrisk/model-ranking-comparison.png', alt: 'Model comparison', caption: 'Edge GCN vs GraphSAGE vs tabular', fit: 'contain', bg: '#fff' },
      { type: 'image', src: 'media/chainrisk/operating-tradeoffs.png', alt: 'Operating trade-offs', caption: 'Operating point at 10% FPR', fit: 'contain', bg: '#fff' },
      { type: 'image', src: 'media/chainrisk/report-model-results-table.png', alt: 'Model results table from the report', caption: 'Results report', wide: true },
    ],
  },

  {
    slug: 'flight-scanner',
    name: 'Flight Scanner',
    tagline: 'A fare monitor that learns what each kind of trip normally costs and alerts only on real dips.',
    kind: 'Data engineering',
    year: '2026',
    role: 'Solo',
    stack: ['Dagster', 'dbt', 'Postgres', 'Databricks', 'FastAPI', 'Next.js', 'Kubernetes'],
    links: [{ label: 'GitHub', href: GH + 'flight-scanner', primary: true }],
    cover: { type: 'image', src: 'media/flight-scanner/deals-feed-baseline-strips-prototype.png', alt: 'Deals feed against baseline bands' },
    context: {
      heading: 'Fare alerts want a route. People want “somewhere warm in November”.',
      paragraphs: [
        'Describe trips loosely — “Helsinki to anywhere in Europe, 3–6 nights in November”.',
        'Every 30 minutes it collects cached fares, learns a baseline per trip type, verifies candidates live and alerts with one-tap feedback.',
      ],
    },
    pipeline: [
      { name: 'Scan planner', text: 'Rank tasks by proximity, volatility and staleness within each source’s budget.' },
      { name: 'Ingestion', text: 'Archive raw payloads; parse one-way and round-trip prices.' },
      { name: 'Quality gates', text: 'Empty, jumpy or stale slices are blocked, not the whole source.' },
      { name: 'dbt models', text: 'History → baselines → marts; round trips composed in SQL.' },
      { name: 'Verify', text: 'Live re-checks within 8 a day and 250 a month.' },
      { name: 'Alert and learn', text: 'Telegram or email with 👍/👎, feeding a precision backtest.' },
    ],
    highlights: [
      { metric: '~600', metricLabel: 'calls per scan instead of ~18,000', title: 'Compose round trips, don’t query them', text: 'Monthly one-way prices paired in SQL price every itinerary.' },
      { title: 'Outlier-resistant baseline', text: '60-day median and MAD, today excluded, with route → country → provisional fallbacks.' },
      { title: 'Precision, measured', text: 'A deal is real if prices rebound at least halfway to baseline.' },
      { title: 'One dbt project, two engines', text: 'Runs on Postgres and Databricks; a 201,428-row export matched exactly.' },
    ],
    gallery: [
      { type: 'video', src: 'media/flight-scanner/prototype-walkthrough.webm', poster: 'media/flight-scanner/deals-feed-baseline-strips-prototype.png', alt: 'Prototype walkthrough: deals, route explorer, backtest', caption: 'Design prototype, synthetic data', wide: true },
      { type: 'image', src: 'media/flight-scanner/route-explorer-baseline-band-prototype.png', alt: 'Route explorer', caption: 'Baseline band — prototype' },
      { type: 'image', src: 'media/flight-scanner/data-health-quality-gate-live-app.png', alt: 'Data health', caption: 'Data health in the running app' },
    ],
  },

  {
    slug: 'control-room',
    name: 'Car Delivery Control Room',
    shortName: 'Control Room',
    tagline: 'Rules flag the orders, an LLM reviewer explains them, operators decide.',
    kind: 'Agent system',
    year: '2026',
    role: 'Hackathon team',
    stack: ['Next.js', 'TypeScript', 'Postgres', 'Claude Haiku', 'Azure Speech'],
    links: [{ label: 'GitHub', href: GH + 'control-room-codriver', primary: true }],
    cover: { type: 'image', src: 'media/control-room/walkthrough.gif', alt: 'Signing in as operator, opening Orders and picking a blocked Bentley', ar: '16 / 10' },
    context: {
      heading: 'A hundred orders. Which need a person, and why?',
      paragraphs: [
        'Built in 24 hours at the Prompt Operations Hackathon for a car-delivery operator.',
        'Agents do the cheap work — reviewing orders, drafting proposals, first-line calls. People make the calls.',
      ],
      facts: [
        { value: '$0.0028', label: 'median cost to review one order' },
        { value: '19/19', label: 'on the reviewer evaluation' },
      ],
    },
    pipeline: [
      { name: 'Immutable snapshot', text: 'Source data never edited; every change is an appended event.' },
      { name: 'Rules', text: 'Thirteen deterministic checks flag ~21 of 100 orders.' },
      { name: 'LLM reviewer', text: 'Fresh context per order, read-only tools, validated citations.' },
      { name: 'Approval policy', text: 'Who and what decide whether an agent acts, asks or proposes.' },
      { name: 'Three-tier calls', text: 'Keypad → checked voice agent → human.' },
      { name: 'Lessons', text: 'Corrections become lessons only after an eval gate and approval.' },
    ],
    highlights: [
      { title: 'Rules first, model second', text: 'Cheap checks catch the obvious; the reviewer sweeps the rest once.' },
      { title: 'Evidence or nothing', text: 'Findings whose citations don’t validate get one repair, then are dropped.' },
      { title: 'Cost tracked per call', text: 'Prompt caching kept a full 100-order sweep at $0.33.' },
      { title: 'Learning behind a gate', text: 'A lesson must not hurt the eval set and must help the cases it came from.' },
    ],
    gallery: [],
  },

  {
    slug: 'tts-context-lab',
    name: 'TTS Context Lab',
    tagline: 'Why LLM-based zero-shot TTS is so sensitive to its voice prompt — and how to tune it.',
    kind: 'ML research',
    year: '2026',
    role: 'Thesis, Wuhan University',
    stack: ['PyTorch', 'CosyVoice2', 'Fish-Speech', 'F5-TTS', 'WavLM', 'Whisper'],
    links: [
      { label: 'GitHub', href: GH + 'TTS-Context-Lab', primary: true },
      { label: 'Report', href: GH + 'TTS-Context-Lab/blob/main/resource/report.pdf' },
    ],
    cover: { type: 'diagram', svg: sharpeningSVG() },
    context: {
      heading: 'Same model, same voice, very different results.',
      paragraphs: [
        'Zero-shot TTS clones a voice from seconds of audio, but the choice of clip swings quality widely.',
        'A Bayesian theory of in-context learning for speech, tested on six models, turned into prompt rules and soft-prompt tuning.',
      ],
      facts: [{ value: '~0.25', label: 'similarity spread across prompts, one model' }],
    },
    pipeline: [
      { name: 'Theory', text: 'Bound the error for correlated, non-exchangeable speech context.' },
      { name: 'Scaling law', text: 'Effective sample size × alignment, plus a noise floor.' },
      { name: 'Toy validation', text: 'Gaussian model with AR(1) noise checks each term.' },
      { name: 'Six-model study', text: '500 prompts, 50 speakers, six diversity metrics.' },
      { name: 'Soft prompts', text: 'Learn a prefix from ten clips; drop the audio prompt.' },
    ],
    highlights: [
      { title: 'Length is the wrong axis', text: 'Curves at every correlation level collapse onto one 1/N_eff line.' },
      { metric: 'r > 0.99', metricLabel: 'alignment vs error', title: 'Alignment predicts error', text: 'Misaligned prompts stall, however long.' },
      { title: 'Diversity beats pitch', text: 'Embedding diversity predicts quality beyond length; pitch variance doesn’t.' },
      { metric: '+3.41%', metricLabel: 'speaker similarity, Fish-Speech 1.5', title: 'Soft prompts beat audio prompts', text: 'Ten clips, frozen backbone; CosyVoice2 WER falls 9%.' },
    ],
    gallery: [
      { type: 'image', src: 'media/tts-context-lab/prompt-sensitivity-sim-violin.png', alt: 'Similarity across prompts', caption: 'Prompt sensitivity, six models', fit: 'contain', bg: '#fff' },
      { type: 'image', src: 'media/tts-context-lab/posterior-sharpening-illustration.png', alt: 'Posterior sharpening', caption: 'Posterior sharpening', fit: 'contain', bg: '#fff' },
      { type: 'image', src: 'media/tts-context-lab/theory-validation-scaling-law-grid.png', alt: 'Scaling-law validation', caption: 'Toy-model validation', fit: 'contain', bg: '#fff', wide: true, ar: '16 / 11' },
    ],
  },

  {
    slug: 'lmfca-net',
    name: 'LMFCA-Net',
    tagline: 'Multi-channel speech enhancement light enough for a laptop CPU.',
    kind: 'Speech ML research',
    year: '2025',
    role: 'First author, ICASSP 2025',
    stack: ['PyTorch', 'Microphone arrays', 'STFT', 'Depthwise convolution'],
    links: [
      { label: 'Paper', href: 'https://arxiv.org/abs/2502.11462', primary: true },
      { label: 'IEEE', href: 'https://ieeexplore.ieee.org/document/10889867' },
      { label: 'Demo', href: 'https://lmfcanet.github.io/' },
    ],
    cover: { type: 'image', src: 'media/lmfca-net/cover.jpg', alt: 'Spectrograms: noisy input and LMFCA-Net output', fit: 'contain', bg: '#121316' },
    context: {
      heading: 'More microphones, without the compute bill.',
      paragraphs: [
        'Multi-channel models clean speech well, but most are too heavy for edge devices.',
        'LMFCA-Net swaps recurrent units for cheap convolutional attention along time and frequency.',
      ],
      facts: [
        { value: '1.77', label: 'GMACs' },
        { value: '0.16', label: 'real-time factor, laptop CPU' },
      ],
    },
    pipeline: [
      { name: 'Input', text: 'Real and imaginary STFT of all six channels.' },
      { name: 'T-FCA', text: 'Narrow-band attention along time.' },
      { name: 'F-FCA', text: 'Cross-band attention along frequency.' },
      { name: 'Bottleneck', text: 'Sandglass units.' },
      { name: 'Decoder', text: 'FT-FCA blocks, upsampled back to full size.' },
      { name: 'Output', text: 'Complex ratio mask.' },
    ],
    highlights: [
      { title: 'Attention without recurrence', text: 'Pool, 1-D depthwise convs per axis, sigmoid, upsample.' },
      { metric: '~6×', metricLabel: 'fewer MACs than MC-ConvTasNet', title: 'Near-heavyweight quality', text: 'PESQ 2.51 vs 2.68 at 1.77 vs 10.11 GMACs.' },
      { metric: '8×', metricLabel: 'faster on a laptop CPU', title: 'Real-time headroom', text: 'RTF 0.16 vs 1.29 on an i5-1135G7.' },
      { title: 'Channels actually help', text: 'Mono to multi-channel gains >0.25 PESQ; other light models ~0.1.' },
    ],
    gallery: [
      { type: 'image', src: 'media/lmfca-net/architecture.png', alt: 'LMFCA-Net architecture', caption: 'Encoder, sandglass bottleneck, decoder', fit: 'contain', bg: '#fff', wide: true, ar: '20 / 9' },
      { type: 'image', src: 'media/lmfca-net/attention.png', alt: 'T-FCA, F-FCA and FT-FCA attention', caption: 'Attention along time, frequency, both', fit: 'contain', bg: '#fff' },
    ],
    caveat: 'PESQ trails heavier models like McNet; offline only, causal version is future work.',
  },

  {
    slug: 'curb-floor-check',
    name: 'Curb Floor Check',
    shortName: 'Curb',
    tagline: 'Every financed car on a dealer’s floor, accounted for without walking the lot. Won the mini hackathon at Netlight Consulting.',
    kind: 'Vision and statistics',
    year: '2026',
    role: 'Hackathon team',
    stack: ['Next.js', 'TypeScript', 'Claude vision', 'SSE'],
    links: [{ label: 'GitHub', href: GH + 'dealer-floor-check', primary: true }],
    cover: { type: 'video', src: 'media/curb-floor-check/story-scroll.webm', poster: 'media/curb-floor-check/hero.jpg', alt: 'Curb story page scrolling through its chapters' },
    context: {
      heading: 'Banks pay €170 a car to count their collateral.',
      paragraphs: [
        'Once a year, in person. Between visits, a car sold out of trust slips through.',
        'Curb checks less and catches more: data signals, dealer self-check-ins, risk-weighted spot checks, full counts only on confirmed problems.',
      ],
    },
    pipeline: [
      { name: 'Signals', text: 'Connected-car, marketplace and registry feeds; a sale starts a payoff clock.' },
      { name: 'Risk score', text: 'Transparent 0–100 score with its top reasons.' },
      { name: 'Sampling', text: 'Smallest sample meeting each tier’s miss-probability target.' },
      { name: 'Photo checks', text: 'Vision reads VIN, plate and odometer blind, then checks against records.' },
      { name: 'Escalation', text: 'Uncertain reads go to people; only an officer can pause credit.' },
    ],
    highlights: [
      { title: 'Vision that reads blind', text: 'The model never sees the expected values, so it can’t agree its way to a pass.' },
      { metric: '2–4', metricLabel: 'cars per check-in', title: 'Exact sampling', text: 'Hypergeometric miss probability, compounded over a year.' },
      { title: 'A sale isn’t fraud', text: 'Alerts need two independent sources to agree.' },
    ],
    gallery: [
      { type: 'video', src: 'media/curb-floor-check/bank-alert-to-photo-checks.webm', poster: 'media/curb-floor-check/bank-portfolio.png', alt: 'Bank dashboard: alert, escalation, verified photo checks', caption: 'From alert to verified photos', wide: true },
      { type: 'image', src: 'media/curb-floor-check/bank-portfolio.png', alt: 'Bank portfolio dashboard', caption: 'Portfolio ranked by risk' },
      { type: 'image', src: 'media/curb-floor-check/bank-alert-detail.png', alt: 'High alert drawer', caption: 'Sold, no payoff' },
      { type: 'image', src: 'media/curb-floor-check/dealer-capture-mobile.jpg', alt: 'Dealer app capturing the VIN plate', caption: 'Dealer check-in', fit: 'contain', ar: '4 / 5' },
      { type: 'image', src: 'media/curb-floor-check/dealer-car-verified-mobile.png', alt: 'Dealer app showing a verified car', caption: 'Verified', fit: 'contain', ar: '4 / 5' },
      { type: 'image', src: 'media/curb-floor-check/bank-photo-check-results.jpg', alt: 'Photo-check results per car', caption: 'Photo checks, simulated reader', wide: true },
    ],
  },

  {
    slug: 'nordparcel-desk',
    name: 'NordParcel Desk',
    shortName: 'NordParcel',
    tagline: 'A shipping support agent that quotes, sells and hands off — and cannot invent a price.',
    kind: 'LLM safety',
    year: '2026',
    role: 'Hackathon',
    stack: ['Next.js', 'TypeScript', 'Claude Haiku', 'Tool use', 'LLM-as-judge'],
    links: [{ label: 'GitHub', href: GH + 'shipping-customer-support', primary: true }],
    cover: { type: 'video', src: 'media/nordparcel-desk/chat-quote-exchange.webm', poster: 'media/nordparcel-desk/chat-quote-cards-and-guardrails.jpg', alt: 'A quote request answered with quote cards, then a discount request refused' },
    context: {
      heading: 'A support bot that misquotes is a liability.',
      paragraphs: [
        'Quotes, product advice, lead capture and human handoff for a fictional carrier.',
        'Prices never pass through the model, and company guidelines run as checks on every conversation.',
      ],
    },
    pipeline: [
      { name: 'Tool loop', text: 'Nine deterministic tools for quotes, restrictions, leads and handoff.' },
      { name: 'Price source', text: 'Code issues quotes; the model only sees an id.' },
      { name: 'Output guard', text: 'Unissued euro amounts are stripped and logged.' },
      { name: 'Photo quotes', text: 'Vision estimates size from a photo; the customer confirms.' },
      { name: 'Evals', text: 'Each guideline has a regex, tool or judge detector.' },
    ],
    highlights: [
      { title: 'Hallucinated prices are impossible', text: 'The model never sees an amount.' },
      { metric: '15/15', metricLabel: 'adversarial turns passed', title: 'Guidelines become tests', text: 'Judge, guard and tool checks from one dashboard.' },
      { title: 'Never dead-ends', text: 'No key or a failed call falls back to a scripted agent.' },
    ],
    gallery: [
      { type: 'image', src: 'media/nordparcel-desk/chat-quote-cards-and-guardrails.jpg', alt: 'Quote cards and a refused discount', caption: 'Quotes from code; a discount request refused', wide: true },
      { type: 'image', src: 'media/nordparcel-desk/photo-estimate.jpg', alt: 'Size estimate from a photo', caption: 'Estimate from a photo' },
      { type: 'image', src: 'media/nordparcel-desk/photo-quote-cards.jpg', alt: 'Quotes after confirming the estimate', caption: 'Confirmed, then quoted' },
      { type: 'image', src: 'media/nordparcel-desk/compliance-stress-tests.png', alt: 'Compliance stress tests', caption: 'Adversarial suite' },
      { type: 'image', src: 'media/nordparcel-desk/sales-lead-panel.png', alt: 'Sales lead panel', caption: 'Lead from a chat' },
    ],
  },

  {
    slug: 'mc-convtasnet',
    name: 'MC-ConvTasNet',
    tagline: 'Multi-channel Conv-TasNet in PyTorch, for separating speakers in reverberant rooms.',
    kind: 'Speech ML',
    year: '2025',
    role: 'Open-source implementation',
    stack: ['PyTorch', 'Dilated TCN', 'Microphone arrays'],
    links: [
      { label: 'GitHub', href: GH + 'MC-ConvTasNet', primary: true },
      { label: 'Paper', href: 'https://arxiv.org/abs/2011.05958' },
    ],
    context: {
      heading: 'More microphones, more cues.',
      paragraphs: [
        'Differences between channels say where each speaker is.',
        'A single-file implementation: a learned spatial encoder joined with the waveform encoder before separation.',
      ],
      facts: [
        { value: '5.0M', label: 'parameters, two-channel' },
        { value: '10.22', label: 'GMac per second of audio' },
      ],
    },
    pipeline: [
      { name: 'Waveform encoder', text: '512 filters over 1 ms windows.' },
      { name: 'Spatial encoder', text: 'One shared 2-D conv over microphone pairs.' },
      { name: 'Bottleneck', text: 'Concatenate, normalise, project to 128.' },
      { name: 'Dilated TCN', text: '3 × 8 blocks; optional causal mode for streaming.' },
      { name: 'Masks and decoder', text: 'Per-speaker masks, transposed conv back to audio.' },
    ],
    highlights: [
      { title: 'Learned spatial cues', text: 'A shared convolution instead of hand-crafted phase features.' },
      { title: 'Long context, small model', text: 'About 0.77 s of context per frame.' },
    ],
    gallery: [],
  },
];
