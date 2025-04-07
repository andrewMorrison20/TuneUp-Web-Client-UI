import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";
import {HomeComponent} from "./home.component";
import {HomeRoutingModule} from "./home-routing.module";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatAnchor, MatButton, MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatList, MatListItem, MatNavList} from "@angular/material/list";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {NavModule} from "../components/nav/nav.module";
import {FooterModule} from "../components/footer/footer.module";
import {SearchBarModule} from "../components/search-bar/search-bar.module";
import {NgForOf, NgIf} from "@angular/common";
import {QuizComponent} from "./quiz/quiz.component";
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {MatCheckbox} from "@angular/material/checkbox";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {ProfileModule} from "../profiles/profile.module";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatCard, MatCardContent, MatCardTitle} from "@angular/material/card";
import {ContactUsComponent} from "./contact-us/contact-us.component";
import {MatDivider} from "@angular/material/divider";
import {AboutUsComponent} from "./about-us/about-us.component";
import {ServicesComponent} from "./services/service.component";

@NgModule({
  declarations: [
    HomeComponent,
    QuizComponent,
    ContactUsComponent,
    AboutUsComponent,
    ServicesComponent
  ],
  imports: [
    HomeRoutingModule,
    MatSlideToggle,
    MatToolbar,
    MatIcon,
    MatFormField,
    MatAnchor,
    MatButton,
    MatInput,
    MatIconButton,
    MatNavList,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    NavModule,
    FooterModule,
    SearchBarModule,
    NgIf,
    MatStep,
    MatCheckbox,
    ReactiveFormsModule,
    MatRadioGroup,
    MatRadioButton,
    MatStepper,
    MatStepperPrevious,
    MatStepLabel,
    MatStepperNext,
    NgForOf,
    MatLabel,
    MatList,
    MatListItem,
    FormsModule,
    ProfileModule,
    MatProgressSpinner,
    MatCardTitle,
    MatCardContent,
    MatCard,
    MatDivider
  ],
  exports:[HomeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class HomeModule {}
