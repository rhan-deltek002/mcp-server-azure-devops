import { uploadWorkItemAttachment } from './feature';
import { AzureDevOpsError } from '../../../shared/errors';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

describe('uploadWorkItemAttachment unit', () => {
  test('should throw when neither filePath nor fileContent is provided', async () => {
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue({}),
    };

    await expect(
      uploadWorkItemAttachment(
        mockConnection,
        1,
        'test.txt',
        'TestProject',
        {},
      ),
    ).rejects.toThrow(
      'Failed to upload work item attachment: Either filePath or fileContent must be provided',
    );
  });

  test('should propagate AzureDevOpsError when thrown internally', async () => {
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockImplementation(() => {
        throw new AzureDevOpsError('Custom error');
      }),
    };

    await expect(
      uploadWorkItemAttachment(mockConnection, 1, 'test.txt', 'TestProject', {
        fileContent: Buffer.from('hello').toString('base64'),
      }),
    ).rejects.toThrow(AzureDevOpsError);

    await expect(
      uploadWorkItemAttachment(mockConnection, 1, 'test.txt', 'TestProject', {
        fileContent: Buffer.from('hello').toString('base64'),
      }),
    ).rejects.toThrow('Custom error');
  });

  test('should wrap unexpected errors in a friendly error message', async () => {
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      }),
    };

    await expect(
      uploadWorkItemAttachment(mockConnection, 1, 'test.txt', 'TestProject', {
        fileContent: Buffer.from('hello').toString('base64'),
      }),
    ).rejects.toThrow(
      'Failed to upload work item attachment: Unexpected error',
    );
  });

  test('should throw when attachment upload returns no reference', async () => {
    const mockWitApi = {
      createAttachment: jest.fn().mockResolvedValue(null),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    await expect(
      uploadWorkItemAttachment(mockConnection, 1, 'test.txt', 'TestProject', {
        fileContent: Buffer.from('hello').toString('base64'),
      }),
    ).rejects.toThrow(
      'Failed to upload work item attachment: Failed to upload attachment — no reference returned',
    );
  });

  test('should throw when work item update returns null', async () => {
    const mockWitApi = {
      createAttachment: jest.fn().mockResolvedValue({
        url: 'https://dev.azure.com/attachment/1',
        id: 'abc-123',
      }),
      updateWorkItem: jest.fn().mockResolvedValue(null),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    await expect(
      uploadWorkItemAttachment(mockConnection, 1, 'test.txt', 'TestProject', {
        fileContent: Buffer.from('hello').toString('base64'),
      }),
    ).rejects.toThrow(
      'Failed to upload work item attachment: Failed to link attachment to work item — no work item returned',
    );
  });

  test('should upload using base64 fileContent', async () => {
    const mockAttachmentRef = {
      url: 'https://dev.azure.com/attachment/1',
      id: 'abc-123',
    };
    const mockWorkItem = {
      id: 1,
      fields: { 'System.Title': 'Test' },
    };
    const mockWitApi = {
      createAttachment: jest.fn().mockResolvedValue(mockAttachmentRef),
      updateWorkItem: jest.fn().mockResolvedValue(mockWorkItem),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await uploadWorkItemAttachment(
      mockConnection,
      1,
      'test.txt',
      'TestProject',
      {
        fileContent: Buffer.from('hello').toString('base64'),
        comment: 'My comment',
      },
    );

    expect(result).toEqual({
      attachment: mockAttachmentRef,
      workItem: mockWorkItem,
    });

    expect(mockWitApi.createAttachment).toHaveBeenCalledWith(
      {},
      expect.anything(),
      'test.txt',
      'Simple',
      'TestProject',
    );

    expect(mockWitApi.updateWorkItem).toHaveBeenCalledWith(
      {},
      [
        {
          op: 'add',
          path: '/relations/-',
          value: {
            rel: 'AttachedFile',
            url: 'https://dev.azure.com/attachment/1',
            attributes: { comment: 'My comment' },
          },
        },
      ],
      1,
      'TestProject',
    );
  });

  test('should upload using filePath', async () => {
    const tempFile = join(tmpdir(), 'upload-test-file.txt');
    await writeFile(tempFile, 'binary content here');

    try {
      const mockAttachmentRef = {
        url: 'https://dev.azure.com/attachment/2',
        id: 'def-456',
      };
      const mockWorkItem = {
        id: 2,
        fields: { 'System.Title': 'Test 2' },
      };
      const mockWitApi = {
        createAttachment: jest.fn().mockResolvedValue(mockAttachmentRef),
        updateWorkItem: jest.fn().mockResolvedValue(mockWorkItem),
      };
      const mockConnection: any = {
        getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
      };

      const result = await uploadWorkItemAttachment(
        mockConnection,
        2,
        'upload-test-file.txt',
        'TestProject',
        { filePath: tempFile },
      );

      expect(result).toEqual({
        attachment: mockAttachmentRef,
        workItem: mockWorkItem,
      });

      // createAttachment should have been called with a stream (ReadStream)
      expect(mockWitApi.createAttachment).toHaveBeenCalledWith(
        {},
        expect.anything(),
        'upload-test-file.txt',
        'Simple',
        'TestProject',
      );
    } finally {
      await unlink(tempFile);
    }
  });
});
