import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtribuirusuarioComponent } from './atribuirusuario.component';

describe('AtribuirusuarioComponent', () => {
  let component: AtribuirusuarioComponent;
  let fixture: ComponentFixture<AtribuirusuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtribuirusuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtribuirusuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
