import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import view from './view.js';
import ru from './locales/ru.js';
import parseRss from './parser.js';
import postUpdateCheck from './helpers/postUpdateChecker.js';
import generateUrl from './helpers/generateUrl.js';

const app = () => {
  const initialState = {
    form: {
      process: {
        state: 'filling', // sending sent uploaded error
        error: null, // invalidLink noRss alreadyAdded network
      },
    },
    feeds: [],
    posts: [],
    modalWindow: {},
    watchedPostLinks: [],
    lastFeedId: 0,
  };

  const elements = {
    feedback: document.querySelector('.feedback'),
    input: document.querySelector('#url-input'),
    form: document.querySelector('.rss-form'),
    sendingButton: document.querySelector('.btn-lg'),
    feedsBlock: document.querySelector('.feeds'),
    postsBlock: document.querySelector('.posts'),
    modalWindow: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalFullArticleButton: document.querySelector('.full-article'),
  };

  const generateSchema = (state) => {
    const currentUrlList = state.feeds.map(({ url }) => url);

    return yup.object({
      url: yup.string().url('invalidLink').notOneOf(currentUrlList, 'alreadyAdded'),
    });
  };

  const i18nInstance = i18next.createInstance();

  i18nInstance
    .init({
      lng: 'ru',
      resources: {
        ru,
      },
    })
    .then(() => {
      const state = onChange(initialState, view(initialState, i18nInstance, elements));

      postUpdateCheck(state);

      const form = document.querySelector('.rss-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = form.elements.url.value;

        const urlSchema = generateSchema(state);
        const validation = urlSchema.validate({ url });
        const feedId = state.lastFeedId + 1;

        validation
          .then(() => {
            state.form.process.state = 'sending';
            const updatedURl = generateUrl(url);
            const request = axios.get(updatedURl);
            return request;
          })
          .then((response) => {
            state.form.process.state = 'sent';
            const parsedRss = parseRss(response, feedId);
            return parsedRss;
          })
          .then((data) => {
            state.form.process.state = 'uploaded';
            state.lastFeedId = feedId;

            const {
              feed: { title, description },
              posts,
            } = data;

            state.feeds.push({
              id: feedId,
              title,
              description,
              url,
            });

            state.posts = [...state.posts, ...posts];
          })
          .then(() => {
            state.form.process.state = 'filling';
            state.form.process.error = null;
          })
          .catch((error) => {
            state.form.process.error = error.message === 'Network Error' ? 'network' : error.message;
            state.form.process.state = 'error';
          });
      });

      elements.modalWindow.addEventListener('show.bs.modal', (e) => {
        const { parentNode } = e.relatedTarget;

        const modalLink = parentNode.querySelector('a').getAttribute('href');
        const post = state.posts.find((p) => p.link === modalLink);

        state.modalWindow = { post };
        state.watchedPostLinks.push(modalLink);
      });
    });
};

export default app;
