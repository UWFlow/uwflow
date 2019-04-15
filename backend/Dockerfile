FROM python:3.7-alpine

WORKDIR /server

ENV LANG C.UTF-8

RUN apk add --no-cache build-base python3-dev postgresql-dev
RUN pip install pipenv

COPY Pipfile Pipfile.lock ./
RUN pipenv sync
RUN rm Pipfile Pipfile.lock

CMD ["pipenv", "run", "server"]
