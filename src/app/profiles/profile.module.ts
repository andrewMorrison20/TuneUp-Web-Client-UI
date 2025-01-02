import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { HttpClientModule } from '@angular/common/http';
import { ProfileService } from './profile.service';

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
import {MatButton, MatIconButton} from "@angular/material/button";
import { RouterModule, Routes } from '@angular/router';
import {NavModule} from "../components/nav/nav.module";
import {SearchBarModule} from "../components/search-bar/search-bar.module";
import {ReviewCardComponent} from "../review-card/review-card.component";
import {AuthGuard} from "../authentication/auth-guard";
import {FooterModule} from "../components/footer/footer.module";
import {FiltersSideBarModule} from "../components/filters-side-bar/filters-side-bar.module";
import {MatSidenav, MatSidenavContainer, MatSidenavModule} from "@angular/material/sidenav";

const profileRoutes: Routes = [
  { path: 'search', component: SearchResultsComponent },
  { path: ':id', component: ProfileComponent, canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [
    ProfileComponent,
    ProfileCardComponent,
    SearchResultsComponent,
    ReviewCardComponent
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
    MatSidenavModule,
    RouterLink,
    RouterModule.forChild(profileRoutes),
    MatProgressSpinner,
    MatPaginator,
    NavModule,
    SearchBarModule,
    MatButton,
    FooterModule,
    FiltersSideBarModule,
    MatSidenav,
    MatSidenavContainer,
    MatIconButton,
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

