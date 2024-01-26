import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Question, QuestionDTO } from '../models/question';
import { plainToInstance } from 'class-transformer';
import { debounceTime } from 'rxjs/operators';
import { SqlDTO } from '../models/sqlDTO';
import { Answer, AnswerDTO } from '../models/answer';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getQuestionById(questionId: number) {
    return this.http.get<QuestionDTO>(`${this.baseUrl}api/question/${questionId}`).pipe(
        map(u => plainToInstance(Question, u))
    );
  }

  // getCurrentAttempt(quizId: number, studentId:number): Observable<number> {
  //   return this.http.get<number>(`${this.baseUrl}api/question/getCurrentAttempt/${quizId}/${studentId}`);
  // }

  // getAllQuestionsAsArray(quizId: number): Observable<[]> {
  //   const url = `${this.baseUrl}api/question/quiz/${quizId}`;
  //   return this.http.get<[]>(url);
  // }

  // getQuestionsForQuiz(quizId: number): Observable<Question[]> {
  //   const url = `${this.baseUrl}api/question/questions/${quizId}`;
  //   return this.http.get<Question[]>(url);
  // }

  // checkIfQuestionAnswered(questionId: number, attemptId: number): Observable<boolean> {
  //     // return true or false
  //   return this.http.get<boolean>(`${this.baseUrl}api/question/check-if-answer/${questionId}/${attemptId}`);
  // }

  // getAnswerForQuestion(questionId: number, attemptId: number): Observable<AnswerDTO> {
  //   return this.http.get<AnswerDTO>(`${this.baseUrl}api/question/get-answer/${questionId}/${attemptId}`);
  // }


  getAllQuestionIdsForQuiz(quizId: number): Observable<number[]> {
    const url = `${this.baseUrl}api/question/ids/${quizId}`;
    return this.http.get<number[]>(url);
  }

  sendSqlReponse(sqlDTO: SqlDTO): Observable<any> {
    return this.http.post<string>(`${this.baseUrl}api/question/send`, sqlDTO);
  }
  

  saveAnswer(answerData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}api/question/save-answer`, answerData);
  }

  finishAttempt(attemptId: number): Observable<any> {
    // API call to finish attempt
    return this.http.post(`${this.baseUrl}api/question/finish-attempt`, { attemptId });
  }

  getData(dbname : string){
    return this.http.get(`${this.baseUrl}api/question/getdata/${dbname}`);
  }
  
  getColumns(dbname : string){
    return this.http.get(`${this.baseUrl}api/question/GetAllColumnNames/${dbname}`);
  }
}
