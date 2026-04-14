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

DROP TYPE IF EXISTS troop_type;
DROP TYPE IF EXISTS user_role;

CREATE TYPE troop_type AS ENUM ('BTROOP', 'GTROOP', 'MTROOP');
CREATE TYPE user_role AS ENUM ('DEV', 'ADMIN', 'AREA_DIRECTOR', 'COUNSELOR', 'LEADER', 'SCOUT', 'PENDING');

CREATE TABLE IF NOT EXISTS public.camp_dpmt (
	dpmt_id uuid NOT NULL DEFAULT gen_random_uuid(),
	dpmt_name varchar(50) NOT NULL,
	dpmt_head_id uuid,
	crtn_date timestamp with time zone NOT NULL DEFAULT now(),
	last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT camp_dpmt_pkey PRIMARY KEY (dpmt_id),
	CONSTRAINT camp_dpmt_dptm_name_key UNIQUE(dpmt_name)
);

-- CREATE TABLE IF NOT EXISTS public.employee (
-- 	emp_id uuid NOT NULL DEFAULT gen_random_uuid(),
-- 	emp_first_name varchar(150) NOT NULL,
-- 	emp_last_name varchar(150) NOT NULL,
-- 	emp_phone_nmbr varchar(20),
-- 	dpmt_id uuid NOT NULL,
-- 	crtn_date timestamp with time zone NOT NULL DEFAULT now(),
-- 	last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
-- 	CONSTRAINT employee_pkey PRIMARY KEY (emp_id)
-- );

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

