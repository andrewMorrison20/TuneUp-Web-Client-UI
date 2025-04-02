import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { HttpClientModule } from '@angular/common/http';
import { ProfileService } from './profile.service';
import {ProfileCardComponent} from "./profile-card/profile-card.component";
import {SearchResultsComponent} from "./search-results/search-results.component";
import { RouterModule, Routes } from '@angular/router';
import {NavModule} from "../components/nav/nav.module";
import {SearchBarModule} from "../components/search-bar/search-bar.module";
import {ReviewCardComponent} from "../review-card/review-card.component";
import {authGuard} from "../authentication/guards/auth-guard";
import {FooterModule} from "../components/footer/footer.module";
import {FiltersSideBarModule} from "../components/filters-side-bar/filters-side-bar.module";
import {FullCalendarModule} from "@fullcalendar/angular";
import {LessonsModule} from "../lessons/lessons.module";
import {SharedModule} from "../shared/shared.module";

const profileRoutes: Routes = [
  { path: 'search', component: SearchResultsComponent },
  { path: ':id', component: ProfileComponent, canActivate: [authGuard] }
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
    SharedModule,
    RouterModule.forChild(profileRoutes),
    NavModule,
    SearchBarModule,
    FooterModule,
    FiltersSideBarModule,
    FullCalendarModule,
    LessonsModule
  ],
  providers: [ ProfileService ],
  exports: [
    ProfileComponent,
    SearchResultsComponent,
    ProfileCardComponent
  ]
})
export class ProfileModule { }
