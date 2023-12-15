/* eslint-disable no-param-reassign */

import axios from 'axios';
import parseRss from '../parser.js';
import generateUrl from './generateUrl.js';

const postUpdateCheck = (state) => {
  const requests = state.feeds.map(({ url }) => {
    const updatedURl = generateUrl(url);
    try {
      const request = axios.get(updatedURl);
      return request;
    } catch (error) {
      state.form.process.error = error.message;
      state.form.process.state = 'error';
      state.form.valid = false;
    }
  });

  const promise = Promise.all(requests);

  promise.then((responses) => {
    const newPosts = responses.reduce((acc, response, index) => {
      const [, posts] = parseRss(response, index + 1);
      acc = [...posts];
      return acc;
    }, []);

    const currentPostsLinks = state.posts.map((post) => {
      const { link } = post;
      return link;
    });

    const postsToAdd = [];

    newPosts.forEach((post) => {
      const { link } = post;
      if (!currentPostsLinks.includes(link)) {
        postsToAdd.push(post);
      }
    });

    if (postsToAdd.length !== 0) {
      state.posts = [...state.posts, ...postsToAdd];
    }
  });
  // .then(() => {
  //   setTimeout(postUpdateCheck, 5000, state);
  // rssList.forEach((rss, index) => {
  //   const newPostList = rss.querySelectorAll('item');
  //   const newPostListElements = [];
  // const currentPostsTitles = state.posts
  //   .reduce((acc, { feedId, elements }) => {
  //     if (feedId === index + 1) {
  //       acc = [...acc, ...elements];
  //     }
  //     return acc;
  //   }, [])
  //   .map(({ title }) => title);
  // const currentPostsTitles = state.posts.flatMap((post) => {
  //   const { elements } = post;
  //   const titles = elements.map((element) => element.title);
  //   return titles;
  // });
  // console.log(currentPostsTitles);
  // newPostList.forEach((post) => {
  //   const postTitle = post.querySelector('title').textContent;
  //   if (!currentPostsTitles.includes(postTitle)) {
  //     const postDescription = post.querySelector('description').textContent;
  //     const link = post.querySelector('link').textContent;
  //     newPostListElements.push({ title: postTitle, description: postDescription, link });
  //   }
  // });
  // if (newPostListElements.length !== 0) {
  //   state.posts.forEach((post) => {
  //     if (post.feedId === index + 1) {
  //       post.elements = [...post.elements, ...newPostListElements];
  //     }
  //   });
  // }
  // });
  // })
  // .catch((error) => {
  //   state.form.process.error = error.message;
  //   state.form.process.state = 'error';
  //   state.form.valid = false;
  // });
  setTimeout(postUpdateCheck, 5000, state);
};

export default postUpdateCheck;
