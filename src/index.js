
import {
  replaceParams,
  toQueryParams
} from '@northern/util';

export default class Collection {

  /**
   * @param {@northern/ApiClient} An ApiClient instance.
   * @param {String} A string specifying the context of this collection (e.g. 'users').
   */
  constructor(apiClient, context) {
    this.apiClient = apiClient;
    this.context = context;
  }

  /**
   * Should return the fetch request Redux action.
   *
   * @return {Object}
   */
  fetchRequest() {
    throw new Error("Implement fetchRequest method.");
  }

  /**
   * Should return the fetch response Redux action.
   *
   * @param {Object} Object containing the response data.
   * @return {Object}
   */
  fetchResponse(data) {
    throw new Error("Implement fetchResponse method.");
  }

  /**
   * Should return the fetch error Redux action.
   *
   * @param {Object} Object containing the response error data.
   * @return {Object}
   */
  fetchError(data) {
    throw new Error("Implement fetchError method.");
  }

  /**
   * Should return the create request Redux action.
   *
   * @return {Object}
   */
  createRequest() {
    throw new Error("Implement createRequest method.");
  }

  /**
   * Should return the create response Redux action.
   *
   * @param {Object} Object containing the response data.
   * @return {Object}
   */
  createResponse(data) {
    throw new Error("Implement createResponse method.");
  }

  /**
   * Should return the create error Redux action.
   *
   * @param {Object} Object containing the response error data.
   * @return {Object}
   */
  createError(error) {
    throw new Error("Implement createError method.");
  }

  /**
   * Should return the update request Redux action.
   *
   * @return {Object}
   */
  updateRequest() {
    throw new Error("Implement updateRequest method.");
  }

  /**
   * Should return the update response Redux action.
   *
   * @param {Object} Object containing the response data.
   * @return {Object}
   */
  updateResponse(data) {
    throw new Error("Implement updateResponse method.");
  }

  /**
   * Should return the update error Redux action.
   *
   * @param {Object} Object containing the response error data.
   * @return {Object}
   */
  updateError(error) {
    throw new Error("Implement updateError method.");
  }

  /**
   * Should return the delete request Redux action.
   *
   * @return {Object}
   */
  deleteRequest() {
    throw new Error("Implement deleteRequest method.");
  }

  /**
   * Should return the delete response Redux action.
   *
   * @param {Object} Object containing the response data.
   * @return {Object}
   */
  deleteResponse(id) {
    throw new Error("Implement deleteResponse method.");
  }

  /**
   * Should return the delete error Redux action.
   *
   * @param {Object} Object containing the response error data.
   * @return {Object}
   */
  deleteError(data) {
    throw new Error("Implement deleteError method.");
  }

  /**
   * return {Promise}
   */
  fetchOne(path, id, forceLoad = false) {
    return (dispatch, getState) => {
      dispatch(this.fetchRequest());

      const state = getState();

      const one = state.core[this.context][id];

      if (one && !forceLoad) {
        const data = {};
        data[this.context] = [one];

        return new Promise((resolve) => {
          dispatch(this.fetchResponse(data));

          resolve(data);
        });
      }
      else {
        return this.apiClient.get(replaceParams(path, {id}))
          .then(data => {
            dispatch(this.fetchResponse(data));

            return data;
          })
          .catch(data => {
            dispatch(this.fetchError(data.error));
          })
        ;
      }
    }
  }

  /**
   * @param {Array} ids An array containing the ids of the objects to retrieve.
   * @param {Object} params The params "offset", "limit", "key" & "sort".
   * @return {Promise}
   */
  fetchMany(path, ids, params = {}, forceReload = false) {
    return (dispatch, getState) => {
      dispatch(this.fetchRequest());

      const state = getState();

      if (!forceReload) {
        ids = ids.filter(id => {
          return !state.core[this.context][id];
        });
      }

      if (ids.length === 0 && !forceReload) {
        const data = state.core[this.context];

        return new Promise((resolve, reject) => {
          dispatch(this.fetchResponse(data));

          resolve(data);
        });        
      }
      else {
        const query = toQueryParams(params);

        return this.apiClient.get(replaceParams(path, {ids:`${ids.join('+')}${query.length ? '?'+query.join('&') : ''}`}))
          .then(data => {
            dispatch(this.fetchResponse(data));

            return data;
          })
          .catch(data => {
            dispatch(this.fetchError(data));
          })
        ;
      }
    }
  }

  /**
   * @param {Object} params The params parameters; "offset", "limit", "key" & "sort"
   * @return {Promise}
   */
  fetchAll(path, params = {}) {
    return (dispatch, getState) => {
      dispatch(this.fetchRequest());

      const query = toQueryParams(params);

      return this.apiClient.get(`${path}${query.length ? '?'+query.join('&') : ''}`)
        .then(data => {
          dispatch(this.fetchResponse(data));

          return data;
        })
        .catch(data => {
          dispatch(this.fetchError(data));
        })
      ;
    }
  }

  /**
   * @return {Promise}
   */
  create(path, data) {
    return (dispatch, getState) => {
      dispatch(this.createRequest());

      return this.apiClient.post(path, JSON.stringify(data))
        .then(data => {
          dispatch(this.createResponse(data));

          return data;
        })
        .catch(data => {
          dispatch(this.createError(data));

          return data;
        })
      ;
    }
  }

  /**
   * @return {Promise}
   */
  update(path, id, data) {
    return (dispatch, getState) => {
      dispatch(this.updateRequest());

      return this.apiClient.put(replaceParams(path, {id}), JSON.stringify(data))
        .then(data => {
          dispatch(this.updateResponse(data));

          return data;
        })
        .catch(data => {
          dispatch(this.updateError(data));

          return data;
        })
      ;
    }
  }

  /**
   * @return {Promise}
   */
  delete(path, id) {
    return (dispatch, getState) => {
      dispatch(this.deleteRequest());

      return this.apiClient.delete(replaceParams(path, {id}))
        .then(data => {
          dispatch(this.deleteResponse(id));

          return id;
        })
        .catch(data => {
          dispatch(this.deleteError(data));

          return data;
        })
      ;
    }
  }
}
