# Curseando – Frontend

## Descripción General
- **Stack**: Angular 20 (standalone), TypeScript, HTML/CSS.
- **Objetivo**: Catálogo de cursos con detalle e inscripción. Permite filtrar por dificultad, paginar/“cargar más”, ver detalle y enviar inscripción.
- **Producción**: Vercel – URL actual: https://curseando.vercel.app

## Requisitos Previos
- Node.js 24.x
- npm 10+
- Angular CLI 20 (`npm i -g @angular/cli@20`)

## Configuración de Entorno
- Archivo de desarrollo: `src/environments/environment.ts`
- Archivo de producción: `src/environments/environment.production.ts`
- Claves actuales:
  - `apiUrl`: Base URL del backend. Ej: `http://localhost:8080/api/v1` (dev) y CloudFront (prod)
  - `locale`: `es-AR`
  - `toast.timeout`: milisegundos para autodescartar toasts

## Desarrollo - ¿Cómo iniciar el proyecto localmente?
1. Instalar dependencias:
   ```bash
   npm ci
   # o
   npm install
   ```
2. Levantar app:
   ```bash
   ng serve
   ```
3. Abrir en: http://localhost:4200

Sugerencias:
- Asegurá que el backend corra en el puerto configurado en `environment.ts`.

## Despliegue Manual - ¿Cómo despliego una nueva versión?
<!-- Despliegue automatizado on push pendiente de implementar -->
Requisitos: tener instalado Vercel CLI (`npm i -g vercel`) y sesión iniciada (`vercel login`).

1. Compilar en modo producción (opcional, Vercel puede construir por ti):
   ```bash
   ng build --configuration production
   ```
2. Desplegar (desde la raíz del proyecto frontend):
   ```bash
   vercel --prod
   ```
3. Actualizar la app: vuelve a ejecutar `vercel --prod` tras tus cambios.
4. Variables de entorno: Para este proyecto no configuramos variables de entorno porque las tenemos directamente versionadas en los archivos environment (`environment.production.ts`).


## Arquitectura y Consideraciones de Diseño
- **Angular standalone**: componentes sin módulos, imports a nivel de componente.
- **Paginación**: backend devuelve `Page`. En UI se soporta “Cargar más” y estados `loading`/`loadingMore`/`error`.
- **Filtro por dificultad**: valores en inglés (enum `Difficulty`) y etiquetas en español mediante map de traducciones.
- **Manejo de errores**: para `CoursesService` y `EnrollmentService`.
- **Toasts**: `ToastService` + `toast.component` para feedback de éxito/error no intrusivo.
- **Responsive**: grid adaptable a mobile y elementos sticky (filtro bajo el header).

## Estructura del Proyecto
```
src/
  app/
    components/
      enrollment-form/
      toast/
    pages/
      course-list/
      course-detail/
    models/
    services/
  environments/
    environment.ts          # Dev
    environment.production.ts  # Prod
  styles.css
```

## API que se consumen:
- `GET /api/v1/courses`
  - Query params: `difficulty?`, `page=0`, `size=10`
- `GET /api/v1/courses/{id}` → detalles del curso
- `POST /api/v1/enrollments` → inscripción

## Scripts útiles
- Desarrollo: `ng serve`
- Build prod: `ng build --configuration production`
- Tests: `ng test`