CREATE TABLE IF NOT EXISTS public.merit_badge_rqmt (
	rqmt_id uuid NOT NULL DEFAULT gen_random_uuid(),
	badge_id uuid NOT NULL,
	rqmt_desc text COLLATE pg_catalog.default NOT NULL,
	rqmt_idnf varchar(10) NOT NULL,
	parent_rqmt_id uuid, 
	crtn_date timestamp with time zone NOT NULL DEFAULT now(),
	last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT merit_badge_rqmt_pkey PRIMARY KEY (rqmt_id),
	CONSTRAINT merit_badge_rqmt_badge_id_rqmt_idnf_key UNIQUE (badge_id, rqmt_idnf, parent_rqmt_id),
	CONSTRAINT metit_badge_rqmt_parent_rqmt_id_rqmt_idnf_key UNIQUE (parent_rqmt_id, rqmt_idnf)
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

CREATE TABLE IF NOT EXISTS public.scout_badge_rqmt (
	scout_badge_rqmt_id uuid NOT NULL DEFAULT gen_random_uuid(),
	scout_badge_id uuid NOT NULL,
	rqmt_id uuid NOT NULL,
	completed boolean NOT NULL DEFAULT false,
	signed_by_id uuid,
	crtn_date timestamp with time zone NOT NULL DEFAULT now(),
	last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT scout_badge_rqmt_pkey PRIMARY KEY (scout_badge_rqmt_id),
	CONSTRAINT scout_badge_rqmt_scout_badge_id_rqmt_id_key UNIQUE (scout_badge_id, rqmt_id)
);

CREATE TABLE IF NOT EXISTS public.activity (
	activity_id uuid NOT NULL DEFAULT gen_random_uuid(),
	period_id uuid NOT NULL, 
	activity_name varchar(150) NOT NULL,
	crtn_date timestamp with time zone NOT NULL DEFAULT now(),
	last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT activity_pkey PRIMARY KEY (activity_id),
	CONSTRAINT activity_period_id_key UNIQUE (activity_name, period_id)
);

CREATE TABLE IF NOT EXISTS public.activity_badge (
	activity_id uuid NOT NULL, 
	badge_id uuid NOT NULL,
	CONSTRAINT activity_badge_pkey PRIMARY KEY (activity_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.attendance (
	activity_id uuid NOT NULL,
	scout_id uuid NOT NULL, 
	monday boolean DEFAULT false,
	tuesday boolean DEFAULT false,
	wednesday boolean DEFAULT false,
	thursday boolean DEFAULT false,
	friday boolean DEFAULT false,
	last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT attendance_pkey PRIMARY KEY (activity_id, scout_id);
);

CREATE TABLE IF NOT EXISTS public.period (
	period_id uuid NOT NULL DEFAULT gen_random_uuid(),
	period_nmbr integer NOT NULL, 
	period_time time NOT NULL, 
	last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT period_pkey PRIMARY KEY (period_id),
	CONSTRAINT period_number_key UNIQUE (period_nmbr);
);

CREATE TABLE IF NOT EXISTS public.users (
	user_id uuid NOT NULL,
	user_email varchar(150) NOT NULL,
	user_first_name varchar(150) NOT NULL,
	user_last_name varchar(150) NOT NULL,
	user_role user_role NOT NULL,
	dpmt_id uuid,
	crtn_date timestamp with time zone NOT NULL DEFAULT now(),
	last_uptd_date timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT users_pkey PRIMARY KEY (user_id),
	CONSTRAINT users_email_key UNIQUE (user_email),
	CONSTRAINT users_auth_fkey
		FOREIGN KEY (user_id)
		REFERENCES auth.users (id)
		ON DELETE CASCADE
);


ALTER TABLE IF EXISTS public.users
	ENABLE ROW LEVEL SECURITY;

--Make sure role based authentication works
CREATE POLICY "Users can read their own row"
ON public.users
AS PERMISSIVE
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Admins and Devs can read all users, Area Directors and Counselors can read all Area Directors, Counselors, Leaders, and Scouts
CREATE POLICY "Admins and Devs can read all users, Area Directors and Counselors can read all Area Directors, Counselors, Leaders, and Scouts"
ON public.users
AS PERMISSIVE
FOR SELECT
USING ( 
	EXISTS ( 
		SELECT 1 
		FROM public.users AS me 
		WHERE me.user_id = auth.uid() 
		AND ( 
			-- Admins and Devs can read everything 
			me.user_role IN ('ADMIN', 'DEV') 
			
			-- Area Directors and Counselors can read only non-admin/dev users 
			OR ( 
				me.user_role IN ('AREA_DIRECTOR', 'COUNSELOR') 
				AND users.user_role NOT IN ('ADMIN', 'DEV') 
			) 
		) 
	) 
);

-- Policy 3: Devs can update any user's role (for testing/development)
CREATE POLICY "Devs can update user roles"
ON public.users
AS PERMISSIVE
FOR UPDATE
USING (
	EXISTS (
		SELECT 1 FROM public.users
		WHERE user_id = auth.uid()
		AND user_role = 'DEV'
	)
)
WITH CHECK (
	EXISTS (
		SELECT 1 FROM public.users
		WHERE user_id = auth.uid()
		AND user_role = 'DEV'
	)
);

-- Policy 4: Users can update their own profile (except role)
CREATE POLICY "Users can update their own profile"
ON public.users
AS PERMISSIVE
FOR UPDATE
USING (
	auth.uid() = user_id
)
WITH CHECK (
	auth.uid() = user_id
);	


-- ============================================
-- HANDLE NEW AUTH USER → INSERT INTO public.users
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
	requested_role text;
	final_role public.user_role;
BEGIN
	
	
	-- Extract requested role from metadata
	requested_role := NEW.raw_user_meta_data->>'role';
	
	-- Whitelist + controlled defaulting (uppercase to match enum)
	CASE requested_role
		WHEN 'ADMIN' THEN final_role := 'ADMIN';
		WHEN 'COUNSELOR' THEN final_role := 'COUNSELOR';
		WHEN 'DEV' THEN final_role := 'DEV';
		WHEN 'SCOUT' THEN final_role := 'SCOUT';
		WHEN 'LEADER' THEN final_role := 'LEADER';
		WHEN 'AREA_DIRECTOR' THEN final_role := 'AREA_DIRECTOR';
		WHEN NULL THEN final_role := 'SCOUT';  -- No role provided
		ELSE
			-- Log suspicious or invalid role attempts
			RAISE LOG 'Invalid role "%" requested for user %, defaulting to SCOUT.',
				requested_role, NEW.id;
			final_role := 'SCOUT';
	END CASE;
	
	-- Insert profile (if this fails, whole transaction fails — desired)
	INSERT INTO public.users (
		user_id,
		user_email,
		user_first_name,
		user_last_name,
		user_role
	)
	VALUES (
		NEW.id,
		NEW.email,
		COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
		COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
		final_role
	);
	
	RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



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


-- =====================================================
-- ENFORCE-BADGE-HEIRARCHY enforce_same_badge FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.enforce_same_badge()
RETURNS TRIGGER AS $$
DECLARE
	parent_badge_id uuid;
BEGIN
	IF NEW.parent_rqmt_id IS NULL THEN
		RETURN NEW;
	END IF;

	SELECT badge_id
	INTO parent_badge_id
	FROM public.merit_badge_rqmt
	WHERE rqmt_id = NEW.parent_rqmt_id;

	IF parent_badge_id IS NULL THEN
		RAISE EXCEPTION
		'Parent requirement does not exist.';
	END IF;

	IF parent_badge_id <> NEW.badge_id THEN
		RAISE EXCEPTION
		'Parent requirement must belong to same badge.';
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

-- CREATE TRIGGER trg_employee_last_updated
-- BEFORE UPDATE ON public.employee
-- FOR EACH ROW
-- EXECUTE FUNCTION public.set_last_updated_date();

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

CREATE TRIGGER trg_merit_badge_rqmt_last_updated
BEFORE UPDATE ON public.merit_badge_rqmt
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_scout_badge_last_updated
BEFORE UPDATE ON public.scout_badge
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_scout_badge_rqmt_last_updated
BEFORE UPDATE ON public.scout_badge_rqmt
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_users_last_updated
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_activity_last_updated
BEFORE UPDATE ON public.activity
FOR EACH ROW 
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_attendance_last_updated
BEFORE UPDATE ON public.attendance
FOR EACH ROW 
EXECUTE FUNCTION public.set_last_updated_date();

CREATE TRIGGER trg_period_last_updated
BEFORE UPDATE ON public.period
FOR EACH ROW 
EXECUTE FUNCTION public.set_last_updated_date();


-- =====================================================================
-- TRIGGERS FOR ENFORCING-BADGE-HEIRARCHY enforce_same_badge FUNCTION
-- =====================================================================
CREATE TRIGGER trg_enforce_same_badge_on_rqmt
BEFORE INSERT OR UPDATE
ON public.merit_badge_rqmt
FOR EACH ROW
EXECUTE FUNCTION public.enforce_same_badge();

-- Foreign Keys 

ALTER TABLE IF EXISTS public.camp_dpmt
	ADD CONSTRAINT fk_dpmt_head
	FOREIGN KEY (dpmt_head_id)
	REFERENCES public.users (user_id)
	MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE SET NULL;

-- ALTER TABLE IF EXISTS public.employee
-- 	ADD CONSTRAINT employee_dpmt_id_fkey
-- 	FOREIGN KEY (dpmt_id)
-- 	REFERENCES public.camp_dpmt (dpmt_id)
-- 	MATCH SIMPLE
-- 	ON UPDATE NO ACTION
-- 	ON DELETE RESTRICT;
	
ALTER TABLE public.merit_badge
	ADD CONSTRAINT merit_badge_dpmt_id_fkey
	FOREIGN KEY (dpmt_id)
	REFERENCES public.camp_dpmt(dpmt_id)
	MATCH SIMPLE
	ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.merit_badge_rqmt
	ADD CONSTRAINT merit_badge_rqmt_badge_id_fkey
	FOREIGN KEY (badge_id)
	REFERENCES public.merit_badge (badge_id)
	MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.merit_badge_rqmt
	ADD CONSTRAINT merit_badge_rqmt_parent_rqmt_id_fkey
	FOREIGN KEY (parent_rqmt_id)
	REFERENCES public.merit_badge_rqmt (rqmt_id)
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
	ON DELETE SET NULL;

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
 	REFERENCES public.users (user_id)
 	MATCH SIMPLE
 	ON UPDATE NO ACTION
 	ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.scout_badge_rqmt
	ADD CONSTRAINT scout_badge_rqmt_rqmt_id_fkey
	FOREIGN KEY (rqmt_id)
	REFERENCES public.merit_badge_rqmt (rqmt_id)
	MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.scout_badge_rqmt
	ADD CONSTRAINT scout_badge_rqmt_scout_badge_id_fkey
	FOREIGN KEY (scout_badge_id)
	REFERENCES public.scout_badge (scout_badge_id)
	MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE CASCADE;
	
ALTER TABLE IF EXISTS public.scout_badge_rqmt
	ADD CONSTRAINT scout_badge_rqmt_signed_by_id_fkey
	FOREIGN KEY (signed_by_id)
	REFERENCES public.users (user_id)
	MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.scout_leader
	ADD CONSTRAINT scout_leader_troop_id_fkey
	FOREIGN KEY (troop_id)
	REFERENCES public.troop (troop_id)
	MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.users
	ADD CONSTRAINT users_dpmt_id_fkey
	FOREIGN KEY (dpmt_id)
	REFERENCES public.camp_dpmt (dpmt_id)
	MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE SET NULL;


-- Removed to support multi merit badge activities	
--ALTER TABLE IF EXISTS public.activity
--	ADD CONSTRAINT activity_badge_id_fkey
--	FOREIGN KEY(badge_id)
--	REFERENCES public.merit_badge (badge_id)
--	MATCH SIMPLE
--	ON UPDATE NO ACTION
--	ON DELETE SET NULL;
	
ALTER TABLE IF EXISTS public.activity
	ADD CONSTRAINT activity_period_id_fkey
	FOREIGN KEY(period_id)
	REFERENCES public.period (period_id)
	MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE SET NULL;
	
	
ALTER TABLE IF EXISTS public.attendance
	ADD CONSTRAINT attendance_activity_id_fkey
	FOREIGN KEY(activity_id)
	REFERENCES public.activity (activity_id)
	MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE CASCADE;
	
ALTER TABLE IF EXISTS public.attendance
	ADD CONSTRAINT attendance_scout_id_fkey
	FOREIGN KEY(scout_id)
	REFERENCES public.scout (scout_id)
	MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE CASCADE;
	
ALTER TABLE IF EXISTS public.activity_badge
	ADD CONSTRAINT activity_badge_badge_id_fkey
	FOREIGN KEY(badge_id)
	REFERENCES public.merit_badge (badge_id)
	MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.activity_badge
	ADD CONSTRAINT activity_badge_activity_id_fkey
	FOREIGN KEY(activity_id)
	REFERENCES public.activity (activity_id)
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
-- CREATE INDEX idx_employee_dpmt_id
-- 	ON public.employee(dpmt_id);

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
CREATE INDEX idx_rqmt_badge_id
	ON public.merit_badge_rqmt(badge_id);

-- merit_badge_sub_rqmt
CREATE INDEX idx_sub_rqmt_parent_rqmt_id
	ON public.merit_badge_rqmt(parent_rqmt_id);

-- scout_badge
CREATE INDEX idx_scout_badge_scout_id
	ON public.scout_badge(scout_id);

CREATE INDEX idx_scout_badge_badge_id
	ON public.scout_badge(badge_id);

CREATE INDEX idx_scout_badge_signed_by_id
	ON public.scout_badge(signed_by_id);

-- scout_badge_rqmt
CREATE INDEX idx_scout_badge_rqmt_scout_badge_id
	ON public.scout_badge_rqmt(scout_badge_id);

CREATE INDEX idx_scout_badge_rqmt_rqmt_id
	ON public.scout_badge_rqmt(rqmt_id);

CREATE INDEX idx_scout_badge_rqmt_signed_by_id
	ON public.scout_badge_rqmt(signed_by_id);

-- users
--CREATE INDEX idx_users_emp_id
--	ON public.users(emp_id);
	
-- activity
CREATE INDEX idx_activity_badge_id
	ON public.activity(badge_id);
	
CREATE INDEX idx_activity_period_id
	ON public.activity(period_id);
	
-- attendance
CREATE INDEX idx_attendance_activity_id
	ON public.attendance(activity_id)
	
CREATE INDEX idx_attendance_scout_id
	ON public.attendance(scout_id)
	
	
-- activity_badge
CREATE INDEX idx_activity_badge_badge_id
	ON public.activity_badge(badge_id);
	
CREATE INDEX idx_activity_badge_activity_id
	ON public.activity_badge(activity_id);