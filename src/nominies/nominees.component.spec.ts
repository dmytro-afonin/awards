import { TestBed } from '@angular/core/testing';
import { NomineesComponent } from './nominees.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NomineesComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(NomineesComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'awards' title`, () => {
    const fixture = TestBed.createComponent(NomineesComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('awards');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(NomineesComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, awards');
  });
});
