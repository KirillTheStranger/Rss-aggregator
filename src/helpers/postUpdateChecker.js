/* eslint-disable no-param-reassign */

import axios from 'axios';
import parseRss from '../parser.js';
import generateUrl from './generateUrl.js';

const postUpdateCheck = (state) => {
  const requests = state.feeds.map(({ url }) => {
    const updatedUrl = generateUrl(url);
    try {
      const request = axios.get(updatedUrl);
      return request;
    } catch (error) {
      if (error.message === 'Network Error') {
        state.form.process.error = 'network';
      } else {
        state.form.process.error = error.message;
      }
      state.form.process.state = 'error';
    }
    return null;
  });

  const promise = Promise.all(requests);

  promise
    .then((responses) => {
      const newPosts = responses.reduce((acc, response, index) => {
        const [, posts] = parseRss(response, index + 1);
        acc = [...acc, ...posts];
        return acc;
      }, []);

      const currentPostsLinks = state.posts.map((post) => {
        const { link } = post;
        return link;
      });

      const postsToAdd = newPosts.filter((post) => !currentPostsLinks.includes(post.link));

      if (postsToAdd.length !== 0) {
        state.posts = [...state.posts, ...postsToAdd];
      }
    })
    .then(() => {
      setTimeout(() => postUpdateCheck(state), 5000);
    });
};

export default postUpdateCheck;
