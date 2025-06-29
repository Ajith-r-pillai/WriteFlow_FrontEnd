export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  owner: User;
  collaborators: User[];
}
