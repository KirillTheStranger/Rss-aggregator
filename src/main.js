import onChange from 'on-change';
import * as yup from 'yup';

const app = () => {
  const initialState = {
    form: {
      process: {
        state: 'filling', // sending sent error
        error: null, //invalidLink noRss alreadyAdded
      },
      valid: null, // true false
    },
    listFeed: [],
  };

  const state = onChange(initialState, (path, value, previousValue) => {
    const feedback = document.querySelector('.feedback');
    const input = document.querySelector('#url-input');
    console.log(path);

    switch (path) {
      case 'form.process.state': {
        switch (state.process.error) {
          case 'invalidLink': {
            feedback.textContent = 'Ссылка должна быть валидным URL';
            input.classList.add('is-invalid');
            break;
          }
          case 'alreadyAdded': {
            feedback.textContent = 'RSS уже существует';
            input.classList.add('is-invalid');
            break;
          }
          case 'noRss': {
            feedback.textContent = 'Ресурс не содержит валидный RSS';
            break;
          }
          default: {
            throw new Error(`Uknown error: ${form.process.state}`);
          }
        }
      }
    }
  });

  const urlSchema = yup.object({
    url: yup.string().url('invalidLink').notOneOf(state.listFeed, 'alreadyAdded'),
  });

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { value } = form.elements.url;

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
    // console.log(initialState);
  });
};

export default app;
