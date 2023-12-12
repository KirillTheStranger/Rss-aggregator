const createCardBody = (cardTitle) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const card = document.createElement('h2');
  card.classList.add('card-title', 'h4');
  card.textContent = `${cardTitle}`;
  cardBody.append(card);

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  container.append(cardBody, listGroup);
  return container;
};

export default (state, i18nInstance) => (path) => {
  const feedback = document.querySelector('.feedback');
  const input = document.querySelector('#url-input');
  const form = document.querySelector('.rss-form');
  const sendingButton = document.querySelector('.btn-lg');
  // console.log(path);

  switch (path) {
    case 'form.process.state': {
      switch (state.form.process.state) {
        case 'sending': {
          sendingButton.setAttribute('disabled', '');
          feedback.textContent = '';
          break;
        }
        case 'error': {
          sendingButton.removeAttribute('disabled');
          feedback.textContent = `${i18nInstance.t(`errors.${state.form.process.error}`)}`;
          break;
        }
        case 'sent': {
          sendingButton.removeAttribute('disabled');
          break;
        }
        default: {
          // throw new Error(`Uknown error: ${state.form.process.state}`);
        }
      }
      break;
    }
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
    case 'feeds': {
      const [currentFeed] = state.feeds.filter((feed) => feed.id === state.lastFeedId);
      const feedsBlock = document.querySelector('.feeds');

      if (!feedsBlock.hasChildNodes()) {
        const cardBlock = createCardBody(i18nInstance.t('feeds'));
        feedsBlock.append(cardBlock);
      }

      const listGroup = feedsBlock.querySelector('.list-group');

      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item', 'border-0', 'border-end-0');

      const listTitle = document.createElement('h3');
      listTitle.classList.add('h6', 'm-0');
      listTitle.textContent = currentFeed.title;

      const listDescription = document.createElement('p');
      listDescription.classList.add('m-0', 'small', 'text-black-50');
      listDescription.textContent = currentFeed.description;

      listItem.append(listTitle, listDescription);
      listGroup.prepend(listItem);
      break;
    }
    case 'posts': {
      const postsBlock = document.querySelector('.posts');
      const [currentPost] = state.posts.filter((post) => post.feedId === state.lastFeedId);
      const postList = currentPost.elements;
      // массив объектов {title: postTitle, description: postDescription, link}

      if (!postsBlock.hasChildNodes()) {
        const cardBlock = createCardBody(i18nInstance.t('posts'));
        postsBlock.append(cardBlock);
      }

      const listGroup = postsBlock.querySelector('.list-group');

      postList.forEach((post) => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

        const link = document.createElement('a');
        link.setAttribute('href', `${post.link}`);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.classList.add('fw-bold');
        link.textContent = `${post.title}`;

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-bs-toggle', 'modal');
        button.setAttribute('data-bs-target', '#modal');
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        button.textContent = i18nInstance.t('watchButton');

        listItem.append(link, button);

        listGroup.prepend(listItem);
      });

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
