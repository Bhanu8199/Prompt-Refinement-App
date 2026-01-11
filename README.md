# Prompt Refinement App

A full-stack AI-powered application for refining prompts using multi-modal inputs including text, images, documents, and videos. Built with modern web technologies for a scalable and maintainable architecture.

## 🏗️ Architecture & Framework

- **Full-Stack Application**: Node.js backend with React frontend
- **Monorepo Structure**: Shared code between client and server
- **TypeScript**: Strongly typed JavaScript for both frontend and backend

## 🎨 Frontend Technologies

### Core Framework
- **React 18.3.1**: Modern React with hooks and concurrent features
- **Vite 7.3.0**: Fast build tool and development server
- **Wouter 3.3.5**: Lightweight routing library for React

### UI Components & Styling
- **Radix UI**: Complete component library (accordion, dialog, dropdown, etc.)
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **Framer Motion 11.18.2**: Animation library
- **Lucide React 0.453.0**: Icon library
- **shadcn/ui**: Customizable UI components built on Radix

### State Management & Data Fetching
- **TanStack Query 5.60.5**: Powerful data fetching and caching
- **React Hook Form 7.55.0**: Form handling with validation
- **Zod 3.25.76**: Schema validation and type inference

## 🚀 Backend Technologies

### Runtime & Framework
- **Node.js**: JavaScript runtime
- **Express 4.21.2**: Web framework for API routes
- **tsx 4.20.5**: TypeScript execution and bundling

### Database & ORM
- **PostgreSQL**: Primary database (Neon hosted)
- **Drizzle ORM 0.39.3**: Type-safe SQL query builder
- **Drizzle Kit 0.31.8**: Database migrations and schema management
- **postgres 3.4.8**: PostgreSQL client for Drizzle

### File Processing & AI
- **Tesseract.js 5.1.0**: OCR for image text extraction
- **PDF-parse 1.1.1**: PDF text extraction
- **Mammoth**: DOCX file processing
- **FFmpeg 1.1.0**: Video/audio processing
- **Google Generative AI 0.24.1**: AI-powered prompt refinement
- **OpenAI 6.15.0**: Alternative AI service

### Middleware & Utilities
- **Multer 1.4.5**: File upload handling
- **CORS 2.8.5**: Cross-origin resource sharing
- **Express Session 1.18.1**: Session management
- **Passport.js**: Authentication framework

## 🛠️ Development Tools

### Build & Development
- **TypeScript 5.6.3**: Type checking and compilation
- **ESLint**: Code linting
- **PostCSS 8.4.47**: CSS processing
- **Autoprefixer 10.4.20**: CSS vendor prefixing

### Testing & Quality
- **Cross-env 10.1.0**: Cross-platform environment variables

## ☁️ Deployment & Hosting

- **Neon**: PostgreSQL database hosting
- **Replit**: Development environment (plugins included)

## 📦 Package Management

- **npm**: Package manager
- **ES Modules**: Modern module system ("type": "module")

## 🔧 Key Features Enabled

- **Multi-modal Input**: Text, images, documents, videos
- **Real-time Processing**: AI-powered prompt refinement
- **File Upload**: Support for various file formats
- **Database Persistence**: History storage in PostgreSQL
- **Responsive UI**: Mobile-friendly design
- **Type Safety**: Full TypeScript coverage

## 🎯 Specialized Libraries

- **p-limit & p-retry**: Concurrency and retry logic
- **Date-fns**: Date manipulation
- **Class Variance Authority**: Component styling variants
- **Tailwind Merge**: Dynamic Tailwind class merging

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd prompt-refinement-app
```

2. Install dependencies:
```bash
npm install
```

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# AI Services
GOOGLE_AI_API_KEY=your_google_ai_api_key
OPENAI_API_KEY=your_openai_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Session
SESSION_SECRET=your_session_secret

# Other configurations as needed
```

### Database Setup

1. Push the database schema:
```bash
npm run db:push
```

This will create the necessary tables in your PostgreSQL database using Drizzle ORM.

### Running the Application

#### Development Mode
```bash
npm run dev
```

This starts the development server with hot reloading for both frontend and backend.

#### Build for Production
```bash
npm run build
```

#### Start Production Server
```bash
npm start
```

### Type Checking
```bash
npm run check
```

## 📁 Project Structure

```
prompt-refinement-app/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                 # Express backend
│   ├── replit_integrations/ # Replit-specific integrations
│   └── *.ts               # Server files
├── shared/                 # Shared code between client and server
│   ├── models/            # Data models
│   └── schema.ts          # Database schema
├── migrations/            # Database migrations
├── uploads/               # File uploads directory
└── data/                  # Additional data files
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🌟 Key Capabilities

- **Prompt Refinement**: AI-powered enhancement of user prompts
- **Multi-Modal Processing**: Handle text, images, PDFs, DOCX, and video files
- **Real-time Feedback**: Instant processing and refinement results
- **History Tracking**: Persistent storage of refinement sessions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Type-Safe Development**: Full TypeScript coverage for reliability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

Repository issues link : https://github.com/Bhanu8199/Prompt-Refinement-App/issues
For Contact Me : https://bvm-portfolio.vercel.app/
