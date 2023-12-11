const parseRss = (link) => {
  const parsedRss = fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then((data) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'application/xml');
      const rss = doc.querySelector('rss');
      if (!rss) {
        throw new Error('noRss');
      }

      return rss;
    });
  return parsedRss;
};

export default parseRss;
