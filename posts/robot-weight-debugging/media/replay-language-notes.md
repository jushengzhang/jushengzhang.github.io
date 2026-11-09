# Language robustness weight-edit experiment
## Constraints
No training, no kernel network execution; practice variants only. Use paired rollouts and independent validation. Budget: 50 forward passes.
## Current status
No edits. Inventory and matched-task diagnosis starting.

## Pass 1: diagnostic baseline
80 hard goal paraphrases, seed 7: 49/80 (61.25%); difficulty 3 18/19, 4 11/17, 5 20/44. Failures often replace canonical object names with synonyms/descriptions. Need separate lexical encoding from expert routing.

## Passes 2-5
Literal goal controls 9/10. Pass 5 diagnostic hard-language sample 102/128; goal 27/44 vs object 22/23, spatial 16/18, long 37/43. Expert attention is not absent on failing instructions; BOS is a strong sink. Will test sparse synonym-embedding canonicalization, protecting all canonical task token IDs.

## Candidate A: sparse unambiguous lexical aliases
cooker->stove, basin->bowl, cupboard->cabinet, grape/grapes/fermented/merlot->wine. 8 embedding rows; all 76 canonical task token IDs protected. First causal dose alpha=0.5. No other tensor changes.

## Candidate A, alpha=0.5 (passes 6-7)
Paired goal diagnostic rollout: +3.75 pp, SE 2.1, 3 recoveries / 0 regressions. 17/80 pairs had null terminations in both arms, so 63 valid pairs: 38->41 successes. Recovered IDs 1420 cooker, 1262 basin/cupboard, 1179 fermented grape. Probe 1420 expert L17 target cosine .594->.915; target initial xyz RMS .208->.069. 1262 expert L0 -.254->.755, L17 .103->.711; xyz RMS .100->.044. 1179 expert L0 .303->.788. Untouched prompt 1385 and 3 literal controls exactly unchanged. Now testing alpha=1.0.

## Candidate A alpha=1 (passes 8-9)
6 recoveries / 0 regressions (+7.5 pp over 80 listed; +10.17 pp, SE3.97 over 59 valid). 21 paired nulls. 1179 expert L17 target cosine .067/.393/.775 at doses 0/.5/1; xyz error .117/.104/.038. 1262 cosine .103/.711/.762. Best fallback saved in best_base/ and best_base_recipe.pt.
Candidate B adds descriptive cues at .75 strength, original aliases at 1.0; 48 rows. Generic container, dish, vessel, appliance, storage untouched.

## Candidate B (pass 10)
Diagnostic hard-language paired: 11 recoveries / 0 regressions, listed +8.6 pp SE2.5 (n128); {'valid': 91, 'total': 128, 'orig': 68, 'edit': 79, 'gain_pp': 12.09, 'se_pp': 3.44, 'WR': 11, 'RW': 0}. Runtime nulls verified as symmetric CUDA OOM, excluded from valid stats. Saved best_B/ and best_B_recipe.pt. Protecting canonical tokens gives exact literal-prompt invariance.

Pass 11 edited-only suffered 54/80 OOMs (20/26 usable successes). Compacting embedding artifact to float16 storage of exact bf16 inference values; no effective weight or inference setting change. Checking whether this reduces loader OOMs.

## Candidate B goal diagnostic (pass 12)
{'valid': 57, 'total': 80, 'orig': 34, 'edit': 48, 'gain_pp': 24.56, 'se_pp': 5.75, 'WR': 14, 'RW': 0}. 14 recoveries / 0 regressions. Compact file did not resolve OOMs; restored exact float32 artifact, only 48 selected rows changed. Preparing verb-alias extension as a separate test.

## Candidate C
Adds 25 verb-synonym embedding rows at .75 to candidate B. Motivation: residual slide/push, pull/open, secure/close primitive confusions. Canonical tokens remain protected; no action/expert weights changed.

## Candidate C (passes 14-15)
Broad diagnostic {'valid': 108, 'total': 128, 'orig': 87, 'edit': 100, 'gain_pp': 12.04, 'se_pp': 3.41, 'WR': 14, 'RW': 1}. Goal diagnostic: 49/80->69/80, +25.0 pp SE4.9, 20 recoveries, 0 regressions; no OOMs. Saved best_C/. Candidate now frozen for disjoint confirmation.

## Confirmation 1 (pass 16): C NOT CONFIRMED
128 entirely new variants: 104->106, +1.56 pp SE2.93, 8 recoveries/6 regressions. Object suite 23->20. This set is now development data; remaining 460 reserved variants are still untouched. Need ablate verb extension and examine ambiguous descriptive cues.

