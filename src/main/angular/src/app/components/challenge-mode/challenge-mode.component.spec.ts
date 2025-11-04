import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeModeComponent } from './challenge-mode.component';

describe('ChallengeModeComponent', () => {
  let component: ChallengeModeComponent;
  let fixture: ComponentFixture<ChallengeModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeModeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
