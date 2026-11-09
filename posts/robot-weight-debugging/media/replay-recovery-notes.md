# Recovery weight-edit investigation

## Protocol
- No training or kernel forward passes. Only permitted practice scenes.
- Scene-level discovery/validation split saved in scene_split.json before outcomes.
- Diagnose with actions, frames, attention, and activation/weight analysis.
- Require causal targeted ablations, dose-response, and paired validation.
- Ordinary-task evaluation is not explicitly exposed by the tool; check its availability, and do not substitute recovery preservation for ordinary-task evidence.

## Pass budget
- Forward passes used: 50/50. Final submitted edits: none.

## Current edits
- None. All candidates reverted; original checkpoint submitted.

## Pass 1: original, discovery, 128 paired-start episodes
- Success 71/128 (55.5%); L1 22/32, L2 21/32, L3 15/32, L4 13/32.
- Failures 57; re-grasp-loop failures 41; already-solved starts 7.
- Full expert attention-output summaries, selected VLM/vision summaries, actions and frames saved. No edits.

## Passes 2-4: initial probes
- Two matched task pairs: 367 (cream cheese/butter) and 753 (alphabet soup).
- BOS and wrist attention are common in both successes and loops; not enough for an ablation claim.
- Some mid-layer heads lose base-camera mass in looping observations; self-only heads also present.
- Collected all expert/VLM residual layers for 16 observations in four matched pairs.
- Important: final VLM block output is downstream of the last KV-cache creation; its large episode-level contrast is not itself a conditioning route.

## First causal candidate
- Expert L16 H3: average B/W/lang/self on two looping inputs 0.00/0.02/0.98/0.00 versus 0.01/0.35/0.65/0.00 on two matched successful inputs.
- Its raw gripper/pose readout coupling ratio is 1.386 (second highest across heads).
- Candidate E16H3_O_0.5: halve only columns 768:1024 of expert layer 16 o_proj. This is a targeted head ablation, not a whole-tensor or action rescaling.
- Screening panel fixed at 32 discovery scenes x both starts (baseline 31/64, 21 loop failures).

## Passes 6-7: E16H3_O_0.5 rejected
- Paired screen: 31/64 -> 29/64, -3.1 pp (SE 3.8), 2 rescues / 4 losses.
- Loop failures 21 -> 24; mean flips 12.52 -> 14.98.
- Contradicts simple excessive-prior interpretation; reverted.

## Pass 6 interpretation and next candidate
- E16H3 half-output: identical-input mean gripper differences only ~0.001, translation RMS changes 0.004-0.025. Raw output-weight alignment was not causal gripper evidence.
- Next: rank-one removal of a recorded wrist-minus-base key contrast from L10 H1 query, restricted to slow RoPE coordinate pairs. Probe must confirm the intended attention change.

## Passes 8-9: L10 H1 camera-direction removal rejected
- Probe: base mass in two loops rose 0.041->0.275 and 0.034->0.180; base-focused success 0.701->0.691. Action changes tiny (XYZ RMS ~0.001).
- Paired screen 31/64 -> 28/64, -4.7 pp (SE 3.5), 1 rescue / 4 losses; loops 21->22.
- Reverted; next isolated test is the same directional edit in spatial L12 H3.

## Passes 10-11: L12 H3 camera-direction removal rejected
- Base attention increased as intended; XYZ changes up to 0.017 RMS, gripper timing unchanged.
- Screen 31/64 -> 26/64, -7.8 pp (SE 4.0), 1 rescue / 6 losses, loops 21->23.
- Reverted. Evidence rejects a simple camera-rebalance repair in these two heads.
- Next diagnosis: visually encoded finger state versus action conditioning; saved state used only as an analysis label, never as policy input.

## Early gripper-state route hypothesis
- Open/closed t0 states differ mainly in fingers, but saved noises also differ: do not treat their expert residual contrast as purely visual.
- L0 H6 is the earliest strongly wrist-focused head (~82-90% wrist mass); L3 H2 and L15 H2 also focus on finger-region patches.
- Test partial L0 H6 O-block attenuation, using identical-input original/edited probes to identify actual gripper effects before evaluating it as a repair.

## Pass 12: L0 H6 half-output diagnostic
- 16 identical-input paired probes: 1/160 gripper signs changed; mean XYZ RMS 0.0072. Most gripper amplitude shifts ~0.03, not a timing repair.
- No rollout claim made; reverted to investigate actual gripper-decision route.
- Initial noise has only two arrays across discovery scenes, keyed by gripper start; this explains much of the very consistent expert initial contrast.

