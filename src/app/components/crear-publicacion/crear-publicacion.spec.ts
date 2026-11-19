import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CrearPublicacion } from './crear-publicacion';

describe('CrearPublicacion', () => {
  let component: CrearPublicacion;
  let fixture: ComponentFixture<CrearPublicacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPublicacion],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearPublicacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
