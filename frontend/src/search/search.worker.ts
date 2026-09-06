import SearchClient from './SearchClient';

const client = new SearchClient();

// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any;

ctx.onmessage = async (event: MessageEvent) => {
  const { type } = event.data;
  switch (type) {
    case 'autocomplete':
      const { query } = event.data;
      const results = client.autocomplete(query);
      ctx.postMessage({ type: 'autocomplete', results });
      break;
    case 'build':
      const [searchData, lastIndexedDate] = await client.buildIndices(
        event.data.searchData,
        event.data.lastIndexedDate,
      );
      ctx.postMessage({ type: 'data', searchData, lastIndexedDate });
      break;
    default:
      break;
  }
};
