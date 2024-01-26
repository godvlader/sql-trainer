import { Component, NgModule, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import * as _ from 'lodash-es';
import {QuestionDTO } from 'src/app/models/question';
import { QuizService } from 'src/app/services/quiz.service';
import { NewSolution, NewQuestion, Quiz } from 'src/app/models/quiz';
import { Router } from '@angular/router';
import { Database} from 'src/app/models/quiz';
import { ActivatedRoute } from '@angular/router';
import { sub } from 'date-fns';
import { MatRadioChange } from '@angular/material/radio';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SolutionDTO } from 'src/app/models/question';
import { ConfirmationDialogComponent } from '../confirmationDialog/ConfirmationDialogComponent';
import { MatDialog } from '@angular/material/dialog';
import { Observable, catchError, debounceTime, map, of } from 'rxjs';
import { ReadOnlyService } from 'src/app/services/readOnly.service';


@Component({
    selector: 'app-edit-quiz',
    templateUrl: './edit-quiz.component.html',
    styleUrls: ['./edit-quiz.component.css'],
})

export class EditQuizComponent {

    public quizForm!: FormGroup;
    public Name!: FormControl;
    public Description!: FormControl;
    public IsPublished!: FormControl;
    public IsClosed!: FormControl;
    public ctlIsTest!: FormControl;
    public Start!:FormControl;
    public Finish! : FormControl;
    public DatabaseId!: FormControl;
    public Questions: QuestionDTO[] = [];
    public quizId!:number;
    public isNew!: boolean;
    public databases: any[] = [];
    public database!: Database;
    public isDateVisible: boolean = false;
    public isTest: boolean = false;
    public TeacherId!: number;
    panelOpenState: boolean[] = [];
    solutions: SolutionDTO[] = [];    
    isReadOnly: boolean = false;
    finishDate: Date = new Date();
    currentDate: Date = new Date();
    

