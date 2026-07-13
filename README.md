# StudyFlow

Student Productivity Hub — a minimal, approachable web application that helps students

# Features
- Student Registration
- Student Login
- Dashboard
- Assignment Tracker
- Timetable Management
- Exam Countdown
- GPA / CGPA Calculator
- Study Timer (Pomodoro)
- Search Assignments, Exams and Timetable


- # Technologies Used

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- FastAPI
- Pydantic
- psycopg2

## Database

- PostgreSQL

# Database Tables

- users
- batches
- assignments
- attendance
- timetable_slots
- exams
- courses
- timer_sessions

Configure Database

Update database.py

DATABASE = {
    "host":"localhost",
    "database":"postgres",
    "user":"postgres",
    "password":"YOUR_PASSWORD",
    "port":"5432"
}
---

## 6. Start Backend

uvicorn main:app --reload

