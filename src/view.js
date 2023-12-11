export default (state, i18nInstance) => (path) => {
  const feedback = document.querySelector('.feedback');
  const input = document.querySelector('#url-input');
  const form = document.querySelector('.rss-form');

  switch (path) {
    case 'form.process.error': {
      switch (state.form.process.error) {
        case 'invalidLink': {
          feedback.textContent = i18nInstance.t('errors.invalidLink');
          input.classList.add('is-invalid');
          break;
        }
        case 'alreadyAdded': {
          feedback.textContent = i18nInstance.t('errors.alreadyAdded');
          input.classList.add('is-invalid');
          break;
        }
        case 'noRss': {
          feedback.textContent = i18nInstance.t('errors.noRss');
          break;
        }
        case null: {
          input.classList.remove('is-invalid');
          break;
        }
        default: {
          throw new Error(`Uknown error: ${state.form.process.error}`);
        }
      }
      break;
    }
    case 'form.valid': {
      if (state.form.valid === true) {
        feedback.classList.replace('text-danger', 'text-success');
        feedback.textContent = i18nInstance.t('uploaded');
        form.reset();
        input.focus();
      }

      if (state.form.valid === false) {
        feedback.classList.replace('text-success', 'text-danger');
      }
      break;
    }
    default: {
      // throw new Error(`Uknown path: ${path}`);
    }
  }
};
