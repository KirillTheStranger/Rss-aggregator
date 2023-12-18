const parseRss = (response, feedId) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response.data.contents, 'application/xml');
  const rss = doc.querySelector('rss');
  const parserError = doc.querySelector('parsererror');

  if (parserError) {
    throw new Error('noRss');
  }

  const feedTitle = rss.querySelector('title').textContent;
  const feedDescription = rss.querySelector('description').textContent;

  const feed = { title: feedTitle, description: feedDescription };
  const posts = [];

  const postList = rss.querySelectorAll('item');
  postList.forEach((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    posts.push({
      feedId,
      title: postTitle,
      description: postDescription,
      link,
    });
  });

  return [feed, posts];
};

export default parseRss;
