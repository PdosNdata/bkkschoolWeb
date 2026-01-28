# BKK Book System - AI Assistant Guidelines

## Project Overview

**BKK Book System** (ระบบสั่งหนังสือเรียน) is a textbook ordering and budget management system for Ban Khor Don Kaen School (โรงเรียนบ้านค้อดอนแคน). The application is primarily in **Thai language**.

### Key Features
- Budget management for textbooks by academic year, grade level, and education level
- Order tracking and management
- Role-based access control (admin, teacher, staff, warehouse)
- Dashboard with analytics and reporting
- PDF export functionality

## Tech Stack

### Backend (`/backend`)
- **Runtime**: Bun
- **Framework**: Elysia (Bun-first web framework)
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **Port**: 3000

### Frontend (`/frontend`)
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Charts**: Chart.js + react-chartjs-2
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PDF Export**: jsPDF + html2canvas
- **Database Client**: @supabase/supabase-js

## Project Structure

```
bkkbooksystem/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Elysia app configuration
│   │   ├── index.ts            # Entry point
│   │   ├── controllers/        # Request handlers (Express-style, legacy)
│   │   ├── routes/             # Elysia route definitions
│   │   ├── services/           # Business logic
│   │   ├── types/              # TypeScript type definitions
│   │   └── db/
│   │       └── supabase.ts     # Supabase client
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx            # React entry point
│   │   ├── App.jsx             # Root component with routing
│   │   ├── index.css           # Global styles + Tailwind
│   │   ├── components/         # Reusable UI components
│   │   │   ├── dashboard/      # Dashboard-specific components
│   │   │   ├── landing/        # Landing page components
│   │   │   ├── sidebar/        # Sidebar components
│   │   │   └── topbar/         # Top navigation components
│   │   ├── config/
│   │   │   └── menuConfig.js   # Role-based menu configuration
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── layouts/            # Page layout wrappers
│   │   ├── lib/
│   │   │   └── supabase.js     # Supabase client
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── dashboard/      # Dashboard pages
│   │   │   └── public/         # Public pages (login, landing)
│   │   ├── routes/             # Route protection
│   │   ├── services/           # API service functions
│   │   └── utils/              # Utility functions
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── CLAUDE.md
```

## Development Commands

### Backend
```bash
cd backend
bun install          # Install dependencies
bun run src/index.ts # Start development server
```

### Frontend
```bash
cd frontend
bun install    # Install dependencies (or npm install)
bun run dev    # Start Vite dev server
bun run build  # Build for production
bun run preview # Preview production build
```

## Architecture Patterns

### Backend Architecture
The backend follows a **Route → Service → Database** pattern with Elysia:

1. **Routes** (`routes/*.route.ts`): Define endpoints with request validation using Elysia's type system
2. **Services** (`services/*.service.ts`): Business logic and database operations
3. **Types** (`types/*.ts`): TypeScript interfaces and type definitions
4. **DB** (`db/supabase.ts`): Supabase client initialization

Note: There's a legacy `controllers/` folder with Express-style handlers that is not actively used.

### Frontend Architecture
The frontend follows a standard React architecture with:

1. **Context-based state management** via `AuthContext`
2. **Role-based routing** with protected routes
3. **Layout components** for consistent page structure
4. **Service layer** for API interactions

## Key Conventions

### TypeScript/JavaScript
- Use ES modules (`import`/`export`)
- Backend uses TypeScript strict mode
- Frontend uses JSX with `.jsx` extension

### Styling
- Use Tailwind CSS utility classes
- Custom component classes defined in `index.css` under `@layer components`
- Primary color: Blue (`blue-600` / `#2563eb`)
- Secondary color: Green (`green-600`)
- Danger color: Red (`red-600`)
- Font: Sarabun (Thai-optimized Google Font)

### Pre-defined CSS Classes
```css
.btn-primary    /* Blue primary button */
.btn-secondary  /* Green secondary button */
.btn-danger     /* Red danger button */
.btn-warning    /* Yellow warning button */
.btn-outline    /* Outlined button */
.input-field    /* Standard input styling */
.card           /* White card with shadow */
.table          /* Styled table with blue header */
.badge          /* Small status badge */
```

### Path Aliases
- Frontend uses `@/` alias pointing to `src/` (configured in vite.config.js)
  - Example: `import AdminSidebar from '@/components/sidebar/AdminSidebar'`

### API Communication
- Frontend API base URL: `VITE_API_URL` env var (default: `http://localhost:5000/api`)
- JWT tokens stored in localStorage
- Axios interceptors handle auth headers and 401 responses

### Authentication
- JWT-based authentication
- Token stored in `localStorage` as `token`
- User data stored in `localStorage` as `user`
- `useAuth()` hook provides `user`, `login`, `logout`, `loading`, `isAuthenticated`

### User Roles
- `admin`: Full system access
- `teacher`: Class book management
- `staff`: Order management
- `warehouse`: Inventory management

### Database Schema (Supabase)
Key tables:
- `budgets`: Budget allocations by year, level, grade, amount

Grade levels:
- Kindergarten: `kg2`, `kg3`
- Primary: `p1` through `p6`
- Secondary: `m1` through `m3`

Education levels: `kindergarten`, `primary`, `secondary`

## Environment Variables

### Backend
```
SUPABASE_URL=<supabase-project-url>
SUPABASE_SERVICE_KEY=<supabase-service-key>
```

### Frontend
```
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
VITE_API_URL=<backend-api-url>
```

## Language Considerations

The application UI is primarily in **Thai**. When working on this codebase:
- Keep user-facing text in Thai
- Use Thai comments when clarifying Thai-specific logic
- English is acceptable for code comments explaining technical concepts
- Variable and function names should remain in English

### Common Thai Terms
- งบประมาณ (ngop pra maan) = Budget
- หนังสือเรียน (nang sue rian) = Textbooks
- คำสั่งซื้อ (kham sang sue) = Order
- นักเรียน (nak rian) = Student
- ครู (khru) = Teacher
- ระดับชั้น (ra dap chan) = Grade level

## Common Tasks

### Adding a New API Endpoint (Backend)
1. Define types in `src/types/`
2. Create service function in `src/services/`
3. Add route in `src/routes/` using Elysia

### Adding a New Page (Frontend)
1. Create page component in `src/pages/`
2. Add route in `App.jsx`
3. Update `menuConfig.js` if adding to navigation
4. Create layout wrapper if needed

### Adding a New Component
1. Create in `src/components/` with appropriate subfolder
2. Use Tailwind classes or pre-defined component classes
3. Keep components focused and reusable

## Testing

No test framework is currently configured. When adding tests:
- Consider Bun's built-in test runner for backend
- Consider Vitest for frontend (Vite-native)

## Notes for AI Assistants

1. **Always check existing patterns** before creating new code
2. **Maintain Thai language** for user-facing strings
3. **Use Tailwind utility classes** consistently
4. **Follow the established folder structure**
5. **Use the `@/` path alias** for frontend imports
6. **Validate inputs** using Elysia's type system (backend)
7. **Handle errors gracefully** with Thai error messages for users
8. **Keep components small** and focused on single responsibilities
