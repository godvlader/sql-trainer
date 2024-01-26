import * as _ from 'lodash-es';
import { Type } from "class-transformer";
import { Database, Quiz } from './quiz';

export class Question {
    id?: number;
    order?: number;
    body?: string;
    quizId?: number;
    answers?: Answers[];
    solutions!: Solutions[];
    quiz!: Quiz;
    quizName?: string;
    quizDbName?: string;
    database! : Database;
    isTest: boolean = false;

    get display(): string {
        return `${this.quiz.name} - Exercice ${this.order}`;
    }

    get displayQuestion() : string {
        return `${this.body}`;
    }
}

export interface QuestionDTO{
    id?: number;
    order?: number;
    body?: string;
    quizId?: number;
    solutions: Solutions[];
}

export interface Answers {
    id: number;
    sql?: string;
    Timestamp?: Date;
    IsCorrect?: boolean;
    
}

export interface Solutions {
    id?: number;
    order?: number;
    sql?: string;

}

export interface SolutionDTO {
    id?: number;
    order?: number;
    sql?: string;

}