import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

/**
 * `QuestionGuard` is an Angular route guard that manages access to quiz questions. It ensures that a user can only access questions
 * belonging to the current quiz they are attempting. The guard stores the ID of the current quiz and the IDs of its questions. When
 * a route to a specific question is activated, the guard checks if the question ID in the URL matches any of the stored question IDs
 * for the current quiz. If there's a match, access to the route is granted; otherwise, the user is redirected to a restricted route.
 * This mechanism is crucial for maintaining the integrity and security of the quiz-taking process, preventing users from accessing
 * questions outside the intended quiz context.
 */

export class QuestionGuard implements CanActivate {
    private currentQuizId: number | null = null;
    private currentQuizQuestionIds: number[] = [];
    private state: any;

    setState(state: any) {
        this.state = state;
    }

    getState(): any {
        return this.state;
    }

    setCurrentQuiz(quizId: number, questionIds: number[]) {
        this.currentQuizId = quizId;
        this.currentQuizQuestionIds = questionIds;
    }

    getCurrentQuizId(): number | null {
        return this.currentQuizId;
    }

    getCurrentQuizQuestionIds(): number[] {
        return this.currentQuizQuestionIds;
    }

    constructor(private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
        const questionId = +route.paramMap.get('id')!;
        const currentQuizId = this.getCurrentQuizId();
        const currentQuizQuestionIds = this.getCurrentQuizQuestionIds();
        const readOnlyMode = this.getState()?.readOnly;

        // Grant access if the question belongs to the current quiz or in read-only mode
        if ((currentQuizId !== null && currentQuizQuestionIds.includes(questionId)) || readOnlyMode) {
            return true;
        } else {
            return this.router.createUrlTree(['/restricted']);
        }
    }
}
