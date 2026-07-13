from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import schemas
from database import get_db
from auth import get_current_user

app = FastAPI(title="Student Portal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# SIGNUP
# ==========================================

@app.post("/signup")
def signup(
    payload: schemas.UserSignup,
    conn=Depends(get_db)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE email=%s
        """,
        (payload.email,)
    )

    if cursor.fetchone():
        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )

    cursor.execute(
        """
        INSERT INTO users(name,email,password)
        VALUES(%s,%s,%s)
        RETURNING id,name,email
        """,
        (
            payload.name,
            payload.email,
            payload.password
        )
    )

    user = cursor.fetchone()

    conn.commit()

    return {
        "message": "Account created successfully.",
        "user": user
    }


# ==========================================
# LOGIN
# ==========================================

@app.post("/login")
def login(
    payload: schemas.UserLogin,
    conn=Depends(get_db)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id,name,email
        FROM users
        WHERE email=%s
        AND password=%s
        """,
        (
            payload.email,
            payload.password
        )
    )

    user = cursor.fetchone()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return {
        "message": "Login successful.",
        "user": user
    }


# ==========================================
# CURRENT USER
# ==========================================

@app.get("/me")
def me(
    current_user=Depends(get_current_user)
):
    return current_user

# ==========================================
# ASSIGNMENTS
# ==========================================

@app.get("/assignments", response_model=list[schemas.AssignmentOut])
def get_assignments(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            title,
            subject,
            due_date,
            status,
            notes
        FROM assignments
        WHERE user_id=%s
        ORDER BY due_date
        """,
        (current_user["id"],)
    )

    return cursor.fetchall()


@app.post("/assignments", response_model=schemas.AssignmentOut)
def create_assignment(
    payload: schemas.AssignmentCreate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO assignments
        (
            user_id,
            title,
            subject,
            due_date,
            status,
            notes
        )
        VALUES(%s,%s,%s,%s,%s,%s)
        RETURNING
            id,
            title,
            subject,
            due_date,
            status,
            notes
        """,
        (
            current_user["id"],
            payload.title,
            payload.subject,
            payload.due_date,
            payload.status,
            payload.notes
        )
    )

    assignment = cursor.fetchone()

    conn.commit()

    return assignment


@app.put("/assignments/{assignment_id}",
response_model=schemas.AssignmentOut)
def update_assignment(
    assignment_id: int,
    payload: schemas.AssignmentUpdate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id
        FROM assignments
        WHERE id=%s
        AND user_id=%s
        """,
        (
            assignment_id,
            current_user["id"]
        )
    )

    if cursor.fetchone() is None:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    data = payload.model_dump(exclude_unset=True)

    for field, value in data.items():

        cursor.execute(

            f"""
            UPDATE assignments
            SET {field}=%s
            WHERE id=%s
            """,

            (
                value,
                assignment_id
            )

        )

    conn.commit()

    cursor.execute(
        """
        SELECT
            id,
            title,
            subject,
            due_date,
            status,
            notes
        FROM assignments
        WHERE id=%s
        """,
        (assignment_id,)
    )

    return cursor.fetchone()


@app.delete("/assignments/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM assignments
        WHERE id=%s
        AND user_id=%s
        """,
        (
            assignment_id,
            current_user["id"]
        )
    )

    conn.commit()

    return {
        "message": "Assignment deleted successfully."
    }

# ==========================================
# TIMETABLE
# ==========================================

@app.get("/timetable", response_model=list[schemas.TimetableOut])
def get_timetable(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            day,
            start_time,
            end_time,
            subject,
            location
        FROM timetable_slots
        WHERE user_id=%s
        ORDER BY
            CASE day
                WHEN 'Monday' THEN 1
                WHEN 'Tuesday' THEN 2
                WHEN 'Wednesday' THEN 3
                WHEN 'Thursday' THEN 4
                WHEN 'Friday' THEN 5
                WHEN 'Saturday' THEN 6
                WHEN 'Sunday' THEN 7
            END,
            start_time
        """,
        (current_user["id"],)
    )

    return cursor.fetchall()


@app.post("/timetable", response_model=schemas.TimetableOut)
def create_timetable(
    payload: schemas.TimetableCreate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO timetable_slots
        (
            user_id,
            day,
            start_time,
            end_time,
            subject,
            location
        )

        VALUES(%s,%s,%s,%s,%s,%s)

        RETURNING
            id,
            day,
            start_time,
            end_time,
            subject,
            location
        """,
        (
            current_user["id"],
            payload.day,
            payload.start_time,
            payload.end_time,
            payload.subject,
            payload.location
        )
    )

    slot = cursor.fetchone()

    conn.commit()

    return slot


@app.delete("/timetable/{slot_id}")
def delete_timetable(
    slot_id: int,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM timetable_slots
        WHERE id=%s
        AND user_id=%s
        """,
        (
            slot_id,
            current_user["id"]
        )
    )

    conn.commit()

    return {
        "message": "Timetable slot deleted successfully."
    }

# ==========================================
# EXAMS
# ==========================================

@app.get("/exams", response_model=list[schemas.ExamOut])
def get_exams(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            subject,
            exam_date,
            priority
        FROM exams
        WHERE user_id=%s
        ORDER BY exam_date
        """,
        (current_user["id"],)
    )

    return cursor.fetchall()


@app.post("/exams", response_model=schemas.ExamOut)
def create_exam(
    payload: schemas.ExamCreate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO exams
        (
            user_id,
            subject,
            exam_date,
            priority
        )

        VALUES(%s,%s,%s,%s)

        RETURNING
            id,
            subject,
            exam_date,
            priority
        """,
        (
            current_user["id"],
            payload.subject,
            payload.exam_date,
            payload.priority
        )
    )

    exam = cursor.fetchone()

    conn.commit()

    return exam


@app.delete("/exams/{exam_id}")
def delete_exam(
    exam_id: int,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM exams
        WHERE id=%s
        AND user_id=%s
        """,
        (
            exam_id,
            current_user["id"]
        )
    )

    conn.commit()

    return {
        "message": "Exam deleted successfully."
    }

# ==========================================
# COURSES
# ==========================================

@app.get("/courses", response_model=list[schemas.CourseOut])
def get_courses(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            id,
            semester,
            course_name,
            credit_hours,
            grade_point
        FROM courses
        WHERE user_id=%s
        ORDER BY semester
        """,
        (current_user["id"],)
    )

    return cursor.fetchall()


@app.post("/courses", response_model=schemas.CourseOut)
def create_course(
    payload: schemas.CourseCreate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO courses
        (
            user_id,
            semester,
            course_name,
            credit_hours,
            grade_point
        )

        VALUES(%s,%s,%s,%s,%s)

        RETURNING
            id,
            semester,
            course_name,
            credit_hours,
            grade_point
        """,
        (
            current_user["id"],
            payload.semester,
            payload.course_name,
            payload.credit_hours,
            payload.grade_point
        )
    )

    course = cursor.fetchone()

    conn.commit()

    return course


@app.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM courses
        WHERE id=%s
        AND user_id=%s
        """,
        (
            course_id,
            current_user["id"]
        )
    )

    conn.commit()

    return {
        "message":"Course deleted successfully."
    }

@app.get("/gpa")
def calculate_gpa(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            semester,
            credit_hours,
            grade_point
        FROM courses
        WHERE user_id=%s
        """,
        (current_user["id"],)
    )

    courses = cursor.fetchall()

    semesters = {}

    total_points = 0
    total_credits = 0

    for c in courses:

        semester = c["semester"]

        if semester not in semesters:

            semesters[semester] = {

                "points":0,

                "credits":0

            }

        points = c["credit_hours"] * c["grade_point"]

        semesters[semester]["points"] += points
        semesters[semester]["credits"] += c["credit_hours"]

        total_points += points
        total_credits += c["credit_hours"]

    semester_result = []

    for semester,data in semesters.items():

        gpa = round(
            data["points"]/data["credits"],
            2
        )

        semester_result.append({

            "semester":semester,

            "credit_hours":data["credits"],

            "gpa":gpa

        })

    cgpa = 0

    if total_credits > 0:

        cgpa = round(
            total_points/total_credits,
            2
        )

    return {

        "semesters":semester_result,

        "cgpa":cgpa,

        "total_credit_hours":total_credits

    }