## Candidate D: semantic backoff after C failed confirmation
Remove heating->microwave, holder->rack, ceramic->mug, shut->close. Dairy becomes .5 original + .5 equal centroid(cheese,milk,butter), not cheese-specific. Woven->basket reduced to .25; round->bowl and flat->plate to .5. 66 rows, all canonical tokens still untouched. Will test known regressions and dairy-positive controls, then untouched confirmation 2.

## D targeted test (pass 17)
24 hard selected cases, original6->edited13, 8WR/1RW. Need inspect retained dairy regression and lost cheese recoveries; class centroid alone may not encode the distinguishing modifier. All results are development, not confirmation.

## Restart audit
Active D verified: exactly 66 changed rows, raw convex interpolation of original embeddings. Canonical task tokens untouched. Runtime failures in early rolls have success=False and termination=None; exclude these, not merely null success, from valid paired statistics.
D fixed 5/6 known C regressions. Remaining object1191 changes only lift and woven. Testing E = D minus both woven rows to causally isolate the material/object overgeneralization.

## E ablation (pass 18)
D and E identical outcomes on all 24 cases. Object1191 regression retained with only initial lift->pick edited. Thus restore lift rows. Dropping woven lost no gains; keep woven original.
## F compositional repair (pass 19)
65 rows: E minus lift; add spread->equal centroid(cream,cheese,butter) at .75 and _churn->butter at .75. Dairy stays at .5 centroid(cheese,milk,butter). 24 selected cases: 6->18 successes, 12 recoveries/0 regressions. All four lost cheese cases recovered, milk control preserved, condiment regression removed. Saved best_F_dev/ and best_F_recipe.pt.
F frozen before confirmation 2 on 128 previously unused variants.

## F confirmation, batch 1 (pass 20)
128 unused variants: 115->116, 2 recoveries/1 regression, +0.78 pp SE1.36. Not sufficient evidence alone. F remains frozen; predeclare pooled evaluation of all remaining confirm3/4/5 (332 more variants), total460. Do not inspect disagreement wording or tune before pooled result.

F confirmation batch2/pass21: reported 115->121 /128, 8 recoveries/2 regressions, +4.69 pp SE2.45. Several execution errors need classification; retain reported all-pair score as primary until errors understood. F unchanged; continue predeclared validation.

F confirmation batch3/pass22: 107->113 /128, 8 recoveries/2 regressions, +4.69 pp SE2.45. Still no weight changes. Last76 reserved variants will run together with all zero-step error pairs from passes21/22, replacing those startup-error records in pooled analysis.

## F independently confirmed (passes20-23)
Frozen before these460 variants. All startup-error pairs rerun in pass23, each variant counted once. {'n': 460, 'original': 412, 'edited': 429, 'gain_pp': 3.7, 'se_pp': 1.03, 'recoveries': 20, 'regressions': 3}
Keep F unchanged as final candidate. Next: paired safety checks for all six other categories; replicate independent language set on new seeds. best_F_dev/ is exact saved candidate.

## Initial safety checks
Pass24 Camera:88/128 both, zero discordances. Pass25 Robot Initial States:98/128 both. Pass26 Lighting:112->114/128, 2 positive/0 negative discordances. Auditing token/trace invariance rather than attributing simulator variation to lexical edits.

## Safety sweep completed, passes24-29
{"Background Textures": {"edited": 113, "gain_pp": 0.0, "n": 128, "original": 113, "recoveries": 0, "regressions": 0, "se_pp": 0.0}, "Camera Viewpoints": {"edited": 88, "gain_pp": 0.0, "n": 128, "original": 88, "recoveries": 0, "regressions": 0, "se_pp": 0.0}, "Light Conditions": {"edited": 114, "gain_pp": 1.56, "n": 128, "original": 112, "recoveries": 2, "regressions": 0, "se_pp": 1.1}, "Objects Layout": {"edited": 106, "gain_pp": 0.0, "n": 128, "original": 106, "recoveries": 0, "regressions": 0, "se_pp": 0.0}, "Robot Initial States": {"edited": 98, "gain_pp": 0.0, "n": 128, "original": 98, "recoveries": 0, "regressions": 0, "se_pp": 0.0}, "Sensor Noise": {"edited": 114, "gain_pp": 0.0, "n": 128, "original": 114, "recoveries": 0, "regressions": 0, "se_pp": 0.0}}
All safety prompts have no edited token. Some simulated trajectories differ despite that; do not attribute the +2 lighting successes to the edit. Camera episode-mean activations differ in only3/128 trajectories, including vision, consistent with different observations. Will use identical-input probes for a proper invariance test. Final F remains frozen.

Diagnostic prompt-copy probe was refused (no pass spent): inputs must be unmodified rollout files. Copies removed. Use genuine literal-rollout inputs instead. Original-vs-edited comparisons are identical-input; paraphrase-vs-literal comparisons have matched task but may differ in images. Do not claim pixel-controlled counterfactual results.

