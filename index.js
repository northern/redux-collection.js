
export default class Collection {
  constructor(api, context) {
    this.api = api;
    this.context = context;
  }

  getEndpoint() {
    return `/${this.context}`;
  }

  getParamsFromQuery(query) {
    const params = []; //

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
   * return {Promise}
   */
  fetchOne(id, forceLoad = false, endpoint = this.getEndpoint()) {
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
        return this.api.get(`${endpoint}/${id}`)
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
   * @param {Object} query The query parameters; "offset", "limit", "key" & "sort".
   * @return {Promise}
   */
  fetchMany(ids, query = {}, forceReload = false, endpoint = this.getEndpoint()) {
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
        const params = this.getParamsFromQuery(query);

        return this.api.get(`${endpoint}/${ids.join('+')}${params.length ? '?'+params.join('&') : ''}`)
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
   * @param {Object} query The query parameters; "offset", "limit", "key" & "sort"
   * @return {Promise}
   */
  fetchAll(query = {}, endpoint = this.getEndpoint()) {
    return (dispatch, getState) => {
      dispatch(this.fetchRequest());

      const params = this.getParamsFromQuery(query);

      return this.api.get(`${endpoint}${params.length ? '?'+params.join('&') : ''}`)
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
  create(data, endpoint = this.getEndpoint()) {
    return (dispatch, getState) => {
      dispatch(this.updateRequest());

      return this.api.post(`${endpoint}`, JSON.stringify(data))
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
  update(id, data, endpoint = this.getEndpoint()) {
    return (dispatch, getState) => {
      dispatch(this.updateRequest());

      return this.api.put(`${endpoint}/${id}`, JSON.stringify(data))
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
