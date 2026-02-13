-- Drop all tables in the database
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END
$$;

DROP TYPE troop_type;
DROP TYPE user_role;

CREATE TYPE troop_type AS ENUM ('BTROOP', 'GTROOP', 'MTROOP');
CREATE TYPE user_role AS ENUM ('admin', 'employee', 'scout', 'leader', 'department_head');

CREATE TABLE IF NOT EXISTS public.camp_dpmt (
    dpmt_id uuid NOT NULL DEFAULT gen_random_uuid(),
    dpmt_name varchar(50) NOT NULL,
    dpmt_head_id uuid,
    crtn_date timestamp with time zone NOT NULL DEFAULT now(),
    last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT camp_dpmt_pkey PRIMARY KEY (dpmt_id)
);

CREATE TABLE IF NOT EXISTS public.employee (
    emp_id uuid NOT NULL DEFAULT gen_random_uuid(),
    emp_first_name varchar(150) NOT NULL,
    emp_last_name varchar(150) NOT NULL,
    emp_phone_nmbr varchar(20),
    dpmt_id uuid NOT NULL,
    crtn_date timestamp with time zone NOT NULL DEFAULT now(),
    last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT employee_pkey PRIMARY KEY (emp_id)
);

CREATE TABLE IF NOT EXISTS public.troop (
    troop_id uuid NOT NULL DEFAULT gen_random_uuid(),
    troop_nmbr integer NOT NULL,
    troop_phone_nmbr varchar(20),
    troop_email varchar(80) NOT NULL,
    troop_type troop_type NOT NULL,
    troop_city varchar(150) NOT NULL,
    troop_state char(2) NOT NULL,
    crtn_date timestamp with time zone NOT NULL DEFAULT now(),
    last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT troop_pkey PRIMARY KEY (troop_id),
	CONSTRAINT troop_state_key UNIQUE (troop_nmbr, troop_state, troop_type)
	--CONSTRAINT troop_troop_number_key UNIQUE (troop_number) Troop number may not be unique, further research required
);

CREATE TABLE IF NOT EXISTS public.scout_leader (
    scout_leader_id uuid NOT NULL DEFAULT gen_random_uuid(),
    scout_leader_first_name varchar(150) NOT NULL,
    scout_leader_last_name varchar(150) NOT NULL,
    troop_id uuid NOT NULL,
    troop_leader_phone_nmbr varchar(20),
    troop_leader_email varchar(80),
    crtn_date timestamp with time zone NOT NULL DEFAULT now(),
    last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT scout_leader_pkey PRIMARY KEY (scout_leader_id)
);

CREATE TABLE IF NOT EXISTS public.scout (
    scout_id uuid NOT NULL DEFAULT gen_random_uuid(),
    scout_first_name varchar(150) NOT NULL,
    scout_last_name varchar(150) NOT NULL,
    troop_id uuid NOT NULL,
    crtn_date timestamp with time zone NOT NULL DEFAULT now(),
    last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT scout_pkey PRIMARY KEY (scout_id)
);

CREATE TABLE IF NOT EXISTS public.merit_badge (
    badge_id uuid NOT NULL DEFAULT gen_random_uuid(),
    badge_name varchar(150) NOT NULL,
    badge_desc text COLLATE pg_catalog.default,
    eagle_badge boolean NOT NULL DEFAULT false,
    dpmt_id uuid NOT NULL,
    crtn_date timestamp with time zone NOT NULL DEFAULT now(),
    last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT merit_badge_pkey PRIMARY KEY (badge_id),
    CONSTRAINT merit_badge_name_key UNIQUE (badge_name)
);

