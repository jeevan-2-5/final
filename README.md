
# 🏟️ Gamon Turf — Sports Facility Booking Platform

A web-based sports facility booking platform designed to simplify turf reservations, service selection, and booking management. The application provides a digital interface for customers to explore available sports facilities and submit bookings, while business administrators can manage booking-related information and facility settings.

**Live Demo:** https://gamonturff.vercel.app/  
**GitHub Repository:** https://github.com/jeevan-2-5/final

---

## 🚀 Overview

Traditional turf booking often involves manual communication, phone calls, and limited visibility into available time slots. This project aims to streamline the reservation process through a centralized web application backed by a structured database.

The application uses a modern frontend stack with Supabase for database and authentication integration, alongside Google Gemini API configuration for AI-related functionality.

## ✨ Key Capabilities

- **Sports Service Management:** Organize sports facilities and booking services, including football turf and cricket practice nets.
- **Online Booking:** Collect customer details, selected services, booking dates, time slots, and additional notes.
- **Booking Status Management:** Support booking statuses such as pending, confirmed, cancelled, and completed.
- **Business Hours Configuration:** Store operating days and opening and closing times.
- **Blocked Date Management:** Maintain dates on which bookings should not be available.
- **Facility Configuration:** Store turf contact information and booking rules, including slot intervals and advance-booking notice.
- **Administrative Access:** Integrate Supabase authentication with an admin-user mapping for privileged operations.
- **Responsive Web Interface:** Build the frontend using React, TypeScript, Tailwind CSS, and reusable UI components.

*Note: The capabilities listed above reflect the repository's configuration and database design. Actual UI workflows and production behavior should be verified against the implementation.*

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Component-based frontend development |
| TypeScript | Static typing and maintainable application code |
| Vite | Development server and production build tooling |
| Tailwind CSS 4 | Utility-first styling |
| Supabase | Database and authentication integration |
| PostgreSQL | Relational data storage through Supabase |
| Google Gemini API | AI integration capability |
| React Router | Client-side routing |
| Lucide React | Icon components |
| Motion | UI animation |
| date-fns | Date and time utilities |
| Vercel | Application deployment |

## 🏗️ Architecture

The application follows a frontend-oriented architecture integrated with cloud services.

```text
                 Customer / Admin
                        |
                        v
              React + TypeScript UI
                        |
              React Router / Components
                        |
             Application Logic & State
                        |
             +----------+----------+
             |                     |
             v                     v
       Supabase Client       Google Gemini API
             |
             v
       Supabase Services
             |
             v
        PostgreSQL DB
```

The diagram represents the intended integration based on the repository dependencies and environment configuration. Actual request flows depend on the application implementation.

## 🗄️ Database Design

The `supabase_schema.sql` file defines the following core tables:

| Table | Responsibility |
|---|---|
| `services` | Stores facility services, descriptions, duration, pricing, and active status |
| `bookings` | Stores customer information, selected service, date, time, notes, and booking status |
| `business_hours` | Defines operating schedules by weekday |
| `blocked_dates` | Records dates when bookings are unavailable |
| `turf_settings` | Stores facility details and booking configuration |
| `admin_users` | Maps authenticated Supabase users to administrator access |

### Database Relationships

- Each booking references a service through `service_id`.
- The `admin_users` table references Supabase authentication users.
- UUIDs serve as primary identifiers for the main records.
- Booking statuses are constrained to predefined values.
- PostgreSQL Row Level Security (RLS) is enabled on the defined tables.

**Security consideration:** Review the existing RLS policies before production use. In particular, the current schema allows anonymous users to read booking records and insert bookings. Customer contact information should not be publicly readable. The schema also contains `DROP TABLE ... CASCADE` statements, so apply it only to a suitable development database or after carefully reviewing the impact.

## 📂 Repository Structure

```text
final/
├── public/               # Public static assets
├── src/                  # Application source code
├── .env.example          # Environment variable template
├── .gitignore            # Git ignore rules
├── index.html            # HTML entry point
├── metadata.json         # Application metadata
├── package.json          # Dependencies and npm scripts
├── supabase_schema.sql   # Database schema and RLS policies
├── tsconfig.json         # TypeScript configuration
├── vercel.json           # Vercel deployment configuration
└── vite.config.ts        # Vite configuration
```

## ⚙️ Getting Started

### Prerequisites

Install the following before running the application:

- Node.js and npm
- Git
- A Supabase project
- A Google Gemini API key if the application uses Gemini features

### 1. Clone the Repository

```bash
git clone https://github.com/jeevan-2-5/final.git
cd final
```

### 2. Install Dependencies

```bash
npm install
```


### 4. Configure the Database

1. Open your Supabase project.
2. Navigate to the SQL Editor.
3. Review `supabase_schema.sql`.
4. Apply the schema to a fresh development database, accounting for its destructive table-drop statements.
5. Verify the RLS policies and administrator setup before enabling public access.

### 5. Start the Development Server

```bash
npm run dev
```

Open the local URL printed by Vite. The repository's development script is configured to use port `3000`.

### 6. Build for Production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

To check TypeScript errors:

```bash
npm run lint
```

## 🌐 Deployment

The project includes a `vercel.json` configuration file and is deployed at:

**Live application:** https://gamonturff.vercel.app/

For a new deployment:

1. Import the GitHub repository into Vercel.
2. Configure the required environment variables in the Vercel project settings.
3. Ensure the build command is `npm run build`.
4. Configure the correct output directory for Vite (`dist`) if it is not already detected.
5. Deploy and verify the frontend, database connection, authentication, and booking workflows.

## 🔒 Security Considerations

- Enforce Row Level Security on all tables containing customer or administrative data.
- Restrict booking records to authorized users and administrators.
- Validate all booking dates, time slots, service IDs, and customer inputs.
- Prevent duplicate or overlapping reservations using appropriate server-side validation and database constraints.
- Keep privileged API keys on trusted server-side infrastructure.
- Configure administrator permissions securely and avoid relying solely on frontend checks.
- Review CORS, authentication, and deployment settings before production release.

## 🛣️ Potential Future Improvements

- Real-time availability updates.
- Transaction-safe booking and conflict prevention.
- Online payment integration.
- Booking confirmation emails and SMS notifications.
- Customer booking history and cancellation workflows.
- Administrative analytics and revenue dashboards.
- Automated tests for booking validation, authorization, and database operations.

## 👨‍💻 Author

**Jeevan N**

- GitHub: [@jeevan-2-5](https://github.com/jeevan-2-5)
- Project: [Gamon Turf Booking Platform](https://github.com/jeevan-2-5/final)

---

*Built with React, TypeScript, Supabase, and modern web technologies.*
