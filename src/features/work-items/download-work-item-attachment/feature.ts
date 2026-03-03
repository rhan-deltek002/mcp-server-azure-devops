import { WebApi } from 'azure-devops-node-api';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join, basename } from 'path';
import { AzureDevOpsError } from '../../../shared/errors';

/**
 * Collect a readable stream into a Buffer.
 */
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return await new Promise<Buffer>((resolve, reject) => {
    stream.on('data', (c) => chunks.push(Buffer.from(c)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => reject(err));
  });
}

/**
 * Download a work item attachment by its ID.
 *
 * By default, saves the attachment to a temp file and returns the file path.
 * When saveToFile is false, returns the content as base64 in the response.
 *
 * @param connection The Azure DevOps WebApi connection
 * @param attachmentId The GUID of the attachment
 * @param projectId The project ID or name
 * @param fileName Optional file name hint
 * @param saveToFile When true, saves to a temp file and returns the path (default: true)
 * @returns Object with attachmentId, fileName, size, and either filePath or base64 content
 */
export async function downloadWorkItemAttachment(
  connection: WebApi,
  attachmentId: string,
  projectId: string,
  fileName?: string,
  saveToFile: boolean = true,
) {
  try {
    const witApi = await connection.getWorkItemTrackingApi();

    const stream = await witApi.getAttachmentContent(
      attachmentId,
      fileName,
      projectId,
      true,
    );

    if (!stream) {
      throw new Error('Failed to download attachment — no content returned');
    }

    const buffer = await streamToBuffer(stream as NodeJS.ReadableStream);

    if (saveToFile) {
      // Use basename to strip directory components and prevent path traversal
      const resolvedFileName = basename(
        fileName || `attachment-${attachmentId}`,
      );
      const filePath = join(tmpdir(), resolvedFileName);
      await writeFile(filePath, buffer);

      return {
        attachmentId,
        fileName: fileName || null,
        filePath,
        sizeBytes: buffer.length,
      };
    }

    return {
      attachmentId,
      fileName: fileName || null,
      contentBase64: buffer.toString('base64'),
      sizeBytes: buffer.length,
    };
  } catch (error) {
    if (error instanceof AzureDevOpsError) {
      throw error;
    }
    throw new Error(
      `Failed to download work item attachment: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
