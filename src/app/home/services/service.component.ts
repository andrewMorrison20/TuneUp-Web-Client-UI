import { Component, OnInit } from '@angular/core';

interface Service {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  services: Service[] = [
    {
      icon: 'calendar_today',
      title: 'Integrated Booking System',
      description: 'Easily schedule lessons and manage appointments—all in one place.'
    },
    {
      icon: 'notifications_active',
      title: 'Instant Notifications',
      description: 'Receive real-time alerts for bookings, updates, and more.'
    },
    {
      icon: 'chat_bubble',
      title: 'Instant Chat Messenger',
      description: 'Connect instantly with tutors and students through our chat feature.'
    },
    {
      icon: 'search',
      title: 'Dynamic Search Ability',
      description: 'Quickly find the best tutors or courses with advanced search tools.'
    },
    {
      icon: 'autorenew',
      title: 'Automated Lesson Updates',
      description: 'Stay informed with automatic notifications on lesson changes.'
    },
    {
      icon: 'group',
      title: 'Tutor-Student Matching',
      description: 'Our smart algorithm pairs students with the ideal tutor for their needs.'
    },
    {
      icon: 'receipt_long',
      title: 'Invoicing Platform',
      description: 'Manage billing and invoices seamlessly for all your lessons.'
    },
    {
      icon: 'account_circle',
      title: 'Profiles',
      description: 'Comprehensive profiles for both students and tutors to showcase their expertise.'
    },
    {
      icon: 'dashboard',
      title: 'Tuition Dashboard',
      description: 'Track progress, analytics, and manage your tutoring business—all in one view.'
    }
  ];

  constructor() { }

  ngOnInit(): void {}
}
