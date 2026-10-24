# Styleguides

These guides own Flow's engineering patterns. Agent files route work here and
record local commands or constraints. Paths in this table start at the repo root.

| Work | Read | Review |
| --- | --- | --- |
| Every change | [General](general.md) | [General review](review.md) |
| Go API, importer, email, shared code | [Go and data](backend/go.md) | [Backend review](backend/review.md) |
| Hasura schema and permissions | [Go and data](backend/go.md#hasura-and-postgres), `hasura/AGENTS.md` | [Backend review](backend/review.md) |
| React, state, GraphQL clients | [React](frontend/react.md) | [Frontend review](frontend/review.md) |
| Components, styling, design comparisons | [Design system](frontend/design-system.md) | [Frontend review](frontend/review.md) |
| Build, deploy, runtime configuration | [General verification](general.md#verification), root `AGENTS.md` | [General review](review.md#runtime-and-deployment) |

Keep guides short and specific to their topic. Put shared rules in `general.md`,
implementation guidance in the area guide, and review checks in `review.md`.
Link to the owner instead of repeating its rules. Verify examples against the
current code and update incoming links when moving a guide.
