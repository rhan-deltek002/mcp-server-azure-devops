# Work Item Tools

This document describes the tools available for working with Azure DevOps work items.

## Table of Contents

- [`get_work_item`](#get_work_item) - Retrieve a specific work item by ID
- [`create_work_item`](#create_work_item) - Create a new work item
- [`list_work_items`](#list_work_items) - List work items in a project
- [`upload_work_item_attachment`](#upload_work_item_attachment) - Upload a file and attach it to a work item
- [`download_work_item_attachment`](#download_work_item_attachment) - Download a work item attachment by ID
- [`list_work_item_attachments`](#list_work_item_attachments) - List all attachments on a work item

## get_work_item

Retrieves a work item by its ID.

### Parameters

| Parameter    | Type   | Required | Description                                                                       |
| ------------ | ------ | -------- | --------------------------------------------------------------------------------- |
| `workItemId` | number | Yes      | The ID of the work item to retrieve                                               |
| `expand`     | string | No       | Controls the level of detail in the response. Defaults to "All" if not specified. Other values: "Relations", "Fields", "None" |

### Response

Returns a work item object with the following structure:

```json
{
  "id": 123,
  "fields": {
    "System.Title": "Sample Work Item",
    "System.State": "Active",
    "System.AssignedTo": "user@example.com",
    "System.Description": "Description of the work item"
  },
  "url": "https://dev.azure.com/organization/project/_apis/wit/workItems/123"
}
```

### Error Handling

- Returns `AzureDevOpsResourceNotFoundError` if the work item does not exist
- Returns `AzureDevOpsAuthenticationError` if authentication fails
- Returns generic error messages for other failures

### Example Usage

```javascript
// Using default expand="All"
const result = await callTool('get_work_item', {
  workItemId: 123,
});

// Explicitly specifying expand
const minimalResult = await callTool('get_work_item', {
  workItemId: 123,
  expand: 'None'
});
```

## create_work_item

Creates a new work item in a specified project.

### Parameters

| Parameter          | Type   | Required | Description                                                         |
| ------------------ | ------ | -------- | ------------------------------------------------------------------- |
| `projectId`        | string | Yes      | The ID or name of the project where the work item will be created   |
| `workItemType`     | string | Yes      | The type of work item to create (e.g., "Task", "Bug", "User Story") |
| `title`            | string | Yes      | The title of the work item                                          |
| `description`      | string | No       | The description of the work item                                    |
| `assignedTo`       | string | No       | The email or name of the user to assign the work item to            |
| `areaPath`         | string | No       | The area path for the work item                                     |
| `iterationPath`    | string | No       | The iteration path for the work item                                |
| `priority`         | number | No       | The priority of the work item                                       |
| `additionalFields` | object | No       | Additional fields to set on the work item (key-value pairs)         |

### Response

Returns the newly created work item object:

```json
{
  "id": 124,
  "fields": {
    "System.Title": "New Work Item",
    "System.State": "New",
    "System.Description": "Description of the new work item",
    "System.AssignedTo": "user@example.com",
    "System.AreaPath": "Project\\Team",
    "System.IterationPath": "Project\\Sprint 1",
    "Microsoft.VSTS.Common.Priority": 2
  },
  "url": "https://dev.azure.com/organization/project/_apis/wit/workItems/124"
}
```

### Error Handling

- Returns validation error if required fields are missing
- Returns `AzureDevOpsAuthenticationError` if authentication fails
- Returns `AzureDevOpsResourceNotFoundError` if the project does not exist
- Returns generic error messages for other failures

### Example Usage

```javascript
const result = await callTool('create_work_item', {
  projectId: 'my-project',
  workItemType: 'User Story',
  title: 'Implement login functionality',
  description:
    'Create a secure login system with email and password authentication',
  assignedTo: 'developer@example.com',
  priority: 1,
  additionalFields: {
    'Custom.Field': 'Custom Value',
  },
});
```

### Implementation Details

The tool creates a JSON patch document to define the fields of the work item, then calls the Azure DevOps API to create the work item. Each field is added to the document with an 'add' operation, and the document is submitted to the API.

## list_work_items

Lists work items in a specified project.

### Parameters

| Parameter   | Type   | Required | Description                                           |
| ----------- | ------ | -------- | ----------------------------------------------------- |
| `projectId` | string | Yes      | The ID or name of the project to list work items from |
| `teamId`    | string | No       | The ID of the team to list work items for             |
| `queryId`   | string | No       | ID of a saved work item query                         |
| `wiql`      | string | No       | Work Item Query Language (WIQL) query                 |
| `top`       | number | No       | Maximum number of work items to return                |
| `skip`      | number | No       | Number of work items to skip                          |

### Response

Returns an array of work item objects:

```json
[
  {
    "id": 123,
    "fields": {
      "System.Title": "Sample Work Item",
      "System.State": "Active",
      "System.AssignedTo": "user@example.com"
    },
    "url": "https://dev.azure.com/organization/project/_apis/wit/workItems/123"
  },
  {
    "id": 124,
    "fields": {
      "System.Title": "Another Work Item",
      "System.State": "New",
      "System.AssignedTo": "user2@example.com"
    },
    "url": "https://dev.azure.com/organization/project/_apis/wit/workItems/124"
  }
]
```

### Error Handling

- Returns `AzureDevOpsResourceNotFoundError` if the project does not exist
- Returns `AzureDevOpsAuthenticationError` if authentication fails
- Returns generic error messages for other failures

### Example Usage

```javascript
const result = await callTool('list_work_items', {
  projectId: 'my-project',
  wiql: "SELECT [System.Id] FROM WorkItems WHERE [System.WorkItemType] = 'Task' ORDER BY [System.CreatedDate] DESC",
  top: 10,
});
```

## upload_work_item_attachment

Uploads a file and attaches it to a work item. Accepts either a file path (reads binary directly from disk) or base64-encoded content.

### Parameters

| Parameter     | Type   | Required | Description                                                                                   |
| ------------- | ------ | -------- | --------------------------------------------------------------------------------------------- |
| `workItemId`  | number | Yes      | The ID of the work item to attach the file to                                                 |
| `fileName`    | string | Yes      | The file name with extension (e.g., "report.pdf")                                             |
| `filePath`    | string | No       | Path to the file to upload. Reads the file as binary directly. Either filePath or fileContent must be provided. |
| `fileContent` | string | No       | Base64-encoded file content. Used when filePath is not provided.                              |
| `comment`     | string | No       | Optional comment for the attachment                                                           |
| `projectId`   | string | No       | The ID or name of the project (defaults to env)                                               |

### Response

Returns the attachment reference and updated work item:

```json
{
  "attachment": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "url": "https://dev.azure.com/org/project/_apis/wit/attachments/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "workItem": {
    "id": 123,
    "fields": { "System.Title": "Sample Work Item" }
  }
}
```

### Example Usage

```javascript
// Upload from a file path (binary — no base64 needed)
const result = await callTool('upload_work_item_attachment', {
  workItemId: 123,
  fileName: 'report.pdf',
  filePath: '/path/to/report.pdf',
  comment: 'Monthly report',
});

// Upload from base64 content
const result = await callTool('upload_work_item_attachment', {
  workItemId: 123,
  fileName: 'notes.txt',
  fileContent: 'SGVsbG8gV29ybGQ=',
});
```

## download_work_item_attachment

Downloads a work item attachment by its ID. By default, saves to a temp file and returns the file path. Set `saveToFile` to `false` to get base64 content instead.

### Parameters

| Parameter      | Type    | Required | Description                                                                                         |
| -------------- | ------- | -------- | --------------------------------------------------------------------------------------------------- |
| `attachmentId` | string  | Yes      | The GUID of the attachment to download                                                              |
| `fileName`     | string  | No       | Optional file name hint for the download                                                            |
| `projectId`    | string  | No       | The ID or name of the project (defaults to env)                                                     |
| `saveToFile`   | boolean | No       | When true (default), saves to a temp file and returns the path. When false, returns base64 content.  |

### Response

When `saveToFile` is `true` (default):

```json
{
  "attachmentId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "fileName": "report.pdf",
  "filePath": "/tmp/report.pdf",
  "sizeBytes": 10240
}
```

When `saveToFile` is `false`:

```json
{
  "attachmentId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "fileName": "report.pdf",
  "contentBase64": "JVBERi0xLjQK...",
  "sizeBytes": 10240
}
```

### Example Usage

```javascript
// Download to temp file (default)
const result = await callTool('download_work_item_attachment', {
  attachmentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  fileName: 'report.pdf',
});

// Download as base64
const result = await callTool('download_work_item_attachment', {
  attachmentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  saveToFile: false,
});
```

## list_work_item_attachments

Lists all attachments on a work item by filtering its relations for `AttachedFile` entries.

### Parameters

| Parameter    | Type   | Required | Description                                       |
| ------------ | ------ | -------- | ------------------------------------------------- |
| `workItemId` | number | Yes      | The ID of the work item                           |
| `projectId`  | string | No       | The ID or name of the project (defaults to env)   |

### Response

Returns an array of attachment metadata objects:

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "url": "https://dev.azure.com/org/project/_apis/wit/attachments/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "report.pdf",
    "resourceSize": 10240,
    "comment": "Monthly report",
    "resourceCreatedDate": "2026-01-15T10:30:00Z",
    "resourceModifiedDate": "2026-01-15T10:30:00Z",
    "authorizedDate": "2026-01-15T10:30:00Z"
  }
]
```

### Error Handling

- Returns `AzureDevOpsResourceNotFoundError` if the work item does not exist
- Returns `AzureDevOpsAuthenticationError` if authentication fails
- Returns generic error messages for other failures

### Example Usage

```javascript
const result = await callTool('list_work_item_attachments', {
  workItemId: 123,
});
```
