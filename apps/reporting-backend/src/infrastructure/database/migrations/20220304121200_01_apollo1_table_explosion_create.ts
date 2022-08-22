import * as Knex from 'knex';

const createTableExplosion = `-- ///////////////////////////////////////////////////////////////////////////
-- CREATE INTERMEDIATE TABLES
-- ///////////////////////////////////////////////////////////////////////////

--------------- CREATE ARTICLE TABLES ---------------------------------------
-- Table: public.article
CREATE TABLE IF NOT EXISTS public.article
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    id text COLLATE pg_catalog."default",
    doi text COLLATE pg_catalog."default",
    title text COLLATE pg_catalog."default",
    volume text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    abstract text COLLATE pg_catalog."default",
    customid text COLLATE pg_catalog."default",
    figcount text COLLATE pg_catalog."default",
    refcount text COLLATE pg_catalog."default",
    journalid text COLLATE pg_catalog."default",
    pagecount text COLLATE pg_catalog."default",
    published text COLLATE pg_catalog."default",
    articletype text COLLATE pg_catalog."default",
    specialissueid text COLLATE pg_catalog."default",
    hassupplementarymaterials text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.article
    OWNER to postgres;

REVOKE ALL ON TABLE public.article FROM superset_ro;

GRANT ALL ON TABLE public.article TO postgres;

GRANT SELECT ON TABLE public.article TO superset_ro;

CREATE INDEX IF NOT EXISTS article_event_id_index
    ON public.article USING btree
    (event_id ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.article_author
CREATE TABLE IF NOT EXISTS public.article_author
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    article_id text COLLATE pg_catalog."default",
    aff text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    country text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    givennames text COLLATE pg_catalog."default",
    iscorresponding text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.article_author
    OWNER to postgres;

REVOKE ALL ON TABLE public.article_author FROM superset_ro;

GRANT ALL ON TABLE public.article_author TO postgres;

GRANT SELECT ON TABLE public.article_author TO superset_ro;

CREATE INDEX IF NOT EXISTS article_author_event_id_index
    ON public.article_author USING btree
    (event_id ASC NULLS LAST)
    TABLESPACE pg_default;



--------------- CREATE CHECKER TABLES ---------------------------------------
-- Table: public.checker
CREATE TABLE IF NOT EXISTS public.checker
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    id uuid,
    role text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    teamid text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    givennames text COLLATE pg_catalog."default",
    isconfirmed text COLLATE pg_catalog."default",
    submissionid text COLLATE pg_catalog."default",
    assignationdate text COLLATE pg_catalog."default",
    assignationtype text COLLATE pg_catalog."default",
    name text COLLATE pg_catalog."default",
    type text COLLATE pg_catalog."default",
    checkers_json jsonb,
    journalids_json jsonb,
    teamleaders_json jsonb
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.checker
    OWNER to postgres;

REVOKE ALL ON TABLE public.checker FROM superset_ro;

GRANT ALL ON TABLE public.checker TO postgres;

GRANT SELECT ON TABLE public.checker TO superset_ro;

-- Table: public.checker_checker
CREATE TABLE IF NOT EXISTS public.checker_checker
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    checker_id uuid,
    id uuid,
    role text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    givennames text COLLATE pg_catalog."default",
    isconfirmed text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.checker_checker
    OWNER to postgres;

REVOKE ALL ON TABLE public.checker_checker FROM superset_ro;

GRANT ALL ON TABLE public.checker_checker TO postgres;

GRANT SELECT ON TABLE public.checker_checker TO superset_ro;

-- Table: public.checker_teamleader
CREATE TABLE IF NOT EXISTS public.checker_teamleader
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    checker_id uuid,
    id uuid,
    email text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    givennames text COLLATE pg_catalog."default",
    isconfirmed text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.checker_teamleader
    OWNER to postgres;

REVOKE ALL ON TABLE public.checker_teamleader FROM superset_ro;

GRANT ALL ON TABLE public.checker_teamleader TO postgres;

GRANT SELECT ON TABLE public.checker_teamleader TO superset_ro;



--------------- CREATE INVOICE TABLES ---------------------------------------
-- Table: public.invoice
CREATE TABLE IF NOT EXISTS public.invoice
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    id uuid,
    created text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    invoiceid text COLLATE pg_catalog."default",
    erpreference text COLLATE pg_catalog."default",
    iscreditnote text COLLATE pg_catalog."default",
    invoicestatus text COLLATE pg_catalog."default",
    preprintvalue text COLLATE pg_catalog."default",
    transactionid text COLLATE pg_catalog."default",
    lastpaymentdate text COLLATE pg_catalog."default",
    referencenumber text COLLATE pg_catalog."default",
    invoiceissueddate text COLLATE pg_catalog."default",
    invoicecreateddate text COLLATE pg_catalog."default",
    creditnoteforinvoice text COLLATE pg_catalog."default",
    invoicefinalizeddate text COLLATE pg_catalog."default",
    manuscriptaccepteddate text COLLATE pg_catalog."default",
    currency text COLLATE pg_catalog."default",
    manuscript_custom_id text COLLATE pg_catalog."default",
    vat_percentage double precision,
    payment_type text COLLATE pg_catalog."default",
    costs_netapc text COLLATE pg_catalog."default",
    costs_grossapc text COLLATE pg_catalog."default",
    costs_dueamount text COLLATE pg_catalog."default",
    costs_netamount text COLLATE pg_catalog."default",
    costs_vatamount text COLLATE pg_catalog."default",
    costs_paidamount text COLLATE pg_catalog."default",
    costs_totaldiscount text COLLATE pg_catalog."default",
    payer_type text COLLATE pg_catalog."default",
    payer_email text COLLATE pg_catalog."default",
    payer_lastname text COLLATE pg_catalog."default",
    payer_firstname text COLLATE pg_catalog."default",
    payer_countrycode text COLLATE pg_catalog."default",
    payer_organization text COLLATE pg_catalog."default",
    payer_billingaddress text COLLATE pg_catalog."default",
    payer_vatregistrationnumber text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.invoice
    OWNER to postgres;

REVOKE ALL ON TABLE public.invoice FROM superset_ro;

GRANT ALL ON TABLE public.invoice TO postgres;

GRANT SELECT ON TABLE public.invoice TO superset_ro;

-- Table: public.invoice_payment
CREATE TABLE IF NOT EXISTS public.invoice_payment
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    invoice_id uuid,
    paymentdate text COLLATE pg_catalog."default",
    paymenttype text COLLATE pg_catalog."default",
    paymentamount text COLLATE pg_catalog."default",
    foreignpaymentid text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.invoice_payment
    OWNER to postgres;

REVOKE ALL ON TABLE public.invoice_payment FROM superset_ro;

GRANT ALL ON TABLE public.invoice_payment TO postgres;

GRANT SELECT ON TABLE public.invoice_payment TO superset_ro;

-- Table: public.invoice_invoiceitem
CREATE TABLE IF NOT EXISTS public.invoice_invoiceitem
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    invoice_id uuid,
    id text COLLATE pg_catalog."default",
    type text COLLATE pg_catalog."default",
    price text COLLATE pg_catalog."default",
    manuscriptid text COLLATE pg_catalog."default",
    vatpercentage text COLLATE pg_catalog."default",
    manuscriptcustomid text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.invoice_invoiceitem
    OWNER to postgres;

REVOKE ALL ON TABLE public.invoice_invoiceitem FROM superset_ro;

GRANT ALL ON TABLE public.invoice_invoiceitem TO postgres;

GRANT SELECT ON TABLE public.invoice_invoiceitem TO superset_ro;


-- Table: public.invoice_invoiceitem_coupon
CREATE TABLE IF NOT EXISTS public.invoice_invoiceitem_coupon
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    invoice_id uuid,
    invoice_lineitem_id text COLLATE pg_catalog."default",
    id text COLLATE pg_catalog."default",
    code text COLLATE pg_catalog."default",
    coupontype text COLLATE pg_catalog."default",
    couponreduction text COLLATE pg_catalog."default",
    couponcreateddate text COLLATE pg_catalog."default",
    couponupdateddate text COLLATE pg_catalog."default",
    couponexpirationdate text COLLATE pg_catalog."default",
    applicabletoinvoiceitemtype text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.invoice_invoiceitem_coupon
    OWNER to postgres;

REVOKE ALL ON TABLE public.invoice_invoiceitem_coupon FROM superset_ro;

GRANT ALL ON TABLE public.invoice_invoiceitem_coupon TO postgres;

GRANT SELECT ON TABLE public.invoice_invoiceitem_coupon TO superset_ro;


-- Table: public.invoice_invoiceitem_waiver
CREATE TABLE IF NOT EXISTS public.invoice_invoiceitem_waiver
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    invoice_id uuid,
    invoice_lineitem_id text COLLATE pg_catalog."default",
    waivertype text COLLATE pg_catalog."default",
    waiverreduction text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.invoice_invoiceitem_waiver
    OWNER to postgres;

REVOKE ALL ON TABLE public.invoice_invoiceitem_waiver FROM superset_ro;

GRANT ALL ON TABLE public.invoice_invoiceitem_waiver TO postgres;

GRANT SELECT ON TABLE public.invoice_invoiceitem_waiver TO superset_ro;

--------------- CREATE JOURNAL TABLES ---------------------------------------
-- Table: public.journal
CREATE TABLE IF NOT EXISTS public.journal
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    id uuid,
    apc text COLLATE pg_catalog."default",
    code text COLLATE pg_catalog."default",
    issn text COLLATE pg_catalog."default",
    name text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    isactive text COLLATE pg_catalog."default",
    publishername text COLLATE pg_catalog."default",
    activationdate text COLLATE pg_catalog."default",
    peerreviewmodelname text COLLATE pg_catalog."default",
    editors_json jsonb,
    sections_json jsonb,
    articletypes jsonb,
    specialissues_json jsonb
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.journal
    OWNER to postgres;

REVOKE ALL ON TABLE public.journal FROM superset_ro;

GRANT ALL ON TABLE public.journal TO postgres;

GRANT SELECT ON TABLE public.journal TO superset_ro;


-- Table: public.journal_editor

-- DROP TABLE IF EXISTS public.journal_editor;

CREATE TABLE IF NOT EXISTS public.journal_editor
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    journal_id uuid,
    id uuid,
    aff text COLLATE pg_catalog."default",
    roletype text COLLATE pg_catalog."default",
    rolelabel text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    title text COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default",
    userid text COLLATE pg_catalog."default",
    country text COLLATE pg_catalog."default",
    orcidid text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    givennames text COLLATE pg_catalog."default",
    expireddate text COLLATE pg_catalog."default",
    inviteddate text COLLATE pg_catalog."default",
    removeddate text COLLATE pg_catalog."default",
    accepteddate text COLLATE pg_catalog."default",
    assigneddate text COLLATE pg_catalog."default",
    declineddate text COLLATE pg_catalog."default",
    iscorresponding text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.journal_editor
    OWNER to postgres;

REVOKE ALL ON TABLE public.journal_editor FROM superset_ro;

GRANT ALL ON TABLE public.journal_editor TO postgres;

GRANT SELECT ON TABLE public.journal_editor TO superset_ro;

-- Table: public.journal_section

-- DROP TABLE IF EXISTS public.journal_section;

CREATE TABLE IF NOT EXISTS public.journal_section
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    journal_id uuid,
    journal_name text COLLATE pg_catalog."default",
    journal_issn text COLLATE pg_catalog."default",
    journal_code text COLLATE pg_catalog."default",
    id uuid,
    name text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    specialissues_json jsonb,
    editors_json jsonb
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.journal_section
    OWNER to postgres;

REVOKE ALL ON TABLE public.journal_section FROM superset_ro;

GRANT ALL ON TABLE public.journal_section TO postgres;

GRANT SELECT ON TABLE public.journal_section TO superset_ro;

-- Table: public.journal_section_editor

-- DROP TABLE IF EXISTS public.journal_section_editor;

CREATE TABLE IF NOT EXISTS public.journal_section_editor
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    journal_id uuid,
    journal_section_id uuid,
    id uuid,
    aff text COLLATE pg_catalog."default",
    roletype text COLLATE pg_catalog."default",
    rolelabel text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    title text COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default",
    userid text COLLATE pg_catalog."default",
    country text COLLATE pg_catalog."default",
    orcidid text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    givennames text COLLATE pg_catalog."default",
    expireddate text COLLATE pg_catalog."default",
    inviteddate text COLLATE pg_catalog."default",
    removeddate text COLLATE pg_catalog."default",
    accepteddate text COLLATE pg_catalog."default",
    assigneddate text COLLATE pg_catalog."default",
    declineddate text COLLATE pg_catalog."default",
    iscorresponding text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.journal_section_editor
    OWNER to postgres;

REVOKE ALL ON TABLE public.journal_section_editor FROM superset_ro;

GRANT ALL ON TABLE public.journal_section_editor TO postgres;

GRANT SELECT ON TABLE public.journal_section_editor TO superset_ro;

-- Table: public.journal_section_specialissue

-- DROP TABLE IF EXISTS public.journal_section_specialissue;

CREATE TABLE IF NOT EXISTS public.journal_section_specialissue
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    journal_id uuid,
    journal_section_id uuid,
    id uuid,
    name text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    enddate text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    customid text COLLATE pg_catalog."default",
    isactive text COLLATE pg_catalog."default",
    startdate text COLLATE pg_catalog."default",
    iscancelled text COLLATE pg_catalog."default",
    cancelreason text COLLATE pg_catalog."default",
    callforpapers text COLLATE pg_catalog."default",
    peerreviewmodelname text COLLATE pg_catalog."default",
    editors_json jsonb
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.journal_section_specialissue
    OWNER to postgres;

REVOKE ALL ON TABLE public.journal_section_specialissue FROM superset_ro;

GRANT ALL ON TABLE public.journal_section_specialissue TO postgres;

GRANT SELECT ON TABLE public.journal_section_specialissue TO superset_ro;

-- Table: public.journal_section_specialissue_editor

-- DROP TABLE IF EXISTS public.journal_section_specialissue_editor;

CREATE TABLE IF NOT EXISTS public.journal_section_specialissue_editor
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    journal_id uuid,
    journal_section_id uuid,
    journal_section_specialissue_id uuid,
    id uuid,
    aff text COLLATE pg_catalog."default",
    roletype text COLLATE pg_catalog."default",
    rolelabel text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    title text COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default",
    userid text COLLATE pg_catalog."default",
    country text COLLATE pg_catalog."default",
    orcidid text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    givennames text COLLATE pg_catalog."default",
    expireddate text COLLATE pg_catalog."default",
    inviteddate text COLLATE pg_catalog."default",
    removeddate text COLLATE pg_catalog."default",
    accepteddate text COLLATE pg_catalog."default",
    assigneddate text COLLATE pg_catalog."default",
    declineddate text COLLATE pg_catalog."default",
    iscorresponding text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.journal_section_specialissue_editor
    OWNER to postgres;

REVOKE ALL ON TABLE public.journal_section_specialissue_editor FROM superset_ro;

GRANT ALL ON TABLE public.journal_section_specialissue_editor TO postgres;

GRANT SELECT ON TABLE public.journal_section_specialissue_editor TO superset_ro;

-- Table: public.journal_specialissue

-- DROP TABLE IF EXISTS public.journal_specialissue;

CREATE TABLE IF NOT EXISTS public.journal_specialissue
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    journal_id uuid,
    id uuid,
    name text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    enddate text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    customid text COLLATE pg_catalog."default",
    isactive text COLLATE pg_catalog."default",
    startdate text COLLATE pg_catalog."default",
    iscancelled text COLLATE pg_catalog."default",
    cancelreason text COLLATE pg_catalog."default",
    callforpapers text COLLATE pg_catalog."default",
    peerreviewmodelname text COLLATE pg_catalog."default",
    editors_json jsonb
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.journal_specialissue
    OWNER to postgres;

REVOKE ALL ON TABLE public.journal_specialissue FROM superset_ro;

GRANT ALL ON TABLE public.journal_specialissue TO postgres;

GRANT SELECT ON TABLE public.journal_specialissue TO superset_ro;

-- Table: public.journal_specialissue_editor

-- DROP TABLE IF EXISTS public.journal_specialissue_editor;

CREATE TABLE IF NOT EXISTS public.journal_specialissue_editor
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    journal_id uuid,
    journal_specialissue_id uuid,
    id uuid,
    aff text COLLATE pg_catalog."default",
    roletype text COLLATE pg_catalog."default",
    rolelabel text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    title text COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default",
    userid text COLLATE pg_catalog."default",
    country text COLLATE pg_catalog."default",
    orcidid text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    givennames text COLLATE pg_catalog."default",
    expireddate text COLLATE pg_catalog."default",
    inviteddate text COLLATE pg_catalog."default",
    removeddate text COLLATE pg_catalog."default",
    accepteddate text COLLATE pg_catalog."default",
    assigneddate text COLLATE pg_catalog."default",
    declineddate text COLLATE pg_catalog."default",
    iscorresponding text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.journal_specialissue_editor
    OWNER to postgres;

REVOKE ALL ON TABLE public.journal_specialissue_editor FROM superset_ro;

GRANT ALL ON TABLE public.journal_specialissue_editor TO postgres;

GRANT SELECT ON TABLE public.journal_specialissue_editor TO superset_ro;

--------------- CREATE MANUSCRIPT TABLES ---------------------------------------
-- Table: public.manuscript

-- DROP TABLE IF EXISTS public.manuscript;

CREATE TABLE IF NOT EXISTS public.manuscript
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    submission_id uuid,
    id uuid,
    title text COLLATE pg_catalog."default",
    version text COLLATE pg_catalog."default",
    abstract text COLLATE pg_catalog."default",
    customid text COLLATE pg_catalog."default",
    journalid text COLLATE pg_catalog."default",
    sectionid text COLLATE pg_catalog."default",
    articletype_name text COLLATE pg_catalog."default",
    accepteddate text COLLATE pg_catalog."default",
    preprintvalue text COLLATE pg_catalog."default",
    sourcejournal_name text COLLATE pg_catalog."default",
    sourcejournal_eissn text COLLATE pg_catalog."default",
    sourcejournal_pissn text COLLATE pg_catalog."default",
    specialissueid text COLLATE pg_catalog."default",
    dataavailability text COLLATE pg_catalog."default",
    fundingstatement text COLLATE pg_catalog."default",
    conflictofinterest text COLLATE pg_catalog."default",
    submissioncreateddate text COLLATE pg_catalog."default",
    qualitycheckssubmitteddate text COLLATE pg_catalog."default",
    files_json jsonb,
    authors_json jsonb,
    editors_json jsonb,
    reviewers_json jsonb,
    reviews_json jsonb,
    submittingstaffmembers_json jsonb
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.manuscript
    OWNER to postgres;

REVOKE ALL ON TABLE public.manuscript FROM superset_ro;

GRANT ALL ON TABLE public.manuscript TO postgres;

GRANT SELECT ON TABLE public.manuscript TO superset_ro;

CREATE INDEX IF NOT EXISTS manuscript_event_id_index
    ON public.manuscript USING btree
    (event_id ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.manuscript_author

-- DROP TABLE IF EXISTS public.manuscript_author;

CREATE TABLE IF NOT EXISTS public.manuscript_author
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    submission_id uuid,
    manuscript_id uuid,
    id uuid,
    aff text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default",
    userid text COLLATE pg_catalog."default",
    country text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    orcidid text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    "position" text COLLATE pg_catalog."default",
    givennames text COLLATE pg_catalog."default",
    assigneddate text COLLATE pg_catalog."default",
    issubmitting text COLLATE pg_catalog."default",
    iscorresponding text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.manuscript_author
    OWNER to postgres;

REVOKE ALL ON TABLE public.manuscript_author FROM superset_ro;

GRANT ALL ON TABLE public.manuscript_author TO postgres;

GRANT SELECT ON TABLE public.manuscript_author TO superset_ro;

CREATE INDEX IF NOT EXISTS manuscript_author_event_id_index
    ON public.manuscript_author USING btree
    (event_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS manuscript_author_event_id_manuscript_id_index
    ON public.manuscript_author USING btree
    (event_id ASC NULLS LAST, manuscript_id ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.manuscript_editor

-- DROP TABLE IF EXISTS public.manuscript_editor;

CREATE TABLE IF NOT EXISTS public.manuscript_editor
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    submission_id uuid,
    manuscript_id uuid,
    id uuid,
    aff text COLLATE pg_catalog."default",
    role_type text COLLATE pg_catalog."default",
    role_label text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    title text COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default",
    userid text COLLATE pg_catalog."default",
    country text COLLATE pg_catalog."default",
    orcidid text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    givennames text COLLATE pg_catalog."default",
    expireddate text COLLATE pg_catalog."default",
    inviteddate text COLLATE pg_catalog."default",
    removeddate text COLLATE pg_catalog."default",
    accepteddate text COLLATE pg_catalog."default",
    assigneddate text COLLATE pg_catalog."default",
    declineddate text COLLATE pg_catalog."default",
    iscorresponding text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.manuscript_editor
    OWNER to postgres;

REVOKE ALL ON TABLE public.manuscript_editor FROM superset_ro;

GRANT ALL ON TABLE public.manuscript_editor TO postgres;

GRANT SELECT ON TABLE public.manuscript_editor TO superset_ro;

CREATE INDEX IF NOT EXISTS manuscript_editor_event_id_index
    ON public.manuscript_editor USING btree
    (event_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS manuscript_editor_event_id_manuscript_id
    ON public.manuscript_editor USING btree
    (event_id ASC NULLS LAST, manuscript_id ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.manuscript_file

-- DROP TABLE IF EXISTS public.manuscript_file;

CREATE TABLE IF NOT EXISTS public.manuscript_file
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    submission_id uuid,
    manuscript_id uuid,
    id uuid,
    url text COLLATE pg_catalog."default",
    size text COLLATE pg_catalog."default",
    type text COLLATE pg_catalog."default",
    label text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    filename text COLLATE pg_catalog."default",
    mimetype text COLLATE pg_catalog."default",
    "position" text COLLATE pg_catalog."default",
    providerkey text COLLATE pg_catalog."default",
    originalname text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.manuscript_file
    OWNER to postgres;

REVOKE ALL ON TABLE public.manuscript_file FROM superset_ro;

GRANT ALL ON TABLE public.manuscript_file TO postgres;

GRANT SELECT ON TABLE public.manuscript_file TO superset_ro;

CREATE INDEX IF NOT EXISTS manuscript_file_event_id_index
    ON public.manuscript_file USING btree
    (event_id ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.manuscript_review

-- DROP TABLE IF EXISTS public.manuscript_review;

CREATE TABLE IF NOT EXISTS public.manuscript_review
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    submission_id uuid,
    manuscript_id uuid,
    manuscript_version text COLLATE pg_catalog."default",
    id uuid,
    created text COLLATE pg_catalog."default",
    isvalid text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    submitted text COLLATE pg_catalog."default",
    teammemberid text COLLATE pg_catalog."default",
    recommendation text COLLATE pg_catalog."default",
    comments_json jsonb
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.manuscript_review
    OWNER to postgres;

REVOKE ALL ON TABLE public.manuscript_review FROM superset_ro;

GRANT ALL ON TABLE public.manuscript_review TO postgres;

GRANT SELECT ON TABLE public.manuscript_review TO superset_ro;

CREATE INDEX IF NOT EXISTS manuscript_review_event_id_index
    ON public.manuscript_review USING btree
    (event_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS manuscript_review_event_id_manuscript_id
    ON public.manuscript_review USING btree
    (event_id ASC NULLS LAST, manuscript_id ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.manuscript_review_comment

-- DROP TABLE IF EXISTS public.manuscript_review_comment;

CREATE TABLE IF NOT EXISTS public.manuscript_review_comment
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    submission_id uuid,
    manuscript_id uuid,
    review_id uuid,
    id uuid,
    type text COLLATE pg_catalog."default",
    content text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    files_json jsonb
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.manuscript_review_comment
    OWNER to postgres;

REVOKE ALL ON TABLE public.manuscript_review_comment FROM superset_ro;

GRANT ALL ON TABLE public.manuscript_review_comment TO postgres;

GRANT SELECT ON TABLE public.manuscript_review_comment TO superset_ro;

CREATE INDEX IF NOT EXISTS manuscript_review_comment_event_id_index
    ON public.manuscript_review_comment USING btree
    (event_id ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.manuscript_review_comment_file

-- DROP TABLE IF EXISTS public.manuscript_review_comment_file;

CREATE TABLE IF NOT EXISTS public.manuscript_review_comment_file
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    submission_id uuid,
    manuscript_id uuid,
    review_id uuid,
    review_comment_id uuid,
    id uuid,
    url text COLLATE pg_catalog."default",
    size text COLLATE pg_catalog."default",
    type text COLLATE pg_catalog."default",
    label text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    filename text COLLATE pg_catalog."default",
    mimetype text COLLATE pg_catalog."default",
    "position" text COLLATE pg_catalog."default",
    commentid text COLLATE pg_catalog."default",
    providerkey text COLLATE pg_catalog."default",
    manuscriptid text COLLATE pg_catalog."default",
    originalname text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.manuscript_review_comment_file
    OWNER to postgres;

REVOKE ALL ON TABLE public.manuscript_review_comment_file FROM superset_ro;

GRANT ALL ON TABLE public.manuscript_review_comment_file TO postgres;

GRANT SELECT ON TABLE public.manuscript_review_comment_file TO superset_ro;

CREATE INDEX IF NOT EXISTS manuscript_review_comment_file_event_id_index
    ON public.manuscript_review_comment_file USING btree
    (event_id ASC NULLS LAST)
    TABLESPACE pg_default;

-- Table: public.manuscript_reviewer

-- DROP TABLE IF EXISTS public.manuscript_reviewer;

CREATE TABLE IF NOT EXISTS public.manuscript_reviewer
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    submission_id uuid,
    manuscript_id uuid,
    manuscript_version text COLLATE pg_catalog."default",
    id uuid,
    aff text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default",
    userid text COLLATE pg_catalog."default",
    country text COLLATE pg_catalog."default",
    created timestamp without time zone,
    orcidid text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    updated timestamp without time zone,
    responded timestamp without time zone,
    givennames text COLLATE pg_catalog."default",
    expireddate timestamp without time zone,
    fromservice text COLLATE pg_catalog."default",
    inviteddate timestamp without time zone,
    accepteddate timestamp without time zone,
    declineddate timestamp without time zone
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.manuscript_reviewer
    OWNER to postgres;

REVOKE ALL ON TABLE public.manuscript_reviewer FROM superset_ro;

GRANT ALL ON TABLE public.manuscript_reviewer TO postgres;

GRANT SELECT ON TABLE public.manuscript_reviewer TO superset_ro;

CREATE INDEX IF NOT EXISTS manuscript_reviewer_event_id_idx
    ON public.manuscript_reviewer USING btree
    (event_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS manuscript_reviewer_event_id_manuscript_id
    ON public.manuscript_reviewer USING btree
    (event_id ASC NULLS LAST, manuscript_id ASC NULLS LAST)
    TABLESPACE pg_default;
--------------- CREATE USER TABLES ---------------------------------------
-- Table: public.user

-- DROP TABLE IF EXISTS public."user";

CREATE TABLE IF NOT EXISTS public."user"
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    id uuid,
    agreetc text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    isactive text COLLATE pg_catalog."default",
    issubscribedtoemails text COLLATE pg_catalog."default",
    defaultidentitytype text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."user"
    OWNER to postgres;

REVOKE ALL ON TABLE public."user" FROM superset_ro;

GRANT ALL ON TABLE public."user" TO postgres;

GRANT SELECT ON TABLE public."user" TO superset_ro;

-- Table: public.user_identity

-- DROP TABLE IF EXISTS public.user_identity;

CREATE TABLE IF NOT EXISTS public.user_identity
(
    event_id uuid,
    event_time timestamp with time zone,
    event_type character varying(255) COLLATE pg_catalog."default",
    user_id uuid,
    id uuid,
    aff text COLLATE pg_catalog."default",
    type text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    title text COLLATE pg_catalog."default",
    country text COLLATE pg_catalog."default",
    created text COLLATE pg_catalog."default",
    surname text COLLATE pg_catalog."default",
    updated text COLLATE pg_catalog."default",
    givennames text COLLATE pg_catalog."default",
    identifier text COLLATE pg_catalog."default",
    isconfirmed text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.user_identity
    OWNER to postgres;

REVOKE ALL ON TABLE public.user_identity FROM superset_ro;

GRANT ALL ON TABLE public.user_identity TO postgres;

GRANT SELECT ON TABLE public.user_identity TO superset_ro;
-- ///////////////////////////////////////////////////////////////////////////
-- CREATE PROCEDURES FOR EXPLODING MANUSCRIPT TABLES
-- ///////////////////////////////////////////////////////////////////////////

-- PROCEDURE: public.sp_copy_submission_manuscript_all()
-- DROP PROCEDURE IF EXISTS public.sp_copy_submission_manuscript_all();
CREATE OR REPLACE PROCEDURE public.sp_copy_submission_manuscript_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;
	
	raise notice 'manuscript %', vStart;

	call public.sp_log(vLogId, clock_timestamp(), 'manuscript create start');
	
	insert into public.manuscript
	select
		se.id as event_id,
		se."time" as event_time,
		se.type as event_type,
		uuid(se.payload ->> 'submissionId') as submission_id,
		
		uuid(m.value ->> 'id') as id,
		m.value ->> 'title' as title,
		m.value ->> 'version' as version,
		m.value ->> 'abstract' as abstract,
		m.value ->> 'customId' as customId,
		m.value ->> 'journalId' as journalId,
		m.value ->> 'sectionId' as sectionId,
		m.value ->  'articleType' ->> 'name' as articleType_Name,
		m.value ->> 'acceptedDate' as acceptedDate,
		m.value ->> 'preprintValue' as preprintValue,
		m.value ->  'sourceJournal' ->> 'name' as sourceJournal_name, 
		m.value ->  'sourceJournal' ->> 'eissn' as sourceJournal_eissn,
		m.value ->  'sourceJournal' ->> 'pissn' as sourceJournal_pissn,
		m.value ->> 'specialIssueId' as specialIssueId,
		m.value ->> 'dataAvailability' as dataAvailability,
		m.value ->> 'fundingStatement' as fundingStatement,
		m.value ->> 'conflictOfInterest' as conflictOfInterest,
		m.value ->> 'submissionCreatedDate' as submissionCreatedDate,
		m.value ->> 'qualityChecksSubmittedDate' as qualityChecksSubmittedDate,
		
		m.value -> 'files' as files_json,
		m.value -> 'authors' as authors_json,
		m.value -> 'editors' as editors_json,
		m.value -> 'reviewers' as reviewers_json,
		m.value -> 'reviews' as reviews_json,
		m.value -> 'submittingStaffMembers' as submittingStaffMembers_json
		
	from public.submission_events se,
	jsonb_array_elements(se.payload -> 'manuscripts') m;

	CREATE INDEX if not exists a11_manuscript_event_id_index ON public.manuscript (event_id);
	
	raise notice 'manuscript took %',  clock_timestamp() - vStart;
	
	call public.sp_log(vLogId, clock_timestamp(), 'manuscript create end', clock_timestamp() - vStart);
end;
$BODY$;


-- PROCEDURE: public.sp_copy_submission_manuscript_file_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_submission_manuscript_file_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_submission_manuscript_file_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;

	raise notice 'manuscript_file %', vStart;
	
	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_file create start');

	insert into public.manuscript_file
	select 
		m.event_id,
		m.event_time,
		m.event_type,
		m.submission_id,   
		m.id as manuscript_id,
		
		uuid(mf.value ->> 'id') as id,
		mf.value ->> 'url' as url,
		mf.value ->> 'size' as size,
		mf.value ->> 'type' as type,
		mf.value ->> 'label' as label,
		mf.value ->> 'created' as created,
		mf.value ->> 'updated' as updated,
		mf.value ->> 'fileName' as fileName,
		mf.value ->> 'mimeType' as mimeType,
		mf.value ->> 'position' as position,
		mf.value ->> 'providerKey' as providerKey,
		mf.value ->> 'originalName' as originalName
	from 
		public.manuscript m,
		jsonb_array_elements(m.files_json) mf;
		
	CREATE INDEX if not exists a11_manuscript_file_event_id_index ON public.manuscript_file (event_id);

	raise notice 'manuscript_file took %',  clock_timestamp() - vStart;
	
	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_file create end', clock_timestamp() - vStart);
end;
$BODY$;


-- PROCEDURE: public.sp_copy_submission_manuscript_author_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_submission_manuscript_author_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_submission_manuscript_author_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;
	raise notice 'manuscript_author %', vStart;

	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_author create start');

	insert into public.manuscript_author
	select 
		m.event_id,
		m.event_time,
		m.event_type,
		m.submission_id,   
		m.id as manuscript_id,

		uuid(mf.value ->> 'id') as id,
		mf.value ->> 'aff' as aff,
		mf.value ->> 'email' as email,
		mf.value ->> 'status' as status,
		mf.value ->> 'userId' as userId,
		mf.value ->> 'country' as country,
		mf.value ->> 'created' as created,
		mf.value ->> 'orcidId' as orcidId,
		mf.value ->> 'surname' as surname,
		mf.value ->> 'updated' as updated,
		mf.value ->> 'position' as position,
		mf.value ->> 'givenNames' as givenNames,
		mf.value ->> 'assignedDate' as assignedDate,
		mf.value ->> 'isSubmitting'  as isSubmitting,
		mf.value ->> 'isCorresponding' as isCorresponding
	from 
		public.manuscript m,
		jsonb_array_elements(m.authors_json) mf;

	CREATE INDEX if not exists a11_manuscript_author_event_id_index ON public.manuscript_author (event_id);

	CREATE INDEX if not exists a11_manuscript_author_event_id_manuscript_id_index ON public.manuscript_author (event_id, manuscript_id);

	raise notice 'manuscript_author took %',  clock_timestamp() - vStart;
	
	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_author create end', clock_timestamp() - vStart);
end;
$BODY$;


-- PROCEDURE: public.sp_copy_submission_manuscript_editor_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_submission_manuscript_editor_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_submission_manuscript_editor_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;
	raise notice 'manuscript_editor %', vStart;
	
	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_editor create start');

	insert into public.manuscript_editor
	select 
		m.event_id,
		m.event_time,
		m.event_type,
		m.submission_id,   
		m.id as manuscript_id,

		uuid(me.value ->> 'id') as id, 
		me.value ->> 'aff' as aff,
		me.value -> 'role' ->> 'type' as role_type,
		me.value -> 'role' ->> 'label' as role_label,
		me.value ->> 'email' as email,
		me.value ->> 'title' as title,
		me.value ->> 'status' as status,
		me.value ->> 'userId' as userId,
		me.value ->> 'country' as country,
		me.value ->> 'orcidId' as orcidId,
		me.value ->> 'surname' as surname,
		me.value ->> 'givenNames' as givenNames,
		me.value ->> 'expiredDate' as expiredDate,
		me.value ->> 'invitedDate' as invitedDate,
		me.value ->> 'removedDate' as removedDate,
		me.value ->> 'acceptedDate' as acceptedDate,
		me.value ->> 'assignedDate' as assignedDate,
		me.value ->> 'declinedDate' as declinedDate,
		me.value ->> 'isCorresponding' as isCorresponding
	from 
		public.manuscript m,
		jsonb_array_elements(m.editors_json) me;
	
	CREATE INDEX if not exists a11_manuscript_editor_event_id_index ON public.manuscript_editor (event_id);

	create index if not exists a11_manuscript_editor_event_id_manuscript_id on public.manuscript_editor(event_id, manuscript_id);
	
	raise notice 'manuscript_editor took %',  clock_timestamp() - vStart;
	
	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_editor create end', clock_timestamp() - vStart);
end;
$BODY$;



-- PROCEDURE: public.sp_copy_submission_manuscript_reviewer_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_submission_manuscript_reviewer_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_submission_manuscript_reviewer_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;
	raise notice 'manuscript_reviewer %', vStart;

	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_reviewer create start');

	insert into public.manuscript_reviewer
	select 
		m.event_id,
		m.event_time,
		m.event_type,
		m.submission_id,   
		m.id as manuscript_id,
		m.version as manuscript_version,
		uuid(mr.value ->> 'id') as id,
		mr.value ->> 'aff' as aff,
		mr.value ->> 'email' as email,
		mr.value ->> 'status' as status,
		mr.value ->> 'userId' as userId,
		mr.value ->> 'country' as country,
		cast_to_timestamp(mr.value ->> 'created') as created,
		mr.value ->> 'orcidId' as orcidId,
		mr.value ->> 'surname' as surname,
		cast_to_timestamp(mr.value ->> 'updated') as updated,
		cast_to_timestamp(mr.value ->> 'responded') as responded,
		mr.value ->> 'givenNames' as givenNames,
		cast_to_timestamp(mr.value ->> 'expiredDate') as expiredDate,
		mr.value ->> 'fromService' as fromService,
		cast_to_timestamp(mr.value ->> 'invitedDate') as invitedDate,
		cast_to_timestamp(mr.value ->> 'acceptedDate') as acceptedDate,
		cast_to_timestamp(mr.value ->> 'declinedDate') as declinedDate
	from 
		public.manuscript m,
		jsonb_array_elements(m.reviewers_json) mr;
		
	CREATE INDEX if not exists a11_manuscript_reviewer_event_id_idx 
		ON public.manuscript_reviewer (event_id);

	create index if not exists a11_manuscript_reviewer_event_id_manuscript_id 
		on public.manuscript_reviewer(event_id, manuscript_id);

	raise notice 'manuscript_reviewer took %',  clock_timestamp() - vStart;

	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_reviewer create end', clock_timestamp() - vStart);
end;
$BODY$;


-- PROCEDURE: public.sp_copy_submission_manuscript_review_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_submission_manuscript_review_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_submission_manuscript_review_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;
	raise notice 'manuscript_review %', vStart;

	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_review create start');

	insert into public.manuscript_review 
	select 
		m.event_id,
		m.event_time,
		m.event_type,
		m.submission_id,   
		m.id as manuscript_id,
		m.version as manuscript_version,
		uuid(mr.value ->> 'id') as id,
		mr.value ->> 'created' as created,
		mr.value ->> 'isValid' as isValid,
		mr.value ->> 'updated' as updated,
		mr.value ->> 'submitted' as submitted,
		mr.value ->> 'teamMemberId' as teamMemberId,
		mr.value ->> 'recommendation' as recommendation,
		mr.value ->  'comments' as comments_json
	from 
		public.manuscript m,
		jsonb_array_elements(m.reviews_json) mr;
	
	CREATE INDEX if not exists a11_manuscript_review_event_id_index ON public.manuscript_review (event_id);

	create index if not exists a11_manuscript_review_event_id_manuscript_id on public.manuscript_review(event_id, manuscript_id);
	raise notice 'manuscript_review took %',  clock_timestamp() - vStart;

	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_review create end', clock_timestamp() - vStart);
end;
$BODY$;



-- PROCEDURE: public.sp_copy_submission_manuscript_review_comment_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_submission_manuscript_review_comment_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_submission_manuscript_review_comment_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;
	raise notice 'manuscript_review_comment %', vStart;

	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_review_comment create start');

	insert into public.manuscript_review_comment
	select 
		mr.event_id,
		mr.event_time,
		mr.event_type,
		mr.submission_id,   
		mr.manuscript_id,
		mr.id as review_id,

		uuid(mrc.value ->> 'id') as id,
		mrc.value ->> 'type' as type,
		mrc.value ->> 'content' as content,
		mrc.value ->> 'created' as created ,
		mrc.value ->> 'updated' as updated,
		mrc.value ->  'files' as files_json
	from public.manuscript_review mr,
	jsonb_array_elements(mr.comments_json) mrc;
	
	CREATE INDEX if not exists a11_manuscript_review_comment_event_id_index ON public.manuscript_review_comment (event_id);

	raise notice 'manuscript_review_comment took %',  clock_timestamp() - vStart;
	
	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_review_comment create end', clock_timestamp() - vStart);
end;
$BODY$;



-- PROCEDURE: public.sp_copy_submission_manuscript_review_comment_file_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_submission_manuscript_review_comment_file_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_submission_manuscript_review_comment_file_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;
	raise notice 'manuscript_review_comment_file %', vStart;

	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_review_comment_file create start');

	insert into public.manuscript_review_comment_file
	select 
		mrc.event_id,
		mrc.event_time,
		mrc.event_type,
		mrc.submission_id,   
		mrc.manuscript_id,
		mrc.review_id,
		mrc.id as review_comment_id,

		uuid(mrcf.value ->> 'id') as id,
		mrcf.value ->> 'url' as url,
		mrcf.value ->> 'size' as size,
		mrcf.value ->> 'type' as type,
		mrcf.value ->> 'label' as label,
		mrcf.value ->> 'created' as created,
		mrcf.value ->> 'updated' as updated,
		mrcf.value ->> 'fileName' as fileName,
		mrcf.value ->> 'mimeType' as mimeType,
		mrcf.value ->> 'position' as position,
		mrcf.value ->> 'commentId' as commentId,
		mrcf.value ->> 'providerKey' as providerKey,
		mrcf.value ->> 'manuscriptId' as manuscriptId,
		mrcf.value ->> 'originalName' as originalName		
	from 
		public.manuscript_review_comment mrc,
		jsonb_array_elements(mrc.files_json) mrcf;
	
	CREATE INDEX if not exists a11_manuscript_review_comment_file_event_id_index ON public.manuscript_review_comment_file (event_id);

	raise notice 'manuscript_review_comment_file took %',  clock_timestamp() - vStart;

	call public.sp_log(vLogId, clock_timestamp(), 'manuscript_review_comment_file create end', clock_timestamp() - vStart);
end;
$BODY$;



-- PROCEDURE: public.sp_copy_submission_root_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_submission_root_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_submission_root_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin
	call public.sp_copy_submission_manuscript_all();
	commit;

	call public.sp_copy_submission_manuscript_file_all();
	commit;
	
	call public.sp_copy_submission_manuscript_author_all();
	commit;
	
	call public.sp_copy_submission_manuscript_editor_all();
	commit;
	
	call public.sp_copy_submission_manuscript_reviewer_all();
	commit;
	
	call public.sp_copy_submission_manuscript_review_all();
	commit;
	
	call public.sp_copy_submission_manuscript_review_comment_all();
	commit;
	
	call public.sp_copy_submission_manuscript_review_comment_file_all();
	commit;
end;
$BODY$;

-- ///////////////////////////////////////////////////////////////////////////
-- EXPLODING JOURNAL TABLES
-- ///////////////////////////////////////////////////////////////////////////

-- PROCEDURE: public.sp_copy_journal_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_journal_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_journal_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;

	call public.sp_log(vLogId, clock_timestamp(), 'journal create start');

	insert into public.journal
	select
		je.Id as event_id,
		je.time as event_time,
		je.type as event_type,
		uuid(je.payload ->>'id') as id,
		je.payload ->>'apc' as apc,
		je.payload ->>'code' as code,
		je.payload ->>'issn' as issn,
		je.payload ->>'name' as name,
		je.payload ->>'email' as email,
		je.payload ->>'created' as created,
		je.payload ->>'updated' as updated,
		je.payload ->>'isActive' as isActive,
		je.payload ->>'publisherName' as publisherName,
		je.payload ->>'activationDate' as activationDate,
		je.payload ->'peerReviewModel' ->> 'name' peerReviewModelName,
		je.payload ->'editors' as editors_json,
		je.payload ->'sections' sections_json,
		je.payload ->'articleTypes' articleTypes,
		je.payload ->'specialIssues' as specialIssues_json 
	from public.journal_events je;

	call public.sp_log(vLogId, clock_timestamp(), 'journal create end', clock_timestamp() - vStart);
end;
$BODY$;


-- PROCEDURE: public.sp_copy_journal_editor_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_journal_editor_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_journal_editor_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_editor create start');

	insert into public.journal_editor
	select
		j.event_id,
		j.event_time,
		j.event_type,
		j.id journal_id,

		uuid(editors.value ->> 'id') as id,
		editors.value ->> 'aff' as aff,
		editors.value -> 'role' ->> 'type'  as roleType,
		editors.value -> 'role' ->> 'label' as roleLabel,
		editors.value ->> 'email' as email,
		editors.value ->> 'title' as title,
		editors.value ->> 'status' as status,
		editors.value ->> 'userId' as userId,
		editors.value ->> 'country' as country,
		editors.value ->> 'orcidId' as orcidId,
		editors.value ->> 'surname' as surname,
		editors.value ->> 'givenNames' as givenNames,
		editors.value ->> 'expiredDate' expiredDate,
		editors.value ->> 'invitedDate' invitedDate,
		editors.value ->> 'removedDate' removedDate,
		editors.value ->> 'acceptedDate' acceptedDate,
		editors.value ->> 'assignedDate' assignedDate,
		editors.value ->> 'declinedDate' declinedDate,
		editors.value ->> 'isCorresponding' as isCorresponding
	from 
		public.journal j, 
		jsonb_array_elements(j.editors_json) editors;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_editor create end', clock_timestamp() - vStart);
end;
$BODY$;


-- PROCEDURE: public.sp_copy_journal_section_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_journal_section_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_journal_section_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_section create start');

	insert into public.journal_section
	SELECT
		j.event_id,
		j.event_time,
		j.event_type,
		j.id as journal_id,
		j.name as journal_name,
		j.issn as journal_issn,
		j.code as journal_code,

		uuid(sections.value ->> 'id') as id,
		sections.value ->> 'name' as name,
		sections.value ->> 'created' as created,
		sections.value ->> 'updated' as updated,
		sections.value ->'specialIssues' as specialIssues_json,
		sections.value ->'editors' as editors_json
	FROM 
		public.journal j,
		jsonb_array_elements(j.sections_json) sections;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_section create end', clock_timestamp() - vStart);

end;
$BODY$;


-- PROCEDURE: public.sp_copy_journal_specialissue_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_journal_specialissue_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_journal_specialissue_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;
	
	call public.sp_log(vLogId, clock_timestamp(), 'journal_specialissue create start');

	insert into public.journal_specialissue
	select
		j.event_id,
		j.event_time,
		j.event_type,
		j.id journal_id,

		uuid(si.value ->> 'id') as id,
		si.value ->> 'name' as name,
		si.value ->> 'created' as created,
		si.value ->> 'endDate' as endDate,
		si.value ->> 'updated' as updated,
		si.value ->> 'customId' as customId,
		si.value ->> 'isActive' as isActive,
		si.value ->> 'startDate' as startDate,
		si.value ->> 'isCancelled' as isCancelled,
		si.value ->> 'cancelReason' as cancelReason,
		si.value ->> 'callForPapers' as callForPapers,
		si.value -> 'peerReviewModel' ->> 'name' as peerReviewModelName,
		si.value -> 'editors' as editors_json
	from 
		public.journal j,
		jsonb_array_elements(j.specialIssues_json) si;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_specialissue create end', clock_timestamp() - vStart);
end;
$BODY$;


-- PROCEDURE: public.sp_copy_journal_specialissue_editor()

-- DROP PROCEDURE IF EXISTS public.sp_copy_journal_specialissue_editor();

CREATE OR REPLACE PROCEDURE public.sp_copy_journal_specialissue_editor(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_specialissue_editor create start');

	insert into public.journal_specialissue_editor
	select 
		jsi.event_id, 
		jsi.event_time, 
		jsi.event_type,
		jsi.journal_id,
		jsi.id as journal_specialissue_id,

		uuid(jsie.value ->> 'id') as id,
		jsie.value ->> 'aff' as aff,
		jsie.value -> 'role' ->> 'type'  as roleType,
		jsie.value -> 'role' ->> 'label' as roleLabel,
		jsie.value ->> 'email' as email,
		jsie.value ->> 'title' as title,
		jsie.value ->> 'status' as status,
		jsie.value ->> 'userId' as userId,
		jsie.value ->> 'country' as country,
		jsie.value ->> 'orcidId' as orcidId,
		jsie.value ->> 'surname' as surname,
		jsie.value ->> 'givenNames' as givenNames,
		jsie.value ->> 'expiredDate' expiredDate,
		jsie.value ->> 'invitedDate' invitedDate,
		jsie.value ->> 'removedDate' removedDate,
		jsie.value ->> 'acceptedDate' acceptedDate,
		jsie.value ->> 'assignedDate' assignedDate,
		jsie.value ->> 'declinedDate' declinedDate,
		jsie.value ->> 'isCorresponding' as isCorresponding
	from
		public.journal_specialissue jsi,
		jsonb_array_elements(jsi.editors_json) jsie;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_specialissue_editor create end', clock_timestamp() - vStart);
end;
$BODY$;


-- PROCEDURE: public.sp_copy_journal_section_editor_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_journal_section_editor_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_journal_section_editor_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_section_editor create start');

	insert into public.journal_section_editor
	select 
		js.event_id, 
		js.event_time,
		js.event_type,
		js.journal_id,
		js.id as journal_section_id,

		uuid(jse.value ->> 'id') as id,
		jse.value ->> 'aff' as aff,
		jse.value -> 'role' ->> 'type'  as roleType,
		jse.value -> 'role' ->> 'label' as roleLabel,
		jse.value ->> 'email' as email,
		jse.value ->> 'title' as title,
		jse.value ->> 'status' as status,
		jse.value ->> 'userId' as userId,
		jse.value ->> 'country' as country,
		jse.value ->> 'orcidId' as orcidId,
		jse.value ->> 'surname' as surname,
		jse.value ->> 'givenNames' as givenNames,
		jse.value ->> 'expiredDate' expiredDate,
		jse.value ->> 'invitedDate' invitedDate,
		jse.value ->> 'removedDate' removedDate,
		jse.value ->> 'acceptedDate' acceptedDate,
		jse.value ->> 'assignedDate' assignedDate,
		jse.value ->> 'declinedDate' declinedDate,
		jse.value ->> 'isCorresponding' as isCorresponding
	from
		public.journal_section js,
		jsonb_array_elements(js.editors_json) jse;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_section_editor create end', clock_timestamp() - vStart);

end;
$BODY$;


-- PROCEDURE: public.sp_copy_journal_section_specialissue()

-- DROP PROCEDURE IF EXISTS public.sp_copy_journal_section_specialissue();

CREATE OR REPLACE PROCEDURE public.sp_copy_journal_section_specialissue(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_section_specialissue create start');

	insert into public.journal_section_specialissue
	select 
		js.event_id, 
		js.event_time,
		js.event_type,
		js.journal_id,
		js.id as journal_section_id,

		uuid(jssi.value ->> 'id') as id,
		jssi.value ->> 'name' as name,
		jssi.value ->> 'created' as created,
		jssi.value ->> 'endDate' as endDate,
		jssi.value ->> 'updated' as updated,
		jssi.value ->> 'customId' as customId,
		jssi.value ->> 'isActive' as isActive,
		jssi.value ->> 'startDate' as startDate,
		jssi.value ->> 'isCancelled' as isCancelled,
		jssi.value ->> 'cancelReason' as cancelReason,
		jssi.value ->> 'callForPapers' as callForPapers,
		jssi.value -> 'peerReviewModel' ->> 'name' as peerReviewModelName,
		jssi.value -> 'editors' as editors_json
	from
		public.journal_section js,
		jsonb_array_elements(js.specialIssues_json) jssi;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_section_specialissue create end', clock_timestamp() - vStart);

end;
$BODY$;



-- PROCEDURE: public.sp_copy_journal_section_specialissue_editor()

-- DROP PROCEDURE IF EXISTS public.sp_copy_journal_section_specialissue_editor();

CREATE OR REPLACE PROCEDURE public.sp_copy_journal_section_specialissue_editor(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_section_specialissue_editor create start');

	insert into public.journal_section_specialissue_editor
	select 
		jssi.event_id, 
		jssi.event_time,
		jssi.event_type,
		jssi.journal_id,
		jssi.journal_section_id,
		jssi.id journal_section_specialissue_id,

		uuid(jssie.value ->> 'id') as id,
		jssie.value ->> 'aff' as aff,
		jssie.value -> 'role' ->> 'type'  as roleType,
		jssie.value -> 'role' ->> 'label' as roleLabel,
		jssie.value ->> 'email' as email,
		jssie.value ->> 'title' as title,
		jssie.value ->> 'status' as status,
		jssie.value ->> 'userId' as userId,
		jssie.value ->> 'country' as country,
		jssie.value ->> 'orcidId' as orcidId,
		jssie.value ->> 'surname' as surname,
		jssie.value ->> 'givenNames' as givenNames,
		jssie.value ->> 'expiredDate' expiredDate,
		jssie.value ->> 'invitedDate' invitedDate,
		jssie.value ->> 'removedDate' removedDate,
		jssie.value ->> 'acceptedDate' acceptedDate,
		jssie.value ->> 'assignedDate' assignedDate,
		jssie.value ->> 'declinedDate' declinedDate,
		jssie.value ->> 'isCorresponding' as isCorresponding
	from
		public.journal_section_specialissue jssi,
		jsonb_array_elements(jssi.editors_json) jssie;

	call public.sp_log(vLogId, clock_timestamp(), 'journal_section_specialissue_editor create end', clock_timestamp() - vStart);
end;
$BODY$;



-- PROCEDURE: public.sp_copy_journal_all_root()

-- DROP PROCEDURE IF EXISTS public.sp_copy_journal_all_root();

CREATE OR REPLACE PROCEDURE public.sp_copy_journal_all_root(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;
	raise notice '-- % explode journal_events START', clock_timestamp();

	raise notice '% explode sp_copy_journal_all START', clock_timestamp();
	call public.sp_copy_journal_all();

	raise notice '% explode sp_copy_journal_editor_all START', clock_timestamp();
	call public.sp_copy_journal_editor_all();

	raise notice '% explode sp_copy_journal_section_all START', clock_timestamp();
	call public.sp_copy_journal_section_all();

	raise notice '% explode sp_copy_journal_specialissue_all START', clock_timestamp();
	call public.sp_copy_journal_specialissue_all();

	raise notice '% explode sp_copy_journal_specialissue_editor START', clock_timestamp();
	call public.sp_copy_journal_specialissue_editor();

	raise notice '% explode sp_copy_journal_section_editor_all START', clock_timestamp();
	call public.sp_copy_journal_section_editor_all();

	raise notice '% explode sp_copy_journal_section_specialissue START', clock_timestamp();
	call public.sp_copy_journal_section_specialissue();

	raise notice '% explode sp_copy_journal_section_specialissue_editor START', clock_timestamp();
	call public.sp_copy_journal_section_specialissue_editor();

	raise notice '-- % explode journal_events END', clock_timestamp();
end;
$BODY$;



-- ///////////////////////////////////////////////////////////////////////////
-- EXPLODING ARTICLE TABLES
-- ///////////////////////////////////////////////////////////////////////////
-- PROCEDURE: public.sp_copy_article_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_article_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_article_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;

	call public.sp_log(vLogId, clock_timestamp(), 'article tables create start');

	insert into public.article
	select
		ae.Id as event_id,
		ae.time as event_time,
		ae.type as event_type,
		ae.payload ->>'id'::text as id,

		ae.payload ->> 'doi' as doi,
		ae.payload ->> 'title' as title,
		ae.payload ->> 'volume' as volume,
		ae.payload ->> 'created' as created,
		ae.payload ->> 'updated' as updated,
		ae.payload ->> 'abstract' as abstract,
		ae.payload ->> 'customId' as customId,
		ae.payload ->> 'figCount' as figCount,
		ae.payload ->> 'refCount' as refCount,
		ae.payload ->> 'journalId' as journalId,
		ae.payload ->> 'pageCount' as pageCount,
		ae.payload ->> 'published' as published,
		ae.payload ->> 'articleType' as articleType,
		ae.payload ->> 'specialIssueId' as specialIssueId,
		ae.payload ->> 'hasSupplementaryMaterials' as hasSupplementaryMaterials 
	from 
		public.article_events ae;
	
	CREATE INDEX if not exists a11_article_event_id_index ON public.article (event_id);

	insert into public.article_author
	select
		ae.Id as event_id,
		ae.time as event_time,
		ae.type as event_type,
		ae.payload ->>'id'::text as article_id,
		aa.value ->> 'aff' as aff,
		aa.value ->>'email' as email,
		aa.value ->>'country' as country,
		aa.value ->>'surname' as surname,
		aa.value ->>'givenNames' as givenNames,
		aa.value ->>'isCorresponding' as isCorresponding
	from  
		article_events ae,
		jsonb_array_elements(ae.payload -> 'authors'::text) aa;

	CREATE INDEX if not exists a11_article_author_event_id_index ON public.article_author (event_id);

	call public.sp_log(vLogId, clock_timestamp(), 'article tables create end', clock_timestamp() - vStart);
end;
$BODY$;

-- ///////////////////////////////////////////////////////////////////////////
-- EXPLODING CHECKER TABLES
-- ///////////////////////////////////////////////////////////////////////////

-- PROCEDURE: public.sp_copy_checker_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_checker_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_checker_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;

	call public.sp_log(vLogId, clock_timestamp(), 'checker tables create start');

	insert into public.checker
	select
		c.Id as event_id,
		c.time as event_time,
		c.type as event_type,
		uuid(c.payload ->>'id') as id,
		c.payload ->> 'role' as role,
		c.payload ->> 'email' as email,
		c.payload ->> 'teamId' as teamId,
		c.payload ->> 'created' as created,
		c.payload ->> 'surname' as surname,
		c.payload ->> 'updated' as updated,
		c.payload ->> 'givenNames' as givenNames,
		c.payload ->> 'isConfirmed' as isConfirmed,
		c.payload ->> 'submissionId' as submissionId,
		c.payload ->> 'assignationDate' as assignationDate,
		c.payload ->> 'assignationType' as assignationType,
		c.payload ->> 'name' as name,
		c.payload ->> 'type' as type,
		c.payload -> 'checkers' as checkers_json,
		c.payload -> 'journalIds' as journalIds_json,
		c.payload -> 'teamLeaders' as teamLeaders_json	
	from 
		public.checker_events c;

	insert into public.checker_checker
	select
		c.event_id,
		c.event_time,
		c.event_type,
		c.id as checker_id,
		uuid(cc.value ->>'id') as id,
		cc.value ->> 'role' as role,
		cc.value ->> 'email' as email,
		cc.value ->> 'created' as created,
		cc.value ->> 'surname' as surname,
		cc.value ->> 'updated' as updated,
		cc.value ->> 'givenNames' as givenNames,
		cc.value ->> 'isConfirmed' as isConfirmed
	from 
		public.checker c,
		jsonb_array_elements(c.checkers_json) cc;

	insert into public.checker_teamleader
	select
		c.event_id,
		c.event_time,
		c.event_type,
		c.id as checker_id,
		uuid(tl.value ->>'id') as id,
		tl.value ->> 'email' as email,
		tl.value ->> 'created' as created,
		tl.value ->> 'surname' as surname,
		tl.value ->> 'updated' as updated,
		tl.value ->> 'givenNames' as givenNames,
		tl.value ->> 'isConfirmed' as isConfirmed
	from 
		public.checker c,
		jsonb_array_elements(c.teamLeaders_json) tl;

	call public.sp_log(vLogId, clock_timestamp(), 'checker tables create end', clock_timestamp() - vStart);
end;
$BODY$;



-- ///////////////////////////////////////////////////////////////////////////
-- EXPLODING INVOICE TABLES
-- ///////////////////////////////////////////////////////////////////////////

-- PROCEDURE: public.sp_copy_invoice_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_invoice_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_invoice_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;

	call public.sp_log(vLogId, clock_timestamp(), 'invoice tables create start');

	raise notice '% invoice', clock_timestamp();

	insert into public.invoice
	select
		ie.Id as event_id,
		ie.time as event_time,
		ie.type as event_type,
		uuid(ie.payload ->>'id') as id,

		ie.payload ->>'created' as created,
		ie.payload ->>'updated' as updated,
		ie.payload ->>'invoiceId' as invoiceId,
		ie.payload ->>'erpReference' as erpReference,
		ie.payload ->>'isCreditNote' isCreditNote,
		ie.payload ->>'invoiceStatus' as invoiceStatus,
		ie.payload ->>'preprintValue' as preprintValue,
		ie.payload ->>'transactionId' as transactionId,
		ie.payload ->>'lastPaymentDate' as lastPaymentDate,
		ie.payload ->>'referenceNumber' as referenceNumber,
		ie.payload ->>'invoiceIssuedDate' as invoiceIssuedDate,
		ie.payload ->>'invoiceCreatedDate' as invoiceCreatedDate,
		ie.payload ->>'creditNoteForInvoice' as creditNoteForInvoice,
		ie.payload ->>'invoiceFinalizedDate' as invoiceFinalizedDate,
		ie.payload ->>'manuscriptAcceptedDate' as manuscriptAcceptedDate,
		ie.payload ->>'currency' as currency,
		-- "very" sexy logic inherited from invoices_data
		((ie.payload -> 'invoiceItems'::text) -> 0) ->> 'manuscriptCustomId'::text AS manuscript_custom_id,
		COALESCE((((ie.payload -> 'invoiceItems'::text) -> 0) ->> 'vatPercentage'::text)::double precision, 0::double precision) AS vat_percentage,
		((ie.payload -> 'payments'::text) -> 0) ->> 'paymentType'::text AS payment_type,
			
		ie.payload ->'costs' ->> 'netApc' as costs_netApc,
		ie.payload ->'costs' ->> 'grossApc' as costs_grossApc,
		ie.payload ->'costs' ->> 'dueAmount' as costs_dueAmount,
		ie.payload ->'costs' ->> 'netAmount' as costs_netAmount,
		ie.payload ->'costs' ->> 'vatAmount' as costs_vatAmount,
		ie.payload ->'costs' ->> 'paidAmount' as costs_paidAmount,
		ie.payload ->'costs' ->> 'totalDiscount' as costs_totalDiscount,

		ie.payload ->'payer' ->> 'type'::text as payer_type,
		ie.payload ->'payer' ->> 'email'::text as payer_email,
		ie.payload ->'payer' ->> 'lastName'::text as payer_lastName,
		ie.payload ->'payer' ->> 'firstName'::text as payer_firstName,
		ie.payload ->'payer' ->> 'countryCode'::text as payer_countryCode,
		ie.payload ->'payer' ->> 'organization'::text as payer_organization,
		ie.payload ->'payer' ->> 'billingAddress'::text as payer_billingAddress,
		ie.payload ->'payer' ->> 'vatRegistrationNumber'::text as payer_vatRegistrationNumber
	from 
		public.invoice_events ie;

	raise notice '% invoice_payment', clock_timestamp();

	insert into public.invoice_payment
	select
		ie.Id as event_id,
		ie.time as event_time,
		ie.type as event_type,
		uuid(ie.payload ->>'id') as invoice_id,

		ip ->> 'paymentDate' as paymentDate,
		ip ->> 'paymentType' as paymentType,
		ip ->> 'paymentAmount' as paymentAmount,
		ip ->> 'foreignPaymentId' as foreignPaymentId
	from 
		public.invoice_events ie,
		jsonb_array_elements(ie.payload ->'payments') ip;

	raise notice '% invoice_invoiceItem', clock_timestamp();

	insert into public.invoice_invoiceItem
	select
		ie.Id as event_id,
		ie.time as event_time,
		ie.type as event_type,
		uuid(ie.payload ->>'id') as invoice_id,

		ii ->> 'id' as id,
		ii ->> 'type' as type,
		ii ->> 'price' as price,
		ii ->> 'manuscriptId' as manuscriptId,
		ii ->> 'vatPercentage' vatPercentage,
		ii ->> 'manuscriptCustomId' as manuscriptCustomId
	from 
		public.invoice_events ie,
		jsonb_array_elements(ie.payload ->'invoiceItems') ii;

	raise notice '% invoice_invoiceItem_coupon', clock_timestamp();
	insert into public.invoice_invoiceItem_coupon
	select
		ie.Id as event_id,
		ie.time as event_time,
		ie.type as event_type,
		uuid(ie.payload ->>'id') as invoice_id,
		ii ->> 'id' as invoice_lineItem_id,

		iic ->> 'id' as id,
		iic ->> 'code' as code,
		iic ->> 'couponType' as couponType,
		iic ->> 'couponReduction' as couponReduction,
		iic ->> 'couponCreatedDate' as couponCreatedDate,
		iic ->> 'couponUpdatedDate' as couponUpdatedDate,
		iic ->> 'couponExpirationDate' as couponExpirationDate,
		iic ->> 'applicableToInvoiceItemType' as applicableToInvoiceItemType
	from 
		public.invoice_events ie,
		jsonb_array_elements(ie.payload ->'invoiceItems') ii,
		jsonb_array_elements(ii.value ->'coupons') iic;

	raise notice '% invoice_invoiceItem_waiver', clock_timestamp();
	insert into public.invoice_invoiceItem_waiver 
	select
		ie.Id as event_id,
		ie.time as event_time,
		ie.type as event_type,
		uuid(ie.payload ->>'id') as invoice_id,
		ii ->> 'id' as invoice_lineItem_id,

		iiw ->> 'waiverType' as waiverType,
		iiw ->> 'waiverReduction' as waiverReduction
	from 
		public.invoice_events ie,
		jsonb_array_elements(ie.payload ->'invoiceItems') ii,
		jsonb_array_elements(ii.value ->'waivers') iiw;

	raise notice '% DONE.', clock_timestamp();

	call public.sp_log(vLogId, clock_timestamp(), 'invoice tables create end', clock_timestamp() - vStart);
end;
$BODY$;



-- ///////////////////////////////////////////////////////////////////////////
-- EXPLODING USER TABLES
-- ///////////////////////////////////////////////////////////////////////////


-- PROCEDURE: public.sp_copy_user_all()

-- DROP PROCEDURE IF EXISTS public.sp_copy_user_all();

CREATE OR REPLACE PROCEDURE public.sp_copy_user_all(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStart timestamp;
	vLogId uuid;
begin
	vStart = clock_timestamp();
	vLogId = md5(random()::text || clock_timestamp()::text)::uuid;

	call public.sp_log(vLogId, clock_timestamp(), 'user tables create start');

	insert into public.user 
	select
		ue.Id as event_id,
		ue.time as event_time,
		ue.type as event_type,
		uuid(ue.payload ->>'id') as id,
		ue.payload ->> 'agreeTc' as agreeTc,
		ue.payload ->> 'created' as created,
		ue.payload ->> 'updated' as updated,
		ue.payload ->> 'isActive' as isActive,
		ue.payload ->> 'isSubscribedToEmails' as isSubscribedToEmails,
		ue.payload ->> 'defaultIdentityType' as defaultIdentityType
	FROM 
		public.user_events ue;

	insert into public.user_identity
	select
		ue.Id as event_id,
		ue.time as event_time,
		ue.type as event_type,
		uuid(ue.payload ->>'id') as user_id,

		uuid(ui.value ->> 'id') as id,
		ui.value ->> 'aff' as aff,
		ui.value ->> 'type' as type,
		ui.value ->> 'email' as email,
		ui.value ->> 'title' as title,
		ui.value ->> 'country' as country,
		ui.value ->> 'created' as created,
		ui.value ->> 'surname' as surname,
		ui.value ->> 'updated' as updated,
		ui.value ->> 'givenNames' as givenNames,
		ui.value ->> 'identifier' as identifier,
		ui.value ->> 'isConfirmed' as isConfirmed
	FROM 
		public.user_events ue,
		jsonb_array_elements(ue.payload -> 'identities') ui;	

	call public.sp_log(vLogId, clock_timestamp(), 'user tables create end', clock_timestamp() - vStart);
end;
$BODY$;
commit;

-- ///////////////////////////////////////////////////////////////////////////
-- CREATE TRIGGER FUNCTIONS
-- ///////////////////////////////////////////////////////////////////////////


-- FUNCTION: public.insert_into_article_tables()

-- DROP FUNCTION IF EXISTS public.insert_into_article_tables();

CREATE OR REPLACE FUNCTION public.insert_into_article_tables()
	RETURNS trigger
	LANGUAGE 'plpgsql'
	COST 100
	VOLATILE NOT LEAKPROOF
AS $BODY$
declare
begin

	--create table public._article as select * from public.article limit 0;
	insert into public.article
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			NEW.payload ->>'id'::text as id,
			NEW.payload ->> 'doi' as doi,
			NEW.payload ->> 'title' as title,
			NEW.payload ->> 'volume' as volume,
			NEW.payload ->> 'created' as created,
			NEW.payload ->> 'updated' as updated,
			NEW.payload ->> 'abstract' as abstract,
			NEW.payload ->> 'customId' as customId,
			NEW.payload ->> 'figCount' as figCount,
			NEW.payload ->> 'refCount' as refCount,
			NEW.payload ->> 'journalId' as journalId,
			NEW.payload ->> 'pageCount' as pageCount,
			NEW.payload ->> 'published' as published,
			NEW.payload ->> 'articleType' as articleType,
			NEW.payload ->> 'specialIssueId' as specialIssueId,
			NEW.payload ->> 'hasSupplementaryMaterials' as hasSupplementaryMaterials 
			;
	
	--create table public._article_author as select * from public.article_author limit 0;
	insert into public.article_author
	select
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		NEW.payload ->>'id'::text as article_id,
		authors.value ->> 'aff' as aff,
		authors.value ->>'email' as email,
		authors.value ->>'country' as country,
		authors.value ->>'surname' as surname,
		authors.value ->>'givenNames' as givenNames,
		authors.value ->>'isCorresponding' as isCorresponding
	from 
		jsonb_array_elements(NEW.payload ->'authors') authors;
		
	RETURN NEW;
	END
$BODY$;

ALTER FUNCTION public.insert_into_article_tables()
	OWNER TO postgres;


-- FUNCTION: public.insert_into_checker_tables()

-- DROP FUNCTION IF EXISTS public.insert_into_checker_tables();

CREATE OR REPLACE FUNCTION public.insert_into_checker_tables()
	RETURNS trigger
	LANGUAGE 'plpgsql'
	COST 100
	VOLATILE NOT LEAKPROOF
AS $BODY$
declare
begin

	--create table public._checker as select * from public.checker limit 0;
	insert into public.checker
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as id,
			NEW.payload ->> 'role' as role,
			NEW.payload ->> 'email' as email,
			NEW.payload ->> 'teamId' as teamId,
			NEW.payload ->> 'created' as created,
			NEW.payload ->> 'surname' as surname,
			NEW.payload ->> 'updated' as updated,
			NEW.payload ->> 'givenNames' as givenNames,
			NEW.payload ->> 'isConfirmed' as isConfirmed,
			NEW.payload ->> 'submissionId' as submissionId,
			NEW.payload ->> 'assignationDate' as assignationDate,
			NEW.payload ->> 'assignationType' as assignationType,
			NEW.payload ->> 'name' as name,
			NEW.payload ->> 'type' as type,
			NEW.payload -> 'checkers' as checkers_json,
			NEW.payload -> 'journalIds' as journalIds_json,
			NEW.payload -> 'teamLeaders' as teamLeaders_json	 
			;
	
	--create table public._checker_checker as select * from public.checker_checker limit 0;
	insert into public.checker_checker
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as checker_id,
			uuid(cc.value ->>'id') as id,
			cc.value ->> 'role' as role,
			cc.value ->> 'email' as email,
			cc.value ->> 'created' as created,
			cc.value ->> 'surname' as surname,
			cc.value ->> 'updated' as updated,
			cc.value ->> 'givenNames' as givenNames,
			cc.value ->> 'isConfirmed' as isConfirmed
		from 
			jsonb_array_elements(NEW.payload ->'checkers') cc;
		
		
	--create table public._checker_teamleader as select * from public.checker_teamleader limit 0;
	insert into public.checker_teamleader
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as checker_id,
			uuid(tl.value ->>'id') as id,
			tl.value ->> 'email' as email,
			tl.value ->> 'created' as created,
			tl.value ->> 'surname' as surname,
			tl.value ->> 'updated' as updated,
			tl.value ->> 'givenNames' as givenNames,
			tl.value ->> 'isConfirmed' as isConfirmed
		from 
			jsonb_array_elements(NEW.payload ->'teamLeaders') tl;
		
	RETURN NEW;
	END
$BODY$;

ALTER FUNCTION public.insert_into_checker_tables()
	OWNER TO postgres;


-- FUNCTION: public.insert_into_invoice_tables()

-- DROP FUNCTION IF EXISTS public.insert_into_invoice_tables();

CREATE OR REPLACE FUNCTION public.insert_into_invoice_tables()
	RETURNS trigger
	LANGUAGE 'plpgsql'
	COST 100
	VOLATILE NOT LEAKPROOF
AS $BODY$
declare
begin

	--create table public.invoice as select * from public.invoice limit 0;
	insert into public.invoice
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as id,
			
			NEW.payload ->>'created' as created,
			NEW.payload ->>'updated' as updated,
			NEW.payload ->>'invoiceId' as invoiceId,
			NEW.payload ->>'erpReference' as erpReference,
			NEW.payload ->>'isCreditNote' isCreditNote,
			NEW.payload ->>'invoiceStatus' as invoiceStatus,
			NEW.payload ->>'preprintValue' as preprintValue,
			NEW.payload ->>'transactionId' as transactionId,
			NEW.payload ->>'lastPaymentDate' as lastPaymentDate,
			NEW.payload ->>'referenceNumber' as referenceNumber,
			NEW.payload ->>'invoiceIssuedDate' as invoiceIssuedDate,
			NEW.payload ->>'invoiceCreatedDate' as invoiceCreatedDate,
			NEW.payload ->>'creditNoteForInvoice' as creditNoteForInvoice,
			NEW.payload ->>'invoiceFinalizedDate' as invoiceFinalizedDate,
			NEW.payload ->>'manuscriptAcceptedDate' as manuscriptAcceptedDate,
			NEW.payload ->>'currency' as currency,
			-- "very" sexy logic inherited from invoices_data
			((NEW.payload -> 'invoiceItems'::text) -> 0) ->> 'manuscriptCustomId'::text AS manuscript_custom_id,
			COALESCE((((NEW.payload -> 'invoiceItems'::text) -> 0) ->> 'vatPercentage'::text)::double precision, 0::double precision) AS vat_percentage,
			((NEW.payload -> 'payments'::text) -> 0) ->> 'paymentType'::text AS payment_type,
			
			NEW.payload ->'costs' ->> 'netApc' as costs_netApc,
			NEW.payload ->'costs' ->> 'grossApc' as costs_grossApc,
			NEW.payload ->'costs' ->> 'dueAmount' as costs_dueAmount,
			NEW.payload ->'costs' ->> 'netAmount' as costs_netAmount,
			NEW.payload ->'costs' ->> 'vatAmount' as costs_vatAmount,
			NEW.payload ->'costs' ->> 'paidAmount' as costs_paidAmount,
			NEW.payload ->'costs' ->> 'totalDiscount' as costs_totalDiscount,
			
			NEW.payload ->'payer' ->> 'type'::text as payer_type,
			NEW.payload ->'payer' ->> 'email'::text as payer_email,
			NEW.payload ->'payer' ->> 'lastName'::text as payer_lastName,
			NEW.payload ->'payer' ->> 'firstName'::text as payer_firstName,
			NEW.payload ->'payer' ->> 'countryCode'::text as payer_countryCode,
			NEW.payload ->'payer' ->> 'organization'::text as payer_organization,
			NEW.payload ->'payer' ->> 'billingAddress'::text as payer_billingAddress,
			NEW.payload ->'payer' ->> 'vatRegistrationNumber'::text as payer_vatRegistrationNumber	 
			;
	
	--create table public.invoice_payment as select * from public.invoice_payment limit 0;
	insert into public.invoice_payment
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as invoice_id,
			
			ip ->> 'paymentDate' as paymentDate,
			ip ->> 'paymentType' as paymentType,
			ip ->> 'paymentAmount' as paymentAmount,
			ip ->> 'foreignPaymentId' as foreignPaymentId
		from 
			jsonb_array_elements(NEW.payload ->'payments') ip;
		
		
	--create table public.invoice_invoiceItem as select * from public.invoice_invoiceItem limit 0;
	insert into public.invoice_invoiceItem
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as invoice_id,
			
			ii ->> 'id' as id,
			ii ->> 'type' as type,
			ii ->> 'price' as price,
			ii ->> 'manuscriptId' as manuscriptId,
			ii ->> 'vatPercentage' vatPercentage,
			ii ->> 'manuscriptCustomId' as manuscriptCustomId
		from 
			jsonb_array_elements(NEW.payload ->'invoiceItems') ii;
	
	
	--create table public.invoice_invoiceItem_coupon as select * from public.invoice_invoiceItem_coupon limit 0;
	insert into public.invoice_invoiceItem_coupon
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as invoice_id,
			ii ->> 'id' as invoice_lineItem_id,
			iic ->> 'id' as id,
			iic ->> 'code' as code,
			iic ->> 'couponType' as couponType,
			iic ->> 'couponReduction' as couponReduction,
			iic ->> 'couponCreatedDate' as couponCreatedDate,
			iic ->> 'couponUpdatedDate' as couponUpdatedDate,
			iic ->> 'couponExpirationDate' as couponExpirationDate,
			iic ->> 'applicableToInvoiceItemType' as applicableToInvoiceItemType
		from 
			jsonb_array_elements(NEW.payload ->'invoiceItems') ii,
			jsonb_array_elements(ii.value ->'coupons') iic;
		
	
	--create table public.invoice_invoiceItem_waiver as select * from public.invoice_invoiceItem_waiver limit 0;
	insert into public.invoice_invoiceItem_waiver
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as invoice_id,
			ii ->> 'id' as invoice_lineItem_id,
			iiw ->> 'waiverType' as waiverType,
			iiw ->> 'waiverReduction' as waiverReduction
		from 
			jsonb_array_elements(NEW.payload ->'invoiceItems') ii,
			jsonb_array_elements(ii.value ->'waivers') iiw;	
		
	RETURN NEW;
	END
$BODY$;

ALTER FUNCTION public.insert_into_invoice_tables()
	OWNER TO postgres;


-- FUNCTION: public.insert_into_journal_tables()

-- DROP FUNCTION IF EXISTS public.insert_into_journal_tables();

CREATE OR REPLACE FUNCTION public.insert_into_journal_tables()
	RETURNS trigger
	LANGUAGE 'plpgsql'
	COST 100
	VOLATILE NOT LEAKPROOF
AS $BODY$
declare
begin

	--create table public._journal as select * from public.journal limit 0;
	insert into public.journal
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as id,
			NEW.payload ->>'apc' as apc,
			NEW.payload ->>'code' as code,
			NEW.payload ->>'issn' as issn,
			NEW.payload ->>'name' as name,
			NEW.payload ->>'email' as email,
			NEW.payload ->>'created' as created,
			NEW.payload ->>'updated' as updated,
			NEW.payload ->>'isActive' as isActive,
			NEW.payload ->>'publisherName' as publisherName,
			NEW.payload ->>'activationDate' as activationDate,
			NEW.payload ->'peerReviewModel' ->> 'name' peerReviewModelName
			,NEW.payload ->'editors' as editors_json -- todo: dowe still need jsons
			,NEW.payload ->'sections' sections_json
			,NEW.payload ->'articleTypes' articleTypes
			,NEW.payload ->'specialIssues' as specialIssues_json 
			;
	
	--create table public._journal_editor as select * from public.journal_editor limit 0;
	insert into public.journal_editor
	select
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,

		uuid(editors.value ->> 'id') as id,
		editors.value ->> 'aff' as aff,
		editors.value -> 'role' ->> 'type'  as roleType,
		editors.value -> 'role' ->> 'label' as roleLabel,
		editors.value ->> 'email' as email,
		editors.value ->> 'title' as title,
		editors.value ->> 'status' as status,
		editors.value ->> 'userId' as userId,
		editors.value ->> 'country' as country,
		editors.value ->> 'orcidId' as orcidId,
		editors.value ->> 'surname' as surname,
		editors.value ->> 'givenNames' as givenNames,
		editors.value ->> 'expiredDate' expiredDate,
		editors.value ->> 'invitedDate' invitedDate,
		editors.value ->> 'removedDate' removedDate,
		editors.value ->> 'acceptedDate' acceptedDate,
		editors.value ->> 'assignedDate' assignedDate,
		editors.value ->> 'declinedDate' declinedDate,
		editors.value ->> 'isCorresponding' as isCorresponding
	from 
		jsonb_array_elements(NEW.payload ->'editors') editors;
	
	--create table public._journal_section as select * from public.journal_section limit 0;
	INSERT INTO public.journal_section 
	SELECT
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,
		NEW.payload ->>'name' as journal_name,
		NEW.payload ->>'issn' as journal_issn,
		NEW.payload ->>'code' as journal_code,
		
		uuid(sections.value ->> 'id') as id,
		sections.value ->> 'name' as name,
		sections.value ->> 'created' as created,
		sections.value ->> 'updated' as updated,
		sections.value ->'editors' as editors_json,
		sections.value ->'specialIssues' as specialIssues_json
	FROM
		jsonb_array_elements(NEW.payload ->'sections') sections;

	--create table public._journal_section_editor as select * from public.journal_section_editor limit 0;
	INSERT INTO public.journal_section_editor 
	SELECT
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,
		uuid(js.value ->> 'id') as journal_section_id,

		uuid(jse.value ->> 'id') as id,
		jse.value ->> 'aff' as aff,
		jse.value -> 'role' ->> 'type'  as roleType,
		jse.value -> 'role' ->> 'label' as roleLabel,
		jse.value ->> 'email' as email,
		jse.value ->> 'title' as title,
		jse.value ->> 'status' as status,
		jse.value ->> 'userId' as userId,
		jse.value ->> 'country' as country,
		jse.value ->> 'orcidId' as orcidId,
		jse.value ->> 'surname' as surname,
		jse.value ->> 'givenNames' as givenNames,
		jse.value ->> 'expiredDate' expiredDate,
		jse.value ->> 'invitedDate' invitedDate,
		jse.value ->> 'removedDate' removedDate,
		jse.value ->> 'acceptedDate' acceptedDate,
		jse.value ->> 'assignedDate' assignedDate,
		jse.value ->> 'declinedDate' declinedDate,
		jse.value ->> 'isCorresponding' as isCorresponding
	from
		jsonb_array_elements(NEW.payload ->'sections') js,
		jsonb_array_elements(js -> 'editors') jse;

	--create table public._journal_section_specialissue as select * from public.journal_section_specialissue limit 0;
	INSERT INTO public.journal_section_specialissue
	SELECT
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,
		uuid(js.value ->> 'id') as journal_section_id,

		uuid(jssi.value ->> 'id') as id,
		jssi.value ->> 'name' as name,
		jssi.value ->> 'created' as created,
		jssi.value ->> 'endDate' as endDate,
		jssi.value ->> 'updated' as updated,
		jssi.value ->> 'customId' as customId,
		jssi.value ->> 'isActive' as isActive,
		jssi.value ->> 'startDate' as startDate,
		jssi.value ->> 'isCancelled' as isCancelled,
		jssi.value ->> 'cancelReason' as cancelReason,
		jssi.value ->> 'callForPapers' as callForPapers,
		jssi.value -> 'peerReviewModel' ->> 'name' as peerReviewModelName,
		jssi.value -> 'editors' as editors_json
	from
		jsonb_array_elements(NEW.payload ->'sections') js,
		jsonb_array_elements(js -> 'specialIssues') jssi;

	--create table public._journal_section_specialissue_editor as select * from public.journal_section_specialissue_editor limit 0;
	INSERT INTO public.journal_section_specialissue_editor
	SELECT
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,
		uuid(js.value ->> 'id') as journal_section_id,
		uuid(jssi.value ->>'id') as journal_section_specialissue_id,

		uuid(jssie.value ->> 'id') as id,
		jssie.value ->> 'aff' as aff,
		jssie.value -> 'role' ->> 'type'  as roleType,
		jssie.value -> 'role' ->> 'label' as roleLabel,
		jssie.value ->> 'email' as email,
		jssie.value ->> 'title' as title,
		jssie.value ->> 'status' as status,
		jssie.value ->> 'userId' as userId,
		jssie.value ->> 'country' as country,
		jssie.value ->> 'orcidId' as orcidId,
		jssie.value ->> 'surname' as surname,
		jssie.value ->> 'givenNames' as givenNames,
		jssie.value ->> 'expiredDate' expiredDate,
		jssie.value ->> 'invitedDate' invitedDate,
		jssie.value ->> 'removedDate' removedDate,
		jssie.value ->> 'acceptedDate' acceptedDate,
		jssie.value ->> 'assignedDate' assignedDate,
		jssie.value ->> 'declinedDate' declinedDate,
		jssie.value ->> 'isCorresponding' as isCorresponding
	from
		jsonb_array_elements(NEW.payload ->'sections') js,
		jsonb_array_elements(js -> 'specialIssues') jssi,
		jsonb_array_elements(jssi -> 'editors') jssie;

	--create table public._journal_specialissue as select * from public.journal_specialissue limit 0;
	INSERT INTO public.journal_specialissue 
	select
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,

		uuid(si.value ->> 'id') as id,
		si.value ->> 'name' as name,
		si.value ->> 'created' as created,
		si.value ->> 'endDate' as endDate,
		si.value ->> 'updated' as updated,
		si.value ->> 'customId' as customId,
		si.value ->> 'isActive' as isActive,
		si.value ->> 'startDate' as startDate,
		si.value ->> 'isCancelled' as isCancelled,
		si.value ->> 'cancelReason' as cancelReason,
		si.value ->> 'callForPapers' as callForPapers,
		si.value -> 'peerReviewModel' ->> 'name' as peerReviewModelName,
		si.value -> 'editors' as editors_json
	from 
		jsonb_array_elements(NEW.payload ->'specialIssues') si;

	--create table public._journal_specialissue_editor as select * from public.journal_specialissue_editor limit 0;
	INSERT INTO public.journal_specialissue_editor
	select 
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,
		uuid(jsi.value ->> 'id') as journal_specialissue_id,

		uuid(jsie.value ->> 'id') as id,
		jsie.value ->> 'aff' as aff,
		jsie.value -> 'role' ->> 'type'  as roleType,
		jsie.value -> 'role' ->> 'label' as roleLabel,
		jsie.value ->> 'email' as email,
		jsie.value ->> 'title' as title,
		jsie.value ->> 'status' as status,
		jsie.value ->> 'userId' as userId,
		jsie.value ->> 'country' as country,
		jsie.value ->> 'orcidId' as orcidId,
		jsie.value ->> 'surname' as surname,
		jsie.value ->> 'givenNames' as givenNames,
		jsie.value ->> 'expiredDate' expiredDate,
		jsie.value ->> 'invitedDate' invitedDate,
		jsie.value ->> 'removedDate' removedDate,
		jsie.value ->> 'acceptedDate' acceptedDate,
		jsie.value ->> 'assignedDate' assignedDate,
		jsie.value ->> 'declinedDate' declinedDate,
		jsie.value ->> 'isCorresponding' as isCorresponding
	from
		jsonb_array_elements(NEW.payload ->'specialIssues') jsi,
		jsonb_array_elements(jsi -> 'editors') jsie;

	RETURN NEW;
	END
$BODY$;

ALTER FUNCTION public.insert_into_journal_tables()
	OWNER TO postgres;


-- FUNCTION: public.insert_into_manuscript_tables()

-- DROP FUNCTION IF EXISTS public.insert_into_manuscript_tables();

CREATE OR REPLACE FUNCTION public.insert_into_manuscript_tables()
	RETURNS trigger
	LANGUAGE 'plpgsql'
	COST 100
	VOLATILE NOT LEAKPROOF
AS $BODY$
declare
begin

	--create table public._manuscript as select * from public.manuscript limit 0;
	insert into public.manuscript
		select
			NEW.id as event_id,
			NEW."time" as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->> 'submissionId') as submission_id,
			
			uuid(m.value ->> 'id') as id,
			m.value ->> 'title' as title,
			m.value ->> 'version' as version,
			m.value ->> 'abstract' as abstract,
			m.value ->> 'customId' as customId,
			m.value ->> 'journalId' as journalId,
			m.value ->> 'sectionId' as sectionId,
			m.value ->  'articleType' ->> 'name' as articleType_Name,
			m.value ->> 'acceptedDate' as acceptedDate,
			m.value ->> 'preprintValue' as preprintValue,
			m.value ->  'sourceJournal' ->> 'name' as sourceJournal_name, 
			m.value ->  'sourceJournal' ->> 'eissn' as sourceJournal_eissn,
			m.value ->  'sourceJournal' ->> 'pissn' as sourceJournal_pissn,
			m.value ->> 'specialIssueId' as specialIssueId,
			m.value ->> 'dataAvailability' as dataAvailability,
			m.value ->> 'fundingStatement' as fundingStatement,
			m.value ->> 'conflictOfInterest' as conflictOfInterest,
			m.value ->> 'submissionCreatedDate' as submissionCreatedDate,
			m.value ->> 'qualityChecksSubmittedDate' as qualityChecksSubmittedDate,
			m.value -> 'files' as files_json,
			m.value -> 'authors' as authors_json,
			m.value -> 'editors' as editors_json,
			m.value -> 'reviewers' as reviewers_json,
			m.value -> 'reviews' as reviews_json,
			m.value -> 'submittingStaffMembers' as submittingStaffMembers_json	 
		from 
			jsonb_array_elements(NEW.payload -> 'manuscripts') m;
			
	
	--create table public._manuscript_author as select * from public.manuscript_author limit 0;
	insert into public.manuscript_author
		select
			NEW.id as event_id,
			NEW."time" as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->> 'submissionId') as submission_id,   
			uuid(m.value ->> 'id') as manuscript_id,
			
			uuid(mf.value ->> 'id') as id,
			mf.value ->> 'aff' as aff,
			mf.value ->> 'email' as email,
			mf.value ->> 'status' as status,
			mf.value ->> 'userId' as userId,
			mf.value ->> 'country' as country,
			mf.value ->> 'created' as created,
			mf.value ->> 'orcidId' as orcidId,
			mf.value ->> 'surname' as surname,
			mf.value ->> 'updated' as updated,
			mf.value ->> 'position' as position,
			mf.value ->> 'givenNames' as givenNames,
			mf.value ->> 'assignedDate' as assignedDate,
			mf.value ->> 'isSubmitting'  as isSubmitting,
			mf.value ->> 'isCorresponding' as isCorresponding
		from 
			jsonb_array_elements(NEW.payload -> 'manuscripts') m,
			jsonb_array_elements(m.value -> 'authors') mf;
		
		
	--create table public._manuscript_editor as select * from public.manuscript_editor limit 0;
	insert into public.manuscript_editor
		select
			NEW.id as event_id,
			NEW."time" as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->> 'submissionId') as submission_id,   
			uuid(m.value ->> 'id') as manuscript_id,
			
			uuid(me.value ->> 'id') as id, 
			me.value ->> 'aff' as aff,
			me.value -> 'role' ->> 'type' as role_type,
			me.value -> 'role' ->> 'label' as role_label,
			me.value ->> 'email' as email,
			me.value ->> 'title' as title,
			me.value ->> 'status' as status,
			me.value ->> 'userId' as userId,
			me.value ->> 'country' as country,
			me.value ->> 'orcidId' as orcidId,
			me.value ->> 'surname' as surname,
			me.value ->> 'givenNames' as givenNames,
			me.value ->> 'expiredDate' as expiredDate,
			me.value ->> 'invitedDate' as invitedDate,
			me.value ->> 'removedDate' as removedDate,
			me.value ->> 'acceptedDate' as acceptedDate,
			me.value ->> 'assignedDate' as assignedDate,
			me.value ->> 'declinedDate' as declinedDate,
			me.value ->> 'isCorresponding' as isCorresponding
		from 
			jsonb_array_elements(NEW.payload -> 'manuscripts') m,
			jsonb_array_elements(m.value -> 'editors') me;
	
	
	--create table public._manuscript_file as select * from public.manuscript_file limit 0;
	insert into public.manuscript_file
		select
			NEW.id as event_id,
			NEW."time" as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->> 'submissionId') as submission_id,   
			uuid(m.value ->> 'id') as manuscript_id,
			
			uuid(mf.value ->> 'id') as id,
			mf.value ->> 'url' as url,
			mf.value ->> 'size' as size,
			mf.value ->> 'type' as type,
			mf.value ->> 'label' as label,
			mf.value ->> 'created' as created,
			mf.value ->> 'updated' as updated,
			mf.value ->> 'fileName' as fileName,
			mf.value ->> 'mimeType' as mimeType,
			mf.value ->> 'position' as position,
			mf.value ->> 'providerKey' as providerKey,
			mf.value ->> 'originalName' as originalName
		from 
			jsonb_array_elements(NEW.payload -> 'manuscripts') m,
			jsonb_array_elements(m.value -> 'files') mf;
		
	
	--create table public._manuscript_reviewer as select * from public.manuscript_reviewer limit 0;
	insert into public.manuscript_reviewer
		select
			NEW.id as event_id,
			NEW."time" as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->> 'submissionId') as submission_id,   
			uuid(m.value ->> 'id') as manuscript_id,
			m.value ->> 'version' as manuscript_version,
			uuid(mr.value ->> 'id') as id,
			mr.value ->> 'aff' as aff,
			mr.value ->> 'email' as email,
			mr.value ->> 'status' as status,
			mr.value ->> 'userId' as userId,
			mr.value ->> 'country' as country,
			cast_to_timestamp(mr.value ->> 'created')::timestamp without time zone as created,
			mr.value ->> 'orcidId' as orcidId,
			mr.value ->> 'surname' as surname,
			cast_to_timestamp(mr.value ->> 'updated')::timestamp without time zone as updated,
			cast_to_timestamp(mr.value ->> 'responded')::timestamp without time zone as responded,
			mr.value ->> 'givenNames' as givenNames,
			cast_to_timestamp(mr.value ->> 'expiredDate')::timestamp without time zone as expiredDate,
			mr.value ->> 'fromService' as fromService,
			cast_to_timestamp(mr.value ->> 'invitedDate')::timestamp without time zone as invitedDate,
			cast_to_timestamp(mr.value ->> 'acceptedDate')::timestamp without time zone as acceptedDate,
			cast_to_timestamp(mr.value ->> 'declinedDate')::timestamp without time zone as declinedDate
		from 
			jsonb_array_elements(NEW.payload -> 'manuscripts') m,
			jsonb_array_elements(m.value -> 'reviewers') mr;
		
		
	--create table public._manuscript_review as select * from public.manuscript_review limit 0;
	insert into public.manuscript_review
		select
			NEW.id as event_id,
			NEW."time" as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->> 'submissionId') as submission_id,   
			uuid(m.value ->> 'id') as manuscript_id,
			m.value ->> 'version' as manuscript_version,
			uuid(mr.value ->> 'id') as id,
			cast_to_timestamp(mr.value ->> 'created')::timestamp without time zone as created,
			mr.value ->> 'isValid' as isValid,
			cast_to_timestamp(mr.value ->> 'updated')::timestamp without time zone as updated,
			mr.value ->> 'submitted' as submitted,
			mr.value ->> 'teamMemberId' as teamMemberId,
			mr.value ->> 'recommendation' as recommendation,
			mr.value ->  'comments' as comments_json
		from 
			jsonb_array_elements(NEW.payload -> 'manuscripts') m,
			jsonb_array_elements(m.value -> 'reviews') mr;
		
	
	--create table public._manuscript_review_comment as select * from public.manuscript_review_comment limit 0;
	insert into public.manuscript_review_comment
		select
			NEW.id as event_id,
			NEW."time" as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->> 'submissionId') as submission_id,   
			uuid(m.value ->> 'id') as manuscript_id,
			uuid(mr.value ->> 'id') as review_id,
			
			uuid(mrc.value ->> 'id') as id,
			mrc.value ->> 'type' as type,
			mrc.value ->> 'content' as content,
			mrc.value ->> 'created' as created ,
			mrc.value ->> 'updated' as updated,
			mrc.value ->  'files' as files_json
		from 
			jsonb_array_elements(NEW.payload -> 'manuscripts') m,
			jsonb_array_elements(m.value -> 'reviews') mr,
			jsonb_array_elements(mr.value -> 'comments') mrc;

	--create table public._manuscript_review_comment_file as select * from public.manuscript_review_comment_file limit 0;
	insert into public.manuscript_review_comment_file
		select
			NEW.id as event_id,
			NEW."time" as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->> 'submissionId') as submission_id,   
			uuid(m.value ->> 'id') as manuscript_id,
			uuid(mr.value ->> 'id') as review_id,
			uuid(mrc.value ->> 'id') as review_comment_id,
			
			uuid(mrcf.value ->> 'id') as id,
			mrcf.value ->> 'url' as url,
			mrcf.value ->> 'size' as size,
			mrcf.value ->> 'type' as type,
			mrcf.value ->> 'label' as label,
			mrcf.value ->> 'created' as created,
			mrcf.value ->> 'updated' as updated,
			mrcf.value ->> 'fileName' as fileName,
			mrcf.value ->> 'mimeType' as mimeType,
			mrcf.value ->> 'position' as position,
			mrcf.value ->> 'commentId' as commentId,
			mrcf.value ->> 'providerKey' as providerKey,
			mrcf.value ->> 'manuscriptId' as manuscriptId,
			mrcf.value ->> 'originalName' as originalName
		from 
			jsonb_array_elements(NEW.payload -> 'manuscripts') m,
			jsonb_array_elements(m.value -> 'reviews') mr,
			jsonb_array_elements(mr.value -> 'comments') mrc,
			jsonb_array_elements(mrc.value -> 'files') mrcf;	

	
	RETURN NEW;
	END
$BODY$;

ALTER FUNCTION public.insert_into_manuscript_tables()
	OWNER TO postgres;


-- FUNCTION: public.insert_into_user_tables()

-- DROP FUNCTION IF EXISTS public.insert_into_user_tables();

CREATE OR REPLACE FUNCTION public.insert_into_user_tables()
	RETURNS trigger
	LANGUAGE 'plpgsql'
	COST 100
	VOLATILE NOT LEAKPROOF
AS $BODY$
declare
begin

	--create table public._user as select * from public.user limit 0;
	insert into public.user
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as id,
			NEW.payload ->> 'agreeTc' as agreeTc,
			NEW.payload ->> 'created' as created,
			NEW.payload ->> 'updated' as updated,
			NEW.payload ->> 'isActive' as isActive,
			NEW.payload ->> 'isSubscribedToEmails' as isSubscribedToEmails,
			NEW.payload ->> 'defaultIdentityType' as defaultIdentityType 
			;
	
	--create table public._user_identity as select * from public.user_identity limit 0;
	insert into public.user_identity
	select
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as user_id,

		uuid(ui.value ->> 'id') as id,
		ui.value ->> 'aff' as aff,
		ui.value ->> 'type' as type,
		ui.value ->> 'email' as email,
		ui.value ->> 'title' as title,
		ui.value ->> 'country' as country,
		ui.value ->> 'created' as created,
		ui.value ->> 'surname' as surname,
		ui.value ->> 'updated' as updated,
		ui.value ->> 'givenNames' as givenNames,
		ui.value ->> 'identifier' as identifier,
		ui.value ->> 'isConfirmed' as isConfirmed
	from 
		jsonb_array_elements(NEW.payload ->'identities') ui;
		
	RETURN NEW;
	END
$BODY$;

ALTER FUNCTION public.insert_into_user_tables()
	OWNER TO postgres;
commit;
-- ///////////////////////////////////////////////////////////////////////////
-- CREATE TRIGGERS
-- ///////////////////////////////////////////////////////////////////////////

-- Trigger: after_ae_insert

-- DROP TRIGGER IF EXISTS after_ae_insert ON public.article_events;

DROP TRIGGER IF EXISTS after_ae_insert on public.article_events;

CREATE TRIGGER after_ae_insert
    AFTER INSERT
    ON public.article_events
    FOR EACH ROW
    EXECUTE FUNCTION public.insert_into_article_tables();
	
-- Trigger: after_ce_insert

-- DROP TRIGGER IF EXISTS after_ce_insert ON public.checker_events;
DROP TRIGGER IF EXISTS after_ce_insert on public.checker_events;

CREATE TRIGGER after_ce_insert
    AFTER INSERT
    ON public.checker_events
    FOR EACH ROW
    EXECUTE FUNCTION public.insert_into_checker_tables();
	
	
-- Trigger: after_ie_insert

-- DROP TRIGGER IF EXISTS after_ie_insert ON public.invoice_events;
DROP TRIGGER IF EXISTS after_ie_insert on public.invoice_events;

CREATE TRIGGER after_ie_insert
    AFTER INSERT
    ON public.invoice_events
    FOR EACH ROW
    EXECUTE FUNCTION public.insert_into_invoice_tables();
	
	
-- Trigger: after_je_insert

-- DROP TRIGGER IF EXISTS after_je_insert ON public.journal_events;
DROP TRIGGER IF EXISTS after_je_insert on public.journal_events;

CREATE TRIGGER after_je_insert
    AFTER INSERT
    ON public.journal_events
    FOR EACH ROW
    EXECUTE FUNCTION public.insert_into_journal_tables();
	
	
-- Trigger: after_se_insert

-- DROP TRIGGER IF EXISTS after_se_insert_1 ON public.submission_events;
DROP TRIGGER IF EXISTS after_se_insert_into_manuscripts on public.submission_events;

CREATE TRIGGER after_se_insert_into_manuscripts
    AFTER INSERT
    ON public.submission_events
    FOR EACH ROW
    EXECUTE FUNCTION public.insert_into_manuscript_tables();
	
	
-- Trigger: after_ue_insert

-- DROP TRIGGER IF EXISTS after_ue_insert ON public.user_events;
DROP TRIGGER IF EXISTS after_ue_insert on public.user_events;

CREATE TRIGGER after_ue_insert
    AFTER INSERT
    ON public.user_events
    FOR EACH ROW
    EXECUTE FUNCTION public.insert_into_user_tables();

commit;
	
call public.sp_log(md5(random()::text || clock_timestamp()::text)::uuid, clock_timestamp(), 'Triggers create end');`;


export async function up(knex: Knex): Promise<any> {
	return Promise.all([
	  knex.raw(createTableExplosion),
	]);
  }
  
  export async function down(knex: Knex): Promise<any> {
  }

  export const name = '20220304121200_01_apollo1_table_explosion_create';
