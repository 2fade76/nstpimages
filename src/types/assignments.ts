
import { Assignment, Photographer } from "./database";

export type SortField = 'date' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface AssignmentWithPhotographer extends Assignment {
  photographers: Pick<Photographer, 'id' | 'name'>;
}

export interface AssignmentEditForm {
  title: string;
  location: string;
  date: string;
  time: string;
  photographer_id: string;
  status: Assignment['status'];
}

