import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFuncionarioFormComponent } from './add-funcionario-form.component';

describe('AddFuncionarioFormComponent', () => {
  let component: AddFuncionarioFormComponent;
  let fixture: ComponentFixture<AddFuncionarioFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFuncionarioFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFuncionarioFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
