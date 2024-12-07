import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTuitionsComponent } from './my-tuitions.component';

describe('MyTuitionsComponent', () => {
  let component: MyTuitionsComponent;
  let fixture: ComponentFixture<MyTuitionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTuitionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyTuitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
