# Collective Seoul web archive — deploy notes

- Editing happens in the Builder of the claude.ai artifact: https://claude.ai/artifact/RJRmKgqsb8kvHd1Zj13Qom
- This repo is the public copy served by GitHub Pages.
- `tools/collective-seoul.html` is the artifact page source; `tools/export.py` builds `index.html` + `img/` from a dump of the artifact database and its asset files.

Redeploy: dump `products`, `archive`, `site/config` from the artifact db, fetch any asset ids missing from `img/`, run
`python3 tools/export.py tools/collective-seoul.html <dump> <assets> .`, commit, push.
