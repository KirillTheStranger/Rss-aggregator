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
    lastFeedId: 0,
  };

  const generateSchema = (state) => {
    const currentUrlList = state.feeds.map(({ url }) => url);
    const schema = yup.object({
      url: yup.string().url('invalidLink').notOneOf(currentUrlList, 'alreadyAdded'),
    });

    return schema;
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
      const state = onChange(initialState, view(initialState, i18nInstance));

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

            const [feed, posts] = data;
            const { title } = feed;
            const { description } = feed;

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
            if (error.message === 'Network Error') {
              state.form.process.error = 'network';
            } else {
              state.form.process.error = error.message;
            }
            state.form.process.state = 'error';
          });
      });
    });
};

export default app;
