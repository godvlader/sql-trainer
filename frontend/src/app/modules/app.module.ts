import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DefaultValueAccessor, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutes } from '../routing/app.routing';

import { AppComponent } from '../components/app/app.component';
import { NavMenuComponent } from '../components/nav-menu/nav-menu.component';
// import { QuizzesComponent } from '../components/quizzes/quizzes.component';
import { CounterComponent } from '../components/counter/counter.component';
import { FetchDataComponent } from '../components/fetch-data/fetch-data.component';
import { UserListComponent } from '../components/userlist/userlist.component';
import { RestrictedComponent } from '../components/restricted/restricted.component';
import { UnknownComponent } from '../components/unknown/unknown.component';
import { JwtInterceptor } from '../interceptors/jwt.interceptor';
import { LoginComponent } from '../components/login/login.component';
import { SignupComponent } from '../components/signup/signup.component';
import { WelcomeComponent } from '../components/welcome/welcome.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SetFocusDirective } from '../directives/setfocus.directive';
import { EditUserComponent } from '../components/edit-user/edit-user.component';
import { SharedModule } from './shared.module';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { fr } from 'date-fns/locale';
import { Quiz } from '../models/quiz';
import { QuizListComponent } from '../components/quizzes/quizlist.component';
import { QuizzesContainerComponent } from '../components/quizzes/group-container.component';
import { QuizGroupComponent } from '../components/quizzes/quiz-group.component';
import { QuestionComponent } from '../components/question/question.component';
import { TestCodeEditorComponent } from '../components/test-code-editor/test-code-editor.component';
import { CodeEditorComponent } from '../components/code-editor/code-editor.component';
import { TeacherComponent } from '../components/teacher/teacher.component';
import { EditQuizComponent } from '../components/edit-quiz/edit-quiz.component';
import { ConfirmationDialogComponent } from '../components/confirmationDialog/ConfirmationDialogComponent';

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        WelcomeComponent,
        CounterComponent,
        FetchDataComponent,
        UserListComponent,
        LoginComponent,
        SignupComponent,
        UnknownComponent,
        RestrictedComponent,
        EditUserComponent,
        SetFocusDirective,
        RestrictedComponent,
        QuizListComponent,
        QuizzesContainerComponent, 
        QuizGroupComponent,
        QuestionComponent,
        TestCodeEditorComponent, 
        CodeEditorComponent,
        TeacherComponent, 
        EditQuizComponent,
        ConfirmationDialogComponent
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutes,
        BrowserAnimationsModule,
        SharedModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: fr },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: ['dd/MM/yyyy'],
        },
        display: {
          dateInput: 'dd/MM/yyyy',
          monthYearLabel: 'MMM yyyy',
          dateA11yLabel: 'dd/MM/yyyy',
          monthYearA11yLabel: 'MMM yyyy',
        },
      },
    },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { 
  constructor() {
    DefaultValueAccessor.prototype.registerOnChange = function (fn: (_: string | null) => void): void {
      this.onChange = (value: string | null) => {
          fn(value === '' ? null : value);
      };
    };
  }
}
