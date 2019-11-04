echo $(npm run affected:libs -- ${AFFECTED_ARGS} --plain 2>&1 | tail -1 | tr " " "\n");
