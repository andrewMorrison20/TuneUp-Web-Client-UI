import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from "@angular/material/button";
import {SharedModule} from "../../shared/shared.module";
import {NavComponent} from "./nav.component";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {SearchBarModule} from "../search-bar/search-bar.module";
import {NotificationIconPipe} from "../../shared/pipes/notification-icon.pipe";
import {NotificationLinkPipe} from "../../shared/pipes/notification-link.pipe";



@NgModule({
  declarations: [NavComponent,NotificationIconPipe,NotificationLinkPipe],
  imports: [
    CommonModule,
    SharedModule,
    RouterLink,
    FormsModule,
    SearchBarModule,
    RouterLinkActive
  ],
  exports:[
    NavComponent
  ]
})
export class NavModule { }
