import { downloadWorkItemAttachment } from './feature';
import { AzureDevOpsError } from '../../../shared/errors';
import { Readable } from 'stream';
import { readFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

describe('downloadWorkItemAttachment unit', () => {
  test('should propagate AzureDevOpsError when thrown internally', async () => {
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockImplementation(() => {
        throw new AzureDevOpsError('Custom error');
      }),
    };

    await expect(
      downloadWorkItemAttachment(mockConnection, 'abc-123', 'TestProject'),
    ).rejects.toThrow(AzureDevOpsError);

    await expect(
      downloadWorkItemAttachment(mockConnection, 'abc-123', 'TestProject'),
    ).rejects.toThrow('Custom error');
  });

  test('should wrap unexpected errors in a friendly error message', async () => {
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      }),
    };

    await expect(
      downloadWorkItemAttachment(mockConnection, 'abc-123', 'TestProject'),
    ).rejects.toThrow(
      'Failed to download work item attachment: Unexpected error',
    );
  });

  test('should throw when no stream is returned', async () => {
    const mockWitApi = {
      getAttachmentContent: jest.fn().mockResolvedValue(null),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    await expect(
      downloadWorkItemAttachment(mockConnection, 'abc-123', 'TestProject'),
    ).rejects.toThrow(
      'Failed to download work item attachment: Failed to download attachment — no content returned',
    );
  });

  test('should save to temp file by default and return filePath', async () => {
    const testContent = 'Hello, world!';
    const testBuffer = Buffer.from(testContent);
    const mockStream = Readable.from(testBuffer);

    const mockWitApi = {
      getAttachmentContent: jest.fn().mockResolvedValue(mockStream),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await downloadWorkItemAttachment(
      mockConnection,
      'abc-123',
      'TestProject',
      'test.txt',
    );

    const expectedPath = join(tmpdir(), 'test.txt');
    expect(result).toEqual({
      attachmentId: 'abc-123',
      fileName: 'test.txt',
      filePath: expectedPath,
      sizeBytes: testBuffer.length,
    });
    expect(result).not.toHaveProperty('contentBase64');

    // Verify the file was actually written
    const written = await readFile(expectedPath);
    expect(written.toString()).toBe(testContent);

    // Cleanup
    await unlink(expectedPath);
  });

  test('should use attachment ID in filename when fileName not provided', async () => {
    const mockStream = Readable.from(Buffer.from('data'));

    const mockWitApi = {
      getAttachmentContent: jest.fn().mockResolvedValue(mockStream),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await downloadWorkItemAttachment(
      mockConnection,
      'abc-123',
      'TestProject',
    );

    const expectedPath = join(tmpdir(), 'attachment-abc-123');
    expect(result).toEqual({
      attachmentId: 'abc-123',
      fileName: null,
      filePath: expectedPath,
      sizeBytes: 4,
    });

    // Cleanup
    await unlink(expectedPath);
  });

  test('should sanitize path traversal in fileName when saving to file', async () => {
    const mockStream = Readable.from(Buffer.from('data'));

    const mockWitApi = {
      getAttachmentContent: jest.fn().mockResolvedValue(mockStream),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await downloadWorkItemAttachment(
      mockConnection,
      'abc-123',
      'TestProject',
      '../../etc/malicious.txt',
      true,
    );

    // Should strip directory components, writing only to tmpdir
    const expectedPath = join(tmpdir(), 'malicious.txt');
    expect((result as any).filePath).toBe(expectedPath);

    // Cleanup
    await unlink(expectedPath);
  });

  test('should return base64 content when saveToFile is false', async () => {
    const testContent = 'Hello, world!';
    const testBuffer = Buffer.from(testContent);
    const mockStream = Readable.from(testBuffer);

    const mockWitApi = {
      getAttachmentContent: jest.fn().mockResolvedValue(mockStream),
    };
    const mockConnection: any = {
      getWorkItemTrackingApi: jest.fn().mockResolvedValue(mockWitApi),
    };

    const result = await downloadWorkItemAttachment(
      mockConnection,
      'abc-123',
      'TestProject',
      'test.txt',
      false,
    );

    expect(result).toEqual({
      attachmentId: 'abc-123',
      fileName: 'test.txt',
      contentBase64: testBuffer.toString('base64'),
      sizeBytes: testBuffer.length,
    });
    expect(result).not.toHaveProperty('filePath');

    expect(mockWitApi.getAttachmentContent).toHaveBeenCalledWith(
      'abc-123',
      'test.txt',
      'TestProject',
      true,
    );
  });
});
