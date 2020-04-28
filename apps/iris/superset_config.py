import os

LOG_FORMAT = '%(asctime)s:%(levelname)s:%(name)s:%(message)s'
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
SQLLAB_TIMEOUT = int(os.getenv('SQLLAB_TIMEOUT', '120'))
ENABLE_PROXY_FIX = True
# Replace this with SecretsManager or SSM Parameter Store.

# TODO - Move to env
SECRET_KEY = os.environ['SECRET_KEY']

# Replace this with IAM authentication or SecretsManager
# SQLALCHEMY_CUSTOM_PASSWORD_STORE
# TODO - Move to env
SQLALCHEMY_DATABASE_URI = os.environ['SQLALCHEMY_DATABASE_URI']

# TODO: Implement OAuth2

# TODO: Configure Celery
if os.getenv('CACHE_TYPE', '') == 'redis':
  CACHE_CONFIG = {
    'CACHE_TYPE': 'redis',
    'CACHE_DEFAULT_TIMEOUT': 60 * 60 * 24, # 1 day default (in secs)
    'CACHE_KEY_PREFIX': 'superset_results',
    'CACHE_REDIS_URL': os.getenv('CACHE_REDIS_URL'),
  }

BASE_DIR = os.path.abspath(os.path.dirname(__file__))