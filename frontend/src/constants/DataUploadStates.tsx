export const AWAITING_UPLOAD = 'awaiting_upload';
export const UPLOAD_PENDING = 'upload_pending';
export const UPLOAD_SUCCESSFUL = 'upload_successful';
export const UPLOAD_FAILED = 'upload_failed';

export type DataUploadState =
  | typeof AWAITING_UPLOAD
  | typeof UPLOAD_PENDING
  | typeof UPLOAD_SUCCESSFUL
  | typeof UPLOAD_FAILED;