## Fixed-input mechanism probe (pass30)
30 probes (28 unique; 2 duplicates). 23 untouched-prompt entries: action chunks and all recorded VLM/expert activations exactly equal. All SigLIP activations exactly equal including7 touched-prompt entries. Literal controls have equal denoising noise, but different images; target-similarity results are supporting, not pixel-controlled counterfactual evidence. Details in F_probe_mechanism_summary.json.

## Centered task features and planned dose test
Pass30 expert residuals share a large time component. Subtract mean of5 literal-task controls for analysis only. Layer17 target cosine original->F: cooker .462->.975; basin .154->.843; grape .006->.831; spread -.039->.857; slide .513->.561. Attention maps pass31 test whether language was already read. Temporarily installed F_half_causal (each sparse interpolation coefficient halved) for probe32 and diagnostic rollout33. FINAL CHOICE REMAINS F; restore before rollout34 and remaining validation.

## Attention mechanism (pass31)
Relevant text is attended before repair; layer6 non-BOS text mass original->F: cooker .141->.124, basin .196->.138, grape .228->.211, spread .254->.228. Thus not an attention-amplification repair. Common language-reading heads include L6 H6/H2. No attention head weights edited; causal localization is sparse lexical embeddings.
Pass32 half-dose fixed-input results in F_dose_probe_summary.json. Half-dose still active for upcoming80-case diagnostic pass33; restore F immediately afterward.

## Half-dose behavioral ablation (pass33)
80 diagnostic goal cases:49->59, +12.5pp SE3.72, 10 recoveries/0 regressions. F restored afterward and checked elementwise equal to best_F_dev/. Current active edit is FULL F, not half. Pass34 will test full F on exactly the same80 cases.

## Full-dose diagnostic replication (pass34)
Same80 diagnostic goal cases and seeds as half-dose pass33:
original49/80 -> full F68/80, +23.75pp SE4.76, 19 recoveries/0 regressions.
Half dose:59/80; full dose:68/80. This is development-set causal dose-response,
not independent confirmation. F remains the final candidate; no further tuning planned.
Restart at34/50 passes: audit artifacts, then replicate frozen F on independent
language-validation variants with fresh seeds, and strengthen fixed-input safety checks.

## Prespecified remaining validation
Full F equals best_F_dev elementwise; exactly65 embedding rows changed. Fresh-seed replication on the460 reserved variants: seeds3101 and6203, four batches per seed; cluster uncertainty by variant. Then128 additional paired episodes in each other category, and two fixed-input probes. No tuning planned from these results.

Pass35 frozen-F replication seed3101 batch1: {"n": 128, "invalid": 0, "original": 117, "edited": 120, "gain_pp": 2.344, "se_pp": 1.342, "recoveries": 3, "regressions": 0}.

## Fresh-seed replication complete (passes35-38, seed3101)
{"n": 460, "invalid": 0, "original": 424, "edited": 439, "gain_pp": 3.261, "se_pp": 0.936, "recoveries": 17, "regressions": 2}
Two-seed pooled (clustered by460 variants): {"n": 920, "invalid": 0, "original": 836, "edited": 868, "gain_pp": 3.478, "se_pp": 0.695, "recoveries": 37, "regressions": 5, "variants": 460, "seeds_per_variant": 2, "cluster_se_pp": 0.909, "cluster_95ci_pp": [1.696, 5.26]}
All460 requested pairs valid, F unchanged. Proceeding with prespecified seed6203.

