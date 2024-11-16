import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { HttpClientModule } from '@angular/common/http';
import { ProfileService } from './profile.service';

// Import necessary Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import {ProfileCardComponent} from "./profile-card/profile-card.component";
import {RouterLink} from "@angular/router";

@NgModule({
  declarations: [
    ProfileComponent,
    ProfileCardComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    RouterLink,
  ],
  providers: [
    ProfileService
  ],
  exports: [
    ProfileComponent
  ]
})
export class ProfileModule { }

