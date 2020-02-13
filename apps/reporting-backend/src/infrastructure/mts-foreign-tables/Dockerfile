FROM postgres:12

RUN buildDependencies="ca-certificates \
    libsybdb5 \
    freetds-dev \
    freetds-common \
    freetds-bin \
    wget \
    gcc \
    make \
    postgresql-server-dev-$PG_MAJOR" \
  && apt-get update \
  && apt-get install -y ${buildDependencies} \
  && wget https://github.com/tds-fdw/tds_fdw/archive/v2.0.1.tar.gz \
  && tar -xvzf v2.0.1.tar.gz \
  && cd tds_fdw-2.0.1 \
  && make USE_PGXS=1 \
  && make USE_PGXS=1 install
  