import path from 'path';
import nock from 'nock';
import parser from 'xml2json';

const serverEndpoint = 'http://mock-client.blzbth';

function parseRequestBody(
  body: string
): { vatNumber: string; countryCode: string } {
  const parsedBody = parser.toJson(body, { object: true })?.['soap:Envelope']?.[
    'soap:Body'
  ]?.['tns1:checkVat'];
  const vatNumber = parsedBody?.['tns1:vatNumber'];
  const countryCode = parsedBody?.['tns1:countryCode'];
  return { vatNumber, countryCode };
}

export function setupVatService(): nock.Scope {
  process.env.VAT_VALIDATION_SERVICE_ENDPOINT = serverEndpoint;
  return nock(serverEndpoint)
    .get('/')
    .replyWithFile(200, path.join(__dirname, 'soapResponses', 'api.xml'))
    .post('/checkVatService', (body: string) => {
      const { vatNumber } = parseRequestBody(body);
      if (vatNumber === '1') {
        return true;
      }

      return false;
    })
    .replyWithFile(200, path.join(__dirname, 'soapResponses', 'failure.xml'))
    .post('/checkVatService', (body: string) => {
      const { vatNumber, countryCode } = parseRequestBody(body);
      if (vatNumber === '181094119' && countryCode !== 'GB') {
        return true;
      }
      return false;
    })
    .replyWithFile(200, path.join(__dirname, 'soapResponses', 'invalid.xml'))
    .post('/checkVatService')
    .replyWithFile(200, path.join(__dirname, 'soapResponses', 'success.xml'));
}
