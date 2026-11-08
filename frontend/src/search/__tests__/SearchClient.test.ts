import LZString from 'lz-string';

import SearchClient from '../SearchClient';

const index = async (prof: object) => {
  const client = new SearchClient();
  await client.buildIndices(
    LZString.compressToUTF16(
      JSON.stringify({
        courses: [],
        profs: [
          {
            id: 8358,
            code: 'josh_d_neufeld',
            name: 'Josh D. Neufeld',
            courses: [],
            rating_count: 1,
            ...prof,
          },
        ],
      }),
    ),
    new Date(),
  );
  return client.profs.map(({ name, code }) => [name, code]);
};

describe('SearchClient prof aliases', () => {
  it('links a merged name to its former code', async () => {
    expect(
      await index({
        aliases: ['Josh Neufeld'],
        alias_codes: ['josh_neufeld'],
      }),
    ).toEqual([
      ['Josh D. Neufeld', 'josh_d_neufeld'],
      ['Josh Neufeld', 'josh_neufeld'],
    ]);
  });

  it('links to the prof when cached data has no alias codes', async () => {
    expect(await index({ aliases: ['Josh Neufeld'] })).toEqual([
      ['Josh D. Neufeld', 'josh_d_neufeld'],
      ['Josh Neufeld', 'josh_d_neufeld'],
    ]);
  });
});