## Observational gripper check
- Across saved observations: Gaussian gripper-coordinate/output correlations 0.093 successes, 0.096 loops; finger-width/output correlations -0.567 successes, -0.636 loops.
- This supports strong visible-state dependence, not a globally noise-dominated gripper.
- Next localization: late finger-focused expert L15 H2 O block at 0.5.

## Pass 13: late finger head localization
- L15 H2 half-output: 2/160 gripper signs changed, both in input 13 (scene 1269, initially empty closed gripper); reopening delayed from token 2 to token 4.
- Other 15 inputs: action changes mostly ~0.001; downstream MLP responses partly cancel the head perturbation (L15 ~9-11%, L17 ~1-2%).
- Both early and late finger-head attenuation delay reopening in this state. Next test reverses the intervention: L15 H2 gain 2.0, to strengthen visual failed-grasp feedback.

## Pass 14: L15 H2 gain 2.0 not supported
- 17 paired inputs, including 8 empty-closed loops and 8 holding-like successes: no gripper sign changes, small pose changes. Original threshold case also unchanged.
- Reverted; no rollout claim. Continuing localization using actual residual increments and MLP outputs.

## Pass 15: visual-feedback localization
- Counterfactual fixed-noise copies were refused (no pass charged); only original rollout inputs used.
- Probed 24 matched t0 open/closed pairs; VLM residuals are independent of the differing action noise.
- Computing a matched visual gripper-state contrast, not a success/failure classifier or fitted weight model.
- Matched wrist residual contrast mean cosine across scenes ~0.50-0.57 in layers 0-13; two-half value-direction cosine ~0.72-0.83.
- Candidate: expert O projections at L1-14 attenuate only the corresponding one-dimensional visual gripper-state value direction by 50%, across heads. Directions orthogonalized to mean base/wrist/language values. No output/action/noise scaling.

## Pass 16: distributed visual-gripper attenuation probe
- 17 identical-input paired probes; 2/170 gripper signs changed.
- XYZ RMS change 0.0168.

## Pass 17: visual-gripper value attenuation rejected
- Fixed paired screen: 31/64 -> 25/64, -9.4 pp (SE 4.8), 2 rescues / 8 losses; loop failures 21 -> 23.
- This visual feedback is useful, not an expendable shortcut. Reverted attenuation.
- Next causal dose: gain 1.5 on the SAME protected value directions (alpha=-0.5), L1-14 expert O projections.

## Pass 18: visual-gripper value amplification rejected
- Same screen, gain 1.5: 31/64 -> 27/64, -6.2 pp (SE 3.8), 1 rescue / 5 losses; loop failures 21 -> 20.
- Both attenuation and amplification damaged solved scenes. Reverted all edits.
- Next hypothesis: action-token self-conditioning rather than inadequate raw gripper-state visibility.

## Self-conditioning hypothesis
- Saved maps: E15H5 ~100% action-token attention in all four matched observations; E16H0 ~98.6%, E16H1 ~99.8%, E16H5 ~99.6%; several E17 heads also ~100%.
- Grip-axis residual std in 48 t0 probes grows L14 12.8 -> L15 27.1 -> L16 50.0 -> L17 71.9 at first denoising call.
- Candidate E15H5_O_0.5: earliest isolated self-only head before this amplification. This is a causal test, not a claim that self-attention is inherently bad.

## Pass 19: E15H5 half-output probe
- 0/170 gripper signs changed; XYZ RMS 0.0039.
- E15H5 half-output probe: no sign changes; first-call downstream grip-axis RMS perturbation <0.75 vs natural signal std ~72. Reverted without rollout claim.
- Next: separate adaptive attention and MLP residual branches using identical-input recorded activations.

## Pass 20: adaptive branch decomposition
- Recovered observation-independent time/channel residual multipliers from recorded A, M, and residual increments; cross-observation reconstruction error at L14-17: 0.33%, 0.47%, 0.30%, 0.16%. Diagnostic algebra only; no weight fitting.
- First-call grip-axis increment std at L15/L16/L17: attention 8.00/9.67/16.23; MLP 5.14/11.26/8.72. Both branches matter.
- Adaptive gates substantially change head ranking: E15H4 gated grip/pose ratio 7.20 (highest inspected late head); E16H7 5.04, E15H2 4.85, E16H5 4.08. E16H3 raw alignment was misleading (gated ratio 0.52).
- Next candidate E15H4_O_0.5; mixed self/visual head with strong gripper-specific coupling.

## Pass 21: E15H4 half-output probe
- 0/170 gripper signs changed; XYZ RMS 0.0040.

