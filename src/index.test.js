
import Collection from  './index';

describe('getEndpoint', () => {
  const collection = new Collection(null, 'mycontext');

  it('returns the correct context', () => {
    expect(collection.getEndpoint()).toBe(`/mycontext`);
  });
});

describe('getParamsFromQuery', () => {
  const collection = new Collection();

  it('returns the correct query parameters', () => {
    expect(collection.getParamsFromQuery({foo:undefined})).toEqual([]);
    expect(collection.getParamsFromQuery({foo:'bar'})).toEqual(['foo=bar']);
    expect(collection.getParamsFromQuery({foo:'bar', boo:'baz'})).toEqual(['foo=bar', 'boo=baz']);
  });
});

describe('getIdsToFetch', () => {
  const collection = new Collection();

  it('returns the ids not in a collection', () => {
    expect(collection.getIdsToFetch({1:'foo', 2:'bar', 3:'baz'}, [1,2,3,4,5])).toEqual([4,5]);
  });
});
