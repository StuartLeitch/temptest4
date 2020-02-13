CREATE SERVER superset
	FOREIGN DATA WRAPPER postgres_fdw
	OPTIONS (host '${REPORTING_DB_HOST}', dbname 'superset');

CREATE USER MAPPING FOR postgres
	SERVER superset
	OPTIONS (
       user 'postgres',
       password '${REPORTING_PASSWORD}'
);