## Pass 22: E15H4 half-output rejected
- Screen 31/64 -> 29/64, -3.1 pp (SE 3.1), 1 rescue / 3 losses; loops 21 -> 19 but mean flips increased 12.55 -> 13.69.
- Reverted. The previous probe panel was mostly saturated gripping states; next panel emphasizes predicted within-chunk transitions.

## Transition panel and sparse MLP feedback hypothesis
- Saved 64 transition-focused original inputs, 16 each loop/success x closing/opening, in transition_probe_manifest.json.
- Executed traces do NOT show higher approach speed at closing in loops: pre-close XYZ norm 0.333 loops vs 0.419 successes. No premature-speed claim.
- Candidate: halve 32 E16 MLP down-projection columns selected by gated gripper coupling and >4:1 squared grip/pose preference. No full-tensor scaling.

## Pass 23: E16 sparse MLP attenuation probe
- 32 channels contain 35.3% of gated grip coupling, 0.4% pose coupling; median input-grip-contrast alignment percentile 97.7%.
- Transition panel: 19/640 signs changed, 8/320 executed signs changed; XYZ RMS 0.0179.

## Pass 24: E16 MLP grip32 gain 0.5 rejected
- Paired screen 32/64 -> 27/64, -7.8 pp (SE 4.0), 1 rescue / 6 losses; loops 20 -> 23; mean flips 12.55 -> 14.56.
- Original result drifted by one success from earlier repeats (31 -> 32); always use the within-pass paired baseline.
- Attenuation destabilizes, contrary to an excessive-feedback account. Next fixed opposite dose: same 32 columns at gain 1.5.

## Pass 25: E16 MLP grip32 gain 1.5 rejected
- Screen 31/64 -> 29/64, -3.1 pp (SE 3.1), 1 rescue / 3 losses; loops 21 -> 20; flips 12.39 -> 13.36.
- Neither nonlinear-feedback dose improved recovery. Reverted.
- Next hypothesis: fully closed/empty-like hand cue is present visually but insufficiently coupled to corrective arm motion. Distinguish it from object-separated closed fingers and open hand, rather than weakening grasp commands.

## Pass 26: physical-state cue diagnosis
- Correct aperture is abs(q1-q2), not q1+q2 (opposite-signed finger joints).
- 15 fully-closed/empty-like, 16 holding-like, 16 open controls; derive/check split by scene hash.
- L15 value direction protected against holding/open/base/language means: held-out score means 0.608 empty, 0.228 holding, 0.149 open; pairwise separation 95.4%. Cue is not perfectly specific.
- Candidate: rank-one addition to E15H2 O block routes this visual cue toward upward reset. Other direct pose/grip readouts orthogonalized. beta=2 diagnostic, not yet evidence of recovery improvement.

## Pass 27: empty-cue retreat intervention probe
- fully_closed: actual attended cue mean 7.066; first-five mean Z action change 0.0123.
- holding_like: actual attended cue mean -1.440; first-five mean Z action change -0.0018.
- open: actual attended cue mean 0.155; first-five mean Z action change 0.0008.

## Pass 28: empty-cue upward retreat rejected
- Beta=2 paired screen: 31/64 -> 26/64, -7.8 pp (SE 3.4), 0 rescues / 5 losses.
- Loop failures 21 -> 23; mean flips 12.62 -> 14.64. Reverted.
- Visual selectivity and Z action causality did not imply a useful recovery behavior.
- Forward budget now 28/50; current edits none.

## Replanning-feedback diagnosis
- Future gripper prediction vs next executed chunk mismatch: 18.0% loop tokens, 10.8% success tokens (451/216 observations).
- Prefix-only attention maps imply E17H6 is almost wholly self-attending.
- E17H6 gated gripper coupling energy 1.382, versus 0.488 for E15H4 and 0.255 for E16H5; raw coupling alone was misleading.
- Causal candidate: halve E17H6 output block. Current edit E17H6_O_0.5, not yet evaluated.

## Pass 29: E17H6 half-output diagnostic
- Transition probe: 0/160 gripper signs changed; mean XYZ RMS about 0.016.
- No support for a gripper-switching repair; reverted without rollout claim.
- Next pre-specified opposite sign of empty-cue Z intervention: beta=-2 (deeper motion), same cue and magnitude.

## Pass 30: empty-cue depth correction rejected
- Beta=-2 paired screen: 31/64 -> 27/64, -6.2 pp (SE 4.4), 2 rescues / 6 losses.
- Loop failures 21 -> 24. Both signs of the cue-to-Z edit damage solved scenes. Reverted.
- Forward budget 30/50; no current edits.

