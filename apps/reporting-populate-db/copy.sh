
#!/bin/sh

start=`date +%s`

# psql postgresql://${SOURCE_DB_USERNAME}:${SOURCE_DB_PASSWORD}@${SOURCE_DB_HOST}:5432/${SOURCE_DB_DATABASE} -qtAXc "COPY (SELECT * FROM submission_events WHERE time IS NOT NULL ORDER BY time DESC LIMIT 10000) TO STDOUT CSV HEADER" \
# | psql postgresql://${TARGET_DB_USERNAME}:${TARGET_DB_PASSWORD}@${TARGET_DB_HOST}:5432/${TARGET_DB_DATABASE} -qtAXc "COPY submission_events FROM STDIN CSV HEADER"

# psql postgresql://postgres:mvgrVIgTzdmyjqgwh0RK@prod-reporting-events.cluster-caews8gzu4su.eu-west-1.rds.amazonaws.com:5432/postgres -qtAXc "COPY (SELECT * FROM submission_events WHERE time IS NOT NULL ORDER BY time LIMIT 10000) TO STDOUT CSV HEADER" | psql postgresql://postgres:"Ii+CteE:Pz8T:?W1y\$Rb_qJ}I'*]KAaz"@qa-reporting-backend-database.cgj3oe6tse1t.eu-west-1.rds.amazonaws.com:5432/qareportingdb -qtAXc "COPY submission_events FROM STDIN CSV HEADER"


end=`date +%s`

echo Execution time was `expr $end - $start` seconds.