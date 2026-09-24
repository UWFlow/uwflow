'use strict';

const fs = require('fs-extra');
const path = require('path');

const SITE_ORIGIN = 'https://uwflow.com';
const GRAPHQL_ENDPOINT = `${SITE_ORIGIN}/graphql`;
const REQUEST_TIMEOUT_MS = 30_000;
const OUTPUT_PATH = path.resolve(
  __dirname,
  '../public/sitemap.txt'
);

const STATIC_ROUTES = ['/', '/explore', '/about', '/privacy'];

const SITEMAP_QUERY = `
  query SitemapRoutes {
    course_search_index(order_by: { code: asc }) {
      code
    }
    prof_search_index(order_by: { code: asc }) {
      code
    }
  }
`;

const toUrl = route => new URL(route, SITE_ORIGIN).toString();

const toEntityUrls = (entities, routePrefix) =>
  entities.map(({ code }) => {
    if (typeof code !== 'string' || code.length === 0) {
      throw new Error(`Received an invalid ${routePrefix} code`);
    }

    return toUrl(`${routePrefix}/${encodeURIComponent(code)}`);
  });

async function generateSitemap() {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: SITEMAP_QUERY }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `Sitemap query failed with ${response.status} ${response.statusText}`
    );
  }

  const payload = await response.json();
  if (payload.errors) {
    throw new Error(`Sitemap query failed: ${JSON.stringify(payload.errors)}`);
  }

  const { course_search_index: courses, prof_search_index: professors } =
    payload.data;
  if (!Array.isArray(courses) || !Array.isArray(professors)) {
    throw new Error('Sitemap query returned an unexpected response');
  }

  const urls = [
    ...STATIC_ROUTES.map(toUrl),
    ...toEntityUrls(courses, '/course'),
    ...toEntityUrls(professors, '/professor'),
  ];
  const uniqueUrls = [...new Set(urls)];

  if (uniqueUrls.length !== urls.length) {
    throw new Error('Sitemap contains duplicate URLs');
  }

  await fs.ensureDir(path.dirname(OUTPUT_PATH));
  await fs.writeFile(OUTPUT_PATH, `${urls.join('\n')}\n`);

  console.log(
    `Generated ${urls.length} URLs (${courses.length} courses, ` +
      `${professors.length} professors) at ${OUTPUT_PATH}`
  );
}

generateSitemap().catch(error => {
  console.error(error);
  process.exit(1);
});
