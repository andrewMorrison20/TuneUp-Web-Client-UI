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
import {SearchResultsComponent} from "./search-results/search-results.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatPaginator} from "@angular/material/paginator";
import {MatButton} from "@angular/material/button";
import { RouterModule, Routes } from '@angular/router';
import {NavModule} from "../components/nav/nav.module";
import {SearchBarModule} from "../components/search-bar/search-bar.module";

const profileRoutes: Routes = [
  { path: 'search', component: SearchResultsComponent },
  { path: ':id', component: ProfileComponent }
];

@NgModule({
  declarations: [
    ProfileComponent,
    ProfileCardComponent,
    SearchResultsComponent
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
    MatCardModule,
    RouterLink,
    RouterModule.forChild(profileRoutes),
    MatProgressSpinner,
    MatPaginator,
    NavModule,
    SearchBarModule,
    MatButton,
  ],
  providers: [
    ProfileService
  ],
  exports: [
    ProfileComponent,
    SearchResultsComponent,
    ProfileCardComponent
  ]
})
export class ProfileModule { }