CREATE TABLE IF NOT EXISTS public.merit_badge_main_rqmt (
    main_rqmt_id uuid NOT NULL DEFAULT gen_random_uuid(),
    badge_id uuid NOT NULL,
    rqmt_desc text COLLATE pg_catalog.default NOT NULL,
    rqmt_nmbr varchar(10) NOT NULL,
    crtn_date timestamp with time zone NOT NULL DEFAULT now(),
    last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT merit_badge_main_rqmt_pkey PRIMARY KEY (main_rqmt_id),
    CONSTRAINT merit_badge_main_rqmt_badge_id_rqmt_nmbr_key UNIQUE (badge_id, rqmt_nmbr)
);

CREATE TABLE IF NOT EXISTS public.merit_badge_sub_rqmt (
    sub_rqmt_id uuid NOT NULL DEFAULT gen_random_uuid(),
    main_rqmt_id uuid NOT NULL,
    sub_rqmt_idnf varchar(10) NOT NULL,
    sub_rqmt_desc text COLLATE pg_catalog.default NOT NULL,
    crtn_date timestamp with time zone NOT NULL DEFAULT now(),
    last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT merit_badge_sub_rqmt_pkey PRIMARY KEY (sub_rqmt_id),
    CONSTRAINT merit_badge_sub_rqmt_main_rqmt_id_sub_rqmt_idnf_key UNIQUE (main_rqmt_id, sub_rqmt_idnf)
);

