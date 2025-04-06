import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService } from '../../profiles/profile.service';
import { TutorProfile } from '../../profiles/interfaces/tutor.model';
import { StudentProfile } from '../../profiles/interfaces/student.model';

type Profile = TutorProfile | StudentProfile;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit {
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  displayedColumns: string[] = ['name', 'profileType', 'actions'];
  dataSource = new MatTableDataSource<Profile>([]);
  profiles: Profile[] = [];
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private snackBar: MatSnackBar,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.fetchProfiles();
  }

  ngAfterViewInit(): void {
    // Assign paginator and sort to the data source after view init
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fetchProfiles(): void {
    this.isLoading = true;
    this.profileService.getAllProfiles(this.pageIndex, this.pageSize)
      .subscribe({
        next: (response) => {
          this.profiles = response.profiles;
          this.totalElements = response.totalElements; // Update total elements for paginator
          this.dataSource.data = this.profiles;
          // Reassign paginator to ensure updates after each fetch
          this.dataSource.paginator = this.paginator;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching profiles:', error);
          this.isLoading = false;
          this.snackBar.open('Error fetching profiles', 'Close', { duration: 3000 });
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchProfiles();
  }

  sendMessage(profile: Profile): void {
    console.log('Send message to profile:', profile);
    // Implement your send message logic here.
  }

  viewProfile(profile: Profile): void {
    console.log('View profile:', profile);
    // Implement your view profile logic here.
  }
}
