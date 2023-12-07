import onChange from 'on-change';
import * as yup from 'yup';

const app = () => {
  const initialState = {
    form: {
      process: {
        state: 'standby', // processed processing
        error: null, //invalidLink noRss alreadyAdded
      },
      valid: null, // true false
      listFeed: [],
    },
  };

  const state = onChange(initialState, (path, value, previousValue) => {});

  const urlSchema = yup.object({
    url: yup.string().url(),
  });

  const form = document.querySelector('.rss-form');
  // form.elements.url.value

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { value } = form.elements.url;
    // console.log(value);

    try {
      urlSchema.validateSync({ url: value });
    } catch (error) {
      state.form.process.error = 'invalidLink';
      state.form.valid = false;
    }

    console.log(initialState);
  });
};

export default app;
