// import * as Knex from 'knex';
const uuid = require('uuid/v4');

const catalog_items = [
  {
    "journalTitle": "Abstract and Applied Analysis",
    "ISSN": "1687-0409",
    "APC": {"currency": "USD", "amount": "975.00"}
  },
  {
    "journalTitle": "Active and Passive Electronic Components",
    "ISSN": "1563-5031",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Advances in Acoustics and Vibration",
    "ISSN": "1687-627X",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Advances in Agriculture",
    "ISSN": "2314-7539",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Advances in Astronomy",
    "ISSN": "1687-7977",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Advances in Bioinformatics",
    "ISSN": "1687-8035",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Advances in Civil Engineering",
    "ISSN": "1687-8094",
    "APC": {"currency": "USD", "amount": "1,990.00"}
  },
  {
    "journalTitle": "Advances in Condensed Matter Physics",
    "ISSN": "1687-8124",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Advances in Fuzzy Systems",
    "ISSN": "1687-711X",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Advances in Hematology",
    "ISSN": "1687-9112",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Advances in High Energy Physics",
    "ISSN": "1687-7365",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Advances in Human-Computer Interaction",
    "ISSN": "1687-5907",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Advances in Materials Science and Engineering",
    "ISSN": "1687-8442",
    "APC": {"currency": "USD", "amount": "2,100.00"}
  },
  {
    "journalTitle": "Advances in Mathematical Physics",
    "ISSN": "1687-9139",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Advances in Medicine",
    "ISSN": "2314-758X",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Advances in Meteorology",
    "ISSN": "1687-9317",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Advances in Multimedia",
    "ISSN": "1687-5699",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Advances in Operations Research",
    "ISSN": "1687-9155",
    "APC": {"currency": "USD", "amount": "975.00"}
  },
  {
    "journalTitle": "Advances in OptoElectronics",
    "ISSN": "1687-5648",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Advances in Orthopedics",
    "ISSN": "2090-3472",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Advances in Pharmacological Sciences",
    "ISSN": "1687-6342",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Advances in Polymer Technology",
    "ISSN": "1098-2329",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Advances in Preventive Medicine",
    "ISSN": "2090-3499",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Advances in Public Health",
    "ISSN": "2314-7784",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Advances in Tribology",
    "ISSN": "1687-5923",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Advances in Urology",
    "ISSN": "1687-6377",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Advances in Virology",
    "ISSN": "1687-8647",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "AIDS Research and Treatment",
    "ISSN": "2090-1259",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Analytical Cellular Pathology",
    "ISSN": "2210-7185",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Anemia",
    "ISSN": "2090-1275",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Anesthesiology Research and Practice",
    "ISSN": "1687-6970",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Applied and Environmental Soil Science",
    "ISSN": "1687-7675",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Applied Bionics and Biomechanics",
    "ISSN": "1754-2103",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Applied Computational Intelligence and Soft Computing",
    "ISSN": "1687-9732",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Archaea",
    "ISSN": "1472-3654",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Autism Research and Treatment",
    "ISSN": "2090-1933",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Autoimmune Diseases",
    "ISSN": "2090-0430",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Behavioural Neurology",
    "ISSN": "1875-8584",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Biochemistry Research International",
    "ISSN": "2090-2255",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Bioinorganic Chemistry and Applications",
    "ISSN": "1687-479X",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "BioMed Research International",
    "ISSN": "2314-6141",
    "APC": {"currency": "USD", "amount": "1,990.00"}
  },
  {
    "journalTitle": "Canadian Journal of Gastroenterology and Hepatology",
    "ISSN": "2291-2797",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Canadian Journal of Infectious Diseases and Medical Microbiology",
    "ISSN": "1918-1493",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Canadian Respiratory Journal",
    "ISSN": "1916-7245",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Cardiology Research and Practice",
    "ISSN": "2090-0597",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Cardiovascular Therapeutics",
    "ISSN": "1755-5922",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Case Reports in Anesthesiology",
    "ISSN": "2090-6390",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Cardiology",
    "ISSN": "2090-6412",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Critical Care",
    "ISSN": "2090-6439",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Dentistry",
    "ISSN": "2090-6455",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Dermatological Medicine",
    "ISSN": "2090-6471",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Emergency Medicine",
    "ISSN": "2090-6498",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Endocrinology",
    "ISSN": "2090-651X",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Gastrointestinal Medicine",
    "ISSN": "2090-6536",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Genetics",
    "ISSN": "2090-6552",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Hematology",
    "ISSN": "2090-6579",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Hepatology",
    "ISSN": "2090-6595",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Immunology",
    "ISSN": "2090-6617",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Infectious Diseases",
    "ISSN": "2090-6633",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Medicine",
    "ISSN": "1687-9635",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Nephrology",
    "ISSN": "2090-665X",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Neurological Medicine",
    "ISSN": "2090-6676",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Obstetrics and Gynecology",
    "ISSN": "2090-6692",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Oncological Medicine",
    "ISSN": "2090-6714",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Ophthalmological Medicine",
    "ISSN": "2090-6730",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Orthopedics",
    "ISSN": "2090-6757",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Otolaryngology",
    "ISSN": "2090-6773",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Pathology",
    "ISSN": "2090-679X",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Pediatrics",
    "ISSN": "2090-6811",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Psychiatry",
    "ISSN": "2090-6838",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Pulmonology",
    "ISSN": "2090-6854",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Radiology",
    "ISSN": "2090-6870",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Rheumatology",
    "ISSN": "2090-6897",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Surgery",
    "ISSN": "2090-6919",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Transplantation",
    "ISSN": "2090-6951",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Urology",
    "ISSN": "2090-6978",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Vascular Medicine",
    "ISSN": "2090-6994",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Case Reports in Veterinary Medicine",
    "ISSN": "2090-701X",
    "APC": {"currency": "USD", "amount": "575.00"}
  },
  {
    "journalTitle": "Child Development Research",
    "ISSN": "2090-3995",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Complexity",
    "ISSN": "1099-0526",
    "APC": {"currency": "USD", "amount": "2,100.00"}
  },
  {
    "journalTitle": "Computational and Mathematical Methods in Medicine",
    "ISSN": "1748-6718",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Computational Intelligence and Neuroscience",
    "ISSN": "1687-5273",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Concepts in Magnetic Resonance Part A",
    "ISSN": "1552-5023",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Concepts in Magnetic Resonance Part B",
    "ISSN": "1552-504X",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Contrast Media & Molecular Imaging",
    "ISSN": "1555-4317",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Critical Care Research and Practice",
    "ISSN": "2090-1313",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Current Gerontology and Geriatrics Research",
    "ISSN": "1687-7071",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Depression Research and Treatment",
    "ISSN": "2090-133X",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Dermatology Research and Practice",
    "ISSN": "1687-6113",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Discrete Dynamics in Nature and Society",
    "ISSN": "1607-887X",
    "APC": {"currency": "USD", "amount": "2,100.00"}
  },
  {
    "journalTitle": "Disease Markers",
    "ISSN": "1875-8630",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Education Research International",
    "ISSN": "2090-4010",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Emergency Medicine International",
    "ISSN": "2090-2859",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Enzyme Research",
    "ISSN": "2090-0414",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Evidence-Based Complementary and Alternative Medicine",
    "ISSN": "1741-4288",
    "APC": {"currency": "USD", "amount": "2,250.00"}
  },
  {
    "journalTitle": "Gastroenterology Research and Practice",
    "ISSN": "1687-630X",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Genetics Research International",
    "ISSN": "2090-3162",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Geofluids",
    "ISSN": "1468-8123",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Heteroatom Chemistry",
    "ISSN": "1098-1071",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Infectious Diseases in Obstetrics and Gynecology",
    "ISSN": "1098-0997",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Interdisciplinary Perspectives on Infectious Diseases",
    "ISSN": "1687-7098",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "International Journal of Aerospace Engineering",
    "ISSN": "1687-5974",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "International Journal of Agronomy",
    "ISSN": "1687-8167",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Alzheimer’s Disease",
    "ISSN": "2090-0252",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "International Journal of Analytical Chemistry",
    "ISSN": "1687-8779",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "International Journal of Antennas and Propagation",
    "ISSN": "1687-5877",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "International Journal of Biomaterials",
    "ISSN": "1687-8795",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Biomedical Imaging",
    "ISSN": "1687-4196",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Breast Cancer",
    "ISSN": "2090-3189",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Cell Biology",
    "ISSN": "1687-8884",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "International Journal of Chemical Engineering",
    "ISSN": "1687-8078",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Chronic Diseases",
    "ISSN": "2314-5749",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "International Journal of Computer Games Technology",
    "ISSN": "1687-7055",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Corrosion",
    "ISSN": "1687-9333",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Dentistry",
    "ISSN": "1687-8736",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "International Journal of Differential Equations",
    "ISSN": "1687-9651",
    "APC": {"currency": "USD", "amount": "975.00"}
  },
  {
    "journalTitle": "International Journal of Digital Multimedia Broadcasting",
    "ISSN": "1687-7586",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Ecology",
    "ISSN": "1687-9716",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "International Journal of Electrochemistry",
    "ISSN": "2090-3537",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Endocrinology",
    "ISSN": "1687-8345",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "International Journal of Food Science",
    "ISSN": "2314-5765",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "International Journal of Forestry Research",
    "ISSN": "1687-9376",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "International Journal of Genomics",
    "ISSN": "2314-4378",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "International Journal of Geophysics",
    "ISSN": "1687-8868",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Hepatology",
    "ISSN": "2090-3456",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Hypertension",
    "ISSN": "2090-0392",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "International Journal of Inflammation",
    "ISSN": "2042-0099",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Mathematics and Mathematical Sciences",
    "ISSN": "1687-0425",
    "APC": {"currency": "USD", "amount": "975.00"}
  },
  {
    "journalTitle": "International Journal of Medicinal Chemistry",
    "ISSN": "2090-2077",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Microbiology",
    "ISSN": "1687-9198",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "International Journal of Nephrology",
    "ISSN": "2090-2158",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Optics",
    "ISSN": "1687-9392",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "International Journal of Otolaryngology",
    "ISSN": "1687-921X",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "International Journal of Pediatrics",
    "ISSN": "1687-9759",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Photoenergy",
    "ISSN": "1687-529X",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "International Journal of Polymer Science",
    "ISSN": "1687-9430",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "International Journal of Reconfigurable Computing",
    "ISSN": "1687-7209",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Reproductive Medicine",
    "ISSN": "2314-5757",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "International Journal of Rheumatology",
    "ISSN": "1687-9279",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Rotating Machinery",
    "ISSN": "1542-3034",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Surgical Oncology",
    "ISSN": "2090-1410",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Telemedicine and Applications",
    "ISSN": "1687-6423",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Vascular Medicine",
    "ISSN": "2090-2832",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "International Journal of Zoology",
    "ISSN": "1687-8485",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Journal of Addiction",
    "ISSN": "2090-7850",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Journal of Advanced Transportation",
    "ISSN": "2042-3195",
    "APC": {"currency": "USD", "amount": "2,100.00"}
  },
  {
    "journalTitle": "Journal of Aging Research",
    "ISSN": "2090-2212",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Journal of Analytical Methods in Chemistry",
    "ISSN": "2090-8873",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Journal of Applied Mathematics",
    "ISSN": "1687-0042",
    "APC": {"currency": "USD", "amount": "975.00"}
  },
  {
    "journalTitle": "Journal of Cancer Epidemiology",
    "ISSN": "1687-8566",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Chemistry",
    "ISSN": "2090-9071",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Journal of Combustion",
    "ISSN": "2090-1976",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Computer Networks and Communications",
    "ISSN": "2090-715X",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Control Science and Engineering",
    "ISSN": "1687-5257",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Journal of Diabetes Research",
    "ISSN": "2314-6753",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Journal of Drug Delivery",
    "ISSN": "2090-3022",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Electrical and Computer Engineering",
    "ISSN": "2090-0155",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Journal of Energy",
    "ISSN": "2314-615X",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Journal of Engineering",
    "ISSN": "2314-4912",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Journal of Environmental and Public Health",
    "ISSN": "1687-9813",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Food Quality",
    "ISSN": "1745-4557",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Journal of Function Spaces",
    "ISSN": "2314-8888",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Journal of Healthcare Engineering",
    "ISSN": "2040-2309",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Journal of Immunology Research",
    "ISSN": "2314-7156",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Journal of Interventional Cardiology",
    "ISSN": "1540-8183",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Journal of Lipids",
    "ISSN": "2090-3049",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Marine Biology",
    "ISSN": "1687-949X",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Journal of Mathematics",
    "ISSN": "2314-4785",
    "APC": {"currency": "USD", "amount": "975.00"}
  },
  {
    "journalTitle": "Journal of Nanomaterials",
    "ISSN": "1687-4129",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Journal of Nanotechnology",
    "ISSN": "1687-9511",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Nucleic Acids",
    "ISSN": "2090-021X",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Nutrition and Metabolism",
    "ISSN": "2090-0732",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Obesity",
    "ISSN": "2090-0716",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Oncology",
    "ISSN": "1687-8469",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Journal of Ophthalmology",
    "ISSN": "2090-0058",
    "APC": {"currency": "USD", "amount": "2,100.00"}
  },
  {
    "journalTitle": "Journal of Optimization",
    "ISSN": "2314-6486",
    "APC": {"currency": "USD", "amount": "975.00"}
  },
  {
    "journalTitle": "Journal of Osteoporosis",
    "ISSN": "2042-0064",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Parasitology Research",
    "ISSN": "2090-0031",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Journal of Pathogens",
    "ISSN": "2090-3065",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Pharmaceutics",
    "ISSN": "2090-7818",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Pregnancy",
    "ISSN": "2090-2735",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Probability and Statistics",
    "ISSN": "1687-9538",
    "APC": {"currency": "USD", "amount": "975.00"}
  },
  {
    "journalTitle": "Journal of Renewable Energy",
    "ISSN": "2314-4394",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Journal of Robotics",
    "ISSN": "1687-9619",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Sensors",
    "ISSN": "1687-7268",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Journal of Skin Cancer",
    "ISSN": "2090-2913",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Spectroscopy",
    "ISSN": "2314-4939",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Journal of Sports Medicine",
    "ISSN": "2314-6176",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Journal of Thyroid Research",
    "ISSN": "2042-0072",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Toxicology",
    "ISSN": "1687-8205",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Transplantation",
    "ISSN": "2090-0015",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Tropical Medicine",
    "ISSN": "1687-9694",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Journal of Veterinary Medicine",
    "ISSN": "2314-6966",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Malaria Research and Treatment",
    "ISSN": "2044-4362",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Mathematical Problems in Engineering",
    "ISSN": "1563-5147",
    "APC": {"currency": "USD", "amount": "2,100.00"}
  },
  {
    "journalTitle": "Mediators of Inflammation",
    "ISSN": "1466-1861",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Minimally Invasive Surgery",
    "ISSN": "2090-1453",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Mobile Information Systems",
    "ISSN": "1875-905X",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Modelling and Simulation in Engineering",
    "ISSN": "1687-5605",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Multiple Sclerosis International",
    "ISSN": "2090-2662",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Neural Plasticity",
    "ISSN": "1687-5443",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Neurology Research International",
    "ISSN": "2090-1860",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Neuroscience Journal",
    "ISSN": "2314-4270",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Nursing Research and Practice",
    "ISSN": "2090-1437",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Obstetrics and Gynecology International",
    "ISSN": "1687-9597",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Occupational Therapy International",
    "ISSN": "1557-0703",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Oxidative Medicine and Cellular Longevity",
    "ISSN": "1942-0994",
    "APC": {"currency": "USD", "amount": "2,100.00"}
  },
  {
    "journalTitle": "Pain Research and Management",
    "ISSN": "1918-1523",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Parkinson’s Disease",
    "ISSN": "2042-0080",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "PPAR Research",
    "ISSN": "1687-4765",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Prostate Cancer",
    "ISSN": "2090-312X",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Psyche",
    "ISSN": "1687-7438",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Psychiatry Journal",
    "ISSN": "2314-4335",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Pulmonary Medicine",
    "ISSN": "2090-1844",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Radiology Research and Practice",
    "ISSN": "2090-195X",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Rehabilitation Research and Practice",
    "ISSN": "2090-2875",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Sarcoma",
    "ISSN": "1369-1643",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Scanning",
    "ISSN": "1932-8745",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Schizophrenia Research and Treatment",
    "ISSN": "2090-2093",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Science and Technology of Nuclear Installations",
    "ISSN": "1687-6083",
    "APC": {"currency": "USD", "amount": "1,300.00"}
  },
  {
    "journalTitle": "Scientific Programming",
    "ISSN": "1875-919X",
    "APC": {"currency": "USD", "amount": "1,600.00"}
  },
  {
    "journalTitle": "Scientifica",
    "ISSN": "2090-908X",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Security and Communication Networks",
    "ISSN": "1939-0122",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Shock and Vibration",
    "ISSN": "1875-9203",
    "APC": {"currency": "USD", "amount": "2,100.00"}
  },
  {
    "journalTitle": "Sleep Disorders",
    "ISSN": "2090-3553",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Stem Cells International",
    "ISSN": "1687-9678",
    "APC": {"currency": "USD", "amount": "1,900.00"}
  },
  {
    "journalTitle": "Stroke Research and Treatment",
    "ISSN": "2042-0056",
    "APC": {"currency": "USD", "amount": "1,025.00"}
  },
  {
    "journalTitle": "Surgery Research and Practice",
    "ISSN": "2356-6124",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "The Scientific World Journal",
    "ISSN": "1537-744X",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Tuberculosis Research and Treatment",
    "ISSN": "2090-1518",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Veterinary Medicine International",
    "ISSN": "2042-0048",
    "APC": {"currency": "USD", "amount": "775.00"}
  },
  {
    "journalTitle": "Wireless Communications and Mobile Computing",
    "ISSN": "1530-8677",
    "APC": {"currency": "USD", "amount": "2,100.00"}
  }
]


module.exports.seed = (knex) => ci_seed(knex);

const ci_seed = async (knex) => {
  await knex('catalog').del();

  const inserts = catalog_items.reduce((inserts, ci) => {
    const {
      journalTitle,
      ISSN,
      APC: {currency, amount}
    } = ci;

    const catalogItem = {
      id: uuid(),
      journalTitle,
      issn: ISSN,
      type: 'APC',
      amount: Number(parseFloat(amount.replace(',', ''))),
      currency
    };
    inserts.push(knex('catalog').insert(catalogItem));
    return inserts;
  }, []);

  await Promise.all(inserts);
};

export {};
