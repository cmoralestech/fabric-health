# Surgery Management System

A secure, modern web application for managing surgical schedules and patient information, built with Next.js, TypeScript, and MongoDB.

## 📋 **ASSESSMENT NOTE**

**⚠️ This is a demonstration/assessment project configured for team review.**

**Security settings have been relaxed for testing purposes:**
- Login rate limits increased to 20 attempts per 15 minutes (production: 5 attempts)
- API rate limits increased for easier testing
- All changes are clearly documented with `ASSESSMENT MODE` comments in the code

**For production deployment, see `SECURITY.md` for proper security configuration.**

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
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS, Headless UI, Lucide Icons
- **Validation**: Zod
- **Forms**: React Hook Form

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (free tier available at [https://www.mongodb.com/products/platform](https://www.mongodb.com/products/platform))
- npm or yarn

## 🛠️ Installation & Setup

> **📝 Assessment Note**: For assessment purposes, the `.env` and `.env.local` files are included in this repository with pre-configured settings. In a production environment, these files should NEVER be committed to version control and should be added to `.gitignore`.

### 🚀 Quick Start Guide

#### For Assessment/Demo:
1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd surgery-management
   npm install
   ```

2. **Set up your MongoDB Atlas database**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/products/platform)
   - Create a new cluster (M0 free tier)
   - Get your connection string and update `.env.local`:
   ```bash
   DATABASE_URL="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/surgery-management?retryWrites=true&w=majority"
   ```

3. **Initialize the database and start**
   ```bash
   npm run db:push    # Set up database schema
   npm run db:seed    # Add demo data
   npm run dev        # Start the application
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 📋 Detailed Setup Instructions

<details>
<summary>Click to expand detailed setup guide</summary>

#### Step 1: Clone and Install Dependencies
```bash
git clone <your-repo-url>
cd surgery-management
npm install
```

#### Step 2: MongoDB Atlas Setup
1. **Create Account**: Visit [MongoDB Atlas](https://www.mongodb.com/products/platform)
2. **Create Cluster**: 
   - Choose "Build a Database"
   - Select "M0 Sandbox" (Free tier)
   - Choose your preferred cloud provider and region
3. **Database Access**:
   - Go to "Database Access" → "Add New Database User"
   - Create username/password (save these!)
   - Grant "Read and write to any database" permissions
4. **Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - Add your current IP or "0.0.0.0/0" for testing (not recommended for production)
5. **Get Connection String**:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

#### Step 3: Configure Environment Variables
Create or update `.env.local` file:
```bash
DATABASE_URL="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/surgery-management?retryWrites=true&w=majority"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-jwt-key-change-this-in-production-at-least-32-chars-long"
NODE_ENV="development"
```

#### Step 4: Initialize Database
```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Create database schema
npm run db:seed      # Add demo data (users, patients, surgeries)
```

#### Step 5: Start Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

#### Troubleshooting Common Issues
- **Database Connection Error**: Verify your MongoDB Atlas connection string and ensure your IP is whitelisted
- **Prisma Generate Error**: Run `npm run db:generate` if you see Prisma client errors
- **Port 3000 in use**: Change the port with `npm run dev -- -p 3001`
- **Environment Variables**: Ensure `.env.local` exists and has the correct DATABASE_URL

</details>

## 🔧 Environment Files for Assessment

**Important Note**: For this assessment, example environment files are provided to demonstrate the required configuration. In a real production environment, these files should:

1. **Never be committed to version control**
2. **Be added to `.gitignore`**
3. **Contain actual secrets and sensitive data**
4. **Be managed through secure deployment pipelines**

### Example .env.local content:
```bash
# Surgery Management System - Development Configuration
# NOTE: This file is included for assessment purposes only.
# In production, these files should NEVER be committed to version control.

# Database Configuration - MongoDB Atlas
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/surgery-management?retryWrites=true&w=majority"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-jwt-key-change-this-in-production-at-least-32-chars-long"

# Application Environment
NODE_ENV="development"
```

### Production Environment Variables:
For production deployment, ensure these environment variables are properly configured through your deployment platform's secure environment variable management:

- `DATABASE_URL`: Your production MongoDB connection string
- `NEXTAUTH_URL`: Your production application URL
- `NEXTAUTH_SECRET`: A strong, unique secret key (minimum 32 characters)
- `NODE_ENV`: Set to "production"

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

### Production Deployment

#### Database Setup
1. **MongoDB Atlas** (recommended): 
   - Create a production cluster at [MongoDB Atlas](https://www.mongodb.com/products/platform)
   - Configure network access and database users
   - Get your production connection string
2. Update `DATABASE_URL` in your deployment environment variables
3. Run database setup: `npm run db:push`
4. Seed demo data: `npm run db:seed`

#### Application Deployment
The application can be deployed to various platforms:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS (ECS/Fargate)**
- **Railway**
- **Render**
- **Digital Ocean App Platform**

### Cloud Deployment Options

#### Vercel (Recommended for Next.js)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push

#### Other Platforms
- **Netlify**: Full-stack deployment with serverless functions
- **Railway**: Simple deployment with automatic builds
- **AWS/Azure/GCP**: Enterprise-grade cloud deployment

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
2. **MongoDB**: Selected for flexible document storage, scalability, and excellent integration with modern web applications
3. **Prisma ORM**: Provides type safety, easy database management, and excellent developer experience with MongoDB
4. **NextAuth.js**: Industry-standard authentication with built-in security features
5. **Tailwind CSS**: Enables rapid UI development with consistent design system

### Security Considerations

- All user inputs are validated and sanitized
- Passwords are hashed using bcrypt with appropriate salt rounds
- JWT tokens are used for session management
- Role-based access control is implemented
- Database queries are secured through Prisma's type-safe query builder
- MongoDB ObjectId validation prevents injection attacks

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
