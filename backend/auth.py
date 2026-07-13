from fastapi import Depends,Header,HTTPException

from database import get_db


def get_current_user(

    user_id:int=Header(...),

    conn=Depends(get_db)

):

    cursor=conn.cursor()

    cursor.execute(

        """
        SELECT *
        FROM users
        WHERE id=%s
        """,

        (user_id,)

    )

    user=cursor.fetchone()

    if user is None:

        raise HTTPException(

            status_code=401,

            detail="Login Required"

        )

    return user