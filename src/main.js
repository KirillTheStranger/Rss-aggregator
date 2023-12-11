import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import view from './view.js';
import ru from '../locales/ru.js';
import parseRss from './parser.js';

const app = () => {
  const initialState = {
    form: {
      process: {
        state: 'filling', // sending sent error

        error: null, // invalidLink noRss alreadyAdded
      },
      valid: null, // true false
    },
    urlList: [],
    feeds: [],
    posts: [],
    lastFeedId: 0,
  };

  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: 'ru',
    resources: {
      ru,
    },
  });

  const state = onChange(initialState, view(initialState, i18nInstance));

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = form.elements.url.value;

    const urlSchema = yup.object({
      url: yup.string().url('invalidLink').notOneOf(state.urlList, 'alreadyAdded'),
    });

    const validation = urlSchema.validate({ url });
    const parsedRss = parseRss(url);

    const promises = Promise.all([validation, parsedRss]);

    promises
      .then(([, rss]) => {
        state.urlList.push(url);
        state.form.process.state = 'sending';
        const feedId = state.lastFeedId + 1;
        state.lastFeedId = feedId;

        const feedTitle = rss.querySelector('title').textContent;
        const feedDescription = rss.querySelector('description').textContent;
        state.feeds.push({ id: feedId, title: feedTitle, description: feedDescription });

        const postList = rss.querySelectorAll('item');
        const postListElements = [];
        postList.forEach((item) => {
          const postTitle = item.querySelector('title').textContent;
          const postDescription = item.querySelector('description').textContent;
          const link = item.querySelector('link').textContent;
          postListElements.push({ title: postTitle, description: postDescription, link });
        });

        state.posts.push({ feedId, elements: postListElements });

        state.form.process.state = 'sent';
        state.form.valid = true;
        state.form.process.error = null;
        state.form.valid = null;

        // console.log(state);
      })
      .catch((error) => {
        state.form.process.error = error.message;
        state.form.process.state = 'error';
        state.form.valid = false;
      });
  });
};

export default app;
