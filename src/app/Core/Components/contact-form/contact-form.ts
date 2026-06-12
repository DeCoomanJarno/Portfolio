import { NgClass } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { InputFieldModule } from '@angularlibrary/ui-lib';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'ui-contact-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, NgClass, InputFieldModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css'
})
export class ContactForm {
  statusMessage = '';
  isSuccess = false;
  isSubmitting = false;

  async onSubmit(event: Event) {
    event.preventDefault();
    this.statusMessage = '';
    this.isSuccess = false;
    this.isSubmitting = true;

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch('http://localhost:8000/sendmail.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      this.statusMessage = data.message ?? 'Unexpected response.';
      this.isSuccess = Boolean(data.success);

      if (this.isSuccess) {
        form.reset();
      }
    } catch (error) {
      this.statusMessage = 'An error occurred. Please try again later.';
      this.isSuccess = false;

    }

    this.isSubmitting = false;
  }
}
