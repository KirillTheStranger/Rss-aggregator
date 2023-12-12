const parseRss = (request) => {
  const parsedRss = request.then((response) => {
    if (response.status !== 200) {
      throw new Error('noRss');
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(response.data.contents, 'application/xml');
    const rss = doc.querySelector('rss');
    if (!rss) {
      throw new Error('noRss');
    }

    return rss;
  });
  return parsedRss;
};

export default parseRss;
