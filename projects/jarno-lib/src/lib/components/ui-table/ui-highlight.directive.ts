import {
  booleanAttribute,
  Directive,
  ElementRef,
  Input,
  NgModule,
  OnChanges,
  SecurityContext
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({ selector: '[uiHighlight]', standalone: false })
export class HighlightDirective implements OnChanges {
  constructor(
    private _el: ElementRef,
    private _domSanitizer: DomSanitizer
  ) {}

  @Input()
  public set content(content: string) {
    this._content = '' + content;
  }
  public get content(): string {
    return this._content;
  }

  @Input({ transform: booleanAttribute })
  public fullMatch = false;

  @Input()
  public set searchTerm(searchTerm: string) {
    // trim the search and replace spaces with |
    // which matches each word in the string
    // ex: this|is|match
    // would match all instances of the string "this" "is" and "match"
    // regardless of how many times they occur
    this._searchTerm = this.fullMatch
      ? searchTerm?.trim()
      : (searchTerm?.trim()?.replace(/\s/g, '|') ?? '');

    this._searchTerm = this._searchTerm.replace(
      this.fullMatch
        ? /[/\-\\^$*+?.|()[\]{}]/g // Escape all regex characters including |
        : /[/\-\\^$*+?.()[\]{}]/g, // Escape all regex characters except |
      '\\$&'
    );

    if (!this.fullMatch) {
      // let's also make sure we don't have any empty search terms
      // replace multiple | with a single | (removing empty search terms)
      // remove leading/trailing | in a single step
      this._searchTerm = this._searchTerm
        .replace(/\|+/g, '|') // Replace multiple | with a single |
        .replace(/^\||\|$/g, ''); // Remove leading or trailing |
    }

    this.matchPattern = new RegExp(this._searchTerm, 'gi');
    this.searchPattern = new RegExp(this._searchTerm, 'i');
  }

  public get searchTerm(): string {
    return this._searchTerm ?? '';
  }

  private _content = '';
  private _searchTerm?: string;

  public spanStart = '<span class="highlighted">';
  public spanEnd = '</span>';
  public searchPattern!: RegExp;
  public matchPattern!: RegExp;

  private _separatedText: string[] = [];
  private _separatedSearchedText: string[] = [];

  public ngOnChanges(): void {
    this.highlight();
  }

  public highlight(): void {
    let final = '';
    if (
      this._searchTerm !== undefined &&
      this._searchTerm != null &&
      this._searchTerm.length > 0 &&
      this._searchTerm[0] !== '.'
    ) {
      this._separatedText = this._content?.split(this.searchPattern);
      this._separatedSearchedText =
        this._content?.match(this.matchPattern) ?? [];

      if (
        this._separatedSearchedText != null &&
        this._separatedSearchedText.length > 0
      ) {
        for (let i = 0; i < this._separatedText.length; i++) {
          if (i <= this._separatedSearchedText.length - 1) {
            final +=
              this._escapeHtml(this._separatedText[i]) +
              this.spanStart +
              this._escapeHtml(this._separatedSearchedText[i]) +
              this.spanEnd;
          } else {
            final += this._escapeHtml(this._separatedText[i]);
          }
        }
      }

      if (final.length > 0) {
        this._el.nativeElement.innerHTML = final;
      } else {
        this._el.nativeElement.innerText = this._content;
      }
    } else {
      this._el.nativeElement.innerText = this._content;
    }
  }

  private _htmlEscapes: Record<string, string> = {
    '&': '&amp',
    '<': '&lt',
    '>': '&gt',
    '"': '&#34;',
    "'": '&#39'
  };
  private _reUnescapedHtml = /[&<>"']/g;
  private _reHasUnescapedHtml = RegExp(this._reUnescapedHtml.source);

  private _escapeHtml(string: string): string {
    const result =
      string && this._reHasUnescapedHtml.test(string)
        ? string.replace(this._reUnescapedHtml, chr => this._htmlEscapes[chr])
        : string;
    // It should be safe now, but just in case let's also sanitize it to avoid XSS attacks
    return this._domSanitizer.sanitize(SecurityContext.HTML, result) ?? '';
  }
}

@NgModule({
  imports: [],
  exports: [HighlightDirective],
  declarations: [HighlightDirective],
  providers: []
})
export class HighlightDirectiveModule {}
