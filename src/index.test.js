
import Collection from  './index';

describe('getQueryFromParams', () => {
  const collection = new Collection();

  it('returns the correct query parameters', () => {
    expect(collection.getQueryFromParams({foo:undefined})).toEqual([]);
    expect(collection.getQueryFromParams({foo:'bar'})).toEqual(['foo=bar']);
    expect(collection.getQueryFromParams({foo:'bar', boo:'baz'})).toEqual(['foo=bar', 'boo=baz']);
  });
});

describe('getIdsToFetch', () => {
  const collection = new Collection();

  it('returns the ids not in a collection', () => {
    expect(collection.getIdsToFetch({1:'foo', 2:'bar', 3:'baz'}, [1,2,3,4,5])).toEqual([4,5]);
  });
});

describe('getPath', () => {
  const collection = new Collection();

  it('returns', () => {
    expect(collection.getPath('users/:id', {id:1})).toEqual('users/1');
  });
});
