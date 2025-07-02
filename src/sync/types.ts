import {
  type BookmarkTagsAndMetadata,
  type BookmarksData,
} from '../types/bookmarks.js'
import type { MergeStrategy } from '../lib/bookmark-merge-utils.js'
import type { SyncSettings } from '../stores/sync-config-store.js' // Needs to be imported

/**
 * Configuration for a specific synchronization service instance.
 * @template C - The type of credentials for the sync service.
 * @template T - The type of target for the sync service.
 */
export type SyncServiceConfig<
  C = any, // Default to any for broader compatibility, specific adapters should narrow this
  T = any, // Default to any for broader compatibility, specific adapters should narrow this
  // credentials:
  //     | GithubCredentials
  //     | WebDAVCredentials
  //     | ApiCredentials
  //     | BrowserExtensionCredentials // Service-specific credentials
  // target: GithubTarget | WebDAVTarget | ApiTarget | BrowserExtensionTarget // Service-specific target
> = {
  id: string // Unique ID for this configuration
  type: 'github' | 'webdav' | 'customApi' | 'browserExtension' // Type of the sync service
  name: string // User-defined name for this configuration
  credentials: C // Service-specific credentials
  target: T // Service-specific target
  mergeStrategy?: MergeStrategy // Merge strategy
  autoSyncEnabled?: boolean // Whether automatic sync is enabled
  autoSyncInterval?: number // Interval in minutes for automatic sync, e.g., 15
  autoSyncOnChanges?: boolean // Whether to automatically sync when local data changes
  autoSyncDelayOnChanges?: number // Delay in minutes after data changes to trigger sync, e.g., 1. Requires autoSyncOnChanges to be true.
  scope: 'all' | string // Sync scope: 'all' or a collectionId
  lastSyncTimestamp?: number // Timestamp of the last successful remote data sync
  lastSyncLocalDataHash?: string // Hash of local data at the time of last successful sync
  lastSyncMeta?: SyncMetadata // Metadata of the last successful sync
  enabled: boolean // Whether this sync configuration is active
  // Other service-specific configurations can be added here
}

/**
 * Credentials for GitHub synchronization.
 */
export type GithubCredentials = {
  token: string // GitHub Personal Access Token
}

/**
 * Target configuration for GitHub synchronization.
 */
export type GithubTarget = {
  repo: string // Repository name in 'owner/repo' format
  path: string // Path to the bookmarks file within the repository (e.g., 'bookmarks.json')
  branch?: string // Branch to sync with, defaults to the repository's default branch
}

