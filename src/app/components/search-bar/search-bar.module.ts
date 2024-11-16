import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

import { SearchBarComponent } from './search-bar.component';
import {MatOption, MatSelect} from "@angular/material/select";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [SearchBarComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatSelect,
    MatOption,
    // Import FormsModule to use ngModel for two-way binding
  ],
  exports: [SearchBarComponent]  // Export the SearchBarComponent so it can be used in other modules
})
export class SearchBarModule { }