## Three-seed independent language validation completed (pass42)
{"n": 1380, "invalid": 0, "original": 1261, "edited": 1306, "gain_pp": 3.261, "se_pp": 0.559, "recoveries": 53, "regressions": 8, "variants": 460, "seeds_per_variant": 3, "cluster_se_pp": 0.81, "cluster_95ci_pp": [1.674, 4.848], "variant_bootstrap_95ci_pp": [1.739, 4.857]}
By suite: {"libero_10": {"n": 363, "invalid": 0, "original": 337, "edited": 345, "gain_pp": 2.204, "se_pp": 0.772, "recoveries": 8, "regressions": 0, "variants": 121, "seeds_per_variant": 3, "cluster_se_pp": 1.156, "cluster_95ci_pp": [-0.062, 4.47]}, "libero_goal": {"n": 234, "invalid": 0, "original": 181, "edited": 206, "gain_pp": 10.684, "se_pp": 2.198, "recoveries": 27, "regressions": 2, "variants": 78, "seeds_per_variant": 3, "cluster_se_pp": 3.071, "cluster_95ci_pp": [4.664, 16.704]}, "libero_object": {"n": 351, "invalid": 0, "original": 336, "edited": 332, "gain_pp": -1.14, "se_pp": 0.567, "recoveries": 0, "regressions": 4, "variants": 117, "seeds_per_variant": 3, "cluster_se_pp": 0.899, "cluster_95ci_pp": [-2.901, 0.621]}, "libero_spatial": {"n": 432, "invalid": 0, "original": 407, "edited": 423, "gain_pp": 3.704, "se_pp": 1.021, "recoveries": 18, "regressions": 2, "variants": 144, "seeds_per_variant": 3, "cluster_se_pp": 1.473, "cluster_95ci_pp": [0.817, 6.591]}}
Hard levels4-5: {"n": 342, "invalid": 0, "original": 264, "edited": 294, "gain_pp": 8.772, "se_pp": 1.79, "recoveries": 35, "regressions": 5, "variants": 114, "seeds_per_variant": 3, "cluster_se_pp": 2.661, "cluster_95ci_pp": [3.556, 13.988]}
F has remained unchanged throughout. Next six paired safety batches: 128/category, sample seed9107, save genuine inputs for fixed-input probes.

## Final rollout safety totals (passes24-29 and43-48)
{"Camera Viewpoints": {"n": 256, "invalid": 0, "original": 180, "edited": 180, "gain_pp": 0.0, "se_pp": 0.0, "recoveries": 0, "regressions": 0}, "Robot Initial States": {"n": 256, "invalid": 0, "original": 198, "edited": 197, "gain_pp": -0.391, "se_pp": 0.391, "recoveries": 0, "regressions": 1}, "Light Conditions": {"n": 256, "invalid": 0, "original": 228, "edited": 229, "gain_pp": 0.391, "se_pp": 0.677, "recoveries": 2, "regressions": 1}, "Background Textures": {"n": 256, "invalid": 0, "original": 227, "edited": 227, "gain_pp": 0.0, "se_pp": 0.0, "recoveries": 0, "regressions": 0}, "Objects Layout": {"n": 256, "invalid": 0, "original": 217, "edited": 217, "gain_pp": 0.0, "se_pp": 0.0, "recoveries": 0, "regressions": 0}, "Sensor Noise": {"n": 256, "invalid": 0, "original": 232, "edited": 232, "gain_pp": 0.0, "se_pp": 0.0, "recoveries": 0, "regressions": 0}, "overall": {"n": 1536, "invalid": 0, "original": 1282, "edited": 1282, "gain_pp": 0.0, "se_pp": 0.13, "recoveries": 2, "regressions": 2}}
Unique variant-seed pairs: 1388; deduplicated latest-run summary: {"Camera Viewpoints": {"n": 233, "invalid": 0, "original": 166, "edited": 166, "gain_pp": 0.0, "se_pp": 0.0, "recoveries": 0, "regressions": 0}, "Robot Initial States": {"n": 241, "invalid": 0, "original": 185, "edited": 184, "gain_pp": -0.415, "se_pp": 0.415, "recoveries": 0, "regressions": 1}, "Light Conditions": {"n": 225, "invalid": 0, "original": 202, "edited": 203, "gain_pp": 0.444, "se_pp": 0.771, "recoveries": 2, "regressions": 1}, "Background Textures": {"n": 217, "invalid": 0, "original": 193, "edited": 193, "gain_pp": 0.0, "se_pp": 0.0, "recoveries": 0, "regressions": 0}, "Objects Layout": {"n": 236, "invalid": 0, "original": 198, "edited": 198, "gain_pp": 0.0, "se_pp": 0.0, "recoveries": 0, "regressions": 0}, "Sensor Noise": {"n": 236, "invalid": 0, "original": 214, "edited": 214, "gain_pp": 0.0, "se_pp": 0.0, "recoveries": 0, "regressions": 0}}
All50 safety prompts avoid edited rows. Robot-start447: identical initial policy inputs and first85 actions. Lighting2341: initial base images differ in22 elements, explaining why the two initial chunks need not match. Both negative discordances retained; exact-input probes next.

## Pass49 exact-input safety
{"n_inputs": 60, "exact_action_chunks": 60, "exact_activation_sets": 60, "max_action_difference": 0.0, "activation_arrays_per_input": [66], "both_arms_match_saved": 60}
Includes both discordant episodes, both source trajectories at steps0,50,100; six categories and four suites covered. No input files modified.

## Final planned mechanism probe
Natural matched pairs in frozen validation batch35: 42 pairs, 65 unique genuine inputs. Images and flow noise are elementwise equal within each source/control pair; only natural instruction wording differs. Include every available touched source with a successful untouched same-task control, not only recovered cases. Record all18 VLM/expert residual layers. F unchanged.
