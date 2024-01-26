import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Database, NewQuizDTO, Quiz } from '../models/quiz';
import { Attempt, AttemptDTO } from '../models/attempt';
import { plainToInstance } from 'class-transformer';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { Question } from '../models/question';

@Injectable({ providedIn: 'root' })

export class QuizService {
     
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

    isQuizNameAvailable(quizName: string, quizId?: number): Observable<boolean> {
        let url = `${this.baseUrl}api/quiz/quizname-available/${quizName}`;
        if (quizId !== undefined) {
            url += `/${quizId}`;
        }
        return this.http.get<boolean>(url);
    }
    

    getAllQuizzes(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(`${this.baseUrl}api/quiz/all`);
    }

    getAttemptByUser(userId: number, quizId:number, questionId:number): Observable<Attempt> {
        // return true or false
      return this.http.get<Attempt>(`${this.baseUrl}api/quiz/getAttemptByUser/${userId}/${quizId}/${questionId}`);
    }

    handleAttempt(quizId: number, userId:number): Observable<AttemptDTO> {
        return this.http.post<AttemptDTO>(`${this.baseUrl}api/quiz/attempt`, { quizId, userId });
    }

    checkForExistingAttempt(quizId: number, userId: number): Observable<Attempt | null> {
        // Implementation to check if an existing attempt exists for the given quiz and user
        return this.http.get<Attempt | null>(`/api/quiz/checkAttempt?quizId=${quizId}&userId=${userId}`).pipe(
            catchError(error => {
                // Check if the error is a 404 (Not Found) and return null in that case
                if (error.status === 404) {
                    return of(null);
                }
                // If it's not a 404 error, rethrow the error
                return throwError(error);
            })
        );
    }
  
    getQuizzesByProf(profId: number): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(`${this.baseUrl}api/quiz/prof/${profId}`).pipe(
            map(res => plainToInstance(Quiz, res))
        );
    }

    getQuizInfoById(quizId:number){
        return this.http.get<Quiz>(`${this.baseUrl}api/quiz/quizinfo/${quizId}`).pipe(
            map(u => plainToInstance(Quiz, u))
        );
    }


    getTPQuizzes(userId : number): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(`${this.baseUrl}api/quiz/tp/${userId}`).pipe(
            map(res => plainToInstance(Quiz, res))
        );
    }

    getTestQuizzes(userId : number): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(`${this.baseUrl}api/quiz/tests/${userId}`).pipe(
            map(res => plainToInstance(Quiz, res))
        );
    }

    getViewAttempt(quizId:number): Observable<Question>{
        return this.http.get<Question>(`${this.baseUrl}api/question/GetReadOnly/${quizId}`);
    }

    //FOR TEACHER

    saveQuiz(dto: NewQuizDTO): Observable<NewQuizDTO> {
        return this.http.post<NewQuizDTO>(`${this.baseUrl}api/quiz/postquiz`, dto);
    }

    updateQuiz(quizId: number, dto: NewQuizDTO): Observable<Quiz> {
        return this.http.put<Quiz>(`${this.baseUrl}api/quiz/updatequiz/${quizId}`, dto);
    }

    deleteQuiz(quizId: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}api/quiz/${quizId}`);
    }

    checkIfAttempt(quizId: number): Observable<{ hasAttempt: boolean }> {
        return this.http.get<{ hasAttempt: boolean }>(`/api/quiz/checkIfAttempt?quizId=${quizId}`);
    }
    
    
    getDatabases(): Observable<Database[]>{
        return this.http.get<Database[]>(`${this.baseUrl}api/quiz/getDatabases`).pipe(
            map(res => plainToInstance(Database, res))
        );
    }

}
