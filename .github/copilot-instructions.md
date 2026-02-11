# AI Agent Instructions for Index Card System

## Project Overview
This is a full-stack index card management system with a React frontend and Node.js/Express backend. Users can create, edit, and organize draggable index cards on a canvas, with an integrated chat interface for AI assistance.

## Architecture
- **Frontend** (`Indexcardsystemdesign/`): React + TypeScript + Vite + Tailwind CSS + shadcn/ui components
- **Backend** (`nodecardserver/`): Express.js + Prisma ORM + SQLite database
- **Communication**: REST API with axios, proxied through Vite dev server

## Key Components & Data Flow
- **Cards**: Draggable/resizable index cards with title, content, position, and size
- **Messages**: Chat history with user/assistant roles
- **Linking**: Cards can reference messages via `messageId`
- **UI Updates**: Optimistic updates with debounced API calls (100ms) for content changes

## Development Workflows
### Frontend Development
```bash
cd Indexcardsystemdesign
npm install
npm run dev  # Starts Vite dev server with API proxy to localhost:3000
```

### Backend Development
```bash
cd nodecardserver
npm install
npx prisma migrate dev --name <migration_name>  # Apply DB schema changes
npx prisma generate  # Regenerate Prisma client
npm run dev  # Starts Express server with nodemon
```

### Database Management
- Schema: `nodecardserver/prisma/schema.prisma`
- Migrations: `nodecardserver/prisma/migrations/`
- Reset DB: `npx prisma migrate reset --force` (dev only)

## API Patterns
### Card Operations
- **Base URL**: `/api/cards`
- **CRUD**: Standard REST endpoints
- **Special**: `PATCH /cards/:id/move`, `PATCH /cards/:id/resize`, `PATCH /cards/:id/content`, `PATCH /cards/:id/title`
- **Data Mapping**: Use `cardMapper.js` to convert between Prisma DB format and frontend Card interface

### Message Operations
- **Base URL**: `/api/messages`
- **Auto-response**: POST creates user message and generates assistant response
- **Format**: `{ role: 'user'|'assistant', content: string }`

## Frontend Patterns
### State Management
- Cards stored in App component state, synced with backend
- Optimistic updates: UI updates immediately, API calls in background
- Error handling: Console errors, no user-facing error states yet

### Drag & Drop
- Uses `react-dnd` with HTML5 backend
- Card type: `'CARD'`
- Drop zones: CardWorkspace accepts card drops for repositioning

### Component Structure
- **App**: Main orchestrator, manages card state and API calls
- **CardWorkspace**: Drop zone container for cards
- **IndexCard**: Individual card with drag handle, resize, inline editing
- **ChatInterface**: Message display and input, can create cards from messages

### Styling
- Tailwind CSS with custom theme
- shadcn/ui components for consistent design
- Responsive layout: Workspace expands/contracts with chat

## Backend Patterns
### Data Transformation
- `cardMapper.js`: Converts between DB (posX/posY) and app (position: {x,y}) formats
- IDs: String in frontend, Int in DB (Prisma handles conversion)

### Error Handling
- Basic try/catch, returns JSON errors
- Validation: Type checks for position/size updates

## Common Tasks
### Adding New Card Features
1. Update `src/types/index.ts` Card interface
2. Add API endpoint in `server.js`
3. Update `cardMapper.js` if needed
4. Add service method in `cardService.ts`
5. Update App component handlers
6. Modify IndexCard component

### Database Schema Changes
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Update `cardMapper.js` and types if needed
4. Regenerate client: `npx prisma generate`

### UI Component Additions
- Use shadcn/ui components from `src/app/components/ui/`
- Follow existing patterns: controlled inputs, event handlers
- Add to component exports in `src/app/components/index.ts` if needed

## File Organization
- **Frontend services**: `src/services/` - API abstraction
- **Types**: `src/types/index.ts` - Shared interfaces
- **Hooks**: `src/hooks/` - Custom React hooks (e.g., useDebounce)
- **UI Components**: `src/app/components/ui/` - Reusable shadcn components
- **App Components**: `src/app/components/` - Feature-specific components

## Deployment Notes
- Frontend builds with `npm run build` (Vite)
- Backend runs with `npm start` (production) or `npm run dev` (development)
- Database: SQLite file `prisma/dev.db` (dev) or environment-configured (prod)