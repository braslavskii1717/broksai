---
title: "❌ CI Test Failed"
labels: bug, ci-failure
assignees: braslavskii1717
---

## 🔴 CI Test Failure Report

**Workflow**: {{ GITHUB_WORKFLOW }}
**Run ID**: {{ GITHUB_RUN_ID }}
**Branch**: {{ GITHUB_REF }}
**Commit**: {{ GITHUB_SHA }}
**Actor**: {{ GITHUB_ACTOR }}

### Details

🔗 [View Failed Run]({{ GITHUB_SERVER_URL }}/{{ GITHUB_REPOSITORY }}/actions/runs/{{ GITHUB_RUN_ID }})

### Next Steps

- [ ] Проверить логи CI
- [ ] Воспроизвести ошибку локально
- [ ] Исправить и пушить fix
- [ ] Перезапустить CI
