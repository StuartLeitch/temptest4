# ERP References

## Invoices

### Sage only

To identify the SAGE specific data from `invoices` table before being copied into `erp_references`:

```sql
-- SAGE ONLY!
SELECT
  "i"."id" AS "entity_id",
  'invoice' AS TYPE,
  'sage' AS vendor,
  UNNEST(ARRAY ['erp', 'revenueRecognition']) AS "attribute",
  UNNEST(ARRAY [ "i"."erpReference", "i"."revenueRecognitionReference"]) AS "value"
FROM
  "invoices" AS i
GROUP BY
  "i"."id"
```

To actually move the data:

```sql
INSERT INTO erp_references (entity_id, TYPE, vendor, attribute, value) (
  SELECT
    "i"."id" AS "entity_id",
    'invoice' AS TYPE,
    'sage' AS vendor,
    UNNEST(ARRAY ['erp', 'revenueRecognition']) AS "attribute",
    UNNEST(ARRAY [ "i"."erpReference", "i"."revenueRecognitionReference"]) AS "value"
  FROM
    "invoices" AS i
  GROUP BY
    "i"."id"
)
```

### NetSuite only

To identify the NetSuite specific data from `invoices` table before being copied into `erp_references`:

```sql
-- NetSuite ONLY!
SELECT
  "i"."id" AS "entity_id",
  'invoice' AS TYPE,
  'netsuite' AS vendor,
  UNNEST(ARRAY ['erp', 'revenueRecognition', 'creditNote']) AS "attribute",
  UNNEST(ARRAY [ "i"."nsReference", "i"."nsRevRecReference", "i"."creditNoteReference" ]) AS "value"
FROM
  "invoices" AS i
WHERE ("i"."nsReference" IS NOT NULL)
```

To actually move the data:

```sql
INSERT INTO erp_references (entity_id, TYPE, vendor, attribute, value) (
  SELECT
    "i"."id" AS "entity_id",
    'invoice' AS TYPE,
    'netsuite' AS vendor,
    UNNEST(ARRAY ['erp', 'revenueRecognition', 'creditNote']) AS "attribute",
    UNNEST(ARRAY [ "i"."nsReference", "i"."nsRevRecReference", "i"."creditNoteReference" ]) AS "value"
  FROM
    "invoices" AS i
  WHERE ("i"."nsReference" IS NOT NULL)
  GROUP BY
    "i"."id"
)
```

## Data clean-up

```sql
DELETE FROM erp_references
WHERE value IS NULL
```
