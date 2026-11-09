**I am submitting the frozen F edit currently in `/work/edited`.**

### What changed
Only **65 rows** of `paligemma_with_expert.paligemma.model.language_model.embed_tokens.weight` were changed: approximately **0.025% of embedding rows**.

The edit uses direct interpolation toward existing, action-grounded word embeddings, such as `cooker -> stove` and `basin -> bowl`. Ambiguous cues receive partial or centroid-based changes; for example, `dairy` is not forced exclusively toward `cheese`. Canonical instruction tokens are protected.

No vision, attention, MLP, action-expert, or action-scaling weights changed. No training was used.

### Mechanism and causal evidence
The diagnosed failures involved **incorrect task/object cues despite active attention to the instruction**. Embedding repairs shifted downstream expert representations toward successful same-task controls.

A diagnostic dose-response supported this localization:

| Edit strength | Success on the same 80 goal episodes |
|---|---:|
| Original | 49/80 |
| Half strength | 59/80 |
| Full F | 68/80 |

These are diagnostic results, not independent validation.

### Independent practice validation
F was frozen before evaluation on **460 reserved variants**, subsequently tested with three seeds:

- **Overall:** 1261/1380 -> 1306/1380, or **91.4% -> 94.6%**
- **Paired gain:** **+3.26 percentage points**
- **Variant-clustered SE:** 0.81 points; approximate 95% CI **[+1.67, +4.85]**
- **Difficulty 5:** **59.5% -> 75.2%**
- **LIBERO Goal:** **77.4% -> 88.0%**

There were **53 recoveries and 8 regressions**; this is not a universal paraphrase fix.

### Safety
Across **1,536 paired trials** in the other six categories, overall successes were unchanged: **1282 -> 1282**. After deduplication, the largest category decrease was **0.42 points**.

All 50 observed canonical prompts avoid the edited rows. Moreover, **60 identical-input replays** spanning every category and suite produced **bit-identical actions and recorded activations**, including inputs from the discordant safety rollouts.

I expect this edit to help unseen paraphrases that use these lexical cues while preserving canonical-instruction behavior. The reported results are from practice variants; the benchmark held-out set remains unseen.