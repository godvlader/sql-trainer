import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { plainToClass } from 'class-transformer';

@Injectable({ providedIn: 'root' })
export class SignupService {

    public currentUser?: User;

    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

    signup(dto: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}api/users/signup`, dto);
    }

    isPseudoAvailable(pseudo: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}api/users/pseudo-available/${pseudo}`);
    }

    isEmailAvailable(email: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}api/users/email-available/${email}`);
    }
}
