def install_recipe(rec, tag):
    assert not (set(rec["rows"]) & protected), "canonical token would change"
    out = E0.clone()
    for i,t in rec["rows"].items():
        a=rec.get("strengths",{}).get(i,rec.get("alpha",1.0))
        target=E0[t] if isinstance(t,int) else E0[t].mean(0)
        out[i]=(1-a)*E0[i]+a*target
    save_edit(E_NAME,out)
    torch.save(rec,W/f"{tag}_recipe.pt")
    del out
    print("Installed",tag,len(rec["rows"]),"rows")