CREATE TABLE IF NOT EXISTS public.scout_badge (
    scout_badge_id uuid NOT NULL DEFAULT gen_random_uuid(),
    scout_id uuid NOT NULL,
    badge_id uuid NOT NULL,
    completed boolean NOT NULL DEFAULT false,
	signed_by_id uuid,
    crtn_date timestamp with time zone NOT NULL DEFAULT now(),
    last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT scout_badge_pkey PRIMARY KEY (scout_badge_id),
    CONSTRAINT scout_badge_scout_id_badge_id_key UNIQUE (scout_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.scout_badge_main_rqmt (
    scout_badge_main_rqmt_id uuid NOT NULL DEFAULT gen_random_uuid(),
    scout_badge_id uuid NOT NULL,
    main_rqmt_id uuid NOT NULL,
    completed boolean NOT NULL DEFAULT false,
	signed_by_id uuid,
    crtn_date timestamp with time zone NOT NULL DEFAULT now(),
    last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT scout_badge_main_rqmt_pkey PRIMARY KEY (scout_badge_main_rqmt_id),
    CONSTRAINT scout_badge_main_rqmt_scout_badge_id_main_rqmt_id_key UNIQUE (scout_badge_id, main_rqmt_id)
);

CREATE TABLE IF NOT EXISTS public.scout_badge_sub_rqmt (
    scout_badge_sub_rqmt_id uuid NOT NULL DEFAULT gen_random_uuid(),
    scout_badge_main_rqmt_id uuid NOT NULL,
    sub_rqmt_id uuid NOT NULL,
    completed boolean NOT NULL DEFAULT false,
	signed_by_id uuid,
    crtn_date timestamp with time zone NOT NULL DEFAULT now(),
    last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT scout_badge_sub_rqmt_pkey PRIMARY KEY (scout_badge_sub_rqmt_id),
    CONSTRAINT scout_badge_sub_rqmt_main_rqmt_id_sub_rqmt_id_key UNIQUE (scout_badge_main_rqmt_id, sub_rqmt_id)
);

CREATE TABLE IF NOT EXISTS public.users (
    user_id uuid NOT NULL,
    user_email varchar(150) NOT NULL,
    user_first_name varchar(150) NOT NULL,
    user_last_name varchar(150) NOT NULL,
    user_role user_role NOT NULL,
    emp_id uuid,
    crtn_date timestamp with time zone NOT NULL DEFAULT now(),
    last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_email_key UNIQUE (user_email),
    CONSTRAINT users_auth_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users (id)
        ON DELETE CASCADE
);


-- ============================================
-- AUTO-UPDATE last_uptd_date FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.set_last_updated_date()
RETURNS TRIGGER AS $$
BEGIN
    IF ROW(NEW.*) IS DISTINCT FROM ROW(OLD.*) THEN
        NEW.last_uptd_date = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS FOR AUTO-UPDATING last_uptd_date
-- ============================================

CREATE TRIGGER trg_camp_dpmt_last_updated
BEFORE UPDATE ON public.camp_dpmt
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_employee_last_updated
BEFORE UPDATE ON public.employee
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_troop_last_updated
BEFORE UPDATE ON public.troop
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_scout_leader_last_updated
BEFORE UPDATE ON public.scout_leader
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_scout_last_updated
BEFORE UPDATE ON public.scout
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_merit_badge_last_updated
BEFORE UPDATE ON public.merit_badge
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_merit_badge_main_rqmt_last_updated
BEFORE UPDATE ON public.merit_badge_main_rqmt
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_merit_badge_sub_rqmt_last_updated
BEFORE UPDATE ON public.merit_badge_sub_rqmt
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_scout_badge_last_updated
BEFORE UPDATE ON public.scout_badge
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_scout_badge_main_rqmt_last_updated
BEFORE UPDATE ON public.scout_badge_main_rqmt
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_scout_badge_sub_rqmt_last_updated
BEFORE UPDATE ON public.scout_badge_sub_rqmt
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_users_last_updated
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();


ALTER TABLE IF EXISTS public.users
    ENABLE ROW LEVEL SECURITY;

-- Foreign Keys 

ALTER TABLE IF EXISTS public.camp_dpmt
    ADD CONSTRAINT fk_dpmt_head
    FOREIGN KEY (dpmt_head_id)
    REFERENCES public.employee (emp_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.employee
    ADD CONSTRAINT employee_dpmt_id_fkey
    FOREIGN KEY (dpmt_id)
    REFERENCES public.camp_dpmt (dpmt_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE RESTRICT;
	
ALTER TABLE public.merit_badge
	ADD CONSTRAINT merit_badge_dpmt_id_fkey
	FOREIGN KEY (dpmt_id)
	REFERENCES public.camp_dpmt(dpmt_id)
	MATCH SIMPLE
	ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.merit_badge_main_rqmt
    ADD CONSTRAINT merit_badge_main_rqmt_badge_id_fkey
    FOREIGN KEY (badge_id)
    REFERENCES public.merit_badge (badge_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.merit_badge_sub_rqmt
    ADD CONSTRAINT merit_badge_sub_rqmt_main_rqmt_id_fkey
    FOREIGN KEY (main_rqmt_id)
    REFERENCES public.merit_badge_main_rqmt (main_rqmt_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.scout
    ADD CONSTRAINT scout_troop_id_fkey
    FOREIGN KEY (troop_id)
    REFERENCES public.troop (troop_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.scout_badge
    ADD CONSTRAINT scout_badge_badge_id_fkey
    FOREIGN KEY (badge_id)
    REFERENCES public.merit_badge (badge_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.scout_badge
    ADD CONSTRAINT scout_badge_scout_id_fkey
    FOREIGN KEY (scout_id)
    REFERENCES public.scout (scout_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
	
ALTER TABLE IF EXISTS public.scout_badge
    ADD CONSTRAINT scout_badge_signed_by_id_fkey
    FOREIGN KEY (signed_by_id)
    REFERENCES public.employee (emp_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.scout_badge_main_rqmt
    ADD CONSTRAINT scout_badge_main_rqmt_main_rqmt_id_fkey
    FOREIGN KEY (main_rqmt_id)
    REFERENCES public.merit_badge_main_rqmt (main_rqmt_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.scout_badge_main_rqmt
    ADD CONSTRAINT scout_badge_main_rqmt_scout_badge_id_fkey
    FOREIGN KEY (scout_badge_id)
    REFERENCES public.scout_badge (scout_badge_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
	
ALTER TABLE IF EXISTS public.scout_badge_main_rqmt
    ADD CONSTRAINT scout_badge_main_rqmt_signed_by_id_fkey
    FOREIGN KEY (signed_by_id)
    REFERENCES public.employee (emp_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.scout_badge_sub_rqmt
    ADD CONSTRAINT scout_badge_sub_rqmt_main_rqmt_id_fkey
    FOREIGN KEY (scout_badge_main_rqmt_id)
    REFERENCES public.scout_badge_main_rqmt (scout_badge_main_rqmt_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.scout_badge_sub_rqmt
    ADD CONSTRAINT scout_badge_sub_rqmt_sub_rqmt_id_fkey
    FOREIGN KEY (sub_rqmt_id)
    REFERENCES public.merit_badge_sub_rqmt (sub_rqmt_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE RESTRICT;
	
ALTER TABLE IF EXISTS public.scout_badge_sub_rqmt
    ADD CONSTRAINT scout_badge_sub_rqmt_signed_by_id_fkey
    FOREIGN KEY (signed_by_id)
    REFERENCES public.employee (emp_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.scout_leader
    ADD CONSTRAINT scout_leader_troop_id_fkey
    FOREIGN KEY (troop_id)
    REFERENCES public.troop (troop_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT users_employee_id_fkey
    FOREIGN KEY (emp_id)
    REFERENCES public.employee (emp_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT users_scout_id_fkey
    FOREIGN KEY (scout_id)
    REFERENCES public.scout (scout_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT users_scout_leader_id_fkey
    FOREIGN KEY (scout_leader_id)
    REFERENCES public.scout_leader (scout_leader_id)
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE SET NULL;


-- ============================================
-- INDEXES FOR FOREIGN KEYS
-- ============================================

-- camp_dpmt
CREATE INDEX idx_camp_dpmt_head_id
    ON public.camp_dpmt(dpmt_head_id);

-- employee
CREATE INDEX idx_employee_dpmt_id
    ON public.employee(dpmt_id);

-- scout
CREATE INDEX idx_scout_troop_id
    ON public.scout(troop_id);

-- scout_leader
CREATE INDEX idx_scout_leader_troop_id
    ON public.scout_leader(troop_id);

-- merit_badge
CREATE INDEX idx_merit_badge_dpmt_id
    ON public.merit_badge(dpmt_id);

-- merit_badge_main_rqmt
CREATE INDEX idx_main_rqmt_badge_id
    ON public.merit_badge_main_rqmt(badge_id);

-- merit_badge_sub_rqmt
CREATE INDEX idx_sub_rqmt_main_rqmt_id
    ON public.merit_badge_sub_rqmt(main_rqmt_id);

-- scout_badge
CREATE INDEX idx_scout_badge_scout_id
    ON public.scout_badge(scout_id);

CREATE INDEX idx_scout_badge_badge_id
    ON public.scout_badge(badge_id);

CREATE INDEX idx_scout_badge_signed_by_id
    ON public.scout_badge(signed_by_id);

-- scout_badge_main_rqmt
CREATE INDEX idx_sb_main_scout_badge_id
    ON public.scout_badge_main_rqmt(scout_badge_id);

CREATE INDEX idx_sb_main_main_rqmt_id
    ON public.scout_badge_main_rqmt(main_rqmt_id);

CREATE INDEX idx_sb_main_signed_by_id
    ON public.scout_badge_main_rqmt(signed_by_id);

-- scout_badge_sub_rqmt
CREATE INDEX idx_sb_sub_main_id
    ON public.scout_badge_sub_rqmt(scout_badge_main_rqmt_id);

CREATE INDEX idx_sb_sub_sub_rqmt_id
    ON public.scout_badge_sub_rqmt(sub_rqmt_id);

CREATE INDEX idx_sb_sub_signed_by_id
    ON public.scout_badge_sub_rqmt(signed_by_id);

-- users
CREATE INDEX idx_users_emp_id
    ON public.users(emp_id);

CREATE INDEX idx_users_scout_id
    ON public.users(scout_id);

CREATE INDEX idx_users_scout_leader_id
    ON public.users(scout_leader_id);