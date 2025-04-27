import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizComponent } from './quiz.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ProfileService } from '../../profiles/profile.service';
import { SharedDataService } from '../../components/shared-data-service.component';
import {SharedModule} from "../../shared/shared.module";
import {HomeModule} from "../home.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('QuizComponent', () => {
  let component: QuizComponent;
  let fixture: ComponentFixture<QuizComponent>;
  let mockProfileService: any;
  let mockSharedDataService: any;

  const mockInstruments = [{ id: 1, name: 'Guitar' }];
  const mockGenres = [{ id: 2, name: 'Jazz' }];
  const mockQualifications = [{ id: 3, name: 'Diploma' }];
  const mockProfilesResponse = { profiles: [{ name: 'John' }] };
  const mockRegion = { id: 99, name: 'London' };

  beforeEach(async () => {
    mockProfileService = {
      getFilteredProfiles: jasmine.createSpy().and.returnValue(of(mockProfilesResponse))
    };

    mockSharedDataService = {
      loadInstruments: jasmine.createSpy(),
      loadGenres: jasmine.createSpy(),
      loadQualifications: jasmine.createSpy(),
      searchRegions: jasmine.createSpy(),
      selectRegion: jasmine.createSpy(),
      instruments$: of(mockInstruments),
      genres$: of(mockGenres),
      qualifications$: of(mockQualifications),
      regions$: of([mockRegion])
    };

    await TestBed.configureTestingModule({
      imports: [HomeModule, NoopAnimationsModule],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        { provide: SharedDataService, useValue: mockSharedDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize instruments, genres, qualifications', () => {
    expect(component.instruments.length).toBe(1);
    expect(component.genres.length).toBe(1);
    expect(component.qualifications.length).toBe(1);
  });

  it('should submit quiz with populated values', () => {
    component.stepZeroFormGroup.patchValue({ profileType: { id: 1 } });
    component.stepOneFormGroup.patchValue({ lessonType: { id: 2 } });

    component.instrumentsArray.at(0).setValue(true);
    component.genresArray.at(0).setValue(true);
    component.qualificationsArray.at(0).setValue(true);

    component.stepFiveFormGroup.patchValue({ minPrice: 10, maxPrice: 90 });
    component.selectedRegion = mockRegion;

    component.onSubmitQuiz();

    expect(mockProfileService.getFilteredProfiles).toHaveBeenCalledWith(
      jasmine.objectContaining({
        profileType: 1,
        lessonType: [2],
        instruments: [1],
        genres: [2],
        qualifications: [3],
        priceRange: [10, 90],
        regionId: 99
      }),
      0, 3, 'averageRating,desc'
    );
    expect(component.profiles.length).toBe(1);
  });

  it('should fallback to null values if nothing selected', () => {
    component.stepZeroFormGroup.patchValue({ profileType: null });
    component.stepOneFormGroup.patchValue({ lessonType: null });

    component.stepFiveFormGroup.patchValue({ minPrice: 0, maxPrice: 100 });

    component.onSubmitQuiz();

    const callArg = mockProfileService.getFilteredProfiles.calls.mostRecent().args[0];
    expect(callArg.profileType).toBeNull();
    expect(callArg.lessonType).toBeNull();
    expect(callArg.instruments).toBeNull();
    expect(callArg.genres).toBeNull();
    expect(callArg.qualifications).toBeNull();
    expect(callArg.priceRange).toBeNull();
  });

  it('should call searchRegions on user input', () => {
    const event = {
      target: { value: 'Lon' }
    } as unknown as Event;

    component.onRegionSearch(event);
    expect(mockSharedDataService.searchRegions).toHaveBeenCalledWith('Lon');
  });

  it('should select region and notify shared data', () => {
    component.selectRegion(mockRegion);
    expect(component.selectedRegion).toBe(mockRegion);
    expect(mockSharedDataService.selectRegion).toHaveBeenCalledWith(mockRegion);
  });

  it('should clear selected region', () => {
    component.selectedRegion = mockRegion;
    component.clearSelection();
    expect(component.selectedRegion).toBeNull();
  });

  it('should unsubscribe on destroy', () => {
    const subSpy = spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(subSpy).toHaveBeenCalled();
  });
});