## Pass 31: instruction-versus-observation query test
- Recovered existing time-conditioning activations from measured adaptive gates; independent gate residual 0.3-0.8%. No weight fitting/training.
- E16H3 attends 84.3% to the word 'place' in the alphabet-soup loop, versus 55.8% to a wrist patch in the matched success; not a BOS sink.
- Candidate removes one slow-RoPE instruction-vs-image query direction, protected against camera contrast and common key direction.
- Pass 31 geometric query edit barely changed looping word attention and reduced visual attention in one success; rejected without rollout.
- Next causal candidate: E16H3 query-block gain 0.5 only, to soften this head's word fixation without removing its output pathway.

## Pass 32: E16H3 query gain 0.5 screen
- 31/64 -> 30/64, -1.6 pp (SE 3.5), 2 rescues / 3 losses; loop failures 21 -> 20.
- L2 +12.5 pp, L1 -12.5 pp, L3 -6.2 pp; not evidence of an overall gain.
- Next same-head dose: query gain 0.75, chosen before its outcomes.

## Pass 33: E16H3 query gain 0.75 rejected
- 31/64 -> 30/64, -1.6 pp (SE 3.5), 2 rescues / 3 losses; loops unchanged. No consistent improvement across query doses. Reverted.
- New structural test: L7 expert v_proj attenuates one existing gripper-plan input direction, derived from within-noise-group open/close contrasts. VLM prefix values remain unedited.
- Mean activation and direct pose-encoding directions protected. This isolates action self-feedback rather than weakening visual feedback or an entire mixed head.

## Pass 34: isolated L7 action-value feedback diagnostic
- Alpha=0.5 rank-one attenuation: 0/160 gripper signs changed, XYZ RMS 0.0020.
- First-call grip-axis perturbation RMS L7 0.042 -> L17 0.081, small relative to natural signal. Reverted.
- Fixed E16H3 query gain 0.5 selected for an independent test despite inconclusive discovery, not claimed beneficial.
- Independent panels frozen by scene hash from the pre-existing validation split, balanced across level/suite, seed 29.

## Pass 35: independent E16H3 query-softening test rejected
- 122 new paired-start episodes, seed 29: 64/122 -> 63/122, -0.8 pp (SE 3.0), 6 rescues / 7 losses.
- Loop failures 40 -> 43. L2 +9.4 pp repeated the discovery direction, but overall no gain and solved-scene damage. Reverted.
- Independent panel 1 now consumed; panels 2-4 remain untouched.

## Pass 36: dominant query-mode causal probe
- E16H3 leading singular mode carries 5.7% of head weight energy but 36-49% of observed mean-query energy.
- Candidate halves only this rank-one mode; other query modes unchanged.
- Probe summary: [{"input": 0, "masses": [[0.004671062342822552, 0.028432484716176987, 0.9635193347930908, 0.003377079963684082, 0.5085006952285767], [0.012290903367102146, 0.08554297685623169, 0.8905051350593567, 0.011660993099212646, 0.49445319175720215]], "xyz_rms": 0.0011147155891711423}, {"input": 1, "masses": [[0.002899989252910018, 0.024420037865638733, 0.9706833362579346, 0.001996636390686035, 0.2573811709880829], [0.009215941652655602, 0.04962968826293945, 0.9336846470832825, 0.0074697136878967285, 0.25520849227905273]], "xyz_rms": 0.000873043131029612}, {"input": 2, "masses": [[0.000962949707172811, 0.011067664250731468, 0.9868327975273132, 0.0011366009712219238, 0.8434070348739624], [0.011283747851848602, 0.10468179732561111, 0.8731256127357483, 0.010908842086791992, 0.5532063245773315]], "xyz_rms": 0.008196185873166867}, {"input": 3, "masses": [[0.008006196469068527, 0.6689451336860657, 0.3222191333770752, 0.0008295178413391113, 0.10883057117462158], [0.04677906632423401, 0.5829600095748901, 0.3670278787612915, 0.0032330751419067383, 0.03196411207318306]], "xyz_rms": 0.018518249379716363}]

## Pass 37: dominant query-mode attenuation rejected
- 31/64 -> 27/64, -6.2 pp (SE 3.8), 1 rescue / 5 losses; loops 21 -> 25. Reverted.
- Reducing observed word fixation was not sufficient for better recovery.

