**Submitted: the original checkpoint, with no retained weight edits.** `/work/edited` has no active edits; I verified that the restored tensor exactly matches the original.

### Findings
Looping observations showed suspicious instruction fixation and visual/gripper-feedback patterns. Targeted head edits and rank-one interventions changed these internal signals, but **changing the suspected mechanism did not reliably improve recovery**. Several interventions instead damaged previously successful episodes, including at stronger doses.

### Decisive validation
The final frozen candidate modified only the action expert’s layer-17, head-1 output pathway. Across **288 valid paired episodes from 144 reserved practice scenes**:

| Metric | Original | Candidate |
|---|---:|---:|
| Successes | 166/288 (57.6%) | 164/288 (56.9%) |
| Re-grasp-loop failures | 98 | 98 |

The success difference was **−0.69 percentage points**, with scene-clustered SE **1.97 points**. There were **15 rescues but 17 losses**. Excluding already-solved starts did not change the conclusion. The positive result on the last panel did not outweigh the aggregate evidence.

### Final decision
The candidate failed every precommitted acceptance criterion, so I reverted it rather than submit an unsupported “repair.” **I did not establish a recovery improvement or conclusively localize a repairable causal fault.** Unchanged weights preserve the original policy; they are not expected to improve recovery.

The complete decision and validation statistics are saved in `/work/final_decision.json`, with investigation notes in `/work/notes.md`.