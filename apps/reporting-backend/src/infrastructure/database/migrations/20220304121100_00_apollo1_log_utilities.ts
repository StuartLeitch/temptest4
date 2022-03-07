import * as Knex from 'knex';

const logUtilities = `CREATE TABLE IF NOT EXISTS public.__log
(
    logId UUID NOT NULL,
    logTime TIMESTAMP WITH TIME ZONE NOT NULL,
    logText TEXT NOT NULL,
    operationInterval INTERVAL
);

CREATE OR REPLACE PROCEDURE public.sp_log(
	logId UUID,
	logTime TIMESTAMP WITH TIME ZONE,
	logText TEXT,
	operationInterval INTERVAL DEFAULT NULL
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin
	INSERT INTO public.__log (logId, logTime, logText, operationInterval)
	VALUES(logId, logTime, logText, operationInterval);
end;
$BODY$;
`;

export async function up(knex: Knex): Promise<any> {
	return Promise.all([
	  knex.raw(logUtilities),
	]);
  }
  
  export async function down(knex: Knex): Promise<any> {
  }

  export const name = '20220304121100_00_migration_log_utilities';

