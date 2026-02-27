import { slimListItem } from './types';

describe('slimListItem', () => {
  test('should remove _links field', () => {
    const obj = {
      id: 1,
      name: 'Test',
      _links: { self: { href: 'http://...' } },
    };
    const result = slimListItem(obj);
    expect(result).toEqual({ id: 1, name: 'Test' });
    expect(result._links).toBeUndefined();
  });

  test('should remove links field', () => {
    const obj = { id: 1, links: { self: { href: 'http://...' } } };
    const result = slimListItem(obj);
    expect(result.links).toBeUndefined();
  });

  test('should remove project, plan, testPlan, testSuite fields', () => {
    const obj = {
      id: 1,
      name: 'Test',
      project: { id: 'proj-1', name: 'My Project' },
      plan: { id: 10, name: 'Plan' },
      testPlan: { id: 10, name: 'Plan' },
      testSuite: { id: 20, name: 'Suite' },
    };
    const result = slimListItem(obj);
    expect(result).toEqual({ id: 1, name: 'Test' });
  });

  test('should remove revision and lastUpdatedDate', () => {
    const obj = {
      id: 1,
      revision: 5,
      lastUpdatedDate: '2025-01-01T00:00:00Z',
    };
    const result = slimListItem(obj);
    expect(result).toEqual({ id: 1 });
  });

  test('should slim top-level identity refs to displayName, uniqueName, id', () => {
    const obj = {
      id: 1,
      owner: {
        displayName: 'John Doe',
        uniqueName: 'john@example.com',
        id: 'user-1',
        url: 'http://long-url',
        _links: { avatar: { href: 'http://avatar-url' } },
        imageUrl: 'http://image-url',
        descriptor: 'aad.abc123',
      },
    };
    const result = slimListItem(obj);
    expect(result.owner).toEqual({
      displayName: 'John Doe',
      uniqueName: 'john@example.com',
      id: 'user-1',
    });
  });

  test('should slim identity refs inside arrays', () => {
    const obj = {
      id: 1,
      pointAssignments: [
        {
          configurationId: 100,
          tester: {
            displayName: 'Jane',
            uniqueName: 'jane@example.com',
            id: 'user-2',
            url: 'http://long-url',
            _links: {},
          },
        },
      ],
    };
    const result = slimListItem(obj);
    expect(result.pointAssignments[0].tester).toEqual({
      displayName: 'Jane',
      uniqueName: 'jane@example.com',
      id: 'user-2',
    });
    expect(result.pointAssignments[0].configurationId).toBe(100);
  });

  test('should not treat objects without uniqueName as identity refs', () => {
    const obj = {
      id: 1,
      configuration: { id: 10, name: 'Windows 10' },
    };
    const result = slimListItem(obj);
    expect(result.configuration).toEqual({ id: 10, name: 'Windows 10' });
  });

  test('should preserve primitive values', () => {
    const obj = {
      id: 42,
      name: 'Suite A',
      state: 'active',
      suiteType: 'staticTestSuite',
    };
    const result = slimListItem(obj);
    expect(result).toEqual({
      id: 42,
      name: 'Suite A',
      state: 'active',
      suiteType: 'staticTestSuite',
    });
  });

  test('should handle empty object', () => {
    const result = slimListItem({});
    expect(result).toEqual({});
  });

  test('should handle object with only stripped fields', () => {
    const obj = {
      _links: {},
      project: { id: 'p' },
      plan: { id: 1 },
      revision: 1,
      lastUpdatedDate: '2025-01-01',
    };
    const result = slimListItem(obj);
    expect(result).toEqual({});
  });

  test('should not modify arrays of primitives', () => {
    const obj = {
      id: 1,
      tags: ['tag1', 'tag2'],
    };
    const result = slimListItem(obj);
    expect(result.tags).toEqual(['tag1', 'tag2']);
  });
});
