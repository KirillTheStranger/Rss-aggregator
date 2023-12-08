export default (state) => (path, value) => {
  const feedback = document.querySelector('.feedback');
  const input = document.querySelector('#url-input');

  switch (path) {
    case 'form.process.error': {
      switch (state.form.process.error) {
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
        feedback.textContent = 'RSS успешно загружен';
      }

      if (state.form.valid === false) {
        feedback.classList.replace('text-success', 'text-danger');
      }
      break;
    }
    // default: {
    //   throw new Error(`Uknown path: ${path}`);
    // }
  }
};
