import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import Angular Material Modules
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatAnchor, MatButton, MatIconButton} from "@angular/material/button";
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list'; // For MatNavList

@NgModule({
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconButton,
    MatMenuModule,
    MatListModule,
  ],
  exports: [
    MatSlideToggleModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconButton,
    MatMenuModule,
    MatListModule,
  ]
})
export class SharedModule {}
