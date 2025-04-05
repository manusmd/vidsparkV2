export interface Template {
  id: string;
  name: string;
  description?: string;
  contentTypeId: string;
  imageStyleId: string;
  userId: string;
  voiceId: string;
  textPosition: string;
  createdAt: string;
  updatedAt: string;
  textDesign?: {
    color: string;
    font: string;
    style: string;
  };
  music?: {
    id: string;
    name: string;
  };
} 