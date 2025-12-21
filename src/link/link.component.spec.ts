import { TestBed } from '@angular/core/testing';
import { LinkComponent } from './link.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(LinkComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'awards' title`, () => {
    const fixture = TestBed.createComponent(LinkComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('awards');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(LinkComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, awards');
  });
});
