export type Curriculum = {
  id: number;
  major_id: number;
  code: string;
  name_th: string;
  name_en: string;
  short_name: string;
  created_at: Date | string;
  updated_at: Date | string;
  curriculum_questions: CurriculumQuestion[];
};

export type CurriculumQuestion = {
  id: number;
  name_th: string;
  name_en: string;
  choices: CurriculumQuestionChoice[];
};

export type CurriculumQuestionChoice = {
  id: number;
  position: number;
  name_th: string;
  name_en: string;
};
