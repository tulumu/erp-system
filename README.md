# erp-system# Student ERP Management System

This is a full-stack Student ERP Management System designed to help parents monitor their child's school activities. The system provides a comprehensive overview of academic performance, attendance, physical education (PE) progress, and more.

## Features

- **Parent Dashboard**: A centralized view for parents to see their child's latest activities, including attendance, recent results, and reading progress.
- **Student Profile**: Detailed information about the student, including academic records, PE performance, and reading logs.
- **Attendance Tracking**: Parents can view their child's attendance history and receive notifications.
- **Performance Monitoring**: Track academic and PE performance over time with detailed charts and reports.
- **Complaints & Communication**: A dedicated module for parents and teachers to communicate and resolve issues.
- **Reading Tracker**: Monitor a student's reading habits, including time spent reading and books completed.
- **Role-Based Access**: Different views and permissions for parents, teachers, and administrators.

## Tech Stack

- **Frontend**: React, Material-UI, Chart.js, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repository-url>
   cd student-erp-system
   ```

2. **Install backend dependencies:**
   ```sh
   npm install
   ```

3. **Install frontend dependencies:**
   ```sh
   npm run install-client
   ```

4. **Set up environment variables:**
   Create a `.env` file in the `server` directory and add the following:
   ```
   MONGO_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   ```

### Running the Application

1. **Start the backend server:**
   ```sh
   npm run server
   ```

2. **Start the frontend client:**
   ```sh
   npm run client
   ```

3. **Run both concurrently:**
   ```sh
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Deployment

This application is ready to be deployed on platforms like Heroku, which can automatically build and run the application using the `heroku-postbuild` script.
