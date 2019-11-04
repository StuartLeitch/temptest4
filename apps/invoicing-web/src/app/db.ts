export default {
  users: [{ id: 123, name: "John Doe", email: "john.doe@admin.com", role: 'SUPER_ADMIN' }],
  transactions: [
    { id: 'transaction-1', status: 0, dateCreated: new Date(), dateUpdated: new Date(),},
  ],
  manuscripts: [{
    id: 'manuscript-id',
    journalId: undefined,
    title: 'manuscript-title',
    articleTypeId: 'article-type-id',
    authorEmail: 'author@email.com',
    authorCountry: 'MD',
    authorSurname: 'Author Surname'
  }],
  invoices: [
    {
      "id": 'invoice-1',
      "transactionId": "transaction-1",
      "dateCreated": new Date("2019-10-23"),
      "deleted": 0,
      "status": 0,
    }
  ],
  invoiceItems: [{
    id: 'bc825b44-81a8-4d40-93f1-217ae56c762e',
    invoiceId: 'invoice-1',
    manuscriptId: 'manuscript-id',
    type: 'APC',
    name: 'APC',
    price: undefined,
    dateCreated: new Date()
  }],
  catalog: [
    {
        "amount": 975,
        "created": null,
        "currency": "USD",
        "id": "8eac7af9-4887-4db7-ab32-5034fa090028",
        "issn": "1687-0409",
        "journalTitle": "Abstract and Applied Analysis",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "a6fa202a-f9a5-48bb-9c54-a390862f05d9",
        "issn": "1563-5031",
        "journalTitle": "Active and Passive Electronic Components",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "4a848563-4d97-495e-ac76-aeea01f08db1",
        "issn": "1687-627X",
        "journalTitle": "Advances in Acoustics and Vibration",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "8fec69b9-1848-42fc-8fd4-23aa3139661a",
        "issn": "2314-7539",
        "journalTitle": "Advances in Agriculture",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "2f46cf2b-41fc-4db4-92b5-5d3c808bca30",
        "issn": "1687-7977",
        "journalTitle": "Advances in Astronomy",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "945825e5-a84d-4548-adb6-9bccdb685978",
        "issn": "1687-8035",
        "journalTitle": "Advances in Bioinformatics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1990,
        "created": null,
        "currency": "USD",
        "id": "78688159-e7fd-46fd-9b4c-1e3ef1c7bb66",
        "issn": "1687-8094",
        "journalTitle": "Advances in Civil Engineering",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "7430105d-105b-4134-a999-8f0779e3e82a",
        "issn": "1687-8124",
        "journalTitle": "Advances in Condensed Matter Physics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "b9f8e170-2fce-46bc-8134-f64d9ad56e89",
        "issn": "1687-711X",
        "journalTitle": "Advances in Fuzzy Systems",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "24ef4d25-4e6e-4324-8977-dc6abea429ad",
        "issn": "1687-9112",
        "journalTitle": "Advances in Hematology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "410d8db5-5296-410a-af16-3b574724d5d8",
        "issn": "1687-7365",
        "journalTitle": "Advances in High Energy Physics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "ae510bab-6ee7-4b64-88a6-551baf57aff0",
        "issn": "1687-5907",
        "journalTitle": "Advances in Human-Computer Interaction",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 2100,
        "created": null,
        "currency": "USD",
        "id": "61c90645-d3ea-4761-baaa-29efb1d2fe9f",
        "issn": "1687-8442",
        "journalTitle": "Advances in Materials Science and Engineering",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "478d0dd1-e8b7-4925-8c1a-274f68a616e7",
        "issn": "1687-9139",
        "journalTitle": "Advances in Mathematical Physics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "963d9832-ba5a-4efa-8564-fd975dd9742f",
        "issn": "2314-758X",
        "journalTitle": "Advances in Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "61aefcb8-95b1-4474-8802-cbcde7be0ec2",
        "issn": "1687-9317",
        "journalTitle": "Advances in Meteorology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "09f95824-a5aa-4ba6-9437-d794754bcc95",
        "issn": "1687-5699",
        "journalTitle": "Advances in Multimedia",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 975,
        "created": null,
        "currency": "USD",
        "id": "967500f5-988c-4de1-be24-0f95227bf210",
        "issn": "1687-9155",
        "journalTitle": "Advances in Operations Research",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "21cb39dc-c509-4993-adc8-5a9f707a20aa",
        "issn": "1687-5648",
        "journalTitle": "Advances in OptoElectronics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "c7117728-7dfc-412e-aefd-41e32e5f02c0",
        "issn": "2090-3472",
        "journalTitle": "Advances in Orthopedics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "41b96fc3-10df-4ecd-bf1c-909ac62be207",
        "issn": "1687-6342",
        "journalTitle": "Advances in Pharmacological Sciences",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "5318bc28-5d77-4634-a888-357d2eb0e7cc",
        "issn": "1098-2329",
        "journalTitle": "Advances in Polymer Technology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "1f2a103e-2d4b-44c9-a708-2593329120ec",
        "issn": "2090-3499",
        "journalTitle": "Advances in Preventive Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "d18096d1-7bee-41fb-ba90-a52e50b86b60",
        "issn": "2314-7784",
        "journalTitle": "Advances in Public Health",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "303059a7-b0ef-4727-8185-cb9a80a6fb83",
        "issn": "1687-5923",
        "journalTitle": "Advances in Tribology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "fe469b6e-ebb1-46f3-8210-624a78d8ea6a",
        "issn": "1687-6377",
        "journalTitle": "Advances in Urology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "4dd21632-cc35-4239-8cd4-f822835d77b7",
        "issn": "1687-8647",
        "journalTitle": "Advances in Virology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "2cbaddd5-fd6c-4ebc-a760-49544dbce4ad",
        "issn": "2090-1259",
        "journalTitle": "AIDS Research and Treatment",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "de99b5ea-8b72-4d75-abd4-694420ba5897",
        "issn": "2210-7185",
        "journalTitle": "Analytical Cellular Pathology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "df54da70-3d5a-4871-bee8-22395696367d",
        "issn": "2090-1275",
        "journalTitle": "Anemia",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "ec281b54-9fd1-4db9-b48f-6e29a7efa8c1",
        "issn": "1687-6970",
        "journalTitle": "Anesthesiology Research and Practice",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "a762998a-ee46-44ad-bfea-8a6635b459d0",
        "issn": "1687-7675",
        "journalTitle": "Applied and Environmental Soil Science",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "48fa74dc-ff10-4563-8af4-c57465ab9592",
        "issn": "1754-2103",
        "journalTitle": "Applied Bionics and Biomechanics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "28eb2ce1-def5-433a-b217-a28868a6c62d",
        "issn": "1687-9732",
        "journalTitle": "Applied Computational Intelligence and Soft Computing",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "7a6e751e-cc15-4de3-851a-328c5c6e413f",
        "issn": "1472-3654",
        "journalTitle": "Archaea",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "d43e969c-ad32-4a0e-9f1c-87d876bce982",
        "issn": "2090-1933",
        "journalTitle": "Autism Research and Treatment",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "61d2ef6d-f3f5-49ff-941c-88a4d318cb26",
        "issn": "2090-0430",
        "journalTitle": "Autoimmune Diseases",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "81d68892-4ee5-4f9b-9f94-5194798b41da",
        "issn": "1875-8584",
        "journalTitle": "Behavioural Neurology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "db398a03-f536-4940-a2a1-7224a7ac17b3",
        "issn": "2090-2255",
        "journalTitle": "Biochemistry Research International",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "fbb5820e-8314-4d67-ac64-847b1cdfd832",
        "issn": "1687-479X",
        "journalTitle": "Bioinorganic Chemistry and Applications",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1990,
        "created": null,
        "currency": "USD",
        "id": "cdbc8372-2136-42d7-a233-0e7c4ab45c14",
        "issn": "2314-6141",
        "journalTitle": "BioMed Research International",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "46cf3353-6cae-4420-b395-6f2b72bc882f",
        "issn": "2291-2797",
        "journalTitle": "Canadian Journal of Gastroenterology and Hepatology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "9bf0b904-c7b4-4728-83bc-9ea665c465e6",
        "issn": "1918-1493",
        "journalTitle": "Canadian Journal of Infectious Diseases and Medical Microbiology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "04c34727-77f5-4437-a5d0-647ad50d15dc",
        "issn": "1916-7245",
        "journalTitle": "Canadian Respiratory Journal",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "9bfe26a1-a744-4873-8459-980f3c40e45b",
        "issn": "2090-0597",
        "journalTitle": "Cardiology Research and Practice",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "663dc845-7b09-4b29-baad-14129db38f54",
        "issn": "1755-5922",
        "journalTitle": "Cardiovascular Therapeutics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "c9601705-bde4-4dbe-acef-fb6873fbe840",
        "issn": "2090-6390",
        "journalTitle": "Case Reports in Anesthesiology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "f5649b13-145c-40bf-88d1-94f67875a7c4",
        "issn": "2090-6412",
        "journalTitle": "Case Reports in Cardiology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "4f269398-2f77-4b45-9224-6243f7e4abac",
        "issn": "2090-6439",
        "journalTitle": "Case Reports in Critical Care",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "c708dfc2-784c-4058-9afd-80e369682ad9",
        "issn": "2090-6455",
        "journalTitle": "Case Reports in Dentistry",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "32f1dff4-5b73-4194-817c-81f1a67f3a9f",
        "issn": "2090-6471",
        "journalTitle": "Case Reports in Dermatological Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "eaf974b9-8544-42a3-8737-a6f07e633511",
        "issn": "2090-6498",
        "journalTitle": "Case Reports in Emergency Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "57e5f89d-1346-4050-a695-5846120767a1",
        "issn": "2090-651X",
        "journalTitle": "Case Reports in Endocrinology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "b15f735d-cf9e-490e-b069-ca33b1046cd9",
        "issn": "2090-6536",
        "journalTitle": "Case Reports in Gastrointestinal Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "3858befc-f602-478c-8f1e-fbca5c449d48",
        "issn": "2090-6552",
        "journalTitle": "Case Reports in Genetics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "0696e0e3-0d48-41f8-8bce-aad52a823242",
        "issn": "2090-6579",
        "journalTitle": "Case Reports in Hematology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "a0a56b12-7350-4e59-b4d9-9c83c67085be",
        "issn": "2090-6595",
        "journalTitle": "Case Reports in Hepatology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "fc1766b3-18c4-411e-9559-42a5ac19a2a6",
        "issn": "2090-6617",
        "journalTitle": "Case Reports in Immunology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "c5c8fa52-c1db-456e-bed5-1fbcbdf1dbee",
        "issn": "2090-6633",
        "journalTitle": "Case Reports in Infectious Diseases",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "b029b2f2-69be-4971-9eb8-360261f75464",
        "issn": "1687-9635",
        "journalTitle": "Case Reports in Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "df4bbf2d-6867-4856-8491-72fc6f17993c",
        "issn": "2090-665X",
        "journalTitle": "Case Reports in Nephrology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "ec2bae81-6ca6-4dcc-b3d5-145f00c9cf31",
        "issn": "2090-6676",
        "journalTitle": "Case Reports in Neurological Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "3b5cd2a0-757e-4240-a2fe-0fbdb2605d0f",
        "issn": "2090-6692",
        "journalTitle": "Case Reports in Obstetrics and Gynecology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "0c25f402-9fe8-4eb6-abc5-fc87815055e9",
        "issn": "2090-6714",
        "journalTitle": "Case Reports in Oncological Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "fae22d50-c0d4-4a23-9ff7-82f5bcf815b6",
        "issn": "2090-6730",
        "journalTitle": "Case Reports in Ophthalmological Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "75f4371f-8dec-4ec0-8e8a-34071f5a0689",
        "issn": "2090-6757",
        "journalTitle": "Case Reports in Orthopedics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "e46a031b-5cde-4eb4-9618-bb87914f5c32",
        "issn": "2090-6773",
        "journalTitle": "Case Reports in Otolaryngology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "ecaa62ec-1373-492a-9eb5-74bf46d10772",
        "issn": "2090-679X",
        "journalTitle": "Case Reports in Pathology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "f59bd059-9050-4fdb-a0f6-ecc8fdd6d5c5",
        "issn": "2090-6811",
        "journalTitle": "Case Reports in Pediatrics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "86b7e1a7-a506-4b2a-88d3-fd980b520f64",
        "issn": "2090-6838",
        "journalTitle": "Case Reports in Psychiatry",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "0ebebd93-b9bc-4fcf-87d0-e572fc5633cd",
        "issn": "2090-6854",
        "journalTitle": "Case Reports in Pulmonology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "61dbc858-0829-44ef-9aaa-974fa6041735",
        "issn": "2090-6870",
        "journalTitle": "Case Reports in Radiology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "52bab1ac-07cb-4acc-8e84-1eed3672d4e2",
        "issn": "2090-6897",
        "journalTitle": "Case Reports in Rheumatology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "ee54106d-50b0-4bff-b4ff-1473d663fd46",
        "issn": "2090-6919",
        "journalTitle": "Case Reports in Surgery",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "5a8959ad-5843-4a02-92ae-a5d2a9e17a15",
        "issn": "2090-6951",
        "journalTitle": "Case Reports in Transplantation",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "975c17ff-cec6-492f-b83e-18827c69ff3b",
        "issn": "2090-6978",
        "journalTitle": "Case Reports in Urology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "f5701e0a-d4d7-4263-a89d-1b8319e92964",
        "issn": "2090-6994",
        "journalTitle": "Case Reports in Vascular Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 575,
        "created": null,
        "currency": "USD",
        "id": "d445b7a5-46fa-463e-852f-533a991ea109",
        "issn": "2090-701X",
        "journalTitle": "Case Reports in Veterinary Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "75ca5601-fd38-4dfa-8608-d1cb0caeec58",
        "issn": "2090-3995",
        "journalTitle": "Child Development Research",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 2100,
        "created": null,
        "currency": "USD",
        "id": "9f9f864b-b521-46d1-9904-31b871501531",
        "issn": "1099-0526",
        "journalTitle": "Complexity",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "aadd5550-9f78-4489-b461-6a256405ce1b",
        "issn": "1748-6718",
        "journalTitle": "Computational and Mathematical Methods in Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "ed0533c7-de68-4236-a484-f11993f5615d",
        "issn": "1687-5273",
        "journalTitle": "Computational Intelligence and Neuroscience",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "5530bd02-296e-429e-91ab-1d97cd55a3de",
        "issn": "1552-5023",
        "journalTitle": "Concepts in Magnetic Resonance Part A",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "e01164d0-8e17-450a-8459-0fa1b5888fd2",
        "issn": "1552-504X",
        "journalTitle": "Concepts in Magnetic Resonance Part B",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "dd649408-6840-481e-b844-1853a3f8cd72",
        "issn": "1555-4317",
        "journalTitle": "Contrast Media & Molecular Imaging",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "ed834fe0-96c5-43b3-b845-95c240c8549c",
        "issn": "2090-1313",
        "journalTitle": "Critical Care Research and Practice",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "f32a5bdd-d16f-4b26-ab64-f79546ae7d9c",
        "issn": "1687-7071",
        "journalTitle": "Current Gerontology and Geriatrics Research",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "a5538e10-1e97-408a-aeec-19c4f858abdb",
        "issn": "2090-133X",
        "journalTitle": "Depression Research and Treatment",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "28513e91-be17-42d4-b07e-b6a3af6c3d4a",
        "issn": "1687-6113",
        "journalTitle": "Dermatology Research and Practice",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 2100,
        "created": null,
        "currency": "USD",
        "id": "903fe774-6cb0-40d8-b995-5d210536d224",
        "issn": "1607-887X",
        "journalTitle": "Discrete Dynamics in Nature and Society",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "d7c47328-8bb4-4ac4-aad0-5adeae6271ec",
        "issn": "1875-8630",
        "journalTitle": "Disease Markers",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "7d2fa645-18d4-415a-b04b-8c07fa10254f",
        "issn": "2090-4010",
        "journalTitle": "Education Research International",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "5b3d94c2-3614-430b-8017-894916792be5",
        "issn": "2090-2859",
        "journalTitle": "Emergency Medicine International",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "ec2fc040-8289-48f1-8c45-233d13b5a501",
        "issn": "2090-0414",
        "journalTitle": "Enzyme Research",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 2250,
        "created": null,
        "currency": "USD",
        "id": "33d89dbd-4e78-404c-93a2-bae01d57ddad",
        "issn": "1741-4288",
        "journalTitle": "Evidence-Based Complementary and Alternative Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "4561bb37-091b-4bb1-8905-7c0653d8d38e",
        "issn": "1687-630X",
        "journalTitle": "Gastroenterology Research and Practice",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "b84e8e94-9e28-41c0-ab87-31a61da49f77",
        "issn": "2090-3162",
        "journalTitle": "Genetics Research International",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "6c57e2db-b0b0-46df-96a8-c0354eb7e817",
        "issn": "1468-8123",
        "journalTitle": "Geofluids",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "c05c54cd-3d8a-4c3d-a7b7-1d758b3b9412",
        "issn": "1098-1071",
        "journalTitle": "Heteroatom Chemistry",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "7d63978b-2346-45b8-afc4-d6e3180d1d4d",
        "issn": "1098-0997",
        "journalTitle": "Infectious Diseases in Obstetrics and Gynecology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "37b7cfe1-4658-441f-af7a-5bb3e8ce12ba",
        "issn": "1687-7098",
        "journalTitle": "Interdisciplinary Perspectives on Infectious Diseases",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "4f900fbc-a905-454f-b064-78338c2a8344",
        "issn": "1687-5974",
        "journalTitle": "International Journal of Aerospace Engineering",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "fd4e8497-e0bf-4d47-b631-141c1aa88716",
        "issn": "1687-8167",
        "journalTitle": "International Journal of Agronomy",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "92ba8922-9448-48a3-8d9d-c4b63f97de81",
        "issn": "2090-0252",
        "journalTitle": "International Journal of Alzheimer’s Disease",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "0dd43f80-bf7f-425b-bad8-a3923c1038a6",
        "issn": "1687-8779",
        "journalTitle": "International Journal of Analytical Chemistry",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "1a8e62c1-6e65-48c0-bcd4-35ed96d17099",
        "issn": "1687-5877",
        "journalTitle": "International Journal of Antennas and Propagation",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "e2cec52b-3ced-44b2-8686-80776bf99d61",
        "issn": "1687-8795",
        "journalTitle": "International Journal of Biomaterials",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "9bacf99b-0a97-44ad-a3e7-43ba5dc1bf40",
        "issn": "1687-4196",
        "journalTitle": "International Journal of Biomedical Imaging",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "bccc43ab-c2cf-4063-ba9f-d8e8c06a9091",
        "issn": "2090-3189",
        "journalTitle": "International Journal of Breast Cancer",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "b8413284-f7a9-4b08-9663-ee694fac3a71",
        "issn": "1687-8884",
        "journalTitle": "International Journal of Cell Biology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "740ff0ca-014c-47f1-b5be-aa17d1ead80c",
        "issn": "1687-8078",
        "journalTitle": "International Journal of Chemical Engineering",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "ed356f03-2d08-42db-a147-75ad6a5759ee",
        "issn": "2314-5749",
        "journalTitle": "International Journal of Chronic Diseases",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "03bbe501-9300-4940-a39d-f023e9d24af7",
        "issn": "1687-7055",
        "journalTitle": "International Journal of Computer Games Technology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "679a3f18-d56b-4659-a31a-4c224ec2173e",
        "issn": "1687-9333",
        "journalTitle": "International Journal of Corrosion",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "a707c8f7-37cb-487c-99be-8b9a81403aa7",
        "issn": "1687-8736",
        "journalTitle": "International Journal of Dentistry",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 975,
        "created": null,
        "currency": "USD",
        "id": "14417925-8798-46d8-b2e3-892ed7c576e4",
        "issn": "1687-9651",
        "journalTitle": "International Journal of Differential Equations",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "91c47bfa-652d-4f6a-94b0-c0bbb31efa2e",
        "issn": "1687-7586",
        "journalTitle": "International Journal of Digital Multimedia Broadcasting",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "255c39f7-096e-438d-940d-51e78a624caf",
        "issn": "1687-9716",
        "journalTitle": "International Journal of Ecology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "0e2b2627-2e74-4ebd-b4fc-b54fe257693a",
        "issn": "2090-3537",
        "journalTitle": "International Journal of Electrochemistry",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "bc8309a7-5c09-4a8d-9aeb-6bfb6ee98245",
        "issn": "1687-8345",
        "journalTitle": "International Journal of Endocrinology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "87fea461-103d-4f68-a040-aa5c82fc3d56",
        "issn": "2314-5765",
        "journalTitle": "International Journal of Food Science",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "fb1ce241-4f16-47e8-bab4-99528a17b731",
        "issn": "1687-9376",
        "journalTitle": "International Journal of Forestry Research",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "f67c2aa0-f760-44be-a723-e5b9308cbd49",
        "issn": "2314-4378",
        "journalTitle": "International Journal of Genomics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "37ebd9fb-4394-4994-a5aa-63674a4d0d0b",
        "issn": "1687-8868",
        "journalTitle": "International Journal of Geophysics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "ada348c9-3df9-401e-b134-19828333596b",
        "issn": "2090-3456",
        "journalTitle": "International Journal of Hepatology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "552f79a6-d2db-44e9-8222-692a03a018ab",
        "issn": "2090-0392",
        "journalTitle": "International Journal of Hypertension",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "fa9c89c3-d065-4402-825f-2558f9489f9e",
        "issn": "2042-0099",
        "journalTitle": "International Journal of Inflammation",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 975,
        "created": null,
        "currency": "USD",
        "id": "15c032ae-9ad9-4754-83d6-d5442bc4c616",
        "issn": "1687-0425",
        "journalTitle": "International Journal of Mathematics and Mathematical Sciences",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "b3f6f976-554c-4d47-a710-ec7c93b26a1e",
        "issn": "2090-2077",
        "journalTitle": "International Journal of Medicinal Chemistry",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "a5f7ffd4-3680-41f7-8705-d88630877352",
        "issn": "1687-9198",
        "journalTitle": "International Journal of Microbiology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "55fca093-c6a2-457e-af3f-c70ba897b686",
        "issn": "2090-2158",
        "journalTitle": "International Journal of Nephrology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "e3704270-a403-47bb-8528-049ee6f0b853",
        "issn": "1687-9392",
        "journalTitle": "International Journal of Optics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "63d44b0b-b568-4b56-9910-3217ac77625c",
        "issn": "1687-921X",
        "journalTitle": "International Journal of Otolaryngology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "3b47351d-a542-48dc-98d8-b5813f8df64f",
        "issn": "1687-9759",
        "journalTitle": "International Journal of Pediatrics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "e21c9ab1-a693-41e2-9e22-47f055414e1d",
        "issn": "1687-529X",
        "journalTitle": "International Journal of Photoenergy",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "0d37fed7-6081-4f92-a2ba-0f3cd49cfe46",
        "issn": "1687-9430",
        "journalTitle": "International Journal of Polymer Science",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "715ec5fe-2959-422c-b97a-613a7d3f6980",
        "issn": "1687-7209",
        "journalTitle": "International Journal of Reconfigurable Computing",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "0a3d18d9-bb85-477f-862d-b6aeef43812c",
        "issn": "2314-5757",
        "journalTitle": "International Journal of Reproductive Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "8f546c0b-8de0-4c83-941f-bf5d3bd6d41f",
        "issn": "1687-9279",
        "journalTitle": "International Journal of Rheumatology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "d6fc5b20-08b9-48f8-a31c-5d3f4a841565",
        "issn": "1542-3034",
        "journalTitle": "International Journal of Rotating Machinery",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "089a5919-157c-454d-9b91-cf8ba36a0db0",
        "issn": "2090-1410",
        "journalTitle": "International Journal of Surgical Oncology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "57e41706-4b83-47ea-ac3c-0d45f369d1a0",
        "issn": "1687-6423",
        "journalTitle": "International Journal of Telemedicine and Applications",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "7539929e-0abf-4478-812d-c5ddd0c4ba61",
        "issn": "2090-2832",
        "journalTitle": "International Journal of Vascular Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "e88c0f19-0928-41b8-bc0e-9de8a182dc57",
        "issn": "1687-8485",
        "journalTitle": "International Journal of Zoology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "5de533b8-7dcc-4ef9-9d1c-3106e6998baa",
        "issn": "2090-7850",
        "journalTitle": "Journal of Addiction",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 2100,
        "created": null,
        "currency": "USD",
        "id": "88c4a147-ecde-4bc6-bff4-01c2d06f1386",
        "issn": "2042-3195",
        "journalTitle": "Journal of Advanced Transportation",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "8389e63e-1ea8-4822-96c3-bff2179c0b19",
        "issn": "2090-2212",
        "journalTitle": "Journal of Aging Research",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "3b18c602-3429-4995-87f0-aa7134014052",
        "issn": "2090-8873",
        "journalTitle": "Journal of Analytical Methods in Chemistry",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 975,
        "created": null,
        "currency": "USD",
        "id": "28338a86-daa3-4e2e-ae84-b6213fcda142",
        "issn": "1687-0042",
        "journalTitle": "Journal of Applied Mathematics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "e131c207-544b-4c88-8784-7f7a505f9cc4",
        "issn": "1687-8566",
        "journalTitle": "Journal of Cancer Epidemiology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "3d93e259-8528-4752-be54-385ac42d861a",
        "issn": "2090-9071",
        "journalTitle": "Journal of Chemistry",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "558d9416-fa62-4427-9988-2e0c62c6f0a0",
        "issn": "2090-1976",
        "journalTitle": "Journal of Combustion",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "19e910fd-09e2-4fda-a77d-6cf6c92a37dd",
        "issn": "2090-715X",
        "journalTitle": "Journal of Computer Networks and Communications",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "7399beb5-e7f1-4a1c-b8c2-7f4c6f3a68b3",
        "issn": "1687-5257",
        "journalTitle": "Journal of Control Science and Engineering",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "101a5113-d877-4a27-81e9-9e8c4a4b19c1",
        "issn": "2314-6753",
        "journalTitle": "Journal of Diabetes Research",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "1dc8220e-7dcc-4b87-9261-dce2310b106f",
        "issn": "2090-3022",
        "journalTitle": "Journal of Drug Delivery",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "cb092677-0dae-427e-bfae-60ae46bdae16",
        "issn": "2090-0155",
        "journalTitle": "Journal of Electrical and Computer Engineering",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "ddb27d90-57a0-4540-a1c0-f47444eb4bb7",
        "issn": "2314-615X",
        "journalTitle": "Journal of Energy",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "607282c6-aba7-4944-8be7-5ec81bf9d501",
        "issn": "2314-4912",
        "journalTitle": "Journal of Engineering",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "5723bbd3-4ef7-42a5-9262-470f2e060fb8",
        "issn": "1687-9813",
        "journalTitle": "Journal of Environmental and Public Health",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "23f91103-1ea0-4a53-8357-a1142e8cd62f",
        "issn": "1745-4557",
        "journalTitle": "Journal of Food Quality",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "05420fef-25be-4f6e-8d04-d979e3df0261",
        "issn": "2314-8888",
        "journalTitle": "Journal of Function Spaces",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "3236ec20-5507-46e8-9dd3-b4a584059d12",
        "issn": "2040-2309",
        "journalTitle": "Journal of Healthcare Engineering",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "e547fa02-128e-4817-8b3b-2dab1982ea7d",
        "issn": "2314-7156",
        "journalTitle": "Journal of Immunology Research",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "6307d28f-6d0f-4012-a713-54dc306f0d3a",
        "issn": "1540-8183",
        "journalTitle": "Journal of Interventional Cardiology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "559fc409-da1d-4a75-940f-6ecccb298f39",
        "issn": "2090-3049",
        "journalTitle": "Journal of Lipids",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "b011e777-5b7e-405a-bdc1-571ee209750a",
        "issn": "1687-949X",
        "journalTitle": "Journal of Marine Biology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 975,
        "created": null,
        "currency": "USD",
        "id": "2b6e8461-e665-4097-be05-0fd824f3d137",
        "issn": "2314-4785",
        "journalTitle": "Journal of Mathematics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "c1038d32-01fe-4ed5-a517-89fd494bd0ff",
        "issn": "1687-4129",
        "journalTitle": "Journal of Nanomaterials",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "7f228c4e-8992-4e34-9246-5140d79eac51",
        "issn": "1687-9511",
        "journalTitle": "Journal of Nanotechnology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "91194056-b6b0-4993-93cb-05d7e6da69b8",
        "issn": "2090-021X",
        "journalTitle": "Journal of Nucleic Acids",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "47028487-86ed-4c55-98db-47aa734a5b07",
        "issn": "2090-0732",
        "journalTitle": "Journal of Nutrition and Metabolism",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "24fb4ceb-0e66-4cb2-bcc7-36a7f53a32bf",
        "issn": "2090-0716",
        "journalTitle": "Journal of Obesity",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "f510a37c-0323-4dc3-8d61-7e5371eb46a7",
        "issn": "1687-8469",
        "journalTitle": "Journal of Oncology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 2100,
        "created": null,
        "currency": "USD",
        "id": "deb1ea7c-797f-4939-8fac-65052f81c4f8",
        "issn": "2090-0058",
        "journalTitle": "Journal of Ophthalmology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 975,
        "created": null,
        "currency": "USD",
        "id": "9030267b-deaa-4e94-9b0e-2b6f61e2726b",
        "issn": "2314-6486",
        "journalTitle": "Journal of Optimization",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "85b1c7f6-1812-4418-bc6c-c9efd041bd2b",
        "issn": "2042-0064",
        "journalTitle": "Journal of Osteoporosis",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "0e5707e1-1507-4aae-9111-33521dffd030",
        "issn": "2090-0031",
        "journalTitle": "Journal of Parasitology Research",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "199d1342-6fc5-4962-8b67-7d9e7e9ba0e9",
        "issn": "2090-3065",
        "journalTitle": "Journal of Pathogens",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "3a1baa27-44b0-40aa-9618-e9c5ae789dad",
        "issn": "2090-7818",
        "journalTitle": "Journal of Pharmaceutics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "796a825b-b060-4141-a29e-a57c67fc5a2a",
        "issn": "2090-2735",
        "journalTitle": "Journal of Pregnancy",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 975,
        "created": null,
        "currency": "USD",
        "id": "00cfc4b5-4b72-4a73-a2a2-3a18bd2f7722",
        "issn": "1687-9538",
        "journalTitle": "Journal of Probability and Statistics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "12cdd291-d2e5-47f4-8aa6-b9b6b463dba9",
        "issn": "2314-4394",
        "journalTitle": "Journal of Renewable Energy",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "ae050542-116d-49c3-a708-1c06da365991",
        "issn": "1687-9619",
        "journalTitle": "Journal of Robotics",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "75c60ba5-be49-49d7-aca1-a37c9471d9ab",
        "issn": "1687-7268",
        "journalTitle": "Journal of Sensors",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "7aeb3a5a-d87a-44f5-89eb-f589dd96677f",
        "issn": "2090-2913",
        "journalTitle": "Journal of Skin Cancer",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "5d1cde58-c5f5-4788-bf11-d03bb1889dea",
        "issn": "2314-4939",
        "journalTitle": "Journal of Spectroscopy",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "2fc36751-410e-4519-8029-b6c9234e1214",
        "issn": "2314-6176",
        "journalTitle": "Journal of Sports Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "e157dc61-3657-4b7b-adfb-61955bd5dba1",
        "issn": "2042-0072",
        "journalTitle": "Journal of Thyroid Research",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "7f44f1cd-d2a5-4c96-b50d-a838e8c26482",
        "issn": "1687-8205",
        "journalTitle": "Journal of Toxicology",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "1b325917-1566-4e8c-9802-d0d6f60c77d4",
        "issn": "2090-0015",
        "journalTitle": "Journal of Transplantation",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "9f327996-a753-4a10-8703-5fa75492d4e2",
        "issn": "1687-9694",
        "journalTitle": "Journal of Tropical Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "54efa1fb-9c2f-4bb8-aac2-e40a7a685726",
        "issn": "2314-6966",
        "journalTitle": "Journal of Veterinary Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "cff0b81d-e401-44d4-bba0-81ae972a2de4",
        "issn": "2044-4362",
        "journalTitle": "Malaria Research and Treatment",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 2100,
        "created": null,
        "currency": "USD",
        "id": "1f2c5e22-1b5b-4c18-86c6-acf10f29fd4f",
        "issn": "1563-5147",
        "journalTitle": "Mathematical Problems in Engineering",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "36738768-8867-423a-b12a-64a633001f93",
        "issn": "1466-1861",
        "journalTitle": "Mediators of Inflammation",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "f727dba6-e26d-493a-bc5a-4e26abd9efb2",
        "issn": "2090-1453",
        "journalTitle": "Minimally Invasive Surgery",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "42653522-a066-4fde-8adb-8ed0fb761c66",
        "issn": "1875-905X",
        "journalTitle": "Mobile Information Systems",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "b1f7be04-0b5d-47e5-a802-d80db3a9be24",
        "issn": "1687-5605",
        "journalTitle": "Modelling and Simulation in Engineering",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "8c48708a-bff3-44ea-bccc-699a2e535b2a",
        "issn": "2090-2662",
        "journalTitle": "Multiple Sclerosis International",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "e99112b9-ffd8-4b2b-a8dc-f07c684365c2",
        "issn": "1687-5443",
        "journalTitle": "Neural Plasticity",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "e6fc89cf-2a21-475f-88e5-b818c7460e31",
        "issn": "2090-1860",
        "journalTitle": "Neurology Research International",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "2880cd77-0a53-4c35-827b-d5d5070f5431",
        "issn": "2314-4270",
        "journalTitle": "Neuroscience Journal",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "bc3b1f8e-a9a3-4d8f-8e9c-226c624bb872",
        "issn": "2090-1437",
        "journalTitle": "Nursing Research and Practice",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "4224dd49-4e89-477e-8614-9d0af4de66b9",
        "issn": "1687-9597",
        "journalTitle": "Obstetrics and Gynecology International",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "99ba7198-3ff4-4643-9404-be726a36b248",
        "issn": "1557-0703",
        "journalTitle": "Occupational Therapy International",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 2100,
        "created": null,
        "currency": "USD",
        "id": "76edb8aa-2e2e-4887-bb2d-ded6f7459aeb",
        "issn": "1942-0994",
        "journalTitle": "Oxidative Medicine and Cellular Longevity",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "909613f7-0fa4-4e57-b598-e75f0c252f77",
        "issn": "1918-1523",
        "journalTitle": "Pain Research and Management",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "303362d4-6878-4737-b80c-fb75a0f14f88",
        "issn": "2042-0080",
        "journalTitle": "Parkinson’s Disease",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "307eac80-bad6-4dd6-b3bd-3872a6a4e31f",
        "issn": "1687-4765",
        "journalTitle": "PPAR Research",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "4ce192ce-0b9a-49be-a01f-c7d1da9af30b",
        "issn": "2090-312X",
        "journalTitle": "Prostate Cancer",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "818f891e-bb4c-4047-b73f-6ae309af95fe",
        "issn": "1687-7438",
        "journalTitle": "Psyche",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "5934fb9b-24d8-4ba7-93f8-17ddc1268dfd",
        "issn": "2314-4335",
        "journalTitle": "Psychiatry Journal",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "e433ebe1-1bb2-4c15-8bc0-a784212dd530",
        "issn": "2090-1844",
        "journalTitle": "Pulmonary Medicine",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "826fa0d3-c939-4c3a-aabd-6b6814f7bb2e",
        "issn": "2090-195X",
        "journalTitle": "Radiology Research and Practice",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "c7dda498-81e2-4c91-98da-19dfbee1346a",
        "issn": "2090-2875",
        "journalTitle": "Rehabilitation Research and Practice",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "7a588f3e-f735-4ba6-832a-69bb92eb2057",
        "issn": "1369-1643",
        "journalTitle": "Sarcoma",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "94ee9feb-3f4f-4df1-8784-abf144bdc4da",
        "issn": "1932-8745",
        "journalTitle": "Scanning",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "b6572cc5-b006-43e0-a73b-c25827b9b627",
        "issn": "2090-2093",
        "journalTitle": "Schizophrenia Research and Treatment",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1300,
        "created": null,
        "currency": "USD",
        "id": "c2757b93-8863-4a92-bb20-b62163768a97",
        "issn": "1687-6083",
        "journalTitle": "Science and Technology of Nuclear Installations",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1600,
        "created": null,
        "currency": "USD",
        "id": "defab60b-e668-4193-8dca-462923eceeae",
        "issn": "1875-919X",
        "journalTitle": "Scientific Programming",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "cb553d86-8ff2-4121-9b45-ad52e322d0b8",
        "issn": "2090-908X",
        "journalTitle": "Scientifica",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "a69677e0-01bf-40d8-84c5-14952ac19abe",
        "issn": "1939-0122",
        "journalTitle": "Security and Communication Networks",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 2100,
        "created": null,
        "currency": "USD",
        "id": "5491b0e3-f555-4995-9246-0cd677e13db9",
        "issn": "1875-9203",
        "journalTitle": "Shock and Vibration",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "f53e576d-89c2-4dd9-abfa-0ab024acf984",
        "issn": "2090-3553",
        "journalTitle": "Sleep Disorders",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1900,
        "created": null,
        "currency": "USD",
        "id": "845008a7-a2cb-43dd-9663-32673cdf8da1",
        "issn": "1687-9678",
        "journalTitle": "Stem Cells International",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 1025,
        "created": null,
        "currency": "USD",
        "id": "52db5c0d-21ce-4965-9d64-d78e9d31c745",
        "issn": "2042-0056",
        "journalTitle": "Stroke Research and Treatment",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "020e3348-b8a4-43ec-bd53-f4d65bfae35b",
        "issn": "2356-6124",
        "journalTitle": "Surgery Research and Practice",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "b6150925-2cc5-458b-940d-0d6f6006ce7e",
        "issn": "1537-744X",
        "journalTitle": "The Scientific World Journal",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "73237d6b-9d63-4fe8-93eb-c39fb5d2c096",
        "issn": "2090-1518",
        "journalTitle": "Tuberculosis Research and Treatment",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 775,
        "created": null,
        "currency": "USD",
        "id": "f9a12cda-3b3f-4cb8-8772-ee6a1f9a2316",
        "issn": "2042-0048",
        "journalTitle": "Veterinary Medicine International",
        "type": "APC",
        "updated": null
    },
    {
        "amount": 2100,
        "created": null,
        "currency": "USD",
        "id": "96c6fe72-cf2b-44a7-a355-57818aac8f0f",
        "issn": "1530-8677",
        "journalTitle": "Wireless Communications and Mobile Computing",
        "type": "APC",
        "updated": null
    }
]
} as const;
