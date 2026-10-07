import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Lista } from './lista';

describe('Lista', () => {
  let component: Lista;
  let fixture: ComponentFixture<Lista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lista],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Lista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
