import { WebApi } from 'azure-devops-node-api';
import { WorkItemExpand } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import {
  AzureDevOpsError,
  AzureDevOpsResourceNotFoundError,
} from '../../../shared/errors';

/**
 * List all attachments on a work item by filtering its relations.
 *
 * @param connection The Azure DevOps WebApi connection
 * @param workItemId The ID of the work item
 * @param projectId The project ID or name
 * @returns Array of attachment metadata objects
 */
export async function listWorkItemAttachments(
  connection: WebApi,
  workItemId: number,
  projectId: string,
) {
  try {
    const witApi = await connection.getWorkItemTrackingApi();

    const workItem = await witApi.getWorkItem(
      workItemId,
      undefined,
      undefined,
      WorkItemExpand.Relations,
      projectId,
    );

    if (!workItem) {
      throw new AzureDevOpsResourceNotFoundError(
        `Work item '${workItemId}' not found`,
      );
    }

    const relations = workItem.relations || [];

    const attachments = relations
      .filter((r) => r.rel === 'AttachedFile')
      .map((r) => {
        // Extract attachment ID from the URL
        // URL format: https://dev.azure.com/{org}/{project}/_apis/wit/attachments/{id}
        const url = r.url || '';
        const idMatch = url.match(
          /attachments\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
        );

        return {
          id: idMatch ? idMatch[1] : null,
          url,
          name: r.attributes?.['name'] || null,
          resourceSize: r.attributes?.['resourceSize'] || null,
          comment: r.attributes?.['comment'] || null,
          resourceCreatedDate: r.attributes?.['resourceCreatedDate'] || null,
          resourceModifiedDate: r.attributes?.['resourceModifiedDate'] || null,
          authorizedDate: r.attributes?.['authorizedDate'] || null,
        };
      });

    return attachments;
  } catch (error) {
    if (error instanceof AzureDevOpsError) {
      throw error;
    }
    throw new Error(
      `Failed to list work item attachments: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
