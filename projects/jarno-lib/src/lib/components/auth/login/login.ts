import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
   loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isRegistering = false;

  /** Emit the logged-in user so the app can handle redirects */
  @Output() loggedIn = new EventEmitter<User>();

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      fullname: ['', Validators.required],
      email: ['', Validators.email]
    });
  }

  toggleRegister() {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
    this.successMessage = '';
  }

  /** Called from template */
  onLogin() {
    const { username, password } = this.loginForm.value;
    this.login(username, password);
  }

  login(username: string, password: string) {
    const success = this.auth.login(username, password);

    if (!success) {
      this.errorMessage = 'Invalid username or password';
      return;
    }

    const user = this.auth.getCurrentUser();
    if (user)
      {
        this.errorMessage = '';
        this.successMessage = '';
        this.loggedIn.emit(user); // let the consuming app handle the redirect
      }
    }

  register() {
    const user: User = {
      ...this.registerForm.value,
      roles: [] // empty roles by default, app can assign
    };

    const success = this.auth.register(user);
    if (!success) {
      this.errorMessage = 'Username already exists';
      return;
    }
    this.login(user.username,user.password);
    this.successMessage = 'Account created successfully';
    this.isRegistering = false;
    this.registerForm.reset();
  }
}
