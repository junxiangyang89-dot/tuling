import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TapeDisplayComponent } from './tape-display.component';

describe('TapeDisplayComponent', () => {
  let component: TapeDisplayComponent;
  let fixture: ComponentFixture<TapeDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TapeDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TapeDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
