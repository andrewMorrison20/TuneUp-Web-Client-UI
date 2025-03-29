import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProfileService } from '../../profiles/profile.service';
import { Subscription } from 'rxjs';
import { Genre, Instrument, Qualification, SharedDataService } from '../../components/shared-data-service.component';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit, OnDestroy {
  stepOneFormGroup!: FormGroup;
  stepTwoFormGroup!: FormGroup;
  stepThreeFormGroup!: FormGroup;
  stepFourFormGroup!: FormGroup;
  stepFiveFormGroup!: FormGroup; // New form group for Price Range

  lessonTypes = ['Online', 'InPerson', 'Any'];
  instruments: Instrument[] = [];
  genres: Genre[] = [];
  qualifications: Qualification[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private sharedData: SharedDataService
  ) {}

  ngOnInit(): void {
    // Load shared data.
    this.sharedData.loadInstruments();
    this.sharedData.loadGenres();
    this.sharedData.loadQualifications();

    // Subscribe to instruments.
    this.subscriptions.add(
      this.sharedData.instruments$.subscribe(data => {
        if (data) {
          this.instruments = data;
          this.initializeInstrumentsForm();
        }
      })
    );

    // Subscribe to genres.
    this.subscriptions.add(
      this.sharedData.genres$.subscribe(data => {
        if (data) {
          this.genres = data;
          this.initializeGenresForm();
        }
      })
    );

    // Subscribe to qualifications.
    this.subscriptions.add(
      this.sharedData.qualifications$.subscribe(data => {
        if (data) {
          this.qualifications = data;
          this.initializeQualificationsForm();
        }
      })
    );

    // Initialize step one: Lesson Type.
    this.stepOneFormGroup = this.fb.group({
      lessonType: ['', Validators.required]
    });

    // Initialize the price form (step five) with default values.
    this.initializePriceForm();
  }

  private initializeInstrumentsForm(): void {
    this.stepTwoFormGroup = this.fb.group({
      instruments: this.fb.array(this.instruments.map(() => false))
    });
  }

  private initializeGenresForm(): void {
    this.stepThreeFormGroup = this.fb.group({
      genres: this.fb.array(this.genres.map(() => false))
    });
  }

  private initializeQualificationsForm(): void {
    this.stepFourFormGroup = this.fb.group({
      qualifications: this.fb.array(this.qualifications.map(() => false))
    });
  }

  private initializePriceForm(): void {
    // Default price range: minimum 0 and maximum 100.
    this.stepFiveFormGroup = this.fb.group({
      minPrice: [0, [Validators.required, Validators.min(0)]],
      maxPrice: [100, [Validators.required, Validators.min(0)]]
    });
  }

  // Getter for instruments FormArray.
  get instrumentsArray(): FormArray {
    return this.stepTwoFormGroup.get('instruments') as FormArray;
  }

  // Getter for genres FormArray.
  get genresArray(): FormArray {
    return this.stepThreeFormGroup.get('genres') as FormArray;
  }

  // Getter for qualifications FormArray.
  get qualificationsArray(): FormArray {
    return this.stepFourFormGroup.get('qualifications') as FormArray;
  }

  // Compute selected instruments.
  get selectedInstruments() {
    return this.instruments.filter((_, index) => this.instrumentsArray.at(index).value);
  }

  // Compute selected genres.
  get selectedGenres() {
    return this.genres.filter((_, index) => this.genresArray.at(index).value);
  }

  // Compute selected qualifications.
  get selectedQualifications() {
    return this.qualifications.filter((_, index) => this.qualificationsArray.at(index).value);
  }

  onSubmitQuiz(): void {
    // Build criteria from all steps.
    const criteria: any = {
      lessonType: this.stepOneFormGroup.value.lessonType,
      instruments: this.selectedInstruments.map(inst => inst.id),
      genres: this.selectedGenres.map(genre => genre.id),
      qualifications: this.selectedQualifications.map(qual => qual.id),
      priceRange: {
        min: this.stepFiveFormGroup.value.minPrice,
        max: this.stepFiveFormGroup.value.maxPrice
      }
    };

    console.log('Quiz criteria:', criteria);
    // Use the criteria to perform your search, e.g.:
    // this.profileService.searchProfiles(criteria).subscribe(...);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
