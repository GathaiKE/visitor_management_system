# !/bin/bash

# # Apply database migrations
# python3 manage.py showmigrations
# python3 manage.py makemigrations
# python3 manage.py showmigrations
# python3 manage.py migrate

# # Start the application
gunicorn 'cintel.wsgi' --bind=0.0.0.0:8000 --workers=2
