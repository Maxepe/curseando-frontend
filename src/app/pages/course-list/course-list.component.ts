import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { CourseCardDTO, Difficulty } from '../../models/course.model';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css'
})
export class CourseListComponent implements OnInit {
  courses: CourseCardDTO[] = [];
  filteredCourses: CourseCardDTO[] = [];
  loading = true;
  error: string | null = null;
  selectedDifficulty = 'ALL';

  // Difficulty options for the filter dropdown
  difficulties = [
    { value: 'ALL', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' }
  ];

  constructor(
    private coursesService: CoursesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  /**
   * Load courses from the API
   */
  loadCourses(): void {
    this.loading = true;
    this.error = null;

    this.coursesService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.filteredCourses = courses;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load courses';
        this.loading = false;
        console.error('Error loading courses:', err);
      }
    });
  }

  /**
   * Filter courses by difficulty
   * @param difficulty Selected difficulty level
   */
  onFilterChange(difficulty: string): void {
    this.selectedDifficulty = difficulty;

    if (difficulty === 'ALL') {
      this.filteredCourses = this.courses;
    } else {
      this.filteredCourses = this.courses.filter(
        course => course.difficulty === difficulty
      );
    }
  }

  /**
   * Navigate to course detail page
   * @param courseId Course ID
   */
  viewCourse(courseId: number): void {
    this.router.navigate(['/courses', courseId]);
  }

  /**
   * Get badge CSS class based on difficulty
   * @param difficulty Course difficulty
   * @returns CSS class name
   */
  getDifficultyClass(difficulty: Difficulty): string {
    const classes: Record<Difficulty, string> = {
      [Difficulty.BEGINNER]: 'difficulty-beginner',
      [Difficulty.INTERMEDIATE]: 'difficulty-intermediate',
      [Difficulty.ADVANCED]: 'difficulty-advanced'
    };
    return classes[difficulty] || '';
  }

  /**
   * Get seats availability status
   * @param seatsLeft Number of seats remaining
   * @param capacity Total capacity
   * @returns Status object with message and CSS class
   */
  getSeatsStatus(seatsLeft: number, capacity: number): { message: string; class: string } {
    if (seatsLeft === 0) {
      return { message: 'Full', class: 'seats-full' };
    } else if (seatsLeft <= capacity * 0.2) {
      return { message: `Only ${seatsLeft} seats left`, class: 'seats-low' };
    } else {
      return { message: `${seatsLeft} seats available`, class: 'seats-available' };
    }
  }
}
