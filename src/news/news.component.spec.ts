import { TestBed } from '@angular/core/testing';
import { NewsComponent } from './news.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(NewsComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'awards' title`, () => {
    const fixture = TestBed.createComponent(NewsComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('awards');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(NewsComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, awards');
  });
});
