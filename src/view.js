/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */

const createCardBody = (cardTitle, cardClass) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const card = document.createElement('h2');
  card.classList.add('card-title', 'h4', cardClass);
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

const feedsRender = (currentState, i18nInstance, feedsBlock) => {
  const [currentFeed] = currentState.feeds.filter((feed) => feed.id === currentState.lastFeedId);

  if (!feedsBlock.hasChildNodes()) {
    const cardBlock = createCardBody(i18nInstance.t('feeds'), 'feedsHeader');
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

const postsRender = (currentState, i18nInstance, postsBlock) => {
  const postList = currentState.posts;

  if (!postsBlock.hasChildNodes()) {
    const cardBlock = createCardBody(i18nInstance.t('posts'), 'postsHeader');
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

    currentState.watchedPostLinks.includes(post.link) ? link.classList.add('fw-normal', 'link-secondary') : link.classList.add('fw-bold');
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

const feedBackRender = (currentState, i18nInstance, feedback, input, form, sendingButton) => {
  switch (currentState.form.process.state) {
    case 'sending': {
      sendingButton.setAttribute('disabled', '');
      feedback.textContent = i18nInstance.t('uploading');
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
      feedback.textContent = `${i18nInstance.t(`errors.${currentState.form.process.error}`)}`;
      feedback.classList.replace('rss-uploading', 'text-danger');
      feedback.classList.replace('text-success', 'text-danger');
      break;
    }
    default: {
      throw new Error(`Uknown error: ${currentState.form.process.state}`);
    }
  }
};

const errorRender = (currentState, i18nInstance, feedback, input) => {
  switch (currentState.form.process.error) {
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
      throw new Error(`Unknown error: ${currentState.form.process.error}`);
    }
  }
};

const renderModalWindow = (
  currentState,
  i18nInstance,
  modalFullArticleButton,
  modalCloseButton,
  modalTitle,
  modalBody,
) => {
  const { description, link, title } = currentState.modalWindow.post;

  modalFullArticleButton.textContent = i18nInstance.t('modal.fullArticleButton');
  modalFullArticleButton.setAttribute('href', `${link}`);
  modalCloseButton.textContent = i18nInstance.t('modal.closeButton');

  modalTitle.textContent = title;
  modalBody.textContent = description;
};

const renderWatchedPosts = (currentState, postsBlock) => {
  postsBlock.querySelectorAll('a').forEach((post) => {
    const postLink = post.getAttribute('href');
    if (currentState.watchedPostLinks.includes(postLink)) {
      post.classList.remove('fw-bold');
      post.classList.add('fw-normal', 'link-secondary');
    }
  });
};

const renderLngChange = (currentState, i18nInstance, currentValue, elements) => {
  const {
    feedback,
    mainHeader,
    mainParagraph,
    exampleLink,
    addButton,
    placeholder,
  } = elements;

  i18nInstance.changeLanguage(`${currentValue}`, (err, t) => {
    if (err) {
      throw new Error(`something went wrong loading: ${err}`);
    }
    const feedsHeader = document.querySelector('.feedsHeader');
    const postsHeader = document.querySelector('.postsHeader');
    const watchButtons = document.querySelectorAll('.btn-sm');

    if (currentState.form.process.error === null && feedback.textContent !== '') {
      feedback.textContent = `${t('uploaded')}`;
    }

    if (currentState.form.process.state === 'error') {
      feedback.textContent = `${t(`errors.${currentState.form.process.error}`)}`;
    }

    mainHeader.textContent = `${t('mainHeader')}`;
    mainParagraph.textContent = `${t('mainParagraph')}`;
    exampleLink.textContent = `${t('exampleLink')}`;
    addButton.textContent = `${t('addButton')}`;
    placeholder.textContent = `${t('placeholder')}`;

    if (postsHeader) {
      feedsHeader.textContent = `${t('feeds')}`;
      postsHeader.textContent = `${t('posts')}`;
      watchButtons.forEach((button) => {
        button.textContent = `${t('watchButton')}`;
      });
    }
  });
};

export default (state, i18nInstance, elements) => (path, currentValue) => {
  const {
    feedback,
    input,
    form,
    sendingButton,
    feedsBlock,
    postsBlock,
    modalTitle,
    modalBody,
    modalFullArticleButton,
    modalCloseButton,
  } = elements;

  switch (path) {
    case 'form.process.state': {
      feedBackRender(state, i18nInstance, feedback, input, form, sendingButton);
      break;
    }
    case 'form.process.error': {
      errorRender(state, i18nInstance, feedback, input);
      break;
    }
    case 'feeds': {
      feedsRender(state, i18nInstance, feedsBlock);
      break;
    }
    case 'posts': {
      postsRender(state, i18nInstance, postsBlock);
      break;
    }
    case 'lastFeedId': {
      console.log(`Last feed id has been updated, current id is ${state.lastFeedId}`);
      break;
    }
    case 'modalWindow': {
      renderModalWindow(
        state,
        i18nInstance,
        modalFullArticleButton,
        modalCloseButton,
        modalTitle,
        modalBody,
      );
      break;
    }
    case 'watchedPostLinks': {
      renderWatchedPosts(state, postsBlock);
      break;
    }
    case 'lng': {
      renderLngChange(state, i18nInstance, currentValue, elements);
      break;
    }
    default: {
      throw new Error(`Unknown path: ${path}`);
    }
  }
};
