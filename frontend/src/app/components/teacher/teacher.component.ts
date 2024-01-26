import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import * as _ from 'lodash-es';
import { User } from '../../models/user';
import { StateService } from 'src/app/services/state.service';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { QuizService } from 'src/app/services/quiz.service';
import { Quiz } from 'src/app/models/quiz';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ReadOnlyService } from 'src/app/services/readOnly.service';

@Component({
    selector: 'app-teacherlistquiz',
    templateUrl: './teacher.component.html',
    styleUrls: ['./teacher.component.css']
})
export class TeacherComponent implements AfterViewInit, OnDestroy {
    displayedColumns: string[] = ['name', 'database', 'type', 'status','start','finish', 'actions'];
    dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();
    filter: string = '';
    state: MatTableState;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private quizService: QuizService,
        private stateService: StateService,
        private authService: AuthenticationService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private router: Router,
        private readOnlyService: ReadOnlyService
    ) {
        this.state = this.stateService.quizListState;
    }

    ngAfterViewInit(): void {
        // lie le datasource au sorter et au paginator
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // définit le predicat qui doit être utilisé pour filtrer les users
        this.dataSource.filterPredicate = (data: Quiz, filter: string) => {
            const dataStr = [
                data.name,
                data.database!.name, //'database' is an object with a 'name' property
                data.teacherStatus,
                data.isTest ? 'Test' : 'Training' //'type' corresponds to 'isTest'
            ].filter(Boolean).join(' ').toLowerCase(); // Filter out any null/undefined values and join to a single string
            return dataStr.includes(filter.toLowerCase());
        };
        
        // établit les liens entre le data source et l'état de telle sorte que chaque fois que 
        // le tri ou la pagination est modifié l'état soit automatiquement mis à jour
        this.state.bind(this.dataSource);
        // récupère les données 
        this.refresh();
    }

    refresh() {
        this.quizService.getAllQuizzes().subscribe(quizzes => {
            const attemptChecks = quizzes.map(quiz => 
                this.quizService.checkIfAttempt(quiz.id!)
            );
    
            forkJoin(attemptChecks).subscribe(attemptResults => {
                quizzes.forEach((quiz, index) => {
                    //directly assign the boolean value
                    quiz.hasAttempt = attemptResults[index] as unknown as boolean; // Type assertion to boolean
                });
    
                this.dataSource.data = quizzes;
                this.state.restoreState(this.dataSource);
                this.filter = this.state.filter;
            });
        });
    }
    

    // appelée chaque fois que le filtre est modifié par l'utilisateur
    filterChanged(e: KeyboardEvent) {
        const filterValue = (e.target as HTMLInputElement).value;
        // applique le filtre au datasource (et provoque l'utilisation du filterPredicate)
        this.dataSource.filter = filterValue.trim().toLowerCase();
        // sauve le nouveau filtre dans le state
        this.state.filter = this.dataSource.filter;
        // comme le filtre est modifié, les données aussi et on réinitialise la pagination
        // en se mettant sur la première page
        if (this.dataSource.paginator)
            this.dataSource.paginator.firstPage();
    }

    edit(quiz: Quiz) {
        this.quizService.checkIfAttempt(quiz.id!)
            .subscribe(anyAttemptExists => {
                if (anyAttemptExists && quiz.isTest) {
                    // If there are attempts and it's a test, navigate in read-only mode
                    this.readOnlyService.setReadOnly(true);
                    this.router.navigate([`/quizedition/${quiz.id}`]);
                } else {
                    // If there are no attempts or it's not a test, allow editing
                    this.readOnlyService.setReadOnly(false);
                    this.router.navigate([`/quizedition/${quiz.id}`]);
                }
            }, error => {
                console.error('Error checking if any attempt exists:', error);
            });
    }
    
    isLoggedUser(user: User): boolean {
        return this.authService.currentUser?.pseudo == user.pseudo;
    }

    create() {
        const url = `/quizedition/0`;
        this.router.navigate([url]);
    }

    ngOnDestroy(): void {
        this.snackBar.dismiss();
    }
}
