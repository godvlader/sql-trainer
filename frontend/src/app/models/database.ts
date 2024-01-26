import * as _ from 'lodash-es';
import { Type } from "class-transformer";
import { Quiz } from './quiz';

export class Database {
    id!: number;
    name!: string;
    description? : string;
}