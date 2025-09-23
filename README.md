# Surgery Management System

A secure, modern web application for managing surgical schedules and patient information, built with Next.js, TypeScript, and PostgreSQL.

## 🏥 Features

- **Surgery Scheduling**: Schedule new surgeries with comprehensive patient and surgeon information
- **Patient Management**: Manage patient records including demographics and medical information
- **Real-time Updates**: Track surgery status from scheduled to completed
- **Role-based Access**: Support for Admin, Surgeon, and Staff roles
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Responsive Design**: Beautiful, mobile-friendly interface built with Tailwind CSS
- **Data Validation**: Comprehensive input validation and sanitization
- **Medical-grade Security**: Built with healthcare compliance and security in mind

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS, Headless UI, Lucide Icons
- **Validation**: Zod
- **Forms**: React Hook Form

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd surgery-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/surgery_management?schema=public"
   
   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with demo data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 Demo Accounts

The system comes with pre-configured demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | password123 |
| Surgeon | surgeon@hospital.com | password123 |
| Staff | staff@hospital.com | password123 |

## 🏗️ Project Structure

```
surgery-management/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Demo data seeding
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # Main dashboard
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   └── surgeries/        # Surgery-specific components
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prisma.ts         # Database client
│   │   ├── validations.ts    # Zod schemas
│   │   └── utils.ts          # Utility functions
│   └── types/
│       └── next-auth.d.ts    # TypeScript declarations
```

## 🔐 Security Features

- **Authentication**: Secure JWT-based authentication with NextAuth.js
- **Password Hashing**: bcrypt with salt rounds for password security
- **Input Validation**: Comprehensive validation using Zod schemas
- **Data Sanitization**: XSS prevention through input sanitization
- **Role-based Access**: Different access levels for Admin, Surgeon, and Staff
- **CSRF Protection**: Built-in CSRF protection via NextAuth.js
- **SQL Injection Prevention**: Prisma ORM prevents SQL injection attacks

## 📊 Database Schema

### Users
- Role-based access (Admin, Surgeon, Staff)
- Secure password storage
- Audit trail with timestamps

### Patients
- Comprehensive patient information
- Age calculation from birth date
- Contact information

### Surgeries
- Complete surgery scheduling
- Status tracking (Scheduled, In Progress, Completed, Cancelled, Postponed)
- Surgeon and patient associations
- Audit trail for scheduling

## 🎨 UI/UX Design

- **Modern Interface**: Clean, professional design suitable for healthcare
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessibility**: Built with accessibility best practices
- **Intuitive Navigation**: Easy-to-use interface for healthcare professionals
- **Status Indicators**: Clear visual indicators for surgery statuses
- **Form Validation**: Real-time validation with helpful error messages

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio

## 🚀 Deployment

### Option 1: Docker (Recommended)

The easiest way to deploy is using Docker:

```bash
# Clone the repository
git clone <your-repo-url>
cd surgery-management

# Start with Docker Compose (includes PostgreSQL)
docker-compose up -d

# Run database migrations and seed
docker-compose exec app npx prisma db push
docker-compose exec app npm run db:seed
```

The application will be available at `http://localhost:3000`

### Option 2: Manual Deployment

#### Database Setup
1. Set up a PostgreSQL database (recommended: Supabase, PlanetScale, or AWS RDS)
2. Update `DATABASE_URL` in your environment variables
3. Run migrations: `npm run db:push`
4. Seed demo data: `npm run db:seed`

#### Application Deployment
The application can be deployed to various platforms:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS (ECS/Fargate)**
- **Railway**
- **Render**

### Option 3: AWS ECS Deployment

For production AWS deployment:

1. **Build and push Docker image to ECR**
2. **Create ECS task definition**
3. **Set up RDS PostgreSQL instance**
4. **Configure environment variables**
5. **Deploy using ECS Fargate**

### Environment Variables
Ensure these environment variables are set in production:
- `DATABASE_URL`
- `NEXTAUTH_URL` 
- `NEXTAUTH_SECRET`

## 🧪 Testing

The application includes:
- Input validation testing
- API endpoint testing
- Component integration testing
- Security testing for authentication

## 📝 Implementation Notes

### Architecture Decisions

1. **Next.js Full-Stack**: Chosen for its excellent TypeScript support, API routes, and deployment simplicity
2. **PostgreSQL**: Selected for ACID compliance, complex queries, and healthcare data integrity requirements
3. **Prisma ORM**: Provides type safety, easy migrations, and excellent developer experience
4. **NextAuth.js**: Industry-standard authentication with built-in security features
5. **Tailwind CSS**: Enables rapid UI development with consistent design system

### Security Considerations

- All user inputs are validated and sanitized
- Passwords are hashed using bcrypt with appropriate salt rounds
- JWT tokens are used for session management
- Role-based access control is implemented
- Database queries use parameterized statements via Prisma

### Performance Optimizations

- Server-side rendering for initial page loads
- Optimistic updates for better user experience
- Efficient database queries with proper indexing
- Image optimization and lazy loading
- Bundle optimization and code splitting

### Scalability Considerations

- Stateless architecture for horizontal scaling
- Database connection pooling
- API rate limiting (can be implemented)
- Caching strategies for frequently accessed data
- Microservices-ready architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For technical issues or questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

---

Built with ❤️ for healthcare professionals