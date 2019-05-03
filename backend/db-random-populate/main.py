import json
import os
import random
import string
import sys

import psycopg2
import faker

DB_URL = "postgres://{user}:{password}@localhost:{port}/{db}"

COURSES = 7000
PROFS = 1000
USERS = 5000
COURSE_REVIEWS = 10000
PROF_REVIEWS = 10000
COURSE_REVIEW_VOTES = 10000
PROF_REVIEW_VOTES = 10000

fake = faker.Faker()


def courses(conn):
    cur = conn.cursor()
    seen_codes = set()
    for i in range(COURSES):
        cur = conn.cursor()
        course = dict()

        while True:
            code = "".join(random.choices(string.ascii_lowercase, k=3)) + str(random.randint(100, 999))
            if code not in seen_codes:
                seen_codes.add(code)
                break

        course["code"] = code
        course["name"] = " ".join(w.capitalize() for w in fake.words(random.randint(1, 4)))
        if random.random() < 0.9:
            course["description"] = fake.text()
        else:
            course["description"] = None

        cur.execute("""
            INSERT INTO course(code, name, description)
            VALUES (%(code)s, %(name)s, %(description)s)
        """, course)

    conn.commit()


def profs(conn):
    cur = conn.cursor()
    for i in range(PROFS):
        cur.execute("INSERT INTO prof(name) VALUES (%s)", (fake.name(),))
    conn.commit()


def users(conn):
    cur = conn.cursor()
    for i in range(USERS):
        cur.execute("INSERT INTO \"user\"(name) VALUES (%s)", (fake.name(),))
    conn.commit()


def course_reviews(conn):
    cur = conn.cursor()
    for _ in range(COURSE_REVIEWS):
        review = dict()
        if random.choice([True, False]):
            review["text"] = fake.text()
        else:
            review["text"] = None

        review["easy"] = fake.null_boolean()
        review["liked"] = fake.null_boolean()
        review["useful"] = fake.null_boolean()
        review["course_id"] = random.randint(1, COURSES)
        review["prof_id"] = random.randint(1, PROFS)
        review["user_id"] = random.randint(1, USERS)

        cur.execute("""
            INSERT INTO course_review(course_id, prof_id, user_id, text, easy, liked, useful)
            VALUES (%(course_id)s, %(prof_id)s, %(user_id)s, %(text)s, %(easy)s, %(liked)s, %(useful)s)
        """, review)

    conn.commit()


def prof_reviews(conn):
    cur = conn.cursor()
    for _ in range(PROF_REVIEWS):
        review = dict()
        if random.choice([True, False]):
            review["text"] = fake.text()
        else:
            review["text"] = None
        review["clear"] = fake.null_boolean()
        review["engaging"] = fake.null_boolean()
        review["course_id"] = random.randint(1, COURSES)
        review["prof_id"] = random.randint(1, PROFS)
        review["user_id"] = random.randint(1, USERS)

        cur.execute("""
            INSERT INTO prof_review(course_id, prof_id, user_id, text, clear, engaging)
            VALUES (%(course_id)s, %(prof_id)s, %(user_id)s, %(text)s, %(clear)s, %(engaging)s)
        """, review)

    conn.commit()


def course_review_votes(conn):
    cur = conn.cursor()
    seen = set()
    for _ in range(COURSE_REVIEW_VOTES):
        vote = dict()
        while True:
            vote["review_id"] = random.randint(1, PROF_REVIEWS)
            vote["user_id"] = random.randint(1, USERS)
            if (vote["review_id"], vote["user_id"]) not in seen:
                seen.add((vote["review_id"], vote["user_id"]))
                break
        vote["vote"] = random.choice([-1, 1])

        cur.execute("""
            INSERT INTO course_review_vote(review_id, user_id, vote)
            VALUES (%(review_id)s, %(user_id)s, %(vote)s)
        """, vote)

    conn.commit()


def prof_review_votes(conn):
    cur = conn.cursor()
    seen = set()
    for _ in range(PROF_REVIEW_VOTES):
        vote = dict()
        while True:
            vote["review_id"] = random.randint(1, PROF_REVIEWS)
            vote["user_id"] = random.randint(1, USERS)
            if (vote["review_id"], vote["user_id"]) not in seen:
                seen.add((vote["review_id"], vote["user_id"]))
                break
        vote["vote"] = random.choice([-1, 1])

        cur.execute("""
            INSERT INTO prof_review_vote(review_id, user_id, vote)
            VALUES (%(review_id)s, %(user_id)s, %(vote)s)
        """, vote)

    conn.commit()


def in_order(*funcs):
    def inner(*args, **kwargs):
        for func in funcs:
            func(*args, **kwargs)

    return inner


if __name__ == "__main__":
    url = DB_URL.format(user=os.environ["POSTGRES_USER"], password=os.environ["POSTGRES_PASSWORD"],
                        port=os.environ["POSTGRES_PORT"], db=os.environ["POSTGRES_DB"])
    conn = psycopg2.connect(url)
    
    in_order(courses, profs, users, course_reviews, prof_reviews, course_review_votes, prof_review_votes)(conn)
