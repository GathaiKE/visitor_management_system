migrations:
	python manage.py makemigrations

migrate:
	python manage.py migrate

dev:
	python manage.py runserver


flush:
	python manage.py flush --noinput

push:
	git push origin faraji

pr:
	gh pr create --web -B dev

ppr:
	git push origin faraji
	gh pr create --web -B dev

pull-staging:
	git pull origin staging

reset-db:
	python manage.py flush --noinput
	python manage.py makemigrations
	python manage.py migrate
	make dev

requirements:
	pip freeze > requirements.txt