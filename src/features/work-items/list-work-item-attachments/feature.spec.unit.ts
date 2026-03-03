import { listWorkItemAttachments } from './feature';
import { AzureDevOpsError } from '../../../shared/errors';

describe('listWorkItemAttachments unit', () => {
  test('should propagate AzureDevOpsError when thrown internally', async () => {
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockImplementation(() => {
        throw new AzureDevOpsError('Custom error');
      }),
    };

    await expect(
      listWorkItemAttachments(mockConnection, 1, 'TestProject'),
    ).rejects.toThrow(AzureDevOpsError);

    await expect(
      listWorkItemAttachments(mockConnection, 1, 'TestProject'),
    ).rejects.toThrow('Custom error');
  });

  test('should wrap unexpected errors in a friendly error message', async () => {
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      }),
    };

    await expect(
      listWorkItemAttachments(mockConnection, 1, 'TestProject'),
    ).rejects.toThrow('Failed to list work item attachments: Unexpected error');
  });

  test('should throw resource not found when work item is null', async () => {
    const mockWitApi = {
      getWorkItem: jest.fn().mockResolvedValue(null),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    await expect(
      listWorkItemAttachments(mockConnection, 999, 'TestProject'),
    ).rejects.toThrow("Work item '999' not found");
  });

  test('should return empty array when work item has no relations', async () => {
    const mockWitApi = {
      getWorkItem: jest.fn().mockResolvedValue({
        id: 1,
        relations: undefined,
      }),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await listWorkItemAttachments(
      mockConnection,
      1,
      'TestProject',
    );

    expect(result).toEqual([]);
  });

  test('should filter only AttachedFile relations', async () => {
    const mockWitApi = {
      getWorkItem: jest.fn().mockResolvedValue({
        id: 1,
        relations: [
          {
            rel: 'AttachedFile',
            url: 'https://dev.azure.com/org/project/_apis/wit/attachments/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
            attributes: {
              name: 'report.pdf',
              resourceSize: 1024,
              comment: 'Test attachment',
            },
          },
          {
            rel: 'System.LinkTypes.Hierarchy-Forward',
            url: 'https://dev.azure.com/org/project/_apis/wit/workItems/2',
            attributes: {},
          },
          {
            rel: 'AttachedFile',
            url: 'https://dev.azure.com/org/project/_apis/wit/attachments/11111111-2222-3333-4444-555555555555',
            attributes: {
              name: 'image.png',
              resourceSize: 2048,
            },
          },
        ],
      }),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await listWorkItemAttachments(
      mockConnection,
      1,
      'TestProject',
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      url: 'https://dev.azure.com/org/project/_apis/wit/attachments/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      name: 'report.pdf',
      resourceSize: 1024,
      comment: 'Test attachment',
      resourceCreatedDate: null,
      resourceModifiedDate: null,
      authorizedDate: null,
    });
    expect(result[1]).toEqual({
      id: '11111111-2222-3333-4444-555555555555',
      url: 'https://dev.azure.com/org/project/_apis/wit/attachments/11111111-2222-3333-4444-555555555555',
      name: 'image.png',
      resourceSize: 2048,
      comment: null,
      resourceCreatedDate: null,
      resourceModifiedDate: null,
      authorizedDate: null,
    });
  });

  test('should handle URL without valid attachment GUID', async () => {
    const mockWitApi = {
      getWorkItem: jest.fn().mockResolvedValue({
        id: 1,
        relations: [
          {
            rel: 'AttachedFile',
            url: 'https://dev.azure.com/some/other/url',
            attributes: {},
          },
        ],
      }),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await listWorkItemAttachments(
      mockConnection,
      1,
      'TestProject',
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBeNull();
  });
});