# ==========================================
# TIMER
# ==========================================

@app.get("/timer-sessions",
response_model=list[schemas.TimerSessionOut])
def get_timer_sessions(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor = conn.cursor()

    cursor.execute("""

        SELECT
            id,
            session_type,
            duration_minutes,
            completed_at

        FROM timer_sessions

        WHERE user_id=%s

        ORDER BY completed_at DESC

        LIMIT 50

    """,(current_user["id"],))

    return cursor.fetchall()


@app.post("/timer-sessions",
response_model=schemas.TimerSessionOut)
def add_timer_session(
    payload:schemas.TimerSessionCreate,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor=conn.cursor()

    cursor.execute("""

        INSERT INTO timer_sessions

        (

        user_id,
        session_type,
        duration_minutes

        )

        VALUES(%s,%s,%s)

        RETURNING

        id,
        session_type,
        duration_minutes,
        completed_at

    """,

    (

        current_user["id"],
        payload.session_type,
        payload.duration_minutes

    ))

    session=cursor.fetchone()

    conn.commit()

    return session

# ==========================================
# DASHBOARD
# ==========================================

@app.get("/dashboard-summary")
def dashboard_summary(
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor=conn.cursor()

    user=current_user["id"]

    cursor.execute("""

        SELECT COUNT(*)

        FROM assignments

        WHERE user_id=%s

        AND status!='completed'

    """,(user,))

    pending=cursor.fetchone()["count"]


    cursor.execute("""

        SELECT subject,exam_date

        FROM exams

        WHERE user_id=%s

        ORDER BY exam_date

        LIMIT 3

    """,(user,))

    exams=cursor.fetchall()

# ==========================================
# SEARCH
# ==========================================

@app.get("/search")
def search(
    q:str,
    conn=Depends(get_db),
    current_user=Depends(get_current_user)
):

    cursor=conn.cursor()

    like=f"%{q}%"

    cursor.execute("""

        SELECT
        id,
        title,
        subject,
        due_date,
        status

        FROM assignments

        WHERE user_id=%s

        AND

        (

            title ILIKE %s

            OR

            subject ILIKE %s

            OR

            notes ILIKE %s

        )

    """,

    (

        current_user["id"],
        like,
        like,
        like

    ))

    assignments=cursor.fetchall()


    cursor.execute("""

        SELECT

        id,
        day,
        subject,
        start_time,
        end_time

        FROM timetable_slots

        WHERE user_id=%s

        AND

        (

            subject ILIKE %s

            OR

            location ILIKE %s

        )

    """,

    (

        current_user["id"],
        like,
        like

    ))

    timetable=cursor.fetchall()


    cursor.execute("""

        SELECT

        id,
        subject,
        exam_date

        FROM exams

        WHERE user_id=%s

        AND subject ILIKE %s

    """,

    (

        current_user["id"],
        like

    ))

    exams=cursor.fetchall()

    return{

        "assignments":assignments,

        "timetable_slots":timetable,

        "exams":exams

    }


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():
    return {
        "message": "Student Portal API Running"
    }