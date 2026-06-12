import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface QuoteFormData {
  name: string;
  email: string;
  service: string;
  budget: string;
  description: string;
}

export interface FormspreeResponse {
  ok: boolean;
  next: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormspreeService {
  private readonly FORMSPREE_ENDPOINT = 'https://formspree.io/f/mgopvkar';
  private readonly RATE_LIMIT_KEY = 'formspree_submission_timestamps';
  private readonly MAX_SUBMISSIONS_PER_MONTH = 45; // Leave 5 buffer for testing
  private readonly SUBMISSION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

  constructor(private http: HttpClient) {}

  /**
   * Check if user can submit form based on rate limiting
   * Returns null if allowed, otherwise returns error message
   */
  canSubmit(): string | null {
    if (typeof window === 'undefined') {
      return null; // SSR safe
    }

    try {
      const timestamps = this.getSubmissionTimestamps();
      const now = Date.now();
      
      // Clean up old timestamps (older than 30 days)
      const recentTimestamps = timestamps.filter(
        (ts: number) => now - ts < this.SUBMISSION_WINDOW_MS
      );

      // Check limit
      if (recentTimestamps.length >= this.MAX_SUBMISSIONS_PER_MONTH) {
        const oldestTimestamp = recentTimestamps[0];
        const timeUntilReset = new Date(oldestTimestamp + this.SUBMISSION_WINDOW_MS);
        return `Rate limit exceeded. Please try again after ${timeUntilReset.toLocaleDateString()}`;
      }

      return null;
    } catch (error) {

      return null; // Don't block on error
    }
  }

  /**
   * Submit quote form to FormSpree
   */
  submitQuote(formData: QuoteFormData): Observable<FormspreeResponse> {
    const rateLimitError = this.canSubmit();
    if (rateLimitError) {
      return throwError(() => new Error(rateLimitError));
    }

    // Record this submission
    this.recordSubmission();

    // Prepare FormSpree payload
    const payload = {
      name: formData.name,
      email: formData.email,
      service: formData.service,
      budget: formData.budget,
      description: formData.description,
      _subject: `New Project Inquiry from ${formData.name}`
    };

    return this.http.post<FormspreeResponse>(
      this.FORMSPREE_ENDPOINT,
      payload,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get remaining submissions for the month
   */
  getRemainingSubmissions(): number {
    const timestamps = this.getSubmissionTimestamps();
    const now = Date.now();
    const recentTimestamps = timestamps.filter(
      (ts: number) => now - ts < this.SUBMISSION_WINDOW_MS
    );
    return Math.max(0, this.MAX_SUBMISSIONS_PER_MONTH - recentTimestamps.length);
  }

  private recordSubmission(): void {
    if (typeof window === 'undefined') return;

    try {
      const timestamps = this.getSubmissionTimestamps();
      timestamps.push(Date.now());
      localStorage.setItem(this.RATE_LIMIT_KEY, JSON.stringify(timestamps));
    } catch (error) {

    }
  }

  private getSubmissionTimestamps(): number[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.RATE_LIMIT_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {

      return [];
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Failed to submit quote request.';
    
    if (error.status === 400) {
      errorMessage = 'Invalid form data. Please check your input.';
    } else if (error.status === 429) {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
