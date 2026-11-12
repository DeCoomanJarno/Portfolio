import { NgModule } from '@angular/core';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterModule, RouterStateSnapshot, Routes, UrlTree } from '@angular/router';
import { BookingFormComponent } from './components/booking-form/booking-form';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { AppointmentCalendarComponent } from './components/appointment-calendar/appointment-calendar';
import { AppointmentPageComponent } from './components/appointment-page/appointment-page';
import { AuthService, Login, User } from '@angularlibrary/core-lib';

function isAdmin(user: User | null): boolean {
  if (!user?.roles?.length) return false;
  return user.roles.some((role) => String(role?.name || '').toLowerCase().includes('admin'));
}

const adminGuard = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return isAdmin(auth.getCurrentUser())
    ? true
    : router.createUrlTree(['/Appointments/login'], {
      queryParams: { returnUrl: state.url }
    });
};

const routes: Routes = [
  {
    path: '',
    component: AppointmentPageComponent,
    children: [
      { path: '', redirectTo: 'book', pathMatch: 'full' },
      { path: 'book', component: BookingFormComponent },
      {
        path: 'login',
        component: Login,
        data: {
          autoRedirect: true,
          redirectTo: '/Appointments/book',
          returnUrlQueryParam: 'returnUrl'
        }
      },
      { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
      { path: 'admin/calendar', component: AppointmentCalendarComponent, canActivate: [adminGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }
