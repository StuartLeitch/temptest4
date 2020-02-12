-- REPLACE VARS BEFORE USE
CREATE SERVER mssql_mts
	FOREIGN DATA WRAPPER tds_fdw
	OPTIONS (servername '${HOST}', port '${PORT}', msg_handler 'notice', database 'mtsv2');

CREATE USER MAPPING FOR postgres
	SERVER mssql_mts
	OPTIONS (
       username '${USER}',
       password '${PASSWORD}'
);
