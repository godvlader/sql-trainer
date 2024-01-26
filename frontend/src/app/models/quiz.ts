import * as _ from 'lodash-es';
import { Type } from "class-transformer";
import { Question } from './question';
import { Database } from './database';


export enum Status {
    EN_COURS = 0,
    FINI = 1,
    PAS_COMMENCE = 2,
    CLOTURE=3,
    PUBLIE = 4,
    PAS_PUBLIE = 5,
}

export class Quiz {
    id?:number;
    name?: string;
    description?: string;
    isPublished?: boolean;
    isClosed?: boolean = false;
    isTest?: boolean;
    @Type(() => Date)
    start?: Date;
    @Type(() => Date)
    finish?: Date;
    database!: Database;
    questions!: Question[];
    static database: string;
    hasAttempt: boolean = false;
    note?: number;
    status?: Status | string;
    teacherStatus?: Status;

    constructor(data?: any) {
        this.name = data?.name;
        this.description = data?.description;
        this.isPublished = data?.isPublished;
        this.isTest = data?.isTest;
        this.start = data?.start;
        this.finish = data?.finish;
        this.database = data?.database;
    }

    public get getStatut(): string {
        switch (this.status) {
            case Status.PAS_COMMENCE:
                return "PAS_COMMENCE";
            case Status.EN_COURS:
                return "EN_COURS";
            case Status.CLOTURE:
                return "CLOTURE";
            case Status.FINI:
                return "FINI";
            default:
                return "PAS_COMMENCE";
        }
    }

    public get teacherStatut(): string {
        switch (this.teacherStatus) {
            case Status.PUBLIE:
                return "PUBLIE";
            case Status.PAS_PUBLIE:
                return "PAS_PUBLIE";
            case Status.CLOTURE:
                return "CLOTURE";
            default:
                return "PAS_PUBLIE";
        }
    }

    public get getNote(): string {
        //check if quiz is closed
        if (this.status === 'CLOTURE' || this.status === 'PAS_COMMENCE' || this.status ==='EN_COURS') {
            return "N/A";
        }
    
        //check if note is available
        if (this.note !== null && this.note !== undefined) {
            return this.note + "/10";
        }
        return "N/A";
    }
        
    get display(): string {
        return `${this.name} ${this.database} ${this.status}`;
    }

}

export class NewQuizDTO
{
    Id?: number | undefined;
    Name!: string;
    Description? : string;
    IsPublished!: boolean;
    IsTest!: boolean;
    Start?: Date;
    Finish?: Date;
    DatabaseId!: number;
    TeacherId!:number;
}

export interface NewQuestion {
    order: number;
    body: string;
    solutions: NewSolution[];
}

export interface NewSolution {
    order: number;
    sql: string;
}


export { Database };