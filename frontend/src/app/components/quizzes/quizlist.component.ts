import { Quiz } from 'src/app/models/quiz';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy, Input, SimpleChanges } from '@angular/core';
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
import { Router } from '@angular/router';
import { Attempt, AttemptDTO } from 'src/app/models/attempt';
import { QuestionGuard } from 'src/app/services/questionGuard.service';


@Component({
    selector: 'app-quizlist',
    templateUrl: './quizlist.component.html',
    styleUrls: ['./quizlist.component.css']
})
export class QuizListComponent implements AfterViewInit, OnDestroy {
    @Input() isTest: boolean = false;
    @Input() filter: string = '';
    displayedColumns = this.isTest 
            ? ['name', 'database','start','finish', 'status','note','actions']
            : ['name', 'database', 'status', 'actions'];
    dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();
    state: MatTableState;
    //tpStatus: string ='';
    //currentAttemptId?: number | null;
    hasAttempt: boolean = false;
    currentDate: Date = new Date();
    
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private quizService: QuizService,
        private stateService: StateService,
        private authService: AuthenticationService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private router: Router,
        private questionGuard: QuestionGuard,
        
    ) {
        this.state = this.stateService.quizListState;
    }

    /*ngOnInit() {
        this.load('ngOnInit');
    }

    load(from: string): void {
        console.log(from, 'do something with the FILTER IN THE CHILD', this.filter?.valueOf);
    }*/
    
    ngAfterViewInit(): void {
        
        this.displayedColumns = this.isTest ? ['name', 'database','start','finish', 'status','note','actions'] : ['name', 'database', 'status', 'actions'];
        // lie le datasource au sorter et au paginator
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // définit le predicat qui doit être utilisé pour filtrer les users
        this.dataSource.filterPredicate = (data: Quiz, filter: string) => {
            const dataStr = [
                data.name,
                data.database!.name, // 'database' is an object with a 'name' property
                data.status
            ].filter(Boolean).join(' ').toLowerCase(); //out any null/undefined values and join to a single string
            return dataStr.includes(filter);
        };
        
        // établit les liens entre le data source et l'état de telle sorte que chaque fois que 
        // le tri ou la pagination est modifié l'état soit automatiquement mis à jour
        this.state.bind(this.dataSource);
        // récupère les données 
        this.refresh();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['filter'] && !changes['filter'].isFirstChange()) {
            this.applyFilter();
        }
        if (changes['isTest']) {
            this.setDisplayedColumns();
        }
    }

    public applyFilter() {
        this.dataSource.filter = this.filter;
    }

    private setDisplayedColumns() {
        this.displayedColumns = this.isTest 
            ? ['name', 'database', 'start', 'finish', 'status', 'note', 'actions']
            : ['name', 'database', 'status', 'actions'];
    }
    

    refresh() {
        const userId = this.authService.currentUser!.id!;
    
        const handleQuizzes = (quizzes: Quiz[]) => {
            //check ongoing attempts for each quiz.
            const attemptChecks = quizzes.map(quiz => 
                this.checkForAttempt(quiz.id!, userId).then(hasAttempt => {
                    quiz.hasAttempt = hasAttempt;
                    return quiz;
                })
            );
    
            Promise.all(attemptChecks).then(updatedQuizzes => {
                //update data source with quizzes that now have the hasAttempt property
                this.dataSource.data = updatedQuizzes;
                this.state.restoreState(this.dataSource);
                this.filter = this.state.filter;
            });
        };
    
        if(this.isTest) {
            this.quizService.getTestQuizzes(userId).subscribe(handleQuizzes);
        } else {
            this.quizService.getTPQuizzes(userId).subscribe(handleQuizzes);
        }
    }
    
    async checkForAttempt(quizId: number, userId: number): Promise<boolean> {
        return new Promise(resolve => {
            this.quizService.checkForExistingAttempt(quizId, userId).subscribe(
                attempt => resolve(!!attempt),
                error => {
                    console.error('Error checking for existing attempt:', error);
                    resolve(false);
                }
            );
        });
    }
    

    logId(id: number) {
        console.log('Quiz ID:', id);
    }
    

    attempt(quizId: number) {
        console.log('Attempting quiz with ID:', quizId);
        const userId = this.authService.currentUser!.id!;
      
        this.quizService.getQuizInfoById(quizId).subscribe(
          quiz => {
            if (!quiz.questions || quiz.questions.length === 0) {
              console.error('No questions available for this quiz.');
              return;
            }
            //store quiz data in guard service
            this.questionGuard.setCurrentQuiz(quizId, quiz.questions.map(q => q.id!));
      
            //handle attempt and navigate to first question
            this.quizService.handleAttempt(quizId, userId).subscribe(
              (attempt: AttemptDTO) => {
                console.log('Attempt ID:', attempt.id);
                const firstQuestionId = quiz.questions[0].id!;
                this.router.navigate([`/question/${firstQuestionId}`]);
              },
              error => console.error('Error handling attempt:', error)
            );
          },
          error => {
            console.error('Error fetching quiz:', error);
          }
        );
      }
      

    isStartDateInFuture(startDate: Date): boolean {
        let currentDate = new Date();
        return currentDate < new Date(startDate);
    }    

    // appelée quand on clique sur le bouton view
    viewLastAttempt(quizId: number) {
        this.quizService.getViewAttempt(quizId).subscribe(
            res => {
                this.questionGuard.setState({ readOnly: true });
                this.router.navigate([`/question/${res.id}`]);
            }
        );
    }    

    isLoggedUser(user: User): boolean {
        return this.authService.currentUser?.pseudo == user.pseudo;
    }

    ngOnDestroy(): void {
        this.snackBar.dismiss();
    }
}
