import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyHubComponent } from './study-hub.component';
import {UserDashboardModule} from "../user-dashboard.module";
import {RouterTestingModule} from "@angular/router/testing";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('StudyHubComponent', () => {
  let component: StudyHubComponent;
  let fixture: ComponentFixture<StudyHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[
      UserDashboardModule,
      RouterTestingModule,
      NoopAnimationsModule
    ]
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
