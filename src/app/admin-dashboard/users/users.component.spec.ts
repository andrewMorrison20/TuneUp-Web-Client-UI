import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ProfileService } from '../../profiles/profile.service';
import { AdminService } from '../admin.service';
import { StudentProfile } from '../../profiles/interfaces/student.model';
import {SharedModule} from "../../shared/shared.module";

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;

  const mockProfiles: StudentProfile[] = [
    {
      id: 1,
      appUserId: 101,
      profileType: 'STUDENT',
      displayName: 'John D',
      grades:[],
      reviews:[],
      bio: 'Piano enthusiast',
      averageRating: 4.8,
      lessonType: 'Online',
      instruments: [],
      genres: [],
      qualifications: [],
      tuitionRegion: { id: 1, name: 'London' },
      profilePicture: { id: 1, url: 'http://localhost/profile.png' },
      enrolledCourses: [],
      completedCourses: [],
      instrumentQuals: []
    }
  ];

  beforeEach(async () => {
    const profileSpy = jasmine.createSpyObj('ProfileService', ['getAllProfiles']);
    const adminSpy = jasmine.createSpyObj('AdminService', ['softDeleteUsers']);

    await TestBed.configureTestingModule({
      imports: [
        SharedModule,
        BrowserAnimationsModule
      ],
      declarations: [UsersComponent],
      providers: [
        { provide: ProfileService, useValue: profileSpy },
        { provide: AdminService, useValue: adminSpy }
      ]
    }).compileComponents();

    profileServiceSpy = TestBed.inject(ProfileService) as jasmine.SpyObj<ProfileService>;
    adminServiceSpy = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch profiles on init', fakeAsync(() => {
    profileServiceSpy.getAllProfiles.and.returnValue(of({ profiles: mockProfiles, totalElements: 1 }));
    fixture.detectChanges();
    tick();

    expect(component.dataSource.data.length).toBe(1);
    expect(component.totalElements).toBe(1);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle page change', fakeAsync(() => {
    profileServiceSpy.getAllProfiles.and.returnValue(of({ profiles: mockProfiles, totalElements: 1 }));

    fixture.detectChanges();
    tick();

    component.onPageChange({ pageIndex: 1, pageSize: 5, length: 10 });
    tick();

    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(5);
  }));

  it('should toggle a row in selectedProfiles', () => {
    component.selectedProfiles = [];
    component.toggleRow(mockProfiles[0]);
    expect(component.selectedProfiles).toContain(mockProfiles[0]);

    component.toggleRow(mockProfiles[0]);
    expect(component.selectedProfiles).not.toContain(mockProfiles[0]);
  });

  it('should toggle all rows', () => {
    component.profiles = [...mockProfiles];
    component.toggleAllRows();
    expect(component.selectedProfiles.length).toBe(mockProfiles.length);

    component.toggleAllRows();
    expect(component.selectedProfiles.length).toBe(0);
  });

  it('should confirm delete and refresh profiles', fakeAsync(() => {
    component.profiles = mockProfiles;
    component.selectedProfiles = [...mockProfiles];

    profileServiceSpy.getAllProfiles.and.returnValue(of({ profiles: [], totalElements: 0 }));
    adminServiceSpy.softDeleteUsers.and.returnValue(of(void 0));

    component.confirmDeleteUsers();
    tick(3000);

    expect(component.selectedProfiles.length).toBe(0);
    expect(component.dataSource.data.length).toBe(0);
  }));
});
