import onChange from 'on-change';
import * as yup from 'yup';
import view from './view.js';

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

  const state = onChange(initialState, view(initialState));

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { value } = form.elements.url;

    const urlSchema = yup.object({
      url: yup.string().url('invalidLink').notOneOf(state.listFeed, 'alreadyAdded'),
    });
    const validation = urlSchema.validate({ url: value });

    validation
      .then(() => {
        state.form.process.state = 'sending';
      })
      .then(() => {
        state.listFeed.push(value);
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
