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
    listFeed: [],
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
      url: yup.string().url('invalidLink').notOneOf(state.listFeed, 'alreadyAdded'),
    });
    const validation = urlSchema.validate({ url });

    validation
      .then(() => {
        parseRss(url).catch((error) => {
          state.form.process.error = error.message;
          state.form.process.state = 'error';
          state.form.valid = false;
        });
        state.form.process.state = 'sending';
      })
      .then(() => {
        state.listFeed.push(url);
        console.log(state.listFeed);
      })
      .then(() => {
        state.form.process.state = 'sent';
        state.form.valid = true;
        state.form.process.error = null;
      })
      .catch((error) => {
        state.form.process.error = error.message;
        state.form.process.state = 'error';
        state.form.valid = false;
      });
  });
};

export default app;
