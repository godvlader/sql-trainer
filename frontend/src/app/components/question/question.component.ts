import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { Question, Solutions} from 'src/app/models/question';
import { QuizService } from 'src/app/services/quiz.service';
import { Database, Quiz } from 'src/app/models/quiz';
import { Router } from '@angular/router';
import { CodeEditorComponent } from '../code-editor/code-editor.component';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SqlDTO } from 'src/app/models/sqlDTO';
import { Answer } from 'src/app/models/answer';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmationDialog/ConfirmationDialogComponent';
import { Attempt } from 'src/app/models/attempt';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})
export class QuestionComponent implements AfterViewInit {
  question!: Question;
  quiz!: Quiz;
  quizId: number | undefined;
  attempt?: Attempt;
  questionId!: number | undefined;
  quizQuestionIds: number[] = [];
  isNextButtonDisabled: boolean = false;
  isPrevButtonDisabled: boolean = false;
  // responseFromServer!: string;
  showSolutions = false;
  errorMessage: string | undefined;
  responseDate!: Date | null;
  isQuestionAnswered: boolean = false;
  //attemptId!: number | null;
  //currentAnswer?: Answer | null = null;
  dataTable: string[] = [];
  columnTab : string[] = [];
  isResponseCorrect: boolean | null = null;  // null initially, true for correct, false for incorrect
  responseErrors: string[] = [];
  currentQuestionNumber = 1;
  database!: Database;
  correctMessage: string = '';
  dbname!: string;
  soluc: string[] = [];
  isreadonly: boolean = false;
  answer?: Answer | null;
  isTest: boolean = false;
  timestamp?: Date | null;
  rowCount: number = 0;
  
  @ViewChild('editor') editor!: CodeEditorComponent;

  query = "";
 
    constructor(private route: ActivatedRoute, 
      private authService: AuthenticationService, 
      private questionService: QuestionService, 
      private quizService: QuizService,
      private dialog: MatDialog,
      private router: Router) 
      { 
      this.questionId = 0;
    }

    ngAfterViewInit() {
      this.route.params.subscribe(params => {
        const id = +params['id']; //+ => convert string to number
        this.questionId = id;
        this.refresh(id);
      });
    }

  refresh(id: number) {
      // Reset state variables
      this.resetState();

      this.questionService.getQuestionById(id).subscribe(question => {
        this.question = question;
        this.quizId = question.quizId!;
        this.database = question.database!;
        this.soluc = question.solutions?.map(s => s.sql!) || [];
        this.isTest = question.isTest;
        if (this.question.solutions) {
          this.question.solutions.sort((a, b) => a.order! - b.order!);
      }
        this.loadAttemptData(id);
        //all question IDs for the quiz
        this.loadAllQuestionIdsForQuiz(question.quizId!);
    });
  }

  private updateButtonStates() {
    const index = this.quizQuestionIds.indexOf(this.question!.id!);
    this.isPrevButtonDisabled = index === 0;
    this.isNextButtonDisabled = index === this.quizQuestionIds.length - 1;
  }

  private resetState() {
      this.query = '';
      this.dataTable = [];
      this.columnTab = [];
      this.responseDate = null;
      this.isResponseCorrect = null;
      this.errorMessage = undefined;
      this.showSolutions = false;
      this.isNextButtonDisabled = false;
      this.isPrevButtonDisabled = false;
      this.isQuestionAnswered = false;
      this.correctMessage = '';
      this.soluc = [];
      this.isreadonly = false;
      this.answer = null;
  }

  private loadAttemptData(questionId: number) {
    this.quizService.getAttemptByUser(this.authService.currentUser!.id!, this.quizId!, questionId).subscribe(res => {
        this.attempt = res;
        if (res && res.answers && res.answers.length > 0) {
            this.answer = res.answers[0];
            this.query = this.answer.sql!;
            this.timestamp = this.answer.timestamp ? new Date(this.answer.timestamp) : null;
            this.isQuestionAnswered = true;
            // Always send the query, even in read-only mode
            this.send(this.query, false);
        } else {
            this.isQuestionAnswered = false;
            this.timestamp = null;
        }
        if (res && res.finish) {
            this.editor.readOnly = true;
            this.isreadonly = true;
        }
    });
}

