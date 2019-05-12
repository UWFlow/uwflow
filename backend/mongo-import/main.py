import json
import os
import sys

import bson
import psycopg2
from tqdm import tqdm

DB_URL = "postgres://{user}:{password}@localhost:{port}/{db}"


def in_order(*funcs):
    def inner(*args, **kwargs):
        for func in funcs:
            func(*args, **kwargs)

    return inner


def read_mongo(root_path, collection):
    with open(os.path.join(root_path, f"{collection}.bson"), "rb") as f:
        return bson.decode_all(f.read())


def trinary(value):
    if value is None:
        return None
    else:
        return bool(value)


def courses(conn, root_path, idmap):
    cur = conn.cursor()
    idmap["course"] = {}
    mcourses = read_mongo(root_path, "course")
    cur.execute("TRUNCATE course CASCADE")

    for i, mc in tqdm(enumerate(mcourses), desc="courses"):
        course = {"id": i, "code": mc["_id"], "name": mc["name"], "description": mc["description"]}
        idmap["course"][course["code"]] = i

        cur.execute(
            """
            INSERT INTO course(id, code, name, description)
            VALUES (%(id)s, %(code)s, %(name)s, %(description)s)
        """,
            course,
        )

    conn.commit()


def profs(conn, root_path, idmap):
    cur = conn.cursor()
    idmap["prof"] = {}
    mprofs = read_mongo(root_path, "professor")
    cur.execute("TRUNCATE prof CASCADE")

    for i, mp in tqdm(enumerate(mprofs), desc="profs"):
        idmap["prof"][mp["_id"]] = i
        prof = {"id": i, "name": (mp["first_name"] + " " + mp["last_name"]).strip()}
        cur.execute("INSERT INTO prof(id, name) VALUES (%(id)s, %(name)s)", prof)

    conn.commit()


def users(conn, root_path, idmap):
    cur = conn.cursor()
    idmap["user"] = {}
    musers = read_mongo(root_path, "user")
    cur.execute('TRUNCATE "user" CASCADE')

    for i, mu in tqdm(enumerate(musers), desc="users"):
        idmap["user"][mu["_id"]] = i
        user = {"id": i, "name": (mu["first_name"] + " " + mu["last_name"]).strip()}
        cur.execute('INSERT INTO "user"(id, name) VALUES (%(id)s, %(name)s)', user)

    conn.commit()


def course_reviews(conn, root_path, idmap):
    cur = conn.cursor()
    idmap["course_review"] = {}
    mreviews = read_mongo(root_path, "user_course")
    cur.execute("TRUNCATE course_review CASCADE")

    for i, mr in tqdm(enumerate(mreviews), "course_reviews"):
        idmap["course_review"][mr["_id"]] = i

        review = {
            "course_id": idmap["course"].get(mr.get("course_id")),
            "prof_id": idmap["prof"].get(mr.get("professor_id")),
            "user_id": idmap["user"].get(mr.get("user_id")),
            "text": mr["course_review"].get("comment") or None,  # set empty strings to None
            "easy": trinary(mr["course_review"].get("easiness")),
            "liked": trinary(mr["course_review"].get("interest")),
            "useful": trinary(mr["course_review"].get("usefulness")),
        }
        cur.execute(
            """
            INSERT INTO course_review(course_id, prof_id, user_id, text, easy, liked, useful)
            VALUES (%(course_id)s, %(prof_id)s, %(user_id)s, %(text)s, %(easy)s, %(liked)s, %(useful)s)
        """,
            review,
        )

    conn.commit()


def prof_reviews(conn, root_path, idmap):
    cur = conn.cursor()
    idmap["prof_review"] = {}
    mreviews = read_mongo(root_path, "user_course")
    cur.execute("TRUNCATE prof_review CASCADE")

    for i, mr in tqdm(enumerate(mreviews), desc="prof_reviews"):
        idmap["prof_review"][mr["_id"]] = i
        review = {
            "course_id": idmap["course"].get(mr.get("course_id")),
            "prof_id": idmap["prof"].get(mr.get("professor_id")),
            "user_id": idmap["user"].get(mr.get("user_id")),
            "text": mr["professor_review"].get("comment") or None,  # set empty strings to None
            "clear": trinary(mr["professor_review"].get("clarity")),
            "engaging": trinary(mr["professor_review"].get("passion")),
        }
        cur.execute(
            """
            INSERT INTO prof_review(course_id, prof_id, user_id, text, clear, engaging)
            VALUES (%(course_id)s, %(prof_id)s, %(user_id)s, %(text)s, %(clear)s, %(engaging)s)
        """,
            review,
        )

    conn.commit()


def run(dump_path):
    if not os.path.isdir(dump_path):
        print(f"Error opening directory {dump_path}", file=sys.stderr)
        return

    url = DB_URL.format(
        user=os.environ["POSTGRES_USER"],
        password=os.environ["POSTGRES_PASSWORD"],
        port=os.environ["POSTGRES_PORT"],
        db=os.environ["POSTGRES_DB"],
    )
    conn = psycopg2.connect(url)

    idmap = {}
    pipeline = in_order(courses, profs, users, course_reviews, prof_reviews)
    pipeline(conn, dump_path, idmap)


if __name__ == "__main__":
    if len(sys.argv) == 2:
        run(sys.argv[1])
    else:
        print(f"Usage: {sys.argv[0]} MONGO_DUMP_PATH", file=sys.stderr)
