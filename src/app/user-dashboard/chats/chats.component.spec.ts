import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatsComponent } from './chats.component';
import {UserDashboardModule} from "../user-dashboard.module";

describe('ChatsComponent', () => {
  let component: ChatsComponent;
  let fixture: ComponentFixture<ChatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[
        UserDashboardModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