## Spatial-concentration hypothesis
- E13H5 conditional image-attention entropy is higher in both recorded loops (paired differences +0.953 and +0.243 nats).
- Its gated, final-normalization-adjusted pose coupling is substantial (0.0383 energy).
- Candidate query gain 1.5 for only E13H5, to concentrate current visual localization rather than rebalance cameras or weaken grip commands.
- Before any forward test, rejected E13H5 spatial interpretation: top image patch was wrist row0/col1 in all four inputs, likely a global/sink feature. Untested edit removed.
- Revised spatial candidate E8H7: image mass 0.65-0.98, observation-dependent peak positions, loop image-entropy differences +0.586/+1.154 nats. Query gain 1.5.

## Pass 38: E8H7 query gain 1.5 mechanism probe
- {"input": 0, "attention": [{"image_mass": 0.7811, "entropy": 4.4333, "effective_patches": 84.21, "peak": ["wrist", 0, 11], "peak_mass": 0.0933}, {"image_mass": 0.6316, "entropy": 3.3542, "effective_patches": 28.62, "peak": ["wrist", 0, 11], "peak_mass": 0.17}], "xyz_rms": 0.00046, "grip_sign_changes": 0, "xyz_first5_delta": [0.0001, 0.0002, 0.0001]}
- {"input": 1, "attention": [{"image_mass": 0.6524, "entropy": 3.8512, "effective_patches": 47.05, "peak": ["wrist", 7, 4], "peak_mass": 0.0925}, {"image_mass": 0.4832, "entropy": 2.2913, "effective_patches": 9.89, "peak": ["wrist", 7, 4], "peak_mass": 0.1509}], "xyz_rms": 0.00061, "grip_sign_changes": 0, "xyz_first5_delta": [0.0008, 0.0001, 0.0003]}
- {"input": 2, "attention": [{"image_mass": 0.8653, "entropy": 3.5687, "effective_patches": 35.47, "peak": ["base", 3, 3], "peak_mass": 0.1804}, {"image_mass": 0.8035, "entropy": 2.4876, "effective_patches": 12.03, "peak": ["base", 3, 3], "peak_mass": 0.3173}], "xyz_rms": 0.00221, "grip_sign_changes": 0, "xyz_first5_delta": [0.0016, 0.0002, 0.003]}
- {"input": 3, "attention": [{"image_mass": 0.9837, "entropy": 2.4656, "effective_patches": 11.77, "peak": ["base", 3, 6], "peak_mass": 0.2726}, {"image_mass": 0.9933, "entropy": 1.7224, "effective_patches": 5.6, "peak": ["base", 3, 6], "peak_mass": 0.3977}], "xyz_rms": 0.0007, "grip_sign_changes": 0, "xyz_first5_delta": [-0.0001, 0.0001, -0.0001]}

## Pass 39: E8H7 query sharpening rejected
- Paired screen: 31/64 -> 29/64, -3.1 pp (SE 3.1), 1 rescue / 3 losses; loops 21 -> 22. Reverted.
- The intended entropy reduction was causal, but not a recovery repair. Current edits none.

## Conditional empty-hand query hypothesis
- E16 normalized query-input contrast from recorded physical states, with holding/open/noise-control means and direct action-input directions protected. No fitting/training.
- Scene-disjoint pairwise separation 82.9%; imperfect physical-state specificity.
- Candidate subtracts beta=0.5 of the dominant E16H3 query-mode amplitude only along that contrast (rank one; 4.50% of head Frobenius norm). Query mode attenuation globally failed earlier; this tests state selectivity.

## Pass 40: conditional empty-hand query probe
- {"input": 0, "group": "fully_closed", "base_wrist_lang_self": [[0.0002, 0.0011, 0.999, -0.0003], [0.0016, 0.0086, 0.9893, 0.0005]], "xyz_rms": 0.00177, "first5_xyz_delta": [-0.0008, -0.0001, -0.003], "grip_sign_changes": 0}
- {"input": 1, "group": "fully_closed", "base_wrist_lang_self": [[0.0018, 0.5771, 0.4194, 0.0018], [0.0026, 0.5522, 0.4427, 0.0026]], "xyz_rms": 0.00066, "first5_xyz_delta": [0.0003, -0.0004, -0.001], "grip_sign_changes": 0}
- {"input": 2, "group": "holding_like", "base_wrist_lang_self": [[0.0032, 0.0561, 0.9396, 0.0011], [0.0091, 0.0737, 0.9131, 0.0041]], "xyz_rms": 0.00165, "first5_xyz_delta": [0.0003, -0.0002, 0.0004], "grip_sign_changes": 0}
- {"input": 3, "group": "holding_like", "base_wrist_lang_self": [[0.0073, 0.2172, 0.7727, 0.0029], [0.0063, 0.2084, 0.7824, 0.003]], "xyz_rms": 0.00056, "first5_xyz_delta": [-0.0009, -0.0, -0.0003], "grip_sign_changes": 0}
- Pass 40 did not establish selective visual reorientation: one empty-hand input lost visual mass; holding effects were comparable. Reverted without a rollout claim.

