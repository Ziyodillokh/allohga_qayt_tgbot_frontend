# 🎨 Bilimdon Frontend

**Next.js-powered web application for the Bilimdon educational platform.**

---

## 📦 Tech Stack

- **Framework:** Next.js 14+
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand/Redux
- **HTTP Client:** Axios
- **Forms:** React Hook Form
- **UI Components:** Custom + Headless UI
- **Icons:** React Icons

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (http://localhost:3001)

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Start development server
npm run dev
```

**App runs on:** `http://localhost:3000`

---

## ⚙️ Environment Setup

Copy `.env.example` to `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_UPLOADS_URL=http://localhost:3001/uploads

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Bilimdon

# Telegram Bot
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourBotUsername
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (main)/          # Main application
│   │   ├── dashboard/
│   │   ├── tests/
│   │   ├── leaderboard/
│   │   ├── profile/
│   │   └── categories/
│   ├── admin/           # Admin panel
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
│
├── components/
│   ├── auth/            # Auth components
│   ├── test/            # Test components
│   ├── leaderboard/     # Leaderboard components
│   ├── common/          # Shared components
│   └── ui/              # Reusable UI components
│
├── contexts/            # React Context providers
│   ├── AuthContext.tsx
│   └── UserContext.tsx
│
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useTest.ts
│   └── useApi.ts
│
├── lib/                 # Utility functions
│   ├── api.ts           # API client config
│   ├── auth.ts          # Auth helpers
│   ├── utils.ts         # Common utilities
│   └── constants.ts     # Constants
│
├── store/               # State management
│   ├── authStore.ts
│   └── testStore.ts
│
├── types/               # TypeScript types
│   ├── auth.ts
│   ├── test.ts
│   ├── user.ts
│   └── api.ts
│
└── styles/              # Global styles
    └── globals.css

public/                  # Static assets
├── icons/
├── images/
└── manifest.json
```

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev             # Start dev server (http://localhost:3000)
npm run dev -- -p 3000 # Specify custom port

# Production
npm run build          # Build for production
npm run start          # Run production build

# Code Quality
npm run lint           # Run ESLint
npm run type-check     # Check TypeScript types
npm run format         # Format with Prettier
npm run test           # Run tests

# Database
npm run test:watch     # Watch mode testing
```

---

## 🎨 Component Structure

### Example Component

```typescript
// components/Button.tsx
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-semibold ${
        variant === "primary"
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-black"
      }`}
    >
      {children}
    </button>
  );
};
```

---

## 🔐 Authentication

### Login Flow

1. User enters email/password
2. Frontend sends credentials to `/api/auth/login`
3. Backend returns JWT token
4. Token is stored in localStorage/cookie
5. Token is included in Authorization header for API requests

### Protected Routes

Routes are protected using middleware and context:

```typescript
// app/(main)/dashboard/page.tsx
import { withAuth } from "@/lib/withAuth";

const Dashboard = () => {
  return <div>Dashboard Content</div>;
};

export default withAuth(Dashboard);
```

---

## 📡 API Communication

### API Client Configuration

```typescript
// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Making Requests

```typescript
// Example: Fetching tests
import api from "@/lib/api";

const fetchTests = async () => {
  try {
    const { data } = await api.get("/tests");
    return data;
  } catch (error) {
    console.error("Failed to fetch tests:", error);
  }
};
```

---

## 🎯 Key Features

### Test Taking

- Browse available tests
- Start new test
- Submit answers
- View results immediately
- Track progress

### User Dashboard

- View statistics
- Track XP and level
- See achievements
- Manage profile

### Leaderboard

- Global rankings
- Weekly/monthly leaderboards
- Category-wise rankings
- User position tracking

### User Profile

- View profile information
- Upload avatar
- See achievement badges
- View test history

### Admin Panel

- Manage categories
- Create/edit questions
- View user statistics
- Monitor platform activity

---

## 🎨 Styling with Tailwind CSS

### Global Styles

```css
/* Global utilities available everywhere */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600;
  }
}
```

### Using Tailwind in Components

```tsx
<div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click Me
  </button>
</div>
```

---

## 📱 Responsive Design

All components are mobile-first and responsive:

```tsx
<div
  className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
"
>
  {/* Components here */}
</div>
```

---

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### Test Watch Mode

```bash
npm run test:watch
```

### Example Test

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/Button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });
});
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Vercel Deployment

```bash
# Push to GitHub
git push origin main

# Vercel will auto-deploy from main branch
# Set environment variables in Vercel dashboard
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_UPLOADS_URL=https://api.yourdomain.com/uploads
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourBotUsername
```

---

## 🔒 Security Best Practices

- ✅ XSS protection (Next.js built-in)
- ✅ CSRF protection
- ✅ Secure token storage
- ✅ Input validation
- ✅ Rate limiting
- ✅ Content Security Policy
- ✅ HTTPS enforcement

---

## 📚 Page Structure

### Auth Pages

- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password reset

### Main Pages

- `/dashboard` - User dashboard
- `/tests` - Browse tests
- `/tests/:id` - Take test
- `/leaderboard` - Rankings
- `/profile` - User profile
- `/categories` - Category listing

### Admin Pages

- `/admin/dashboard` - Admin dashboard
- `/admin/questions` - Manage questions
- `/admin/categories` - Manage categories
- `/admin/users` - Manage users

---

## 🐛 Troubleshooting

### API Connection Issues

```bash
# Verify backend is running on port 3001
# Check NEXT_PUBLIC_API_URL in .env.local
# Check CORS settings on backend
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Port Already in Use

```bash
# Change port
npm run dev -- -p 3001
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Axios Documentation](https://axios-http.com/)

---

## 👨‍💻 Author

**Bekmuhammad**

---

## 📝 License

MIT License

---

**Happy Frontend Development! 🚀**
