import * as _ from 'lodash-es';
import { Answer } from './answer';

export interface Attempt {
    id: number;
    start: Date;
    finish?: Date; //can be null
    quizId: number;
    studentId: number;
    questionId: number;
    answerId: number;
    answers: Answer[];
    isFinished: boolean;
}

export interface AttemptDTO {
    id: number;
    start: Date;
    finish?: Date; //can be null
    quizId: number;
    studentId: number;
    questionId: number;
    answerId: number;
    isFinished: boolean;
}
