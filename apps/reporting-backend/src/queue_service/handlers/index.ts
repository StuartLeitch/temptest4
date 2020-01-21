const events = ['SubmissionSubmitted', 'TEST_EVENT'];

// TODO implement actual listeneres
const moduleExport = events.reduce((acc, curr) => {
  acc[curr] = { event: curr, handler: console.log };
  return acc;
}, {});

export default moduleExport;
