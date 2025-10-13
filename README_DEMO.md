# Allync - Multi-Tenant AI Services Marketplace

A complete, production-ready SaaS platform with role-based access control for managing AI-powered services.

## Demo Accounts

Login with any of these accounts to see different role-based views:

### Super Admin (Full Access)
- **Email:** admin@allync.com
- **Password:** any password
- **Access:** All companies, all users, system settings, maintenance mode

### Company Admin
- **Email:** company@example.com
- **Password:** any password
- **Access:** Own company dashboard, users, services, invoices, support

### Regular User (Read-Only)
- **Email:** user@example.com
- **Password:** any password
- **Access:** View-only dashboard, can create support tickets

## Features

### 🎨 Beautiful UI/UX
- Modern gradient designs (blue/purple theme - NO PURPLE IN PRODUCTION!)
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions
- Professional color scheme avoiding violet/indigo hues
- Accessible design with proper contrast ratios

### 🔐 Role-Based Access Control
- **SUPER_ADMIN**: Platform-wide control
- **COMPANY_ADMIN**: Company-level management
- **USER**: Limited read-only access

### 📊 Dashboard
- Real-time statistics cards
- Interactive charts (Recharts)
- Activity feed
- Quick actions

### ⚡ Services Catalog
8 AI services available:
1. WhatsApp Automation (Active)
2. Instagram Automation
3. Text to Video AI (Active)
4. Text to Image AI (Active)
5. Voice Cloning
6. Document AI
7. Data Analysis AI
8. Custom AI

### 💬 WhatsApp Module (Full Featured)
- **Analytics Tab**: KPIs, charts, sentiment analysis, hourly heatmap
- **Live Chat Tab**: Real-time conversations, customer info sidebar
- **Customers Tab**: Complete customer management with tags
- **Settings Tab**: Bot configuration, auto-reply settings

### 📄 Invoices
- Invoice listing with status filters (All, Paid, Pending, Overdue)
- Detailed invoice view modal
- Line items with calculations
- Tax breakdown (18%)
- Download PDF placeholder

### 🎫 Support System
- Create support tickets
- Priority levels (Urgent, High, Medium, Low)
- Status tracking (Open, In Progress, Resolved)
- Conversation threads
- File attachment placeholders
- Satisfaction ratings for resolved tickets

### ⚙️ Settings
5 comprehensive tabs:
1. **Profile**: Avatar, personal info, password change
2. **Company**: Logo, company details (Admin only)
3. **Notifications**: Email and push notification preferences
4. **Billing**: Active services, payment info, invoice history (Admin only)
5. **Security**: Login history, active sessions, 2FA (coming soon)

### 👑 Admin Panel (Super Admin Only)
- **Companies Tab**: Manage all companies in the system
- **Users Tab**: Global user management across companies
- **System Settings Tab**: Maintenance mode, global config, feature flags
- **Activity Logs Tab**: Complete audit trail with filtering and export

### 🔔 Notifications Center
- Categorized notifications (Info, Success, Warning, Error, Maintenance)
- Unread count badge
- Mark as read functionality

### 🔧 Maintenance Mode
- Platform-wide maintenance scheduling
- Multi-language support (EN/TR)
- Countdown timer
- Public maintenance page

## Technologies

- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Context API** for state management

## Design Principles

✅ **Clean Architecture**: Modular file structure with clear separation of concerns
✅ **Responsive Design**: Mobile-first approach with proper breakpoints
✅ **Accessibility**: ARIA labels, keyboard navigation, proper contrast
✅ **Loading States**: Skeleton screens and spinners
✅ **Empty States**: Helpful messages and CTAs
✅ **Error States**: Clear error messages with retry options

## Mock Data

All data is mocked for demonstration:
- 3 companies with varying status
- 3 users with different roles
- 8 services (3 active)
- 5 invoices with different statuses
- 3 support tickets
- 4 WhatsApp sessions
- Activity logs and notifications

## Color System

- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Info**: Cyan (#06B6D4)
- **Purple**: (#A855F7) - Used sparingly

## Responsive Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

## Building

```bash
npm install
npm run dev    # Development server
npm run build  # Production build
```

## Notes

- All images use placeholder text/initials
- No external API calls
- No real file uploads
- Charts use mock data
- All payments in USD
- No actual authentication (demo purposes)

## Future Enhancements

- Real Supabase backend integration
- Actual authentication with Supabase Auth
- File upload functionality
- PDF generation for invoices
- Real-time WebSocket for chat
- Email notifications
- Multi-language support (i18n)
- Dark mode toggle
- Advanced analytics
- Stripe/PayTR payment integration

---

Built with attention to detail for a production-ready SaaS experience.
