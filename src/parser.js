const parseRss = (response) => {
  if (response.status !== 200) {
    throw new Error('network');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data.contents, 'application/xml');
  const rss = doc.querySelector('rss');

  if (!rss) {
    throw new Error('noRss');
  }

  const feedTitle = rss.querySelector('title').textContent;
  const feedDescription = rss.querySelector('description').textContent;

  const feed = { title: feedTitle, description: feedDescription };
  const posts = { elements: [] };

  const postList = rss.querySelectorAll('item');
  postList.forEach((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    posts.elements.push({ title: postTitle, description: postDescription, link });
  });

  return [feed, posts];
};

export default parseRss;
