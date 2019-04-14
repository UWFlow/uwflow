###############
# Build image #
###############
FROM python:3.7-alpine AS builder

ENV LANG C.UTF-8

WORKDIR /build

RUN apk add --no-cache build-base python3-dev postgresql-dev
RUN pip install pipenv

ENV PYROOT /pyroot
ENV PATH $PYROOT/bin:$PATH
ENV PYTHONPATH $PYROOT/lib/python:$PATH
ENV PYTHONUSERBASE $PYROOT

COPY Pipfile Pipfile.lock ./
RUN PIP_USER=1 PIP_IGNORE_INSTALLED=1 pipenv install --system --deploy

####################
# Production image #
####################
FROM python:3.7-alpine AS prod

ENV PYROOT /pyroot
ENV PATH $PYROOT/bin:$PATH
ENV PYTHONPATH /:$PYROOT/lib/python:$PATH
ENV PYTHONUSERBASE $PYROOT

COPY --from=builder $PYROOT/lib/ $PYROOT/lib/

CMD ["python3", "/app/main.py"]
