import fetch from "isomorphic-fetch";

export const REQUEST_POSTS = 'REQUEST_POSTS';
export const RECEIVE_POSTS = 'RECEIVE_POSTS';
export const FAILURE_POSTS = 'FAILURE_POSTS';
export const SELECT_REDDIT = 'SELECT_REDDIT';
export const INVALIDATE_REDDIT = 'INVALIDATE_REDDIT';

export function selectReddit(reddit) {
  return {
    type: SELECT_REDDIT,
    reddit
  };
}

export function invalidateReddit(reddit) {
  return {
    type: INVALIDATE_REDDIT,
    reddit
  };
}

function requestPosts(reddit) {
  return {
    type: REQUEST_POSTS,
    reddit
  };
}

function receivePosts(reddit, json) {
  return {
    type: RECEIVE_POSTS,
    reddit: reddit,
    posts: json.data.children,
    receivedAt: Date.now()
  };
}

function failurePosts(reddit, error) {
  return {
    type: FAILURE_POSTS,
    reddit: reddit,
    error: error
  }
}
function fetchPosts(reddit) {
  return dispatch => {
    dispatch(requestPosts(reddit));
    return fetch(`http://www.reddit.com/r/${reddit}.json`)
      .then(res => {
        if (res.status >= 400) {
          throw new Error("Failed to retreive");
        }
        return res.json();
      })
      .then(json => {
        return dispatch(receivePosts(reddit, json));
      })
      .catch(error => {
        console.log('ERRORR');
        return dispatch(failurePosts(reddit, error));
      });
  };
}

function shouldFetchPosts(state, reddit) {
  const posts = state.postsByReddit[reddit];

  if (!posts) {
    return true;
  } else if (posts.isFetching) {
    return false;
  } else {
    return posts.didInvalidate;
  }
}

export function fetchPostsIfNeeded(reddit) {
  return (dispatch, getState) => {
    if (shouldFetchPosts(getState(), reddit)) {
      return dispatch(fetchPosts(reddit));
    }
  };
}
