import os
import sys
import json

import bson
import psycopg2

MONGO_DUMP_PATH = "/home/bobw/Downloads/rmc/"
DB_URL = "postgres://{user}:{password}@localhost:{port}/{db}"

def setup_conn():
    url = DB_URL.format(
        user=os.environ["POSTGRES_USER"],
        password=os.environ["POSTGRES_PASSWORD"],
        port=os.environ["POSTGRES_PORT"],
        db=os.environ["POSTGRES_DB"],
    )
    conn = psycopg2.connect(url)
    return conn


def read_mongo(collection):
    with open(os.path.join(MONGO_DUMP_PATH, f"{collection}.bson"), "rb") as f:
        return bson.decode_all(f.read())


def test_courses():
    conn = setup_conn()
    cur = conn.cursor()
    mcourses = read_mongo('course')

    columns = ['id', 'code', 'name', 'description']
    for col in columns:
        cur.execute("SELECT COUNT({}) FROM course".format(col))
        for record in cur:
            assert record[0] == len(mcourses)

    non_empty_columns = ['id', 'code', 'name']
    for col in non_empty_columns:
        cur.execute("SELECT {} FROM course".format(col))
        for record in cur:
            assert record[0] != ''


def test_profs():
    conn = setup_conn()
    cur = conn.cursor()
    mprofs = read_mongo('professor')

    columns = ['id', 'name']
    for col in columns:
        cur.execute("SELECT COUNT({}) FROM prof".format(col))
        for record in cur:
            assert record[0] == len(mprofs)


def test_users():
    conn = setup_conn()
    cur = conn.cursor()
    musers = read_mongo('user')
    
    columns = ['id', 'name']
    for col in columns:
        cur.execute('SELECT COUNT({}) FROM "user"'.format(col))
        for record in cur:
            assert record[0] == len(musers)

    for col in columns:
        cur.execute("SELECT {} FROM course".format(col))
        for record in cur:
            assert record[0] != ''


def test_course_reviews():
    conn = setup_conn()
    cur = conn.cursor()
    mreviews = read_mongo('user_course')

    cur.execute("SELECT COUNT(*) FROM course_review")
    for record in cur:
        assert record[0] == len(mreviews)


def test_prof_reviews():
    conn = setup_conn()
    cur = conn.cursor()
    mreviews = read_mongo('user_course')

    cur.execute("SELECT COUNT(*) FROM prof_review")
    for record in cur:
        assert record[0] == len(mreviews)
