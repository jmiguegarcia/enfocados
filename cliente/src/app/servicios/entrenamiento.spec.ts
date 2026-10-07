import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { EntrenamientoService } from './entrenamiento';

describe('EntrenamientoService', () => {
  let service: EntrenamientoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(EntrenamientoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
