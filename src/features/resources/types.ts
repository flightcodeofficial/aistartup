export interface Resource {
  id: string;
  title: string;
  description: string;
  uploadedByNickname: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  linkUrl?: string;
  downloadCount: number;
  createdAt: number;
}
