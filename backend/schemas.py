from datetime import date,datetime
from typing import Optional

from pydantic import BaseModel,EmailStr


# ---------- USER ----------

class UserSignup(BaseModel):

    name:str
    email:EmailStr
    password:str


class UserLogin(BaseModel):

    email:EmailStr
    password:str


class UserOut(BaseModel):

    id:int
    name:str
    email:EmailStr


# ---------- ASSIGNMENTS ----------

class AssignmentCreate(BaseModel):

    title:str
    subject:Optional[str]=None
    due_date:Optional[date]=None
    status:str="pending"
    notes:Optional[str]=None


class AssignmentUpdate(BaseModel):

    title:Optional[str]=None
    subject:Optional[str]=None
    due_date:Optional[date]=None
    status:Optional[str]=None
    notes:Optional[str]=None


class AssignmentOut(BaseModel):

    id:int
    title:str
    subject:Optional[str]
    due_date:Optional[date]
    status:str
    notes:Optional[str]

# ---------- TIMETABLE ----------

class TimetableCreate(BaseModel):
    day: str
    start_time: str
    end_time: str
    subject: str
    location: str | None = None


class TimetableOut(BaseModel):
    id: int
    day: str
    start_time: str
    end_time: str
    subject: str
    location: str | None = None

# ---------- EXAMS ----------

class ExamCreate(BaseModel):
    subject: str
    exam_date: date
    priority: str = "medium"


class ExamOut(BaseModel):
    id: int
    subject: str
    exam_date: date
    priority: str


# ---------- COURSES ----------

class CourseCreate(BaseModel):
    semester: str
    course_name: str
    credit_hours: float
    grade_point: float


class CourseOut(BaseModel):
    id: int
    semester: str
    course_name: str
    credit_hours: float
    grade_point: float


# ---------- TIMER ----------

class TimerSessionCreate(BaseModel):
    session_type: str = "work"
    duration_minutes: int = 25


class TimerSessionOut(BaseModel):
    id: int
    session_type: str
    duration_minutes: int
    completed_at: datetime