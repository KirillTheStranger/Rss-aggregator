/* eslint-disable no-param-reassign */

import axios from 'axios';
import parseRss from '../parser.js';
import generateUrl from './generateUrl.js';

const postUpdateCheck = (state) => {
  const requests = state.feeds.map(({ url }) => {
    const updatedUrl = generateUrl(url);
    const request = axios.get(updatedUrl);
    request.catch((error) => {
      console.log(`Recieve error in response - ${error.message}`);
    });
    return request;
  });

  const promise = Promise.all(requests);

  promise
    .then((responses) => {
      const newPosts = responses.reduce((acc, response, index) => {
        const { posts } = parseRss(response, index + 1);
        return [...acc, ...posts];
      }, []);

      const currentPostsLinks = state.posts.map((post) => post.link);

      const postsToAdd = newPosts.filter((post) => !currentPostsLinks.includes(post.link));

      if (postsToAdd.length !== 0) {
        state.posts = [...state.posts, ...postsToAdd];
      }
    })
    .catch((error) => {
      console.log(`Recieve error in parsing rss - ${error.message}`);
    })
    .finally(() => {
      const updateTimer = 5000;
      setTimeout(() => postUpdateCheck(state), updateTimer);
    });
};

export default postUpdateCheck;
