import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyHubComponent } from './study-hub.component';

describe('StudyHubComponent', () => {
  let component: StudyHubComponent;
  let fixture: ComponentFixture<StudyHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyHubComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudyHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
