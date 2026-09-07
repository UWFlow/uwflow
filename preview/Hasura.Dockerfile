FROM hasura/graphql-engine:v2.25.1.cli-migrations-v3
COPY hasura/migrations /hasura-migrations
COPY hasura/metadata /hasura-metadata
# Metadata overrides the engine's default pool limit. Keep each preview small.
RUN sed -i 's/max_connections: 250/max_connections: 10/' /hasura-metadata/databases/databases.yaml
