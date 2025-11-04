import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransitionRulesComponent } from './transition-rules.component';

describe('TransitionRulesComponent', () => {
  let component: TransitionRulesComponent;
  let fixture: ComponentFixture<TransitionRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransitionRulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransitionRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
