import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE = {

    "host":"localhost",
    "database":"postgres",
    "user":"postgres",
    "password":"1234",
    "port":"5432"
}


def get_db():

    conn=psycopg2.connect(

        host=DATABASE["host"],
        database=DATABASE["database"],
        user=DATABASE["user"],
        password=DATABASE["password"],
        port=DATABASE["port"],
        cursor_factory=RealDictCursor

    )

    try:

        yield conn

    finally:

        conn.close()