-- ============================================================
-- 멀티테넌트 전환 마이그레이션
-- 기존 13개 테이블에 tenant_id 추가 + RLS 테넌트 격리
-- ============================================================

-- ============================================================
-- 1. organizations (테넌트) 테이블 생성
-- ============================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. profiles (유저 프로필) 테이블 생성
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email           TEXT,
  full_name       TEXT,
  role            TEXT NOT NULL DEFAULT 'member'
                    CHECK (role IN ('owner','admin','member','viewer')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. 헬퍼 함수: 현재 유저의 organization_id 반환
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- ============================================================
-- 4. 기본 테넌트 생성 (기존 데이터 연결용)
-- ============================================================
INSERT INTO public.organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Organization', 'default')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. 기존 테이블에 tenant_id 컬럼 추가
-- ============================================================
ALTER TABLE public.admins            ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.categories        ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.consultations     ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.contact_inquiries ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.directors         ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.gyul_app_config   ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.gyul_categories   ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.gyul_faq          ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.gyul_products     ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.inquiries         ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.products          ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.reservations      ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.reviews           ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- ============================================================
-- 6. 기존 데이터를 기본 테넌트에 연결
-- ============================================================
UPDATE public.admins            SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.categories        SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.consultations     SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.contact_inquiries SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.directors         SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.gyul_app_config   SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.gyul_categories   SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.gyul_faq          SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.gyul_products     SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.inquiries         SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.products          SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.reservations      SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE public.reviews           SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- NOT NULL 제약 추가
ALTER TABLE public.admins            ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.categories        ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.consultations     ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.contact_inquiries ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.directors         ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.gyul_app_config   ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.gyul_categories   ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.gyul_faq          ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.gyul_products     ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.inquiries         ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.products          ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.reservations      ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.reviews           ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================================
-- 7. 기존 RLS 정책 삭제
-- ============================================================
DROP POLICY IF EXISTS "Super admins can manage admins" ON public.admins;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage consultations" ON public.consultations;
DROP POLICY IF EXISTS "Anyone can submit consultation" ON public.consultations;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Public can view active directors" ON public.directors;
DROP POLICY IF EXISTS "Admins can manage directors" ON public.directors;
DROP POLICY IF EXISTS "gyul public read app_config" ON public.gyul_app_config;
DROP POLICY IF EXISTS "gyul auth write app_config" ON public.gyul_app_config;
DROP POLICY IF EXISTS "gyul public read categories" ON public.gyul_categories;
DROP POLICY IF EXISTS "gyul auth write categories" ON public.gyul_categories;
DROP POLICY IF EXISTS "gyul public read faq" ON public.gyul_faq;
DROP POLICY IF EXISTS "gyul auth write faq" ON public.gyul_faq;
DROP POLICY IF EXISTS "gyul public read products" ON public.gyul_products;
DROP POLICY IF EXISTS "gyul auth write products" ON public.gyul_products;
DROP POLICY IF EXISTS "Public insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Allow anonymous updates" ON public.reservations;
DROP POLICY IF EXISTS "Allow anonymous select" ON public.reservations;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.reservations;
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can submit review" ON public.reviews;

-- ============================================================
-- 8. RLS 활성화 (이미 활성화된 테이블은 무시됨)
-- ============================================================
ALTER TABLE public.organizations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directors         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyul_app_config   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyul_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyul_faq          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyul_products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews           ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. 테넌트 격리 RLS 정책
-- ============================================================

-- organizations
CREATE POLICY "tenant_org_select" ON public.organizations
  FOR SELECT USING (id = public.get_my_org_id());
CREATE POLICY "tenant_org_update" ON public.organizations
  FOR UPDATE USING (id = public.get_my_org_id());

-- profiles
CREATE POLICY "tenant_profiles_select" ON public.profiles
  FOR SELECT USING (organization_id = public.get_my_org_id());
CREATE POLICY "tenant_profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (organization_id = public.get_my_org_id());
CREATE POLICY "tenant_profiles_update" ON public.profiles
  FOR UPDATE USING (organization_id = public.get_my_org_id());
CREATE POLICY "tenant_profiles_delete" ON public.profiles
  FOR DELETE USING (organization_id = public.get_my_org_id());

-- admins
CREATE POLICY "tenant_admins_select" ON public.admins
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_admins_insert" ON public.admins
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_admins_update" ON public.admins
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_admins_delete" ON public.admins
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- categories
CREATE POLICY "tenant_categories_select" ON public.categories
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_categories_insert" ON public.categories
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_categories_update" ON public.categories
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_categories_delete" ON public.categories
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- consultations
CREATE POLICY "tenant_consultations_select" ON public.consultations
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_consultations_insert" ON public.consultations
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_consultations_update" ON public.consultations
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_consultations_delete" ON public.consultations
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- contact_inquiries
CREATE POLICY "tenant_contact_inquiries_select" ON public.contact_inquiries
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_contact_inquiries_insert" ON public.contact_inquiries
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_contact_inquiries_update" ON public.contact_inquiries
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_contact_inquiries_delete" ON public.contact_inquiries
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- directors
CREATE POLICY "tenant_directors_select" ON public.directors
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_directors_insert" ON public.directors
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_directors_update" ON public.directors
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_directors_delete" ON public.directors
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- gyul_app_config
CREATE POLICY "tenant_gyul_app_config_select" ON public.gyul_app_config
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_gyul_app_config_insert" ON public.gyul_app_config
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_gyul_app_config_update" ON public.gyul_app_config
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_gyul_app_config_delete" ON public.gyul_app_config
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- gyul_categories
CREATE POLICY "tenant_gyul_categories_select" ON public.gyul_categories
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_gyul_categories_insert" ON public.gyul_categories
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_gyul_categories_update" ON public.gyul_categories
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_gyul_categories_delete" ON public.gyul_categories
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- gyul_faq
CREATE POLICY "tenant_gyul_faq_select" ON public.gyul_faq
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_gyul_faq_insert" ON public.gyul_faq
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_gyul_faq_update" ON public.gyul_faq
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_gyul_faq_delete" ON public.gyul_faq
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- gyul_products
CREATE POLICY "tenant_gyul_products_select" ON public.gyul_products
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_gyul_products_insert" ON public.gyul_products
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_gyul_products_update" ON public.gyul_products
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_gyul_products_delete" ON public.gyul_products
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- inquiries
CREATE POLICY "tenant_inquiries_select" ON public.inquiries
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_inquiries_insert" ON public.inquiries
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_inquiries_update" ON public.inquiries
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_inquiries_delete" ON public.inquiries
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- products
CREATE POLICY "tenant_products_select" ON public.products
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_products_insert" ON public.products
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_products_update" ON public.products
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_products_delete" ON public.products
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- reservations
CREATE POLICY "tenant_reservations_select" ON public.reservations
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_reservations_insert" ON public.reservations
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_reservations_update" ON public.reservations
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_reservations_delete" ON public.reservations
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- reviews
CREATE POLICY "tenant_reviews_select" ON public.reviews
  FOR SELECT USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_reviews_insert" ON public.reviews
  FOR INSERT WITH CHECK (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_reviews_update" ON public.reviews
  FOR UPDATE USING (tenant_id = public.get_my_org_id());
CREATE POLICY "tenant_reviews_delete" ON public.reviews
  FOR DELETE USING (tenant_id = public.get_my_org_id());

-- ============================================================
-- 10. 인덱스 (tenant_id 기반 조회 성능)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_org              ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_admins_tenant             ON public.admins(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant         ON public.categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consultations_tenant      ON public.consultations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_tenant  ON public.contact_inquiries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_directors_tenant          ON public.directors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gyul_app_config_tenant    ON public.gyul_app_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gyul_categories_tenant    ON public.gyul_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gyul_faq_tenant           ON public.gyul_faq(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gyul_products_tenant      ON public.gyul_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_tenant          ON public.inquiries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant           ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_tenant       ON public.reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tenant            ON public.reviews(tenant_id);

-- ============================================================
-- 11. updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['organizations','profiles'])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at'
        AND tgrelid = ('public.' || t)::regclass
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();',
        t
      );
    END IF;
  END LOOP;
END;
$$;
