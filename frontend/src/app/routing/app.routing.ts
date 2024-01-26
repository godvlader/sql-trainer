import { Routes, RouterModule } from '@angular/router';
import { UserListComponent } from '../components/userlist/userlist.component';
import { RestrictedComponent } from '../components/restricted/restricted.component';
import { LoginComponent } from '../components/login/login.component';
import { UnknownComponent } from '../components/unknown/unknown.component';
import { AuthGuard } from '../services/auth.guard';
import { Role } from '../models/user';
import { SignupComponent } from '../components/signup/signup.component';
import { WelcomeComponent } from '../components/welcome/welcome.component';
import { QuizzesContainerComponent } from '../components/quizzes/group-container.component';
import { QuestionComponent } from '../components/question/question.component';
import { TestCodeEditorComponent } from '../components/test-code-editor/test-code-editor.component';
import { TeacherComponent } from '../components/teacher/teacher.component';
import { EditQuizComponent } from '../components/edit-quiz/edit-quiz.component';
import { QuestionGuard } from '../services/questionGuard.service';


const appRoutes: Routes = [
    { path: '', component: WelcomeComponent, pathMatch: 'full' },
    {   
        path: ' ', 
        component: QuizzesContainerComponent,
        canActivate: [AuthGuard],
        data: {roles: [Role.Student, Role.Admin, Role.Teacher]}
    },
    {   
        path: 'quizzes', 
        component: QuizzesContainerComponent,
        canActivate: [AuthGuard],
        data: {roles: [Role.Student, Role.Admin, Role.Teacher]}
    },
    {   
        path: 'quizedition/:quizId', 
        component: EditQuizComponent,
        canActivate: [AuthGuard],
        data: {roles: [Role.Admin, Role.Teacher]}
    },
    {   
        path: 'quizedition', 
        component: EditQuizComponent,
        canActivate: [AuthGuard],
        data: {roles: [Role.Admin, Role.Teacher]}
    },
    {   
        path: 'teacher', 
        component: TeacherComponent,
        canActivate: [AuthGuard],
        data: {roles: [Role.Admin, Role.Teacher]}
    },
    {   
        path: 'testeditor', 
        component: TestCodeEditorComponent,
        canActivate: [AuthGuard],
        data: {roles: [Role.Student, Role.Admin, Role.Teacher]}
    },
    {   path: 'question/:id', 
        component: QuestionComponent,
        canActivate: [AuthGuard, QuestionGuard],
        data: {roles: [Role.Student, Role.Admin, Role.Teacher]}
    },
    {
        path: 'users',
        component: UserListComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin] }
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    { path: 'restricted', component: RestrictedComponent },
    { path: '**', component: UnknownComponent }
];

export const AppRoutes = RouterModule.forRoot(appRoutes);
