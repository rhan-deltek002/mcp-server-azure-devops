import { WebApi } from 'azure-devops-node-api';
import { readFile } from 'fs/promises';
import { Readable } from 'stream';
import { AzureDevOpsError } from '../../../shared/errors';

/**
 * Upload a file and attach it to a work item.
 *
 * This is a two-step process:
 * 1. Upload the file as a blob attachment
 * 2. Link the attachment to the work item via a relation patch
 *
 * Accepts either a file path (reads binary directly) or base64-encoded content.
 * When filePath is provided it takes precedence over fileContent.
 *
 * @param connection The Azure DevOps WebApi connection
 * @param workItemId The ID of the work item to attach the file to
 * @param fileName The file name with extension
 * @param projectId The project ID or name
 * @param options.filePath Path to a file on disk to upload
 * @param options.fileContent Base64-encoded file content (used when filePath is not provided)
 * @param options.comment Optional comment for the attachment
 * @returns The attachment reference and updated work item
 */
export async function uploadWorkItemAttachment(
  connection: WebApi,
  workItemId: number,
  fileName: string,
  projectId: string,
  options: {
    filePath?: string;
    fileContent?: string;
    comment?: string;
  },
) {
  try {
    if (!options.filePath && !options.fileContent) {
      throw new Error('Either filePath or fileContent must be provided');
    }

    const witApi = await connection.getWorkItemTrackingApi();

    // Read file content — prefer filePath over base64
    let buffer: Buffer;
    if (options.filePath) {
      buffer = await readFile(options.filePath);
    } else {
      buffer = Buffer.from(options.fileContent!, 'base64');
    }
    const stream = Readable.from(buffer);

    const attachmentRef = await witApi.createAttachment(
      {},
      stream,
      fileName,
      'Simple',
      projectId,
    );

    if (!attachmentRef || !attachmentRef.url) {
      throw new Error('Failed to upload attachment — no reference returned');
    }

    // Link the attachment to the work item
    const patchDocument = [
      {
        op: 'add',
        path: '/relations/-',
        value: {
          rel: 'AttachedFile',
          url: attachmentRef.url,
          attributes: {
            comment: options.comment || '',
          },
        },
      },
    ];

    const updatedWorkItem = await witApi.updateWorkItem(
      {},
      patchDocument,
      workItemId,
      projectId,
    );

    if (!updatedWorkItem) {
      throw new Error(
        'Failed to link attachment to work item — no work item returned',
      );
    }

    return {
      attachment: attachmentRef,
      workItem: updatedWorkItem,
    };
  } catch (error) {
    if (error instanceof AzureDevOpsError) {
      throw error;
    }
    throw new Error(
      `Failed to upload work item attachment: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