// Placeholder for WebDAV and Custom API credentials and targets
// eslint-disable-next-line @typescript-eslint/naming-convention
export type WebDAVCredentials = {
  username?: string
  password?: string
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export type WebDAVTarget = {
  url: string
  path: string
}
export type ApiCredentials = {
  token?: string // Optional: Bearer token for authentication
  apiKey?: string // Optional: API key for authentication
}
export type ApiTarget = {
  url: string // Base URL of the custom API
  path?: string // Optional: Path to the data file/endpoint on the API (e.g., 'bookmarks.json')
  authTestEndpoint?: string // Optional: Path to the endpoint for testing authentication status (e.g., 'auth/status')
}
/**
 * Represents the response from the custom API after a successful upload.
 */
export type CustomApiUploadResponse = {
  message: string
  lastModified: number // Timestamp
  sha: string
  size: number
  id: string // File path or identifier
}

/**
 * Credentials for Browser Extension synchronization.
 */
export type BrowserExtensionCredentials = {
  // Currently no specific credentials properties, can be extended later
}

/**
 * Target configuration for Browser Extension synchronization.
 */
export type BrowserExtensionTarget = {
  // Currently no specific target properties, can be extended later
  // For example, could specify a named data store within the target extension
  extensionId: string // ID of the target browser extension
  extensionName?: string // Optional: User-friendly name of the target extension
}

/**
 * Metadata associated with synchronized data.
 */
export type SyncMetadata = {
  /**
   * Last modification timestamp (e.g., from file mtime or commit date).
   * This field might be removed in the future. Avoid relying on it unless absolutely necessary.
   */
  timestamp?: number
  version?: string // Version identifier (e.g., commit SHA, ETag)
  sha?: string // GitHub specific: blob SHA or commit SHA of the file
}

/**
 * Alias for SyncMetadata
 */
export type RemoteSyncMetadata = SyncMetadata

/**
 * Represents the authentication status of the sync service.
 */
export type AuthStatus =
  | 'authenticated' // User is authenticated
  | 'unauthenticated' // User is not authenticated
  | 'error' // An error occurred during authentication
  | 'requires_config' // Authentication requires configuration
  | 'unknown' // Adapter is unknown or not initialized

/**
 * Defines the possible types for messages exchanged with the browser extension.
 */
export type MessageType =
  | 'PING'
  | 'PONG'
  | 'DISCOVER_UTAGS_TARGETS'
  | 'DISCOVERY_RESPONSE'
  | 'GET_AUTH_STATUS'
  | 'GET_REMOTE_METADATA'
  | 'DOWNLOAD_DATA'
  | 'UPLOAD_DATA'

/**
 * Generic message structure for communication with the browser extension.
 */
export type Message<T = any> = {
  type: MessageType
  source?: 'utags-webapp' | 'utags-extension' // Identifies the message origin
  id: string // Unique message identifier for tracking requests and responses
  payload?: T
  error?: string
}

/**
 * Specific message types for browser extension communication.
 */
export type AuthStatusRequestMessage = Message<void>
export type AuthStatusResponseMessage = Message<{ status: AuthStatus }>
// eslint-disable-next-line @typescript-eslint/naming-convention
export type DiscoverUTagsTargetsMessage = Message<void>
export type DiscoveryResponseMessage = Message<{
  target: BrowserExtensionTarget
  credentials: BrowserExtensionCredentials
}>
export type DataUploadRequestMessage = Message<{
  data: string
  remoteMeta?: SyncMetadata
}>
export type DataUploadResponseMessage = Message<SyncMetadata>
export type DataDownloadRequestMessage = Message<void>
export type DataDownloadResponseMessage = Message<{
  data: string | undefined
  remoteMeta: SyncMetadata | undefined
}>
export type MetadataRequestMessage = Message<void>
export type MetadataResponseMessage = Message<SyncMetadata | undefined>

/**
 * Interface for a synchronization adapter.
 * Each adapter handles communication with a specific type of remote service.
 * @template C - The type of credentials the adapter handles.
 * @template T - The type of target the adapter handles.
 */
export type SyncAdapter<C = any, T = any> = {
  /**
   * Initializes the adapter with a specific configuration.
   * Should be called before any other methods.
   * @param config - The configuration for this sync service instance.
   * @returns A promise that resolves when initialization is complete.
   * @throws {Error} If initialization fails due to invalid configuration, network issues, or other critical errors.
   */
  init(config: SyncServiceConfig<C, T>): Promise<void>

  /**
   * Gets the current configuration of the adapter.
   * @returns The current configuration of the adapter.
   * @throws {Error} If the adapter has not been initialized by calling `init()` first.
   */
  getConfig(): SyncServiceConfig<C, T>

  /**
   * Uploads data to the remote service.
   * The specific collection to sync is determined by the `scope` in the `SyncServiceConfig` passed to `init`.
   * @param data - The stringified data to upload.
   * @param expectedRemoteMeta - Optional metadata of the remote file, used for optimistic locking (e.g., ETag/version).
   *                           If provided and the remote state does not match, the upload might be rejected.
   * @returns A promise that resolves with the metadata of the uploaded/updated remote file.
   * @throws {Error} If the upload fails due to network issues, authentication problems, server errors, or unrecoverable conflicts (e.g., `If-Match` header mismatch if not handled by returning a specific error object/status).
   *                 Consider defining custom error types (e.g., `SyncConflictError`) for specific failure modes like optimistic locking failures if granular error handling is required by the caller.
   */
  upload(data: string, expectedRemoteMeta?: SyncMetadata): Promise<SyncMetadata>

  /**
   * Downloads data from the remote service.
   * The specific collection to sync is determined by the `scope` in the `SyncServiceConfig` passed to `init`.
   * @returns A promise that resolves with an object containing:
   *          - `data`: The downloaded data as a string, or `undefined` if the remote resource does not exist (e.g., 404 Not Found).
   *          - `remoteMeta`: The metadata of the remote file, or `undefined` if the remote resource does not exist or metadata is unavailable.
   * @throws {Error} If the download fails due to network issues, authentication problems, or server errors (other than a 'Not Found' scenario which should return `undefined` data).
   */
  download(): Promise<{
    data: string | undefined
    remoteMeta: SyncMetadata | undefined
  }>

  /**
   * Retrieves metadata of the remote file/data.
   * The specific collection to sync is determined by the `scope` in the `SyncServiceConfig` passed to `init`.
   * @returns A promise that resolves with the remote metadata, or `undefined` if the remote resource does not exist (e.g., 404 Not Found) or metadata is not available.
   * @throws {Error} If fetching metadata fails due to network issues, authentication problems, or server errors (other than a 'Not Found' scenario).
   */
  getRemoteMetadata(): Promise<SyncMetadata | undefined>

  /**
   * (Optional) Attempts to acquire a lock for synchronization.
   * This is used to prevent concurrent sync operations on the same resource if the backend supports it.
   * The specific collection for which to acquire the lock is determined by the `scope` in the `SyncServiceConfig` passed to `init`.
   * @returns A promise that resolves to `true` if the lock was acquired successfully, `false` if the lock could not be acquired (e.g., already held by another client).
   * @throws {Error} If the attempt to acquire the lock fails due to network issues, authentication problems, or server errors.
   */
  acquireLock?(): Promise<boolean>

  /**
   * (Optional) Releases a previously acquired lock.
   * The specific collection for which to release the lock is determined by the `scope` in the `SyncServiceConfig` passed to `init`.
   * @returns A promise that resolves when the lock is released successfully.
   * @throws {Error} If the attempt to release the lock fails due to network issues, authentication problems, server errors, or if the lock was not held by this instance (if detectable and considered an error).
   */
  releaseLock?(): Promise<void>

  /**
   * (Optional) Checks the authentication status with the remote service.
   * @returns A promise that resolves with the `AuthStatus`.
   *          Should return `'error'` or `'unknown'` if the status check itself fails due to network issues or unexpected responses, rather than throwing an exception directly, to allow the caller to manage UI based on these states.
   */
  getAuthStatus?(): Promise<AuthStatus>

  /**
   * (Optional) Cleans up resources used by the adapter, such as event listeners or open connections.
   * This method should not throw errors and should try to complete its cleanup tasks even if some steps fail.
   */
  destroy?(): void
}

/**
 * Represents the various states of the synchronization process.
 */
export type SyncStatus =
  | { type: 'idle'; lastSyncTime?: number }
  | { type: 'initializing' }
  | { type: 'checking' }
  | { type: 'downloading'; progress?: number } // Optional progress
  | { type: 'uploading'; progress?: number } // Optional progress
  | { type: 'merging'; progress?: number }
  | { type: 'success'; lastSyncTime: number }
  | { type: 'error'; error: string; lastAttemptTime?: number; details?: any }
  | { type: 'conflict'; details: any; lastAttemptTime?: number }
  | { type: 'disabled' }

export type SyncEvents = {
  statusChange: SyncStatus
  syncStart: { serviceId: string }
  syncSuccess: {
    serviceId: string
    data?: BookmarksData
    noUploadNeeded?: boolean
  }
  syncEnd: {
    serviceId: string
    status: 'success' | 'error' | 'conflict'
    error?: Error
  }
  error: string | { message: string; serviceId?: string; error?: Error }
  info: string | { message: string; serviceId?: string }
  adapterChanged: SyncAdapter | undefined
  settingsChanged: SyncSettings
  bookmarksRemoved: { serviceId: string; urls: string[] }
  // Potentially other events like 'conflictDetected', 'mergeNeeded'
  syncConflict: {
    serviceId: string
    details: any
    error?: Error
  }
  destroyed: string
}
