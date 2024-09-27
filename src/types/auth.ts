export type Account = {
  userData: User;
  studentData?: Student;
};

export type User = {
  cmuitaccount: string;
  prename?: string;
  firstname: string;
  lastname: string;
  account_typ: string;
  organization: string;
  created_at: Date;
  updated_at: Date;
};

export type Student = {
  code: number;
  major_id?: number;
  is_term_accepted: boolean;
  created_at: Date;
  updated_at: Date;
};
