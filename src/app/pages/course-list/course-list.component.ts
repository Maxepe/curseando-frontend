import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { CourseCardDTO, Difficulty, DIFFICULTY_TRANSLATIONS } from '../../models/course.model';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css'
})
export class CourseListComponent implements OnInit {
  filteredCourses: CourseCardDTO[] = [];
  loading = true;
  error: string | null = null;
  selectedDifficulty = 'ALL';
  Difficulty = Difficulty;
  isLastPage = false;
  loadingMore = false;
  difficulties = [
    { value: 'ALL', label: 'Todos los niveles' },
    { value: Difficulty.BEGINNER, label: DIFFICULTY_TRANSLATIONS[Difficulty.BEGINNER] },
    { value: Difficulty.INTERMEDIATE, label: DIFFICULTY_TRANSLATIONS[Difficulty.INTERMEDIATE] },
    { value: Difficulty.ADVANCED, label: DIFFICULTY_TRANSLATIONS[Difficulty.ADVANCED] }
  ];
  private currentPage = 0;
  private pageSize = 10;

  constructor(
    private coursesService: CoursesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = null;
    this.currentPage = 0;
    this.isLastPage = false;

    this.coursesService.getCourses(this.selectedDifficulty, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.filteredCourses = response.content;
        this.isLastPage = response.last;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        console.error('Error loading courses:', error);
      }
    });
  }

  loadMoreCourses(): void {
    if (this.loadingMore || this.isLastPage) return;

    this.loadingMore = true;
    this.currentPage++;

    this.coursesService.getCourses(this.selectedDifficulty, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.filteredCourses = [...this.filteredCourses, ...response.content];
        this.isLastPage = response.last;
        this.loadingMore = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loadingMore = false;
        this.currentPage--;
        console.error('Error loading more courses:', error);
      }
    });
  }

  onFilterChange(difficulty: string): void {
    this.selectedDifficulty = difficulty;
    this.loadCourses();
  }

  viewCourse(courseId: number): void {
    this.router.navigate(['/courses', courseId]);
  }

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
      return { message: 'Completo', class: 'seats-full' };
    } else if (seatsLeft <= capacity * 0.2) {
      return { message: `Solo ${seatsLeft} cupos restantes`, class: 'seats-low' };
    } else {
      return { message: `${seatsLeft} cupos disponibles`, class: 'seats-available' };
    }
  }

  getDifficultyLabel(difficulty: Difficulty): string {
    return DIFFICULTY_TRANSLATIONS[difficulty];
  }
}
