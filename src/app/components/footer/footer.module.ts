import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FooterComponent} from "./footer.component";
import {SharedModule} from "../../shared/shared.module";
import {RouterLink, RouterLinkActive} from "@angular/router";



@NgModule({
  declarations: [FooterComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterLink,
    RouterLinkActive,
  ],
  exports:[
    FooterComponent
  ]
})
export class FooterModule { }
