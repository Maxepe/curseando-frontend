import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { CourseDetailDTO, Difficulty } from '../../models/course.model';
import { environment } from '../../../environments/environment';
import { EnrollmentFormComponent } from '../../components/enrollment-form/enrollment-form.component';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, EnrollmentFormComponent],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements OnInit {
  course: CourseDetailDTO | null = null;
  loading = true;
  error: string | null = null;
  courseId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.courseId = parseInt(id, 10);
        this.loadCourse(this.courseId);
      } else {
        this.error = 'Invalid course ID';
        this.loading = false;
      }
    });
  }

  loadCourse(id: number): void {
    this.loading = true;
    this.error = null;

    this.coursesService.getCourse(id).subscribe({
      next: (course) => {
        this.course = course;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load course details';
        this.loading = false;
        console.error('Error loading course:', err);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  retry(): void {
    if (this.courseId) {
      this.loadCourse(this.courseId);
    }
  }

  getDifficultyClass(difficulty: Difficulty): string {
    const classes: Record<Difficulty, string> = {
      [Difficulty.BEGINNER]: 'difficulty-beginner',
      [Difficulty.INTERMEDIATE]: 'difficulty-intermediate',
      [Difficulty.ADVANCED]: 'difficulty-advanced'
    };
    return classes[difficulty] || '';
  }

  isFull(): boolean {
    return this.course ? this.course.seatsLeft === 0 : false;
  }

  isLowSeats(): boolean {
    if (!this.course) return false;
    return this.course.seatsLeft <= this.course.capacity * 0.2 && this.course.seatsLeft > 0;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(environment.locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onEnrollmentSuccess(): void {
    if (this.courseId) {
      this.refreshCourseData(this.courseId);
    }
  }

  private refreshCourseData(id: number): void {
    this.coursesService.getCourse(id).subscribe({
      next: (course) => {
        this.course = course;
      },
      error: (err) => {
        console.error('Error refreshing course data:', err);
      }
    });
  }
}
