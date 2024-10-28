import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import { MatToolbarModule } from '@angular/material/toolbar';  // Import MatToolbar
import { MatButtonModule } from '@angular/material/button';    // Import MatButton
import { MatInputModule } from '@angular/material/input';      // Import MatInput
import { MatIconModule } from '@angular/material/icon';
import {MatButtonToggle} from "@angular/material/button-toggle";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonToggle
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'TuneUp';
}
