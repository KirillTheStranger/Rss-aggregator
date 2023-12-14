/* eslint-disable no-param-reassign */

import axios from 'axios';
import parseRss from '../parser.js';
import generateUrl from './generateUrl.js';

const postUpdateCheck = (state) => {
  const requests = state.feeds.map(({ url }) => {
    const updatedURl = generateUrl(url);
    const response = parseRss(axios.get(updatedURl));
    const parsedRss = response.then((rss) => rss);
    return parsedRss;
  });

  const promise = Promise.all(requests);

  promise
    .then((rssList) => {
      rssList.forEach((rss, index) => {
        const newPostList = rss.querySelectorAll('item');
        const newPostListElements = [];

        const currentPostsTitles = state.posts
          .reduce((acc, { feedId, elements }) => {
            if (feedId === index + 1) {
              acc = [...acc, ...elements];
            }
            return acc;
          }, [])
          .map(({ title }) => title);

        newPostList.forEach((post) => {
          const postTitle = post.querySelector('title').textContent;
          if (!currentPostsTitles.includes(postTitle)) {
            const postDescription = post.querySelector('description').textContent;
            const link = post.querySelector('link').textContent;
            newPostListElements.push({ title: postTitle, description: postDescription, link });
          }
        });

        if (newPostListElements.length !== 0) {
          state.posts.forEach((post) => {
            if (post.feedId === index + 1) {
              post.elements = [...post.elements, ...newPostListElements];
            }
          });
        }
      });
    })
    .catch((error) => {
      state.form.process.error = error.message;
      state.form.process.state = 'error';
      state.form.valid = false;
    });
  setTimeout(postUpdateCheck, 5000, state);
};

export default postUpdateCheck;