## Empty-cue closing-channel hypothesis
- Reconstructed E15 pooled pre-MLP residual from saved E14 residuals and E15 attention outputs/gates. Physical cue contrast protects holding/open means and direct action input.
- Eight E15 MLP channels selected by static positive empty-cue gate alignment, closing-signed output coupling, and >4:1 grip/pose coupling. No fitting or nonlinear kernel forward pass.
- Channels [523, 280, 351, 1232, 462, 3153, 3051, 2197] hold 4.54% of direct grip coupling and 0.036% of pose coupling. Candidate halves only these down-projection columns.

## Pass 41: E15 empty-closing8 gain 0.5 probe
- {"i": 0, "type": "empty", "grip_delta": 0.0001, "grip_first5_delta": -0.0001, "signs": 0, "xyz_rms": 0.00246}
- {"i": 1, "type": "empty", "grip_delta": 0.0006, "grip_first5_delta": 0.0007, "signs": 0, "xyz_rms": 0.0008}
- {"i": 2, "type": "empty", "grip_delta": -0.0, "grip_first5_delta": 0.0003, "signs": 0, "xyz_rms": 0.00055}
- {"i": 3, "type": "empty", "grip_delta": -0.0002, "grip_first5_delta": -0.0, "signs": 0, "xyz_rms": 0.00079}
- {"i": 4, "type": "holding", "grip_delta": -0.0007, "grip_first5_delta": -0.0008, "signs": 0, "xyz_rms": 0.00083}
- {"i": 5, "type": "holding", "grip_delta": 0.0002, "grip_first5_delta": 0.0002, "signs": 0, "xyz_rms": 0.00051}
- {"i": 6, "type": "holding", "grip_delta": -0.0002, "grip_first5_delta": -0.0002, "signs": 0, "xyz_rms": 0.00086}
- {"i": 7, "type": "holding", "grip_delta": -0.0, "grip_first5_delta": -0.0002, "signs": 0, "xyz_rms": 0.00125}
- {"i": 8, "type": "loop_close", "grip_delta": 0.0007, "grip_first5_delta": 0.0014, "signs": 0, "xyz_rms": 0.00262}
- {"i": 9, "type": "loop_close", "grip_delta": 0.0006, "grip_first5_delta": 0.0006, "signs": 0, "xyz_rms": 0.00055}
- {"i": 10, "type": "loop_open", "grip_delta": 0.0005, "grip_first5_delta": 0.0015, "signs": 0, "xyz_rms": 0.00068}
- {"i": 11, "type": "loop_open", "grip_delta": -0.0002, "grip_first5_delta": -0.0002, "signs": 0, "xyz_rms": 0.00051}
- {"i": 12, "type": "success_close", "grip_delta": 0.0012, "grip_first5_delta": 0.0012, "signs": 0, "xyz_rms": 0.00045}
- {"i": 13, "type": "success_close", "grip_delta": 0.0005, "grip_first5_delta": 0.0002, "signs": 0, "xyz_rms": 0.00058}
- {"i": 14, "type": "success_open", "grip_delta": 0.0001, "grip_first5_delta": 0.0, "signs": 0, "xyz_rms": 0.00056}
- {"i": 15, "type": "success_open", "grip_delta": 0.0, "grip_first5_delta": 0.0003, "signs": 0, "xyz_rms": 0.00041}
- Pass 41: 0/160 gripper signs changed, mean XYZ RMS 0.00090; the proposed closing-channel signature was not causally persuasive. Reverted without rollout claim.

## Opposite spatial-attention dose
- E8H7 Q gain 1.5 reduced success. Pre-specified opposite gain 0.5 tests broader visual context instead of concentration. Only one head's query rows changed.

## Pass 42: E8H7 query softening rejected
- Gain 0.5: 31/64 -> 30/64, -1.6 pp (SE 2.7), 1 rescue / 2 losses, loops unchanged at 21. Both spatial-temperature doses lack a recovery gain. Reverted.

## Final-readout cue rejected before editing
- Protecting existing readout rows and control means left a weak final-residual physical cue: scene-disjoint separation 64.3%. No edit made.

