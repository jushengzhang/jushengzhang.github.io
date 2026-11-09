removed_names = list(edited())
assert removed_names == [
    "paligemma_with_expert.gemma_expert.model.layers.17.self_attn.o_proj.weight"
]
torch.save(
    {name: load(name) for name in removed_names},
    w / "rejected_final_beta_minus2.pt",
)
for name in removed_names:
    drop_edit(name)
assert list(edited()) == []
for name in removed_names:
    assert torch.equal(load(name), load_original(name))