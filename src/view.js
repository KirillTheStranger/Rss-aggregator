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

const addAttributesToElement = (element, arrOfAttributes) => {
  arrOfAttributes.forEach(([attribute, value]) => {
    element.setAttribute(attribute, value);
  });
};

export default (state, i18nInstance, elements) => (path) => {
  const {
    feedback, input,
    form, sendingButton,
    feedsBlock, postsBlock,
  } = elements;

  const feedsRender = (currentState) => {
    const [currentFeed] = currentState.feeds.filter((feed) => feed.id === currentState.lastFeedId);

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
  };

  const postsRender = (currentState) => {
    const postList = currentState.posts;

    if (!postsBlock.hasChildNodes()) {
      const cardBlock = createCardBody(i18nInstance.t('posts'));
      postsBlock.append(cardBlock);
    }

    const listGroup = postsBlock.querySelector('.list-group');

    const listItems = postList.map((post) => {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      const link = document.createElement('a');
      const linkAttributes = [
        ['href', `${post.link}`],
        ['target', '_blank'],
        ['rel', 'noopener noreferrer'],
      ];
      addAttributesToElement(link, linkAttributes);

      link.classList.add('fw-bold');
      link.textContent = `${post.title}`;

      const button = document.createElement('button');
      const buttonAttributes = [
        ['type', 'button'],
        ['data-bs-toggle', 'modal'],
        ['data-bs-target', '#modal'],
      ];
      addAttributesToElement(button, buttonAttributes);

      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.textContent = i18nInstance.t('watchButton');

      listItem.append(link, button);

      return listItem;
    });
    listGroup.replaceChildren(...listItems.reverse());
  };

  switch (path) {
    case 'form.process.state': {
      switch (state.form.process.state) {
        case 'sending': {
          sendingButton.setAttribute('disabled', '');
          feedback.textContent = 'RSS загружается';
          feedback.classList.replace('text-danger', 'rss-uploading');
          feedback.classList.replace('text-success', 'rss-uploading');
          break;
        }
        case 'sent': {
          sendingButton.removeAttribute('disabled');
          feedback.classList.replace('rss-uploading', 'text-danger');
          break;
        }
        case 'filling':
        case 'uploaded': {
          feedback.classList.replace('text-danger', 'text-success');
          feedback.textContent = i18nInstance.t('uploaded');
          form.reset();
          input.focus();
          break;
        }
        case 'error': {
          sendingButton.removeAttribute('disabled');
          feedback.textContent = `${i18nInstance.t(`errors.${state.form.process.error}`)}`;
          feedback.classList.replace('rss-uploading', 'text-danger');
          feedback.classList.replace('text-success', 'text-danger');
          break;
        }
        default: {
          throw new Error(`Uknown error: ${state.form.process.state}`);
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
        case 'network': {
          feedback.textContent = i18nInstance.t('errors.network');
          input.classList.add('is-invalid');
          break;
        }
        case 'noRss': {
          feedback.textContent = i18nInstance.t('errors.noRss');
          input.classList.add('is-invalid');
          break;
        }
        case null: {
          input.classList.remove('is-invalid');
          break;
        }
        default: {
          throw new Error(`Unknown error: ${state.form.process.error}`);
        }
      }
      break;
    }
    case 'feeds': {
      feedsRender(state);

      break;
    }
    case 'posts': {
      postsRender(state);

      break;
    }
    case 'lastFeedId': {
      console.log(`Last feed id has been updated, current id is ${state.lastFeedId}`);
      break;
    }
    default: {
      throw new Error(`Unknown path: ${path}`);
    }
  }
};
