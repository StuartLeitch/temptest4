FROM amancevice/superset:0.35.0

USER root
RUN pip install flask_oidc

USER superset
COPY apps/iris .
