CREATE TABLE public.cv_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days')
);
CREATE INDEX cv_shares_token_idx ON public.cv_shares (token);
GRANT ALL ON public.cv_shares TO service_role;
ALTER TABLE public.cv_shares ENABLE ROW LEVEL SECURITY;