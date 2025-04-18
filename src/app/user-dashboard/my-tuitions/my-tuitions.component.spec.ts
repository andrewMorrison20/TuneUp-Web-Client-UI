import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTuitionsComponent } from './my-tuitions.component';
import {MyTuitionsModule} from "./my-tuitions.module";
import {RouterTestingModule} from "@angular/router/testing";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('MyTuitionsComponent', () => {
  let component: MyTuitionsComponent;
  let fixture: ComponentFixture<MyTuitionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MyTuitionsModule,
        RouterTestingModule,
        NoopAnimationsModule
      ]
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
