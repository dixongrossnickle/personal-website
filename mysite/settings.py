import os
from django.core.exceptions import ImproperlyConfigured

# Wrapper function for retrieving environment variables
def get_env_variable(var_name):
    try:
      	return os.environ[var_name]
    except KeyError:
        error_msg = f'Set the {var_name} environment variable.'
        raise ImproperlyConfigured(error_msg)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FOOTBALL_CSV_DIR = os.path.join(BASE_DIR, 'programs/football_sim/football_data', '')

SECRET_KEY = get_env_variable('DJANGO_SECRET_KEY')

# ============================================================================
DEBUG = False
# ============================================================================

if DEBUG:
    ALLOWED_HOSTS = ['localhost', '127.0.0.1']
    INSTALLED_APPS = ['whitenoise.runserver_nostatic']
else:
    ALLOWED_HOSTS = ['174.138.42.36', 'dixongrossnickle.com', 'www.dixongrossnickle.com']
    INSTALLED_APPS = []

# Apps
INSTALLED_APPS += [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    # my apps:
    'templates',
    'home',
    'programs'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'compression_middleware.middleware.CompressionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware'
]

ROOT_URLCONF = 'mysite.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, "templates")],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'mysite.wsgi.application'

# Static Files
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Email Settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_HOST_USER = get_env_variable('DJANGO_EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = get_env_variable('DJANGO_EMAIL_HOST_PASSWORD')
EMAIL_PORT = int(get_env_variable('DJANGO_EMAIL_PORT'))

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Logging
if DEBUG == False:
    log_level = 'WARNING'
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format' : "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
                'datefmt' : "%d/%b/%Y %H:%M:%S"
            },
            'simple': {
                'format': '%(levelname)s %(message)s'
            },
        },
        'handlers': {
            'file': {
                'level': log_level,
                'class': 'logging.FileHandler',
                'filename': os.path.join(BASE_DIR, "mysite.log"),
                'formatter': 'verbose'
            },
        },
        'loggers': {
            'django': {
                'handlers':['file'],
                'propagate': True,
                'level':log_level,
            },
            'MYAPP': {
                'handlers': ['file'],
                'level': log_level,
            },
        }
    }
