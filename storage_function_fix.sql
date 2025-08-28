-- Fix the storage schema function ownership
ALTER FUNCTION storage.update_updated_at_column() OWNER TO postgres;
ALTER FUNCTION storage.update_updated_at_column() SET search_path = public;
