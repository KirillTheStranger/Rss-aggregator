const parseRss = (link) => {
  const listOfRss = fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then((data) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'application/xml');
      const list = doc.querySelectorAll('item');

      if (list.length === 0) {
        throw new Error('noRss');
      }

      return list;
    });
  return listOfRss;
};

export default parseRss;
