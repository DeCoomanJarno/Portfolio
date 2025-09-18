import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../Models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: false,
})
export class LoginComponent {
  loginForm: FormGroup;
  showRegistration = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''], // only for admin
      name: [''],
      fullname: ['']
    });
  }

  submit() {
    const { email, password } = this.loginForm.value;

    if (this.auth.login(email, password)) {
      const user = this.auth.getCurrentUser();
      if (user?.role === 'admin') {
        this.router.navigate(['/Appointments/admin/dashboard']);
      } else {
        this.router.navigate(['/Appointments/book']);
      }
    } else {
      // Client does not exist, show registration form
      this.showRegistration = true;
    }
  }

  register() {
    const { email,password, name, fullname } = this.loginForm.value;
    const newClient: Omit<User, 'role'> = { email, name, fullname, password };
    this.auth.registerClient(newClient);
    this.router.navigate(['/Appointments/book']);
  }
}
