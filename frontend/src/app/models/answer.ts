import * as _ from 'lodash-es';

export class Answer {
  id!: number;
  sql!: string;
  timestamp?: Date;
  isCorrect?: boolean;
  questionId?: number;
  attemptId?: number;

}

export interface AnswerDTO {
  id: number;
  sql: string;
  isCorrect: boolean;
  questionId: number;
}

  