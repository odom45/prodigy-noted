# Prodigy Noted - Music Battle Platform

## Overview

Prodigy Noted is a music discovery platform where artists compete in music battles and listeners vote to determine winners. The platform operates on a subscription model with role-based access: listeners can vote for free, while participants pay to submit music entries. The application features real-time voting, leaderboards, referral systems, and admin controls for content moderation.

Built as a full-stack TypeScript application using React with Vite on the frontend and Express.js on the backend, the platform integrates with Stripe for payments and uses Drizzle ORM with PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses React 18 with TypeScript, built via Vite for fast development and optimized production builds. The UI is built with shadcn/ui components on top of Radix UI primitives, styled with Tailwind CSS using a dark theme with neon accent colors (cyan, magenta, purple). The application uses Wouter for client-side routing and TanStack Query for server state management and API communication.

Key frontend patterns include:
- Component-based architecture with reusable UI components
- Custom hooks for authentication state and data fetching
- Responsive design with mobile-first approach
- Real-time updates through polling-based queries

### Backend Architecture
The server runs on Express.js with TypeScript, following a REST API design pattern. The application uses a session-based authentication system integrated with Replit's OpenID Connect for user management. Database operations are handled through Drizzle ORM, providing type-safe database queries and migrations.

Core backend components:
- Express middleware for authentication and role-based access control
- Storage abstraction layer for database operations
- Stripe integration for subscription and payment processing
- Role-based permissions (admin, participant, listener)

### Database Design
PostgreSQL database with Drizzle ORM manages:
- User accounts with role-based permissions and subscription status
- Music battles organized by genres with time-based contests
- Track submissions linked to battles and users
- Voting system with referential integrity
- Referral tracking for trial account activation
- Content rating system for age-appropriate moderation

### Authentication & Authorization
The platform uses Replit's OpenID Connect for user authentication, storing user sessions in PostgreSQL. Authorization is role-based with three tiers:
- **Listeners**: Free accounts that can vote on battles
- **Participants**: Paid subscribers who can submit tracks to battles
- **Admins**: Full platform management capabilities

Trial accounts are granted through social media referral verification, converting listeners to temporary participants.

### Payment Processing
Stripe integration handles subscription payments and trial management:
- Secure payment processing with Stripe Elements
- Webhook endpoints for payment confirmation
- Automatic subscription status updates
- Customer and subscription management

## External Dependencies

### Payment Services
- **Stripe**: Payment processing, subscription management, and customer billing
- **Stripe React**: Frontend payment form components and secure card handling

### Database & ORM
- **Neon Database**: Serverless PostgreSQL hosting via `@neondatabase/serverless`
- **Drizzle ORM**: Type-safe database operations and schema management
- **connect-pg-simple**: PostgreSQL session storage for Express sessions

### Authentication
- **OpenID Client**: Integration with Replit's authentication system
- **Passport.js**: Authentication middleware and session management

### UI & Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first styling framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast development server and optimized production builds
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundling for production deployment