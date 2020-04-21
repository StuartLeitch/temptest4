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

# TODO: Configure Caching

BASE_DIR = os.path.abspath(os.path.dirname(__file__))