CREATE TABLE public.cv_progress (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  payload JSONB NOT NULL,
  step INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cv_progress TO authenticated;
GRANT ALL ON public.cv_progress TO service_role;
ALTER TABLE public.cv_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own CV progress" ON public.cv_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);