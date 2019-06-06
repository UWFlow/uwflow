#!/bin/sh

. $PWD/env

# Votes have an uniqueness constraint on (review_id, user_id)
# so VOTES / (REVIEWS * USERS) should be small (< .01) as it is the chance of failure.
# Fortunately, real data also has a small number of votes.
sed populate.sql \
 -e s/COURSES/5000/ \
 -e s/PROFS/1000/ \
 -e s/USERS/10000/ \
 -e s/COURSE_REVIEWS/100000/ \
 -e s/PROF_REVIEWS/100000/ \
 -e s/COURSE_REVIEW_VOTES/5000/ \
 -e s/PROF_REVIEW_VOTES/5000/ \
  | sudo docker-compose exec -T postgres psql $POSTGRES_DB -U $POSTGRES_USER