## Late visual empty-hand opening-feedback test
- E17H1 reads wrist tokens; constructed empty-hand value contrast protected against base/lang, holding/open wrist means, and action-self-value means across Euler steps.
- Scene-disjoint pairwise cue separation 78.6%. Opening write direction orthogonal to direct pose readouts at all 10 Euler steps.
- Candidate rank-one addition beta=2 to E17H1 O block, 11.3% of head norm. Not a global gripper/noise/action scale change.

## Pass 43: late empty-hand opening feedback probe
- {"i": 0, "type": "empty", "attended_cue": 1.679, "grip_delta": -0.0007, "first5_grip_delta": -0.0008, "signs": 0, "xyz_rms": 0.00102}
- {"i": 1, "type": "empty", "attended_cue": 2.554, "grip_delta": -0.0015, "first5_grip_delta": -0.0011, "signs": 0, "xyz_rms": 0.00201}
- {"i": 2, "type": "empty", "attended_cue": -0.786, "grip_delta": 0.0023, "first5_grip_delta": 0.0009, "signs": 0, "xyz_rms": 0.00051}
- {"i": 3, "type": "empty", "attended_cue": -0.768, "grip_delta": 0.0024, "first5_grip_delta": 0.0013, "signs": 0, "xyz_rms": 0.00049}
- {"i": 4, "type": "holding", "attended_cue": 2.548, "grip_delta": -0.0024, "first5_grip_delta": -0.0032, "signs": 0, "xyz_rms": 0.00054}
- {"i": 5, "type": "holding", "attended_cue": 0.629, "grip_delta": -0.0004, "first5_grip_delta": -0.0004, "signs": 0, "xyz_rms": 0.00043}
- {"i": 6, "type": "holding", "attended_cue": 0.589, "grip_delta": -0.0007, "first5_grip_delta": -0.0007, "signs": 0, "xyz_rms": 0.00046}
- {"i": 7, "type": "holding", "attended_cue": 1.124, "grip_delta": -0.0012, "first5_grip_delta": -0.0014, "signs": 0, "xyz_rms": 0.00089}
- {"i": 8, "type": "loop_close", "attended_cue": 2.057, "grip_delta": -0.2001, "first5_grip_delta": -0.3987, "signs": 1, "xyz_rms": 0.02695}
- {"i": 9, "type": "loop_close", "attended_cue": 0.388, "grip_delta": -0.0001, "first5_grip_delta": -0.0005, "signs": 0, "xyz_rms": 0.00039}
- {"i": 10, "type": "loop_open", "attended_cue": 0.934, "grip_delta": -0.0004, "first5_grip_delta": 0.0, "signs": 0, "xyz_rms": 0.00081}
- {"i": 11, "type": "loop_open", "attended_cue": 1.257, "grip_delta": -0.0002, "first5_grip_delta": -0.0007, "signs": 0, "xyz_rms": 0.00037}
- {"i": 12, "type": "success_close", "attended_cue": -0.031, "grip_delta": 0.0003, "first5_grip_delta": 0.0005, "signs": 0, "xyz_rms": 0.00083}
- {"i": 13, "type": "success_close", "attended_cue": -0.333, "grip_delta": 0.0004, "first5_grip_delta": 0.0003, "signs": 0, "xyz_rms": 0.00047}
- {"i": 14, "type": "success_open", "attended_cue": 0.453, "grip_delta": -0.0002, "first5_grip_delta": -0.0004, "signs": 0, "xyz_rms": 0.00044}
- {"i": 15, "type": "success_open", "attended_cue": 0.017, "grip_delta": 0.0001, "first5_grip_delta": -0.0, "signs": 0, "xyz_rms": 0.00051}

## Pass 44: E17H1 empty-open beta2 screen
- 31/64 -> 30/64, -1.6 pp (SE 1.6), 0 rescues / 1 loss. Loops unchanged 21; mean flips 12.52 -> 11.81.
- Not a validated improvement. One pre-specified doubled dose beta4 will test whether the same feedback was too weak; no new directions or channels selected.

## Pass 45: opening-feedback dose4 rejected
- 31/64 -> 26/64, -7.8 pp (SE 3.4), 0 rescues / 5 losses; loops 21 -> 26. Larger opening dose caused more damage.

## Final five-pass precommitment
- Reverse only the same rank-one E17H1 route (beta=-2), testing grip retention rather than increased reopening. The actual attended feature was not a reliable empty-hand detector; do not claim that semantic specificity.
- Pass46 fixed discovery screen, pass47 paired mechanism probe, passes48-50 untouched validation panels2-4 (290 paired episodes), no further tuning.
- Retain only with independent gain >2 paired SE, lower loop failures, and small damage to already-solved recovery scenes; otherwise submit no edits. Ordinary-task endpoint is unavailable.

