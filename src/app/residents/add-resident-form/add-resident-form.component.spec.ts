import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddResidentFormComponent } from './add-resident-form.component';

describe('AddResidentFormComponent', () => {
  let component: AddResidentFormComponent;
  let fixture: ComponentFixture<AddResidentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddResidentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddResidentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
