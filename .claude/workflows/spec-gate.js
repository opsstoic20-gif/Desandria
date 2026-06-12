export const meta = {
  name: 'spec-gate',
  description:
    'Adversarial gate review: checks recent work against desandria.md locked decisions, security invariants, and scope rules',
  whenToUse:
    'Run before declaring any phase gate, or after a batch of prompts, to catch spec drift (esp. when a different model did the work).',
  phases: [
    { title: 'Review', detail: 'parallel reviewers, one lens each' },
    { title: 'Verify', detail: 'adversarial refutation of each finding' },
  ],
}

// args (optional): { range: 'HEAD~5..HEAD' } — git range to focus on; default whole repo.
const range = args && args.range ? args.range : null
const scope = range
  ? `Focus on the git diff from \`git diff ${range}\` (run it), but read any file needed for context.`
  : 'Review the entire working tree.'

const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['file', 'title', 'severity', 'detail'],
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          title: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'major', 'minor'] },
          detail: { type: 'string' },
          specSection: { type: 'string' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['isReal', 'reason'],
  properties: {
    isReal: { type: 'boolean' },
    reason: { type: 'string' },
  },
}

const COMMON = `You are reviewing the Desandria repo. First read desandria.md and CLAUDE.md fully — they define what is locked. ${scope} Report ONLY violations you can point to at a specific file (and line where possible). No praise, no style nits.`

const LENSES = [
  {
    key: 'locked-arch',
    prompt: `${COMMON} Lens: LOCKED ARCHITECTURE (desandria.md §1, §5; CLAUDE.md do/never table). Violations: freeform bot codegen instead of modules+config; shared Desandria bot identity; Redis/BullMQ instead of pg-boss; discord.py; Prisma or a second ORM; Claude-first generation; new cloud services; capacity cap not respected.`,
  },
  {
    key: 'security',
    prompt: `${COMMON} Lens: SECURITY INVARIANTS (desandria.md §5.3, §5.4, §12; CLAUDE.md). Violations: secrets in code/logs/pages/client components or NEXT_PUBLIC_*; tokens not AES-256-GCM or echoed anywhere; endpoint without zod validation/auth/audit_log; user table without RLS; \`any\` in TS; banned-API gate weaker than §5.3.`,
  },
  {
    key: 'scope-creep',
    prompt: `${COMMON} Lens: SCOPE (desandria.md §3, §10). Violations: any marketplace/listings, emoji store, customer-facing analytics, teams/orgs, white-label code or schema; features serving "everyone" instead of the Riya persona; v1 OUT items present in any form.`,
  },
  {
    key: 'cost-and-process',
    prompt: `${COMMON} Lens: COST + PROCESS (desandria.md §4.3, §8; CLAUDE.md). Violations: LLM call paths without model/tokens/cost logging to generations; missing plan-limit enforcement; smoke tests claimed but not runnable; migrations hand-edited or mixed into feature commits; docs/STATUS.md stale vs actual repo state.`,
  },
]

phase('Review')
const results = await pipeline(
  LENSES,
  (l) => agent(l.prompt, { label: `review:${l.key}`, phase: 'Review', schema: FINDINGS_SCHEMA }),
  (review, l) =>
    parallel(
      (review ? review.findings : []).map((f) => () =>
        agent(
          `Adversarially verify this claimed Desandria spec violation. Read desandria.md, CLAUDE.md, and ${f.file} yourself. Claim: [${f.severity}] ${f.title} — ${f.detail} (spec: ${f.specSection || 'unspecified'}). Try to REFUTE it; isReal=true only if it clearly violates the spec as written.`,
          { label: `verify:${l.key}`, phase: 'Verify', schema: VERDICT_SCHEMA },
        ).then((v) => ({ ...f, lens: l.key, verdict: v })),
      ),
    ),
)

const confirmed = results
  .filter(Boolean)
  .flat()
  .filter(Boolean)
  .filter((f) => f.verdict && f.verdict.isReal)

log(`${confirmed.length} confirmed finding(s)`)
return {
  confirmed,
  summary: confirmed.map((f) => `[${f.severity}] ${f.file}${f.line ? ':' + f.line : ''} — ${f.title} (${f.lens})`),
}
