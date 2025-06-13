# StoreRate - Store Rating Platform

A comprehensive full-stack web application for rating and managing stores with role-based authentication.

## Features

### User Roles
- **System Administrator**: Complete platform management
- **Normal User**: Browse and rate stores
- **Store Owner**: View store ratings and analytics

### Core Functionality
- User registration and authentication
- Store management and ratings (1-5 stars)
- Advanced search and filtering
- Real-time analytics dashboard
- Responsive design for all devices

## Tech Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS
- **Backend**: Express.js with Node.js
- **Database**: MySQL
- **Authentication**: JWT tokens

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd store-rating-platform
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure Database**
   - Create a MySQL database named `store_rating_db`
   - Update `backend/.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=store_rating_db
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

5. **Initialize Database**
   ```bash
   cd backend
   npm run init-db
   cd ..
   ```

6. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both frontend (port 5173) and backend (port 5000) servers.

## Default Admin Account

After database initialization, you can login with:
- **Email**: admin@storerating.com  
- **Password**: Admin@123

## Project Structure

```
store-rating-platform/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   └── ...
├── backend/               # Express.js backend
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── config/           # Database config
│   └── scripts/          # Database scripts
└── ...
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PUT /api/auth/password` - Update password

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details

### Stores
- `GET /api/stores` - Get all stores
- `POST /api/stores` - Create store (Admin only)
- `GET /api/stores/:id/ratings` - Get store ratings

### Ratings
- `POST /api/ratings` - Submit/update rating

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Form Validations

- **Name**: 20-60 characters
- **Email**: Standard email format
- **Password**: 8-16 characters with uppercase and special character
- **Address**: Maximum 400 characters

## Features by Role

### System Administrator
- Dashboard with platform statistics
- User and store management
- Advanced filtering and sorting
- Create admin, normal users, and stores

### Normal User
- Browse and search stores
- Submit and modify ratings
- View personal rating history
- Update password

### Store Owner
- View store analytics
- Monitor customer ratings
- Rating distribution charts
- Customer feedback details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.