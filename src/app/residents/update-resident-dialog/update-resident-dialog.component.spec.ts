import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateResidentDialogComponent } from './update-resident-dialog.component';

describe('UpdateResidentDialogComponent', () => {
  let component: UpdateResidentDialogComponent;
  let fixture: ComponentFixture<UpdateResidentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateResidentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateResidentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
