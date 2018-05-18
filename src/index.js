
export default class Collection {
  constructor(api, context) {
    this.api = api;
    this.context = context;
  }

  getQueryFromParams(query) {
    const params = [];

    Object.keys(query).map((key) => {
      if (query[key] !== undefined) {
        params.push(`${key}=${query[key]}`)
      }
    });

    return params;
  }

  /**
   * Takes a collection and a list of Ids and returns a list of Ids that are not
   * currently present in the collection.
   *
   * @param {Object} collection An object containing elements indexed by object id.
   * @param {Array} ids A list of Ids.
   * @return {Array}
   */
  getIdsToFetch(collection, ids) {
    if (!ids) {
      ids = [];
    }

    return ids.filter((id) => {
      return !collection[id];
    });
  }

  /**
   * Returns the full path of a path than contains parameters specified in params.
   *
   * @param {String} A string representing a path that contains colon prefixed parameters.
   * @param {Object} An object to which the key/value pairs are replaced in the path.
   * @return {String}
   */
  getPath(path, params) {
    Object.keys(params).map(key => {
      path = path.replace(`:${key}`, params[key]);
    });

    return path;
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
        return this.api.get(this.getPath(path, {id}))
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

      ids = this.getIdsToFetch(state.core[this.context], ids);

      if (ids.length === 0 && forceReload === false) {
        const data = {};
        data[this.context] = [];

        return new Promise((resolve, reject) => {
          dispatch(this.fetchResponse(data));

          resolve(data);
        });        
      }
      else {
        const query = this.getQueryFromParams(params);

        return this.api.get(this.getPath(path, {ids:`${ids.join('+')}${query.length ? '?'+query.join('&') : ''}`}))
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

      const query = this.getQueryFromParams(params);

      return this.api.get(`${path}${query.length ? '?'+query.join('&') : ''}`)
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
      dispatch(this.updateRequest());

      return this.api.post(path, JSON.stringify(data))
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

      return this.api.put(this.getPath(path, {id}), JSON.stringify(data))
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
}
