import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../models/user';
import { plainToInstance } from 'class-transformer';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

    getAll(): Observable<User[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/users`).pipe(
            map(res => plainToInstance(User, res))
        );
    }

    getById(pseudo: string) {
        return this.http.get<User>(`${this.baseUrl}api/users/${pseudo}`).pipe(
            map(u => plainToInstance(User, u)),
            catchError(err => of(null))
        );
    }

    update(user: User): Observable<boolean> {
        const updatedUser = {
          Id: user.id,
          PseudoUpdate: user.pseudo,
          EmailUpdate: user.email,
          PasswordUpdate: user.password,
          FullNameUpdate: user.fullName,
          BirthDateUpdate: user.birthDate,
          RoleUpdate: user.role
        };
    
        //remove password if empty
        if (!updatedUser.PasswordUpdate) {
          delete updatedUser.PasswordUpdate;
        }
    
        return this.http.put<User>(`${this.baseUrl}api/users`, updatedUser).pipe(
          map(res => true),
          catchError(err => {
            console.error(err);
            return of(false);
          })
        );
      }
      

    public delete(u: User): Observable<boolean> {
        return this.http.delete<boolean>(`${this.baseUrl}api/users/delete/${u.pseudo}`).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    public add(u: User): Observable<boolean> {
        return this.http.post<User>(`${this.baseUrl}api/users/postuser`, u).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

}
