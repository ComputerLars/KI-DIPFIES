# KI-DIPFIES

Terminal-based text dungeon for the KI‑DIPFIES Gipfeltreffen (2026) with time‑jump threads and multiverse drift.

## GitHub Backend (Repo + Pages)

### Rename the repo (optional)
```bash
gh repo rename KI-DIPFIES --yes
git remote set-url origin https://github.com/ComputerLars/KI-DIPFIES.git
git push -u origin main
```

### Enable GitHub Pages (root on main)
```bash
gh api -X POST repos/ComputerLars/KI-DIPFIES/pages \
  -f source[branch]=main -f source[path]=/ \
|| gh api -X PUT repos/ComputerLars/KI-DIPFIES/pages \
  -f source[branch]=main -f source[path]=/
```

Pages URL:
```
https://computerlars.github.io/KI-DIPFIES/
```
