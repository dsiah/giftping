export type Gift = {
  author: string;
  title: string;
  recipient?: string;
  date?: string;
  relatedResource?: Filepath; // TODO
  description?: string;
};

export type GiftRequest = {
  author: string;
  title: string;
  recipient: string;
  description?: string;
  date?: string; // TODO 
  file?: string; // TODO 
};

export type Filepath = string;