    constructor(
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private router: Router,
        private dialog: MatDialog,
        private authService: AuthenticationService,
        private quizService: QuizService,
        private readOnlyService: ReadOnlyService
      ) {
        this.Name = this.fb.control('', 
            [Validators.required, Validators.minLength(3)], //sync
            [this.validateNameAvailability.bind(this)] //async
            );
        this.Start = this.fb.control('');
        this.Finish = this.fb.control('');
        this.Description = this.fb.control('');
        this.IsPublished = this.fb.control(false);
        this.IsClosed = this.fb.control(false);
        this.ctlIsTest = this.fb.control(false);
        this.DatabaseId = this.fb.control(null, [Validators.required]);

        this.quizForm = this.fb.group({
            Name: this.Name,
            Description: this.Description,
            IsPublished: this.IsPublished,
            IsClosed: this.IsClosed,
            IsTest: this.ctlIsTest,
            Start: this.Start,
            Finish: this.Finish,
            Database: this.DatabaseId,
        }, { });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
          const quizIdParam = params['quizId'];
          this.isReadOnly = this.readOnlyService.isReadOnly();
            console.log("READONLY?????");
          console.log(this.isReadOnly);
            if (this.isReadOnly && this.quizForm) {
                this.quizForm.disable();
            }
         
            if (quizIdParam === '0') {
                this.quizId = 0;
                this.isNew = true;
                this.ctlIsTest.setValue("Training");
                this.fetchDatabases();
            } else if (quizIdParam) {
                this.isNew = false;
                const quizId = parseInt(quizIdParam, 10); //convert to int
                this.quizId = quizId;
                this.fetchQuizDetails(quizIdParam);
            } else {
                console.error('Invalid or missing quizId parameter');
            }
        });

        this.DatabaseId.valueChanges.subscribe(selectedDatabaseId => {
            //selected database object based on the ID
            this.database = this.databases.find(db => db.id === selectedDatabaseId) || new Database();
        });

        this.quizForm.markAllAsTouched();

        this.ctlIsTest.valueChanges.subscribe(value => {
            this.updateDateValidators(value, this.Start.value, this.Finish.value);
            this.quizForm.markAllAsTouched();
        });
    }

    ngOnDestroy() {
        // Clear the readOnly flag when you leave the readonly quiz page
        this.readOnlyService.clearReadOnly();
      }

    saveQuiz() {
        if (this.quizForm.invalid) {
            return;
        }
    
        //preparing data structure quiz, questions, and solutions
        const start = this.quizForm.value.Start;
        const finish = this.quizForm.value.Finish;
        
        const quizData = {
            Name: this.quizForm.value.Name,
            Description: this.quizForm.value.Description,
            IsPublished: this.quizForm.value.IsPublished,
            IsTest: this.isTest,
            Start: start ? new Date(start + 'Z') : undefined, // Append 'Z' to indicate UTC
            Finish: finish ? new Date(finish + 'Z') : undefined, // Append 'Z' to indicate UTC
            DatabaseId: this.quizForm.value.Database,
            TeacherId: this.authService.currentUser!.id!,
            Questions: this.Questions.map(q => ({
                Order: q.order,
                Body: q.body,
                Solutions: q.solutions.map(s => ({
                    Order: s.order,
                    Sql: s.sql,
                }))
            }))
        };
        

    
        console.log("Quiz data being sent:", JSON.stringify(quizData));
    
        //single call to save the entire quiz
        if (this.isNew) {
            console.log("SAVE");
            this.quizService.saveQuiz(quizData).subscribe({
                next: (response: any) => {
                    console.log('Full response:', response);
                    console.log('New Quiz added with ID:', response.id);
                    this.router.navigate(['/teacher']);
                },
                error: (err) => {
                    console.error('Error occurred while adding new quiz:', err);
                }
            });  
        } else {
            console.log("UPDATE");
            const quizId = parseInt(this.route.snapshot.params['quizId'], 10);
            this.quizService.updateQuiz(quizId, quizData).subscribe({
                next: () => {
                    console.log('Quiz updated, ID:', quizId);
                    this.router.navigate(['/teacher']);
                },
                error: (err: any) => {
                    console.error('Error occurred while updating quiz:', err);
                }
            });
        }
    }
    
    updateIsTest(event: MatRadioChange) {
        if(event.value === 'Test') {
            this.ctlIsTest.setValue(event.value === 'Test');
            this.isTest = true;
            this.isDateVisible = true;
            this.Start.setValidators([Validators.required, this.inPastValidator(), this.afterEndValidator(this.Finish)]);
            this.Finish.setValidators([this.beforeTodayValidator(), this.beforeStartValidator(this.Start)]);
        } else {
            this.ctlIsTest.setValue(event.value === 'Training');
            this.isTest = false;
            this.isDateVisible = false;
            //clear validators and errors for Training
            this.Start.clearValidators();
            this.Finish.clearValidators();
            this.Start.reset(); //reset the values
            this.Finish.reset(); //reset the values
            this.Start.updateValueAndValidity();
            this.Finish.updateValueAndValidity();
        }
    }
    
    fetchQuizDetails(quizId: number) {
        console.log('entered fetchquizdetails');
        console.log(quizId, '  <<<<<=====QuizId');
        if (quizId !== 0) {
            this.quizService.getQuizInfoById(quizId).subscribe(
                (quiz: Quiz) => {
                        this.ctlIsTest.setValue(quiz.isTest);  
                        this.ctlIsTest.setValue(quiz.isTest ? "Test" : "Training");                  
                    this.quizForm.patchValue({
                        Name: quiz.name,
                        Description: quiz.description,
                        IsPublished: quiz.isPublished,
                        ctlIsTest: quiz.isTest,
                        Start: quiz.start,
                        Finish: quiz.finish,
                        DatabaseId: quiz.database ? quiz.database.id : null,
                        database: quiz.database
                    });
                    if(this.isReadOnly){
                        this.Start = this.fb.control({ value: quiz.start, disabled: this.isReadOnly });
                        this.Finish = this.fb.control({ value: quiz.finish, disabled: this.isReadOnly });

                    }
                    this.finishDate = new Date(this.Finish.value);
                    console.log(this.finishDate);
                    console.log(this.currentDate);
                    console.log("quiz", quiz);
                    if (quiz.questions) {
                        this.Questions = quiz.questions;
                    }
                    this.isDateVisible = quiz.isTest!;
                    console.log(this.Questions + " <===Questions");
                    console.log('ctlIsTest value:', quiz.isTest);
    
                    // Fetch databases if necessary
                    this.fetchDatabases();
                    if(quiz.database){
                        this.DatabaseId.setValue(quiz.database.id);
                        this.database = quiz.database;
                    }
                },
                error => {
                    if (error.status === 404) {
                        console.error(`Quiz with ID ${quizId} not found.`);
                        this.router.navigate(['/restricted']); 
                    } else {
                        console.error('Failed to fetch quiz details:', error);
                    }
                }
            );
        }
    }    

    deleteQuiz() {
        let dialogData;
      
        if (this.quizId === 0) {
          dialogData = {
            title: 'Annuler la création du quiz',
            message: 'Les informations saisies seront perdues. Etes-vous sûr de vouloir annuler la création de ce quiz?'
          };
        } else {
          dialogData = {
            title: 'Supprimer ce quiz',
            message: 'Attention, toutes les questions et tous les essais associés seront supprimés. Etes-vous sûr?'
          };
        }
      
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: '500px',
          data: dialogData
        });
      
        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
          if (!confirmed) return;
      
          if (this.quizId === 0) {
            this.quizForm.reset();
            this.router.navigate(['/teacher']); // Or wherever you want to redirect
          } else {
            this.quizService.deleteQuiz(this.quizId).subscribe({
              next: () => {
                console.log('Quiz deleted');
                this.router.navigate(['/teacher']); // Adjust to where you need to redirect
              },
              error: (err) => {
                console.error('Error occurred while deleting quiz:', err);
              }
            });
          }
        });
      }          
      

    fetchDatabases() {
        this.quizService.getDatabases().subscribe(
            data => {
                this.databases = data;
                console.log('Fetched Databases:', data);
            },
            error => {
                console.error('Error fetching databases:', error);
            }
        );
    }

    //=========================QUESTION AND SOLUTION ACTIONS

    isPanelOpen(index: number): boolean {
        return this.panelOpenState[index];
    }

    setPanelState(index: number, isOpen: boolean): void {
        this.panelOpenState[index] = isOpen;
    }

    addQuestion() {
        const newQuestion: NewQuestion = {
            order: this.Questions.length + 1,
            body: '',  //start with empty body
            solutions: []  //start with empty array of solutions
        };
    
        this.Questions.push(newQuestion);
        //close all question panels and open only the new one
        this.panelOpenState = this.Questions.map((_, index) => index === this.Questions.length - 1);   
    }
    
    OrderUp(index: number) {
        if (index > 0) {
            //swap questions
            [this.Questions[index], this.Questions[index - 1]] = [this.Questions[index - 1], this.Questions[index]];
            //update order of swapped questions
            this.updateQuestionOrders();
        }
    }
    
    OrderDown(index: number) {
        if (index < this.Questions.length - 1) {
            //swap questions
            [this.Questions[index], this.Questions[index + 1]] = [this.Questions[index + 1], this.Questions[index]];
            //update order of swapped questions
            this.updateQuestionOrders();
        }
    }
    
    deleteQuestion(index: number) {
        this.Questions.splice(index, 1);
        //update order of remaining questions
        this.updateQuestionOrders();
    }
    
    updateQuestionOrders() {
        this.Questions.forEach((question, index) => {
            question.order = index + 1;
        });
    }
    
    //SOLUTION
    addSolution(questionIndex: number): void {
        const question = this.Questions[questionIndex];
    
        //initialize solutions
        if (!question.solutions) {
            question.solutions = [];
        }
    
        const newSolution: NewSolution = {
            order: question.solutions.length + 1,
            sql: ''  //start with empty sql
        };
    
        //add solution to the question solution array
        question.solutions.push(newSolution);
        this.updateSolutionOrders();
    }
    
    moveSolutionUp(questionIndex: number, solutionIndex: number): void {
        const solutions = this.Questions[questionIndex].solutions;
        if (solutionIndex > 0) {
            //swap solutions
            [solutions[solutionIndex - 1], solutions[solutionIndex]] = [solutions[solutionIndex], solutions[solutionIndex - 1]];
            //update order of swapped solutions
            this.updateSolutionOrders();
        }
    }
    
    moveSolutionDown(questionIndex: number, solutionIndex: number): void {
        const solutions = this.Questions[questionIndex].solutions;
        if (solutionIndex < solutions.length - 1) {
            //swap solutions
            [solutions[solutionIndex], solutions[solutionIndex + 1]] = [solutions[solutionIndex + 1], solutions[solutionIndex]];
            //update order of swapped solutions
            this.updateSolutionOrders();
        }
    }   
      
    deleteSolution(questionIndex: number, solutionIndex: number): void {
        //remove the solution from array
        this.Questions[questionIndex].solutions.splice(solutionIndex, 1);
        //update the order of remaining solutions
        this.updateSolutionOrders();
    }

    updateSolutionOrders() {
        this.Questions.forEach(question => {
            question.solutions.forEach((solution, index) => {
                solution.order = index + 1; //new order based on current index
            });
        });
    }

    //=========================VALIDATIONS

    private updateDateValidators(isTest: boolean, quizStartDate: Date | null, quizEndDate: Date | null): void {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Normalize currentDate to start of the day for comparison
    
        if (isTest) {
            this.Start.setValidators([Validators.required]);
            this.Finish.setValidators([]);
            this.isTest = true;
    
            // Check if quizStartDate is in the future (or if the quiz is new)
            if (this.isNew || (quizStartDate && quizStartDate > currentDate)) {
                this.Start.addValidators([this.inPastValidator(), this.afterEndValidator(this.Finish)]);
            }
    
            // Check if quizEndDate is in the future (or if the quiz is new)
            if (this.isNew || (quizEndDate && quizEndDate > currentDate)) {
                this.Finish.addValidators([this.beforeTodayValidator(), this.beforeStartValidator(this.Start)]);
            } else {
                // Here we handle the case when quizEndDate is in the past
                // You might want to adjust this part based on your specific requirements
                this.Finish.addValidators([this.beforeStartValidator(this.Start)]);
                // Note: No beforeTodayValidator is added as the date is already in the past
            }
        } else {
            this.Start.clearValidators();
            this.Finish.clearValidators();
        }
    
        this.Start.updateValueAndValidity();
        this.Finish.updateValueAndValidity();
    }
    

    private validateNameAvailability(control: AbstractControl): Observable<ValidationErrors | null> {
        return this.quizService.isQuizNameAvailable(control.value, this.quizId).pipe(
            debounceTime(400),
            map(isAvailable => isAvailable ? null : { nameExists: true }),
            catchError(() => of(null))
        );
    }

    checkForQuestions(){
        if(this.Questions?.length ==0)
            return true;
        return false;
    }

    checkForSolutions(qIndex: number){
        const q = this.Questions![qIndex];
        if(q.solutions?.length ==0)
            return true;
        return false;
    }

    isFormValid(): boolean {
        // Check for validity of the Name field
        if (!this.Name.value || this.Name.invalid) {
            return false;
        }
    
        // Check for validity of the DatabaseId field
        if (!this.DatabaseId.value || this.DatabaseId.invalid) {
            return false;
        }
    
        // Additional checks for 'Test' type quizzes
        if (this.ctlIsTest.value === 'Test') {
            // Check for presence and validity of the Start and Finish dates
            if (!this.Start.value || this.Start.invalid || !this.Finish.value || this.Finish.invalid) {
                return false;
            }
    
            // Check if the Start date is not after the Finish date
            const startDate = new Date(this.Start.value);
            const finishDate = new Date(this.Finish.value);
            if (startDate > finishDate) {
                return false;
            }
        }
    
        // Check for the presence of at least one question
        if (!this.Questions || this.Questions.length === 0) {
            return false;
        }
    
        // Check each question for validity
        for (let question of this.Questions) {
            if (!question.body || question.body.trim().length < 2) {
                return false;
            }
    
            // Check for the presence of at least one solution for each question
            if (!question.solutions || question.solutions.length === 0) {
                return false;
            }
    
            // Check each solution for validity
            for (let solution of question.solutions) {
                if (!solution.sql || solution.sql.trim().length === 0) {
                    return false;
                }
            }
        }
    
        // If all checks pass, the form is valid
        return true;
    }    
    
    private inPastValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }
    
            const inputDate = new Date(control.value);
            const currentDate = new Date();
    
            //time midnight for comparison
            inputDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);
    
            return inputDate < currentDate ? { inPast: true } : null;
        };
    }
    
    afterEndValidator(endControl: AbstractControl): ValidatorFn {
        return (startControl: AbstractControl): ValidationErrors | null => {
            const startDate = new Date(startControl.value);
            const endDate = new Date(endControl.value);
    
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
    
            return startDate && endDate && startDate > endDate ? { afterEnd: true } : null;
        };
    }
    
    private beforeStartValidator(startControl: FormControl): ValidatorFn {
        return (endControl: AbstractControl): ValidationErrors | null => {
            const startDate = new Date(startControl.value);
            const endDate = new Date(endControl.value);
    
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
    
            return endDate && startDate && endDate < startDate ? { beforeStart: true } : null;
        };
    }
    
    beforeTodayValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const selectedDate = new Date(control.value);
            const currentDate = new Date();
    
            //ignore time comparison
            selectedDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);
    
            return selectedDate && selectedDate < currentDate ? { beforeToday: true } : null;
        };
    }
      
}