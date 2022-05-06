import {SubmissionService} from "../../../src/lib/services/implementations/submission-service";

describe('sanity test', () => {
  it('should validate true', () => {
    expect(true).toBe(true);
  });
});

describe('active journals test', () => {
  it('should get all active journals', async () => {
    const service = new SubmissionService('https://gateway.qa.phenom.pub/', 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ6cldrb0VzTS1ZS0MyZWdxRC16NzdwcTlWM2lnWklaRG9jMmFDZFBaVWZNIn0.eyJleHAiOjE2NTE4Mzc1NzEsImlhdCI6MTY1MTY2NDc3MiwiYXV0aF90aW1lIjoxNjUxNjY0NzcxLCJqdGkiOiJiNDhjMWRhZC0yNzNkLTQ5ZjMtOWIxYy0wNTI2OTYzY2FiZTMiLCJpc3MiOiJodHRwczovL3Nzby5kZXYucGhlbm9tLnB1Yi9hdXRoL3JlYWxtcy9QaGVub20iLCJhdWQiOlsicWEtcmV2aWV3IiwiaW52b2ljaW5nLWFkbWluIiwic3luZGljYXRpb24iLCJhY2NvdW50Il0sInN1YiI6Ijc2OWQzNjYzLWYyYWEtNDgwOS1iNDMzLTlkM2ZkMDJjNTA4MyIsInR5cCI6IkJlYXJlciIsImF6cCI6InFhLXJldmlldyIsIm5vbmNlIjoiMDMzYzUyNmQtMTJkMy00MjQxLWEyMmEtMTdhMTVkZTNjOTgxIiwic2Vzc2lvbl9zdGF0ZSI6Ijg0OTA5MDIzLTFmN2YtNGYyMy05NzBmLTRmZWY4YjhjZDM2MyIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL3FhLnJldmlldy5oaW5kYXdpLmNvbSIsImh0dHBzOi8vaW1wb3J0LW1hbnVzY3JpcHQucWEucGhlbm9tLnB1YiIsImh0dHBzOi8vcWEucmV2aWV3LmhpbmRhd2kuY29tIiwiaHR0cDovL2xvY2FsaG9zdCIsImh0dHBzOi8vcmV2aWV3LnFhLnBoZW5vbS5wdWIiLCJodHRwOi8vbG9jYWxob3N0OjQyMDAiLCJodHRwczovL3Jldmlldy5hdXRvbWF0aW9uLnBoZW5vbS5wdWIiLCJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJpbnZvaWNpbmctYWRtaW4iOnsicm9sZXMiOlsiYWRtaW4iXX0sInN5bmRpY2F0aW9uIjp7InJvbGVzIjpbImFkbWluIl19LCJxYS1yZXZpZXciOnsicm9sZXMiOlsiYWRtaW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJzaWQiOiI4NDkwOTAyMy0xZjdmLTRmMjMtOTcwZi00ZmVmOGI4Y2QzNjMiLCJjb3VudHJ5IjoiUk8iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYWZmaWxpYXRpb24iOiJoaW5kYXdpIiwibmFtZSI6IlJveGFuYSBMdWNhbiIsInByZWZlcnJlZF91c2VybmFtZSI6InJveGFuYS5sdWNhbkBoaW5kYXdpLmNvbSIsImdpdmVuX25hbWUiOiJSb3hhbmEiLCJ0aXRsZSI6Im1pc3MiLCJwaGVub21JZCI6Ijc2OWQzNjYzLWYyYWEtNDgwOS1iNDMzLTlkM2ZkMDJjNTA4MyIsImZhbWlseV9uYW1lIjoiTHVjYW4iLCJlbWFpbCI6InJveGFuYS5sdWNhbkBoaW5kYXdpLmNvbSIsInVzZXJuYW1lIjoicm94YW5hLmx1Y2FuQGhpbmRhd2kuY29tIn0.L_c1eeO4d21rzvJKt-D7DGY6SxaR4wyJyJsHhzago6xr2yu09MwwHJqNVlcGKRKyoItd2IeWqWsKjOXYgfoXKlp0nZ6S3VAXSwzX5z3n7fNuWP8g5PnxniNTpjslY_RVe41oq9GNolbVxCsQrgm4OGJMpl2MfcMcUWLkIdG0eP-A1e8vpoTcZ28kN4eVnr40Kx6aNCQYaA4tNJiDdr7s_X_GCxTWCtndajM_JLeOH9nnZQcJ5P1D4-AupOST62KRrQa3-GKWLi8-ewJONGmTSBo_KqBz12bo6SY0qcP3sCwIgeK-RM9oRiJmb9X8AYFmAOCJ0T2MmwdJQ6uUu-48og')
    try {
      const things = await service.getAllActiveJournals();
      console.log(JSON.stringify(things, null, 2))
    } catch (things){
      console.log(things);
    }
  });
});

