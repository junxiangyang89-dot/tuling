import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeModeComponent } from './free-mode.component';

describe('FreeModeComponent', () => {
  let component: FreeModeComponent;
  let fixture: ComponentFixture<FreeModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreeModeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreeModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
