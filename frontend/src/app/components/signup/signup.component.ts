import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, AsyncValidatorFn, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { SignupService } from '../../services/signup.service';
import { Observable, debounceTime, switchMap, map, catchError, of } from 'rxjs';
@Component({
  templateUrl: 'signup.component.html',
  styleUrls: ['signup.component.css']
})
export class SignupComponent {
  public signupForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl!: string;
  ctlPseudo!: FormControl;
  ctlFullname!: FormControl;
  ctlBirthdate!: FormControl;
  ctlEmail!: FormControl;
  ctlPassword!: FormControl;
  ctlPasswordConfirm!: FormControl;
  ctlFirstname!: FormControl;
  ctlLastname!: FormControl;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private signupService: SignupService,
  ) {
  }

  ngOnInit() {
    this.ctlPseudo = this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(10),
      Validators.pattern(/^[a-zA-Z][a-zA-Z0-9_]+$/i)
    ], [
      this.validatePseudoAvailability.bind(this) // Asynchronous validator
    ]);

    this.ctlFullname = this.formBuilder.control('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]);

    this.ctlFirstname = this.formBuilder.control('', [
      Validators.minLength(3),
      Validators.maxLength(50),
    ]);

    this.ctlLastname = this.formBuilder.control('', [
      Validators.minLength(3),
      Validators.maxLength(50),
    ]);

    this.ctlBirthdate = this.formBuilder.control('', [
      Validators.required,
      this.birthdateNotInFutureValidator(),
      this.validDateFormatValidator(),
      this.minimumAgeValidator()
    ]);
    
      
    this.ctlEmail = this.formBuilder.control('', [
      Validators.required,
      Validators.email
    ], [
      this.validateEmailAvailability.bind(this), // Asynchronous validator
    ]);

    this.ctlPassword = this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200),
        this.passwordValidator() 
    ]);
    this.ctlPasswordConfirm = this.formBuilder.control('', [
        Validators.required,
        // Custom validator to check if passwords match
        this.passwordMatchValidator(this.ctlPassword)
    ]);
    
    this.signupForm = this.formBuilder.group({
      pseudo: this.ctlPseudo,
      firstname: this.ctlFirstname,
      lastname: this.ctlLastname,
      fullname: this.ctlFullname,
      birthdate: this.ctlBirthdate,
      email: this.ctlEmail,
      password: this.ctlPassword
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  //BIRTHDATE VALIDATIONS
  birthdateNotInFutureValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const birthdate = control.value;
  
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); //midnight for accurate comparison
  
      return new Date(birthdate).getTime() >= currentDate.getTime()
        ? { birthdateInFuture: true }
        : null;
    };
  }
  
  validDateFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const birthdate = control.value;
  
      // Check if birthdate follows the format "YYYY-MM-DD"
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
  
      if (!dateFormatRegex.test(birthdate)) {
        return { invalidDateFormat: true };
      }
  
      // Check if the date is a valid date
      const dateParts = birthdate.split('-');
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);
      const day = parseInt(dateParts[2], 10);
  
      const isValidDate = !isNaN(year) && !isNaN(month) && !isNaN(day) &&
        month >= 1 && month <= 12 &&
        day >= 1 && day <= new Date(year, month, 0).getDate();
  
      return isValidDate ? null : { invalidDate: true };
    };
  }
  
  
  minimumAgeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const birthdate = control.value;
  
      const minimumAgeDate = new Date();
      minimumAgeDate.setFullYear(minimumAgeDate.getFullYear() - 18);
  
      return new Date(birthdate).getTime() > minimumAgeDate.getTime()
        ? { tooYoung: true }
        : null;
    };
  }
  //BIRTHDATE VALIDATIONS END
  
  //EMAIL VALIDATIONS  

  validateEmailAvailability(control: AbstractControl): Observable<ValidationErrors | null> {
    return control.valueChanges.pipe(
        debounceTime(300),
        switchMap(value => {
          
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            const lowerCaseValue = value.toLowerCase();  // Convert email to lowercase

            if (!emailRegex.test(lowerCaseValue)) {
                control.setErrors({ invalidEmailFormat: true });
                return of(null);
            }

            return this.signupService.isEmailAvailable(lowerCaseValue).pipe(
                map(available => {
                    if (!available) {
                        control.setErrors({ emailNotAvailable: true });
                    } else {
                        control.setErrors(null);
                    }
                    return null;
                }),
                catchError(() => of(null))
            );
        })
    );
  }


  validateEmailFormat(control: AbstractControl): ValidationErrors | null {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    // Check email format using a regex
    return emailRegex.test(control.value) ? null : { invalidEmailFormat: true };
  }
  //EMAIL VALIDATIONS END  

  validatePseudoAvailability(control: AbstractControl): Observable<ValidationErrors | null> {
    return control.valueChanges.pipe(
        debounceTime(300),
        switchMap(value => {
            const lowerCaseValue = value.toLowerCase();  // Convert pseudo to lowercase

            return this.signupService.isPseudoAvailable(lowerCaseValue).pipe(
                map(available => {
                    if (!available) {
                        control.setErrors({ pseudoNotAvailable: true });
                    } else {
                        control.setErrors(null);
                    }
                    return null;
                }),
                catchError(() => of(null))
            );
        })
    );
  }

  //PASSWORD VALIDATIONS
  passwordMatchValidator(passwordControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = passwordControl.value;
        const confirmPassword = control.value;

        // Check if passwords match
        return password === confirmPassword ? null : { passwordNotMatched: true };
    };
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      // Check if the password has at least three letters
      const letterRegex = /[a-zA-Z]/g;
      const letterMatches = password.match(letterRegex);
  
      return letterMatches && letterMatches.length >= 3
        ? null
        : { insufficientLetters: true };
    };
  }
  //PASSWORD VALIDATIONS END

  get f() { return this.signupForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.signupForm.invalid) return;

    this.loading = true;

    this.signupService.signup(this.signupForm.value)
      .subscribe(
        response => {
          if (response) {
            console.log('Signup successful');
            this.router.navigate(['/login']);
          } else {
            console.error('Invalid response format:', response);
            this.error = 'Unexpected response from the server.';
          }
        },
        error => {
          console.error('Signup error', error);
          if (error.status === 400 && error.error === 'Email is already registered.') {
            this.error = 'Email is already taken. Please use a different email.';
          } else {
            this.error = 'An error occurred during signup.';
          }
          this.loading = false;
        }
      );
    }
}
