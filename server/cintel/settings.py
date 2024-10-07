"""
Django settings for cintel project.

Generated by 'django-admin startproject' using Django 4.2.4.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from rest_framework.settings import api_settings
from datetime import timedelta
from pathlib import Path
from decouple import config, Csv
import os


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!

# DEBUG = True

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = True
DEBUG = config('DEBUG', cast=bool)


ALLOWED_HOSTS = [
    '*'
]

# 16.171.174.35


# Application definition

INSTALLED_APPS = [
    # 'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'knox',
    'core',
    'corsheaders',
    'django_filters',
    'django_rest_passwordreset',
]



MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    # 'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


CORS_ALLOW_ALL_ORIGINS = True

ROOT_URLCONF = 'cintel.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'Templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cintel.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }


# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': config('DB_NAME','core'),
#         'USER': config('DB_USER','postgres'),
#         'PASSWORD': config('DB_PASSWORD','@2024#ND'),
#         'HOST': config('DB_HOST','localhost'),
#         'PORT': config('DB_PORT','5432'),
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),

    }
}


# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': 'core',
#         'USER': 'cinteladmin',
#         'PASSWORD': 'Cintel@@1',
#         'HOST': 'localhost',
#         'PORT': '5432'
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'core',
        'USER': 'postgres',
        'PASSWORD': 'Engineer@@1',
        'HOST': 'localhost',
        'PORT': '5432'
    }
}



# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

AUTH_USER_MODEL = 'core.MyUser'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.BasicAuthentication',
        'knox.auth.TokenAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
  
}


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Africa/Nairobi' #'UTC'

USE_I18N = True

USE_TZ = True

#
REST_KNOX = {
    'SECURE_HASH_ALGORITHM': 'cryptography.hazmat.primitives.hashes.SHA512',
    'AUTH_TOKEN_CHARACTER_LENGTH': 64,
    'TOKEN_TTL': timedelta(hours=10),
    'USER_SERIALIZER': 'core.serializers.GetMyUserSerializer',
    'TOKEN_LIMIT_PER_USER': None,
    'AUTO_REFRESH': False,
    'EXPIRY_DATETIME_FORMAT': api_settings.DATETIME_FORMAT,
}


# 'django.core.mail.backends.smtp.EmailBackend'
# 'django.core.mail.backends.filebased.EmailBackend'
# 'django.core.mail.backends.console.EmailBackend'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_FILE_PATH = '/tmp/app-messages'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

EMAIL_HOST = 'smtp.gmail.com'

EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')





# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'
# Add/modify these settings
# MEDIA_ROOT = os.path.join(BASE_DIR, 'core/uploads')
# MEDIA_URL = '/media/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# sms
SMS_GATEWAY_API_KEY = config("SMS_GATEWAY_API_KEY", "")
SMS_SENDER_ID = config("SMS_SENDER_ID", "")

# AWS
AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY", "")
AWS_REGION_NAME = config("AWS_REGION_NAME", "")
AWS_REKOGNITION_COLLECTION_ID = config("AWS_REKOGNITION_COLLECTION_ID", "")

# Twilio
TWILIO_ACCOUNT_SID = config("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = config("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = config("TWILIO_PHONE_NUMBER", "")

# Kairos
KAIROS_APP_ID = config("KAIROS_APP_ID", "")
KAIROS_APP_KEY = config("KAIROS_APP_KEY", "")
KAIROS_GALLERY_NAME = config("KAIROS_GALLERY_NAME", "")
KAIROS_BASE_URL = config("KAIROS_BASE_URL", "")

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING = config("AZURE_STORAGE_CONNECTION_STRING", "")
AZURE_STORAGE_CONTAINER_NAME = config("AZURE_STORAGE_CONTAINER_NAME", "")

# AWS
AWS_S3_BUCKET = config("AWS_S3_BUCKET", "")
AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY", "")
AWS_DEFAULT_REGION = config("AWS_DEFAULT_REGION", "")

# AWS Rekog
AWS_REKOG_REGION = config("AWS_REKOG_REGION", "")
AWS_REKOG_COLLECTION_ID=config('AWS_REKOG_COLLECTION_ID', '')


#ADVANTA
ADVANTA_API_KEY = config("ADVANTA_API_KEY", default='')
ADVANTA_PARTNER_ID = config("ADVANTA_PARTNER_ID", default='')
ADVANTA_SHORTCODE = config("ADVANTA_SHORTCODE", default='')
ADVANTA_SENDSMS_URL = config("ADVANTA_SENDSMS_URL", default='')
