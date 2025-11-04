import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachinePageComponent } from './machine-page.component';

describe('MachinePageComponent', () => {
  let component: MachinePageComponent;
  let fixture: ComponentFixture<MachinePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MachinePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MachinePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
