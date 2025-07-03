import logging
import os
logging.basicConfig(level=logging.DEBUG)

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 465
EMAIL_USE_TLS = False
EMAIL_USE_SSL = True   
EMAIL_HOST_USER = 'ziyakhanitm@gmail.com'
EMAIL_HOST_PASSWORD = 'sxnbxelhxpxffdgb'
DEFAULT_FROM_EMAIL = 'ziyakhanitm@gmail.com'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media')
