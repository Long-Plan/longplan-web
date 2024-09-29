export type Student = {
  code: number;
  major_id?: number;
  is_term_accepted: boolean;
  created_at: Date;
  updated_at: Date;
};

export type StudentUpdate = {
  is_term_accepted?: boolean;
  major_id?: number;
};
