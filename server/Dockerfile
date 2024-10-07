# syntax=docker/dockerfile:1


ARG PYTHON_VERSION=3.11.3
FROM python:${PYTHON_VERSION}-slim as base


ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

WORKDIR /app
RUN apt-get update
RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt

# Switch to root temporarily to create directories and set permissions.
USER root

# Create the necessary directories and set permissions.
# RUN mkdir -p /app/core/uploads 

# applying db migrations

# RUN python manage.py migrate

# Make the non-privileged user the owner of the /app directory.
RUN chown -R root:root /app


# # Switch to the non-privileged user to run the application.
USER root

# Copy the source code into the container.
COPY . .

# RUN python manage.py makemigrations


EXPOSE 8000
RUN ls -l /app
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["bash", "/app/entrypoint.sh"]

# RUN rm -rf /app/core/migrations
# RUN python manage.py makemigrations
# RUN sudo apt-get update 
# # RUN python manage.py migrate
# CMD  gunicorn 'cintel.wsgi' --bind=0.0.0.0:8000 --workers=2


# ENTRYPOINT ["python", "entryfile.py"]
# Expose the port that the application listens on.

# ENV /app/.env
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Run the application.

#CMD python manage.py makemigrations && python manage.py migrate && gunicorn cintel.wsgi --bind=0.0.0.0:8000 --workers=2

