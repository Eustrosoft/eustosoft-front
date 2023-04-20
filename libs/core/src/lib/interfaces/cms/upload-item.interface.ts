export interface UploadItem {
  file: File;
  progress: number;
  state: string;
  cancelled: boolean;
}