## Pass 46: frozen opposite-dose discovery screen
- Beta=-2: 31/64 -> 27/64, -6.2 pp (SE 3.0), 0 rescues / 4 losses; loops 21 -> 23.

## Pass 47: frozen opposite-dose mechanism probe
- [{"i": 0, "group": "empty", "grip_delta": 0.001124193460482359, "signs": 0, "xyz_rms": 0.0005833104530018769}, {"i": 1, "group": "empty", "grip_delta": 0.0013139010324478284, "signs": 0, "xyz_rms": 0.0016509054135494532}, {"i": 2, "group": "empty", "grip_delta": -0.002519122760066372, "signs": 0, "xyz_rms": 0.0004323941566160791}, {"i": 3, "group": "empty", "grip_delta": -0.0023208874650537782, "signs": 0, "xyz_rms": 0.0005935874054304056}, {"i": 4, "group": "holding", "grip_delta": 0.001332088740861459, "signs": 0, "xyz_rms": 0.0005448088670831033}, {"i": 5, "group": "holding", "grip_delta": 0.0003578664042115598, "signs": 0, "xyz_rms": 0.000289848324806589}, {"i": 6, "group": "holding", "grip_delta": 0.0004229893653988848, "signs": 0, "xyz_rms": 0.0005926242771334758}, {"i": 7, "group": "holding", "grip_delta": 0.0008231785432517347, "signs": 0, "xyz_rms": 0.0006303560888180734}, {"i": 8, "group": "loop_transition", "grip_delta": 0.0004655087951272452, "signs": 0, "xyz_rms": 0.0031724454942207354}, {"i": 9, "group": "loop_transition", "grip_delta": 0.0003256207652121201, "signs": 0, "xyz_rms": 0.00046223459041049556}, {"i": 10, "group": "loop_transition", "grip_delta": -0.0005683301322728318, "signs": 0, "xyz_rms": 0.0006695926169090201}, {"i": 11, "group": "loop_transition", "grip_delta": 0.00017495240616201003, "signs": 0, "xyz_rms": 0.0002844546171253534}, {"i": 12, "group": "success_transition", "grip_delta": -0.0010924960748165957, "signs": 0, "xyz_rms": 0.0005845865181232465}, {"i": 13, "group": "success_transition", "grip_delta": 0.0004933028554290231, "signs": 0, "xyz_rms": 0.00041678456015207025}, {"i": 14, "group": "success_transition", "grip_delta": 0.0003450956771046121, "signs": 0, "xyz_rms": 0.0004906652827693225}, {"i": 15, "group": "success_transition", "grip_delta": 0.00019844982892578412, "signs": 0, "xyz_rms": 0.00039374179036768024}]
- Independent validation panels checked disjoint from discovery, prior validation, and one another. Acceptance threshold specified before their outcomes: gain >2*max(paired SE, scene-cluster SE), fewer loops, and losses <=2% of validation episodes.

## Pass 48: frozen candidate independent panel2
- 102 episodes: 51/102 -> 48/102, -2.9 pp (SE 3.5), 5 rescues / 8 losses; loop failures 44 -> 45.
- No evidence for a gain; weights remain frozen for precommitted panels3-4.

## Pass 49: frozen candidate independent panel3
- 94 valid paired episodes (2 episode pairs excluded for scene errors): 64/94 -> 61/94, -3.2 pp (SE 3.5), 4 rescues / 7 losses; loop failures 23 -> 26.
- Complete final frozen panel, then aggregate valid matched pairs and apply the precommitted rule.


## Pass 50 and final decision
- Frozen candidate final panel: 51/92 -> 55/92, 6 rescues / 2 losses; loop failures 31 -> 27.
- Reserved validation aggregate: 166/288 -> 164/288; gain -0.694 pp, paired SE 1.967 pp, scene-cluster SE 1.970 pp.
- Rescues/losses: 15/17; loop failures 98 -> 98.
- Two requested episode pairs were unavailable due to scene errors; 288 matched pairs were analyzed. Already-solved starts are separately reported in final_decision.json.
- Failed all precommitted acceptance criteria. Removed the final edit using drop_edit; verified edited() is empty and restored tensor equals original.
- No successful repair established. Attention and action changes were causal, but none justified a claim of improved recovery. Original-task performance was not directly measured; unchanged submission preserves the original policy.
