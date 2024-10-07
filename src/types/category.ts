export type Relationship = {
  id: number;
  child_category_id: number;
  require_all: boolean;
  position: number;
  question_id: number | null;
  choice_id: number | null;
  cross_category_id: number | null;
};

export type Requirement = {
  id: number;
  regex: string;
  credit: number;
};

export type ChildCategory = {
  id: number;
  name_th: string;
  name_en: string;
  at_least: boolean;
  credit: number;
  type_id: number;
  note: string;
  created_at: string;
  updated_at: string;
  requirements: Requirement[] | null;
  relationships: Relationship[] | null;
  child_categories: ChildCategory[] | null;
  courses: string[] | null;
};

export type Category = {
  id: number;
  name_th: string;
  name_en: string;
  at_least: boolean;
  credit: number;
  type_id: number;
  note: string;
  created_at: string;
  updated_at: string;
  requirements: Requirement[] | null;
  relationships: Relationship[] | null;
  child_categories: ChildCategory[] | null;
  courses: string[] | null;
};

export type CategoryType = {
  id: number;
  name_th: string;
  name_en: string;
  created_at: string;
  updated_at: string;
};