  loadAllQuestionIdsForQuiz(quizId: number) {
    console.log("loadAllQuestionIdsForQuiz " + quizId);
    this.questionService.getAllQuestionIdsForQuiz(quizId).subscribe(
      (questionIds: number[]) => {
        // Store the question IDs in memory
        this.quizQuestionIds = questionIds;
        this.updateButtonStates();
        console.log(" IDS +>>>>>"+this.quizQuestionIds);
      },
      error => {
        console.error('Error loading question IDs for quiz:', error);
      }
    );
  }

  navigateToNextQuestion() {
    const index = this.quizQuestionIds.indexOf(this.question!.id!);
    if (index < 0 || index >= this.quizQuestionIds.length - 1) {
        this.isNextButtonDisabled = true;
        return;
    }
    this.isNextButtonDisabled = true; // Disable the button
    let nextQuestionId = this.quizQuestionIds[index + 1];
    this.currentQuestionNumber++;
    this.router.navigate(['/question/' + nextQuestionId]);
    this.refresh(nextQuestionId); // Load next question
  }

  navigateToPreviousQuestion() {
      const index = this.quizQuestionIds.indexOf(this.question!.id!);
      if (index <= 0) {
          this.isPrevButtonDisabled = true;
          return;
      }

      this.isPrevButtonDisabled = true; // Disable the button
      let prevQuestionId = this.quizQuestionIds[index - 1];
      this.currentQuestionNumber--;
      this.router.navigate(['/question/' + prevQuestionId]);
      this.refresh(prevQuestionId); // Load previous question
  }


  send(query?: string, saveToDatabase: boolean = true) {
    // Set the responseDate to now, indicating the time of sending the query
    this.responseDate = new Date();
    console.log("send");

    const userSqlQuery = this.query;
    const userSqlDTO: SqlDTO = {
        QuestionId: this.question!.id!,
        sql: userSqlQuery,
        databaseName: this.question!.quizDbName!,
        UserId: this.authService.currentUser!.id!,
        SaveToDatabase: saveToDatabase
    };

    // Send the user's response to the server
    this.questionService.sendSqlReponse(userSqlDTO).subscribe(
        (data: any) => {
            this.rowCount = data.rowCount;
            this.dataTable = data.data;
            this.columnTab = data.columnNames;
            this.correctMessage = data.correctMessage;
            this.isResponseCorrect = data.error.length === 0;
            this.responseErrors = data.error;
            console.log("send inside");
            // Check if the question was previously unanswered
            if (!this.isQuestionAnswered) {
              this.isQuestionAnswered = true;
              this.timestamp = this.responseDate; // Set timestamp only for new answers
            }
        },
        (error: HttpErrorResponse) => {
            console.error('Error executing SQL query:', error);
            this.errorMessage = error.error instanceof ErrorEvent ? error.error.message : `Backend returned code ${error.status}, body was: ${error.error}`;
            this.showSolutions = false;
        }
    );
}

  exit() {
    console.log(this.attempt);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: 'Finir attempt',
        message: 'Attention, vous ne pouvez plus modifier par aprés. Etes-vous sûr?'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
          this.questionService.finishAttempt(this.attempt!.id!).subscribe(response => {
            console.log('Attempt finished:', response);
            this.router.navigate(['/quizzes']);
          }, error => {
            console.error('Error finishing attempt:', error);
          });
      } else {
        console.log('Exit canceled');
      }
    });
  }


  remove(){
    // alert('clicked effacer');
    this.editor.writeValue('');
    this.responseDate = null;
    this.timestamp = null;
    this.correctMessage = '';
    this.responseErrors = [];
    this.rowCount = 0;
    this.columnTab = [];
    this.dataTable = [];
    this.question.solutions = [];

  }

  solutions() {
    this.showSolutions = !this.showSolutions;
  }


  formatDateTime(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
  
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;
  
    return `${formattedDate} ${formattedTime}`;
  }
  
}
