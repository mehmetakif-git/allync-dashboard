


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."aggregate_daily_metrics"("p_company_id" "uuid", "p_date" "date") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO public.company_daily_metrics (company_id, metric_date)
  VALUES (p_company_id, p_date)
  ON CONFLICT (company_id, metric_date) DO NOTHING;
  
  -- Update with actual data from various tables
  -- This would be expanded based on actual needs
END;
$$;


ALTER FUNCTION "public"."aggregate_daily_metrics"("p_company_id" "uuid", "p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_expired_notifications"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.notifications
  SET is_archived = true
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND is_archived = false;
END;
$$;


ALTER FUNCTION "public"."archive_expired_notifications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_create_company_service"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Eğer status 'approved' olarak değiştirilirse
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    
    -- company_services tablosuna ekle
    INSERT INTO company_services (
      company_id,
      service_type_id,
      package,
      status,
      start_date,
      price_amount,
      price_currency,
      billing_cycle
    )
    VALUES (
      NEW.company_id,
      NEW.service_type_id,
      NEW.package,
      'active',
      CURRENT_DATE,
      -- service_types'tan fiyat çek
      (SELECT 
        CASE 
          WHEN NEW.package = 'basic' THEN (pricing_basic->>'price')::numeric
          WHEN NEW.package = 'standard' THEN (pricing_standard->>'price')::numeric
          WHEN NEW.package = 'premium' THEN (pricing_premium->>'price')::numeric
          ELSE 0
        END
      FROM service_types WHERE id = NEW.service_type_id),
      'USD',
      'monthly'
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_create_company_service"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_invoice_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.tax_amount := ROUND((NEW.subtotal * NEW.tax_rate / 100)::NUMERIC, 2);
  NEW.total_amount := NEW.subtotal + NEW.tax_amount - NEW.discount_amount;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_invoice_totals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_ticket_times"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Calculate response time when first_response_at is set
  IF NEW.first_response_at IS NOT NULL AND OLD.first_response_at IS NULL THEN
    NEW.response_time = EXTRACT(EPOCH FROM (NEW.first_response_at - NEW.created_at))::INTEGER;
  END IF;
  
  -- Calculate resolution time when resolved_at is set
  IF NEW.resolved_at IS NOT NULL AND OLD.resolved_at IS NULL THEN
    NEW.resolution_time = EXTRACT(EPOCH FROM (NEW.resolved_at - NEW.created_at))::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_ticket_times"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_usage_percentage"("p_company_id" "uuid", "p_service_type_id" "uuid", "p_current_usage" integer) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  usage_limit INTEGER;
  usage_pct NUMERIC;
BEGIN
  -- Get usage limit from company_services
  SELECT (usage_limits->>'messages')::INTEGER INTO usage_limit
  FROM public.company_services
  WHERE company_id = p_company_id
    AND service_type_id = p_service_type_id
    AND status = 'active';
  
  IF usage_limit IS NULL OR usage_limit = 0 THEN
    RETURN 0;
  END IF;
  
  usage_pct := (p_current_usage::NUMERIC / usage_limit::NUMERIC) * 100;
  RETURN ROUND(usage_pct, 2);
END;
$$;


ALTER FUNCTION "public"."calculate_usage_percentage"("p_company_id" "uuid", "p_service_type_id" "uuid", "p_current_usage" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_sla_violations"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Insert or update violations for tickets that are approaching or exceeding SLA
  INSERT INTO support_sla_violations (
    ticket_id,
    sla_config_id,
    violation_type,
    priority,
    target_time,
    actual_time,
    time_remaining,
    status
  )
  SELECT 
    ticket_id,
    (SELECT id FROM support_sla_config WHERE is_active = TRUE LIMIT 1),
    'response' as violation_type,
    priority,
    response_time_target,
    current_response_time,
    response_time_target - current_response_time,
    response_sla_status
  FROM ticket_sla_status
  WHERE response_sla_status IN ('warning', 'critical', 'violated')
  AND first_response_at IS NULL
  ON CONFLICT (ticket_id, violation_type) 
  DO UPDATE SET
    status = EXCLUDED.status,
    time_remaining = EXCLUDED.time_remaining,
    actual_time = EXCLUDED.actual_time,
    updated_at = NOW();
END;
$$;


ALTER FUNCTION "public"."check_sla_violations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_notifications_for_new_system_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- If target is 'all', create for all users
  IF NEW.target_audience = 'all' THEN
    INSERT INTO user_notifications (user_id, notification_id)
    SELECT id, NEW.id
    FROM profiles
    WHERE id IS NOT NULL;
    
  -- If target is 'super_admins'
  ELSIF NEW.target_audience = 'super_admins' THEN
    INSERT INTO user_notifications (user_id, notification_id)
    SELECT id, NEW.id
    FROM profiles
    WHERE role = 'super_admin';
    
  -- If target is 'company_admins'
  ELSIF NEW.target_audience = 'company_admins' THEN
    INSERT INTO user_notifications (user_id, notification_id)
    SELECT id, NEW.id
    FROM profiles
    WHERE role = 'company_admin';
    
  -- If target is 'users'
  ELSIF NEW.target_audience = 'users' THEN
    INSERT INTO user_notifications (user_id, notification_id)
    SELECT id, NEW.id
    FROM profiles
    WHERE role = 'user';
    
  -- If target is 'specific_companies'
  ELSIF NEW.target_audience = 'specific_companies' AND NEW.target_company_ids IS NOT NULL THEN
    INSERT INTO user_notifications (user_id, notification_id)
    SELECT id, NEW.id
    FROM profiles
    WHERE company_id = ANY(NEW.target_company_ids);
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_user_notifications_for_new_system_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Create profile from auth user metadata
  INSERT INTO profiles (
    id,
    email,
    full_name,
    company_id,
    role,
    language,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    (NEW.raw_user_meta_data->>'company_id')::uuid,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
    'active'
  );
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_user_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Delete from auth.users table
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."delete_auth_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."expire_old_invitations"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE user_invites
  SET status = 'expired'
  WHERE status = 'sent'
    AND expires_at < NOW();
END;
$$;


ALTER FUNCTION "public"."expire_old_invitations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_invoice_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  next_number INTEGER;
  year_part TEXT;
BEGIN
  IF NEW.invoice_number IS NULL THEN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-' || year_part || '-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.invoices
    WHERE invoice_number LIKE 'INV-' || year_part || '-%';
    
    NEW.invoice_number := 'INV-' || year_part || '-' || LPAD(next_number::TEXT, 4, '0');
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_invoice_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_ticket_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  next_number INTEGER;
  year_part TEXT;
BEGIN
  IF NEW.ticket_number IS NULL THEN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 'TICKET-' || year_part || '-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.support_tickets
    WHERE ticket_number LIKE 'TICKET-' || year_part || '-%';
    
    NEW.ticket_number := 'TICKET-' || year_part || '-' || LPAD(next_number::TEXT, 4, '0');
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_ticket_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_active_maintenance"() RETURNS TABLE("id" "uuid", "scheduled_by" "uuid", "start_time" timestamp with time zone, "end_time" timestamp with time zone, "message_tr" "text", "message_en" "text", "affected_services" "text"[], "is_active" boolean, "metadata" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mw.id,
    mw.scheduled_by,
    mw.start_time,
    mw.end_time,
    mw.message_tr,
    mw.message_en,
    mw.affected_services,
    mw.is_active,
    mw.metadata
  FROM maintenance_windows mw
  WHERE mw.is_active = true
    AND mw.start_time <= CURRENT_TIMESTAMP
    AND mw.end_time >= CURRENT_TIMESTAMP
  ORDER BY mw.start_time DESC
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_active_maintenance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_activity_statistics"("p_company_id" "uuid" DEFAULT NULL::"uuid", "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_start_date" timestamp without time zone DEFAULT NULL::timestamp without time zone, "p_end_date" timestamp without time zone DEFAULT NULL::timestamp without time zone) RETURNS TABLE("total_logs" bigint, "success_count" bigint, "failed_count" bigint, "warning_count" bigint, "critical_count" bigint, "login_count" bigint, "logout_count" bigint, "create_count" bigint, "update_count" bigint, "delete_count" bigint, "unique_users" bigint, "unique_companies" bigint, "avg_duration_ms" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_logs,
    COUNT(*) FILTER (WHERE status = 'success')::BIGINT as success_count,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_count,
    COUNT(*) FILTER (WHERE severity_level = 'warning')::BIGINT as warning_count,
    COUNT(*) FILTER (WHERE severity_level = 'critical')::BIGINT as critical_count,
    COUNT(*) FILTER (WHERE action_category = 'auth' AND action ILIKE '%login%')::BIGINT as login_count,
    COUNT(*) FILTER (WHERE action_category = 'auth' AND action ILIKE '%logout%')::BIGINT as logout_count,
    COUNT(*) FILTER (WHERE action_category = 'create')::BIGINT as create_count,
    COUNT(*) FILTER (WHERE action_category = 'update')::BIGINT as update_count,
    COUNT(*) FILTER (WHERE action_category = 'delete')::BIGINT as delete_count,
    COUNT(DISTINCT user_id)::BIGINT as unique_users,
    COUNT(DISTINCT company_id)::BIGINT as unique_companies,
    AVG(duration_ms)::NUMERIC as avg_duration_ms
  FROM activity_logs
  WHERE
    (p_company_id IS NULL OR company_id = p_company_id)
    AND (p_user_id IS NULL OR user_id = p_user_id)
    AND (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);
END;
$$;


ALTER FUNCTION "public"."get_activity_statistics"("p_company_id" "uuid", "p_user_id" "uuid", "p_start_date" timestamp without time zone, "p_end_date" timestamp without time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_activity_timeline"("p_company_id" "uuid" DEFAULT NULL::"uuid", "p_hours" integer DEFAULT 24) RETURNS TABLE("hour" "text", "log_count" bigint, "success_count" bigint, "failed_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc('hour', created_at)::TEXT as hour,  -- Cast to TEXT
    COUNT(*)::BIGINT as log_count,
    COUNT(*) FILTER (WHERE status = 'success')::BIGINT as success_count,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_count
  FROM activity_logs
  WHERE
    created_at >= NOW() - (p_hours || ' hours')::INTERVAL
    AND (p_company_id IS NULL OR company_id = p_company_id)
  GROUP BY date_trunc('hour', created_at)
  ORDER BY hour DESC;
END;
$$;


ALTER FUNCTION "public"."get_activity_timeline"("p_company_id" "uuid", "p_hours" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_company_service_pricing"("p_company_id" "uuid", "p_service_type_id" "uuid") RETURNS TABLE("package" "text", "price" numeric, "currency" "text", "period" "text", "features_en" "text"[], "features_tr" "text"[], "limits" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    csp.package,
    csp.price,
    csp.currency,
    csp.period,
    csp.custom_features_en,
    csp.custom_features_tr,
    csp.custom_limits
  FROM company_service_pricing csp
  WHERE csp.company_id = p_company_id
    AND csp.service_type_id = p_service_type_id
    AND csp.is_active = true
  ORDER BY
    CASE csp.package
      WHEN 'basic' THEN 1
      WHEN 'standard' THEN 2
      WHEN 'premium' THEN 3
    END;
END;
$$;


ALTER FUNCTION "public"."get_company_service_pricing"("p_company_id" "uuid", "p_service_type_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_company_service_pricing"("p_company_id" "uuid", "p_service_type_id" "uuid") IS 'Get custom pricing for a specific company and service. Returns empty if no custom pricing exists.';



CREATE OR REPLACE FUNCTION "public"."get_display_price"("usd_amount" numeric, "target_currency" "text" DEFAULT 'TRY'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  approximate_rate NUMERIC;
  converted_amount NUMERIC;
BEGIN
  -- Sabit kurlar (yaklaşık - sadece gösterim için)
  -- Gerçek ödemeler USD'den yapılacak
  CASE target_currency
    WHEN 'TRY' THEN approximate_rate := 34.50;
    WHEN 'EUR' THEN approximate_rate := 0.92;
    WHEN 'GBP' THEN approximate_rate := 0.79;
    WHEN 'QAR' THEN approximate_rate := 3.64;
    ELSE approximate_rate := 1.00;
  END CASE;
  
  converted_amount := ROUND(usd_amount * approximate_rate, 2);
  
  RETURN JSONB_BUILD_OBJECT(
    'usd_amount', usd_amount,
    'display_currency', target_currency,
    'display_amount', converted_amount,
    'approximate_rate', approximate_rate,
    'note', 'Approximate rate for display only. Payment will be in USD.'
  );
END;
$$;


ALTER FUNCTION "public"."get_display_price"("usd_amount" numeric, "target_currency" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_project_media_url"("file_path" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN 'https://your-supabase-project.supabase.co/storage/v1/object/public/project-media/' || file_path;
END;
$$;


ALTER FUNCTION "public"."get_project_media_url"("file_path" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_top_active_users"("p_company_id" "uuid" DEFAULT NULL::"uuid", "p_limit" integer DEFAULT 10, "p_days" integer DEFAULT 7) RETURNS TABLE("user_id" "uuid", "user_name" "text", "user_email" "text", "user_role" "text", "activity_count" bigint, "last_activity" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.user_id,
    p.full_name as user_name,
    p.email as user_email,
    p.role as user_role,  -- ✅ ADDED ROLE
    COUNT(*)::BIGINT as activity_count,
    MAX(al.created_at)::TEXT as last_activity
  FROM activity_logs al
  LEFT JOIN profiles p ON p.id = al.user_id
  WHERE
    al.created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND (p_company_id IS NULL OR al.company_id = p_company_id)
  GROUP BY al.user_id, p.full_name, p.email, p.role  -- ✅ ADDED p.role
  ORDER BY activity_count DESC
  LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_top_active_users"("p_company_id" "uuid", "p_limit" integer, "p_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_upcoming_maintenance"("limit_count" integer DEFAULT 10) RETURNS TABLE("id" "uuid", "scheduled_by" "uuid", "start_time" timestamp with time zone, "end_time" timestamp with time zone, "message_tr" "text", "message_en" "text", "affected_services" "text"[], "is_active" boolean, "metadata" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mw.id,
    mw.scheduled_by,
    mw.start_time,
    mw.end_time,
    mw.message_tr,
    mw.message_en,
    mw.affected_services,
    mw.is_active,
    mw.metadata
  FROM maintenance_windows mw
  WHERE mw.is_active = true
    AND mw.start_time > CURRENT_TIMESTAMP
  ORDER BY mw.start_time ASC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_upcoming_maintenance"("limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 'tr');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_maintenance_mode"() RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  maintenance_active BOOLEAN;
BEGIN
  SELECT (value->>'enabled')::boolean INTO maintenance_active
  FROM public.system_settings
  WHERE key = 'maintenance_mode';
  
  IF maintenance_active THEN
    RETURN true;
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM public.maintenance_windows
    WHERE is_active = true
      AND NOW() BETWEEN start_time AND end_time
  ) INTO maintenance_active;
  
  RETURN maintenance_active;
END;
$$;


ALTER FUNCTION "public"."is_maintenance_mode"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_activity"("p_company_id" "uuid", "p_user_id" "uuid", "p_action" "text", "p_action_category" "text", "p_entity_type" "text" DEFAULT NULL::"text", "p_entity_id" "uuid" DEFAULT NULL::"uuid", "p_description" "text" DEFAULT NULL::"text", "p_details" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (
    company_id, user_id, action, action_category,
    entity_type, entity_id, description, details
  ) VALUES (
    p_company_id, p_user_id, p_action, p_action_category,
    p_entity_type, p_entity_id, p_description, p_details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;


ALTER FUNCTION "public"."log_activity"("p_company_id" "uuid", "p_user_id" "uuid", "p_action" "text", "p_action_category" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_description" "text", "p_details" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_invoice_payment_gateway"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- If payment_gateway is not set, get it from company
    IF NEW.payment_gateway IS NULL THEN
        SELECT payment_gateway INTO NEW.payment_gateway
        FROM companies
        WHERE id = NEW.company_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_invoice_payment_gateway"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_payment_gateway_by_country"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.payment_gateway IS NULL THEN
        NEW.payment_gateway := CASE
            WHEN NEW.country = 'TR' THEN 'paytr'
            WHEN NEW.country = 'QA' THEN 'qpay'
            ELSE 'stripe'
        END;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_payment_gateway_by_country"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_company_service_pricing_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_company_service_pricing_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_company_services_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_company_services_updated_at"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_company_services_updated_at"() IS 'Automatically updates the updated_at timestamp whenever a record is modified';



CREATE OR REPLACE FUNCTION "public"."update_invoice_on_transaction"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.status = 'success' AND (OLD.status IS NULL OR OLD.status != 'success') THEN
    UPDATE public.invoices
    SET status = 'paid',
        paid_at = NEW.processed_at,
        gateway_payment_id = NEW.gateway_transaction_id
    WHERE id = NEW.invoice_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_invoice_on_transaction"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_maintenance_windows_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_maintenance_windows_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_message_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.whatsapp_user_profiles
  SET total_messages = total_messages + 1,
      last_seen = NEW.created_at
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_message_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_project_media_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_project_media_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_push_notifications_log_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_push_notifications_log_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_service_types_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_service_types_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_suspension_history_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_suspension_history_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_system_notifications_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_system_notifications_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_system_settings_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_system_settings_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ticket_categories_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_ticket_categories_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ticket_first_response"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  ticket_creator UUID;
  is_admin BOOLEAN;
BEGIN
  SELECT created_by INTO ticket_creator FROM public.support_tickets WHERE id = NEW.ticket_id;
  is_admin := (NEW.sender_id != ticket_creator);
  
  IF is_admin THEN
    UPDATE public.support_tickets
    SET first_response_at = NEW.created_at,
        response_time = NEW.created_at - created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.ticket_id AND first_response_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_ticket_first_response"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ticket_messages_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_ticket_messages_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ticket_on_message"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE support_tickets
  SET updated_at = NOW(),
      first_response_at = CASE
        WHEN first_response_at IS NULL AND NEW.is_from_support = TRUE
        THEN NOW()
        ELSE first_response_at
      END
  WHERE id = NEW.ticket_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_ticket_on_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ticket_resolution_time"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
    NEW.resolved_at := NOW();
    NEW.resolution_time := NOW() - NEW.created_at;
  END IF;
  
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_ticket_resolution_time"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_invites_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_invites_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_service_consents_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_service_consents_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_usd_only"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_TABLE_NAME = 'invoices' THEN
    NEW.currency := 'USD';
  ELSIF TG_TABLE_NAME = 'company_services' THEN
    NEW.price_currency := 'USD';
  ELSIF TG_TABLE_NAME = 'transactions' THEN
    NEW.currency := 'USD';
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_usd_only"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "country" "text" DEFAULT 'TR'::"text" NOT NULL,
    "logo_url" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "website" "text",
    "address" "text",
    "city" "text",
    "postal_code" "text",
    "tax_id" "text",
    "registration_number" "text",
    "billing_email" "text",
    "payment_gateway" "text",
    "state" "text",
    "vat_number" "text",
    "contact_person" "text",
    "contact_title" "text",
    CONSTRAINT "companies_payment_gateway_check" CHECK (("payment_gateway" = ANY (ARRAY['paytr'::"text", 'stripe'::"text", 'qpay'::"text", 'tappay'::"text"]))),
    CONSTRAINT "companies_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'maintenance'::"text"])))
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


COMMENT ON COLUMN "public"."companies"."website" IS 'Company website URL';



COMMENT ON COLUMN "public"."companies"."billing_email" IS 'Separate billing email (if different from main email)';



COMMENT ON COLUMN "public"."companies"."state" IS 'State/Province/Region';



COMMENT ON COLUMN "public"."companies"."vat_number" IS 'VAT Number (for EU companies)';



COMMENT ON COLUMN "public"."companies"."contact_person" IS 'Primary contact person name';



COMMENT ON COLUMN "public"."companies"."contact_title" IS 'Contact person title (CEO, CFO, etc)';



CREATE TABLE IF NOT EXISTS "public"."company_services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "service_type_id" "uuid" NOT NULL,
    "package" "text" DEFAULT 'basic'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "start_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "end_date" "date",
    "next_billing_date" "date",
    "usage_limits" "jsonb" DEFAULT '{}'::"jsonb",
    "current_usage" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "price_amount" numeric(10,2),
    "price_currency" "text" DEFAULT 'USD'::"text",
    "billing_cycle" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "instance_name" "text",
    CONSTRAINT "company_services_billing_cycle_check" CHECK (("billing_cycle" = ANY (ARRAY['monthly'::"text", 'yearly'::"text", 'one-time'::"text"]))),
    CONSTRAINT "company_services_currency_check" CHECK (("price_currency" = 'USD'::"text")),
    CONSTRAINT "company_services_date_range_valid" CHECK ((("end_date" IS NULL) OR ("end_date" >= "start_date"))),
    CONSTRAINT "company_services_next_billing_future" CHECK ((("next_billing_date" IS NULL) OR ("next_billing_date" >= CURRENT_DATE))),
    CONSTRAINT "company_services_package_check" CHECK (("package" = ANY (ARRAY['basic'::"text", 'pro'::"text", 'premium'::"text", 'custom'::"text"]))),
    CONSTRAINT "company_services_price_amount_positive" CHECK ((("price_amount" IS NULL) OR ("price_amount" >= (0)::numeric))),
    CONSTRAINT "company_services_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'inactive'::"text", 'maintenance'::"text"])))
);


ALTER TABLE "public"."company_services" OWNER TO "postgres";


COMMENT ON TABLE "public"."company_services" IS 'Stores company service subscriptions. Companies can have multiple instances of the same service type (e.g., multiple websites, multiple apps).';



COMMENT ON COLUMN "public"."company_services"."instance_name" IS 'Unique name for this service instance (e.g., "E-commerce Store", "Corporate Website", "iOS App", "Android App"). Allows companies to distinguish between multiple instances of the same service type.';



CREATE TABLE IF NOT EXISTS "public"."service_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name_tr" "text" NOT NULL,
    "name_en" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "category" "text" NOT NULL,
    "icon" "text",
    "color" "text",
    "description_tr" "text",
    "description_en" "text",
    "features" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "short_description_tr" character varying(255),
    "short_description_en" character varying(255),
    "image_url" "text",
    "pricing_basic" "jsonb" DEFAULT '{}'::"jsonb",
    "pricing_standard" "jsonb" DEFAULT '{}'::"jsonb",
    "pricing_premium" "jsonb" DEFAULT '{}'::"jsonb",
    "requirements_tr" "text"[],
    "requirements_en" "text"[],
    "is_featured" boolean DEFAULT false,
    "meta_title_tr" character varying(100),
    "meta_title_en" character varying(100),
    "meta_description_tr" character varying(255),
    "meta_description_en" character varying(255),
    "meta_keywords" "text"[],
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text",
    "payment_type" "text" DEFAULT 'recurring'::"text",
    CONSTRAINT "service_types_category_check" CHECK (("category" = ANY (ARRAY['ai'::"text", 'digital'::"text"]))),
    CONSTRAINT "service_types_payment_type_check" CHECK (("payment_type" = ANY (ARRAY['recurring'::"text", 'one-time'::"text"]))),
    CONSTRAINT "service_types_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'maintenance'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."service_types" OWNER TO "postgres";


COMMENT ON COLUMN "public"."service_types"."pricing_basic" IS 'Basic tier pricing (JSONB): {price, currency, period, features_tr, features_en}';



COMMENT ON COLUMN "public"."service_types"."pricing_standard" IS 'Standard tier pricing (JSONB): {price, currency, period, features_tr, features_en}';



COMMENT ON COLUMN "public"."service_types"."pricing_premium" IS 'Premium tier pricing (JSONB): {price, currency, period, features_tr, features_en}';



COMMENT ON COLUMN "public"."service_types"."is_featured" IS 'Featured services shown prominently';



COMMENT ON COLUMN "public"."service_types"."meta_title_tr" IS 'SEO title (Turkish)';



COMMENT ON COLUMN "public"."service_types"."meta_title_en" IS 'SEO title (English)';



COMMENT ON COLUMN "public"."service_types"."meta_description_tr" IS 'SEO description (Turkish)';



COMMENT ON COLUMN "public"."service_types"."meta_description_en" IS 'SEO description (English)';



COMMENT ON COLUMN "public"."service_types"."payment_type" IS 'Payment type: recurring (monthly/yearly) or one-time (website/mobile dev)';



CREATE OR REPLACE VIEW "public"."active_company_services" AS
 SELECT "cs"."id",
    "cs"."company_id",
    "c"."name" AS "company_name",
    "cs"."service_type_id",
    "st"."name_en" AS "service_name",
    "st"."slug" AS "service_slug",
    "cs"."instance_name",
    "cs"."package",
    "cs"."status",
    "cs"."price_amount",
    "cs"."price_currency",
    "cs"."billing_cycle",
    "cs"."start_date",
    "cs"."end_date",
    "cs"."next_billing_date",
    "cs"."created_at",
    "cs"."updated_at"
   FROM (("public"."company_services" "cs"
     JOIN "public"."companies" "c" ON (("cs"."company_id" = "c"."id")))
     JOIN "public"."service_types" "st" ON (("cs"."service_type_id" = "st"."id")))
  WHERE ("cs"."status" = 'active'::"text");


ALTER VIEW "public"."active_company_services" OWNER TO "postgres";


COMMENT ON VIEW "public"."active_company_services" IS 'Convenient view showing all active services with company and service type details';



CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid",
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "action_category" "text",
    "entity_type" "text",
    "entity_id" "uuid",
    "description" "text",
    "details" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'success'::"text",
    "severity_level" "text" DEFAULT 'info'::"text",
    "changed_data" "jsonb" DEFAULT '{}'::"jsonb",
    "session_id" "text",
    "device_type" "text",
    "browser" "text",
    "location_data" "jsonb" DEFAULT '{}'::"jsonb",
    "error_message" "text",
    "duration_ms" integer,
    "tags" "text"[],
    CONSTRAINT "activity_logs_action_category_check" CHECK (("action_category" = ANY (ARRAY['auth'::"text", 'billing'::"text", 'service'::"text", 'support'::"text", 'admin'::"text", 'system'::"text"]))),
    CONSTRAINT "activity_logs_device_check" CHECK ((("device_type" IS NULL) OR ("device_type" = ANY (ARRAY['desktop'::"text", 'mobile'::"text", 'tablet'::"text", 'unknown'::"text"])))),
    CONSTRAINT "activity_logs_severity_check" CHECK (("severity_level" = ANY (ARRAY['info'::"text", 'warning'::"text", 'error'::"text", 'critical'::"text"]))),
    CONSTRAINT "activity_logs_status_check" CHECK (("status" = ANY (ARRAY['success'::"text", 'failed'::"text", 'pending'::"text", 'warning'::"text"])))
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointment_actions_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "appointment_id" "uuid",
    "company_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "action_by" "text" NOT NULL,
    "action_by_name" "text",
    "action_by_role" "text",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "notes" "text",
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."appointment_actions_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointment_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "metric_date" "date" NOT NULL,
    "total_requests" integer DEFAULT 0,
    "pending_count" integer DEFAULT 0,
    "approved_count" integer DEFAULT 0,
    "rejected_count" integer DEFAULT 0,
    "completed_count" integer DEFAULT 0,
    "cancelled_count" integer DEFAULT 0,
    "no_show_count" integer DEFAULT 0,
    "whatsapp_count" integer DEFAULT 0,
    "web_count" integer DEFAULT 0,
    "manual_count" integer DEFAULT 0,
    "avg_response_time_minutes" numeric,
    "avg_ai_confidence" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."appointment_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointment_reminders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "appointment_id" "uuid",
    "company_id" "uuid" NOT NULL,
    "reminder_type" "text",
    "reminder_time" timestamp with time zone NOT NULL,
    "sent_at" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text",
    "message_content" "text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."appointment_reminders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointment_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "customer_name" "text" NOT NULL,
    "customer_phone" "text" NOT NULL,
    "customer_email" "text",
    "whatsapp_customer_id" "text",
    "whatsapp_session_id" "text",
    "whatsapp_message_id" "text",
    "appointment_type" "text",
    "appointment_reason" "text" NOT NULL,
    "requested_date" "date" NOT NULL,
    "requested_time" time without time zone NOT NULL,
    "duration_minutes" integer DEFAULT 60,
    "location" "text",
    "notes" "text",
    "assigned_to_staff_id" "uuid",
    "assigned_department" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "google_event_id" "text",
    "calendar_event_link" "text",
    "google_meet_link" "text",
    "n8n_execution_id" "text",
    "n8n_workflow_status" "text",
    "ai_parsed_data" "jsonb",
    "ai_confidence_score" numeric,
    "created_by" "text",
    "created_by_name" "text",
    "approved_by" "text",
    "approved_by_name" "text",
    "rejected_by" "text",
    "rejected_by_name" "text",
    "cancelled_by" "text",
    "cancelled_by_name" "text",
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "approved_at" timestamp with time zone,
    "rejected_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."appointment_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointment_types" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "duration_minutes" integer DEFAULT 60,
    "color" "text",
    "requires_approval" boolean DEFAULT true,
    "ai_keywords" "text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."appointment_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blocked_time_slots" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "staff_id" "uuid",
    "blocked_date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "reason" "text",
    "is_recurring" boolean DEFAULT false,
    "recurrence_rule" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text"
);


ALTER TABLE "public"."blocked_time_slots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calendar_instances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "google_calendar_id" "text",
    "calendar_name" "text",
    "timezone" "text" DEFAULT 'UTC'::"text",
    "business_hours" "jsonb",
    "auto_approve_appointments" boolean DEFAULT false,
    "status" "text" DEFAULT 'active'::"text",
    "settings" "jsonb",
    "n8n_workflow_id" "text",
    "n8n_webhook_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text",
    "updated_by" "text",
    "instance_name" character varying(255) DEFAULT 'Main Calendar'::character varying
);


ALTER TABLE "public"."calendar_instances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calendar_staff" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "department" "text",
    "role" "text",
    "availability" "jsonb",
    "max_daily_appointments" integer DEFAULT 20,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text",
    "updated_by" "text"
);


ALTER TABLE "public"."calendar_staff" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "invoice_number" "text" NOT NULL,
    "subtotal" numeric(10,2) DEFAULT 0 NOT NULL,
    "tax_rate" numeric(5,2) DEFAULT 0,
    "tax_amount" numeric(10,2) DEFAULT 0,
    "discount_amount" numeric(10,2) DEFAULT 0,
    "total_amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "issue_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "due_date" "date" NOT NULL,
    "paid_at" timestamp with time zone,
    "payment_gateway" "text",
    "gateway_customer_id" "text",
    "gateway_payment_id" "text",
    "pdf_url" "text",
    "notes" "text",
    "internal_notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "auto_suspend_on_overdue" boolean DEFAULT true,
    "is_manual" boolean DEFAULT false,
    "suspended_at" timestamp with time zone,
    CONSTRAINT "invoices_currency_check" CHECK (("currency" = 'USD'::"text")),
    CONSTRAINT "invoices_payment_gateway_check" CHECK (("payment_gateway" = ANY (ARRAY['paytr'::"text", 'stripe'::"text", 'qtap'::"text", 'bank_transfer'::"text", 'cash'::"text"]))),
    CONSTRAINT "invoices_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending'::"text", 'paid'::"text", 'failed'::"text", 'refunded'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


COMMENT ON COLUMN "public"."invoices"."auto_suspend_on_overdue" IS 'Whether to automatically suspend service when invoice becomes overdue';



COMMENT ON COLUMN "public"."invoices"."is_manual" IS 'Whether this invoice was created manually by admin';



COMMENT ON COLUMN "public"."invoices"."suspended_at" IS 'Timestamp when service was suspended due to overdue invoice';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "company_id" "uuid",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "full_name" "text" NOT NULL,
    "avatar_url" "text",
    "language" "text" DEFAULT 'tr'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "status" "text" DEFAULT 'active'::"text",
    "last_login" timestamp with time zone,
    "must_change_password" boolean DEFAULT false,
    "push_token" "text",
    "push_enabled" boolean DEFAULT false,
    "push_platform" "text",
    CONSTRAINT "profiles_language_check" CHECK (("language" = ANY (ARRAY['tr'::"text", 'en'::"text"]))),
    CONSTRAINT "profiles_push_platform_check" CHECK (("push_platform" = ANY (ARRAY['ios'::"text", 'android'::"text", 'web'::"text"]))),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'company_admin'::"text", 'user'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."must_change_password" IS 'Flag indicating user must change password on next login (for temporary passwords)';



COMMENT ON COLUMN "public"."profiles"."push_token" IS 'Expo push token for mobile notifications';



COMMENT ON COLUMN "public"."profiles"."push_enabled" IS 'Whether user has enabled push notifications';



COMMENT ON COLUMN "public"."profiles"."push_platform" IS 'Platform type: ios, android, or web';



CREATE TABLE IF NOT EXISTS "public"."support_tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "ticket_number" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text",
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "assigned_to" "uuid",
    "service_type_id" "uuid",
    "resolution_notes" "text",
    "satisfaction_rating" integer,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "tags" "text"[] DEFAULT ARRAY[]::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resolved_at" timestamp with time zone,
    "closed_at" timestamp with time zone,
    "first_response_at" timestamp with time zone,
    "response_time" interval,
    "resolution_time" interval,
    "category_id" "uuid",
    CONSTRAINT "support_tickets_category_check" CHECK (("category" = ANY (ARRAY['technical'::"text", 'billing'::"text", 'feature_request'::"text", 'bug'::"text", 'general'::"text", 'urgent'::"text"]))),
    CONSTRAINT "support_tickets_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "support_tickets_satisfaction_rating_check" CHECK ((("satisfaction_rating" >= 1) AND ("satisfaction_rating" <= 5))),
    CONSTRAINT "support_tickets_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'in_progress'::"text", 'waiting_customer'::"text", 'resolved'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."support_tickets" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."company_complete_profile" AS
 SELECT "id",
    "name",
    "email",
    "phone",
    "country",
    "logo_url",
    "status",
    "created_at",
    "updated_at",
    ( SELECT "jsonb_agg"("jsonb_build_object"('service_id', "cs"."id", 'service_name', "st"."name_en", 'service_slug', "st"."slug", 'package', "cs"."package", 'status', "cs"."status", 'start_date', "cs"."start_date")) AS "jsonb_agg"
           FROM ("public"."company_services" "cs"
             JOIN "public"."service_types" "st" ON (("st"."id" = "cs"."service_type_id")))
          WHERE (("cs"."company_id" = "c"."id") AND ("cs"."status" = 'active'::"text"))) AS "active_services",
    ( SELECT "count"(*) AS "count"
           FROM "public"."profiles" "p"
          WHERE ("p"."company_id" = "c"."id")) AS "user_count",
    ( SELECT COALESCE("sum"("i"."total_amount"), (0)::numeric) AS "coalesce"
           FROM "public"."invoices" "i"
          WHERE (("i"."company_id" = "c"."id") AND ("i"."status" = 'paid'::"text") AND ("i"."paid_at" >= ("now"() - '30 days'::interval)))) AS "revenue_last_30_days",
    ( SELECT "count"(*) AS "count"
           FROM "public"."support_tickets" "st"
          WHERE (("st"."company_id" = "c"."id") AND ("st"."status" = ANY (ARRAY['open'::"text", 'in_progress'::"text"])))) AS "open_tickets_count"
   FROM "public"."companies" "c";


ALTER VIEW "public"."company_complete_profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_daily_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "metric_date" "date" NOT NULL,
    "active_users" integer DEFAULT 0,
    "new_users" integer DEFAULT 0,
    "total_api_calls" integer DEFAULT 0,
    "total_messages_sent" integer DEFAULT 0,
    "total_storage_used_gb" numeric(10,2) DEFAULT 0,
    "tickets_created" integer DEFAULT 0,
    "tickets_resolved" integer DEFAULT 0,
    "avg_resolution_time" interval,
    "revenue_generated" numeric(10,2) DEFAULT 0,
    "invoices_paid" integer DEFAULT 0,
    "session_count" integer DEFAULT 0,
    "avg_session_duration" interval,
    "page_views" integer DEFAULT 0,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."company_daily_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_service_pricing" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "service_type_id" "uuid" NOT NULL,
    "package" "text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "period" "text" DEFAULT 'month'::"text" NOT NULL,
    "custom_features_en" "text"[],
    "custom_features_tr" "text"[],
    "custom_limits" "jsonb" DEFAULT '{}'::"jsonb",
    "notes" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "company_service_pricing_package_check" CHECK (("package" = ANY (ARRAY['basic'::"text", 'standard'::"text", 'premium'::"text"]))),
    CONSTRAINT "company_service_pricing_period_check" CHECK (("period" = ANY (ARRAY['month'::"text", 'year'::"text", 'one-time'::"text"])))
);


ALTER TABLE "public"."company_service_pricing" OWNER TO "postgres";


COMMENT ON TABLE "public"."company_service_pricing" IS 'Custom pricing per company for each service package. Overrides default pricing from service_types.';



COMMENT ON COLUMN "public"."company_service_pricing"."package" IS 'Package tier: basic, standard, or premium';



COMMENT ON COLUMN "public"."company_service_pricing"."period" IS 'Billing period: month, year, or one-time (for website/mobile app dev)';



COMMENT ON COLUMN "public"."company_service_pricing"."custom_features_en" IS 'Custom features specific to this company (English)';



COMMENT ON COLUMN "public"."company_service_pricing"."custom_features_tr" IS 'Custom features specific to this company (Turkish)';



COMMENT ON COLUMN "public"."company_service_pricing"."custom_limits" IS 'Custom limits/quotas as JSON (e.g., {"max_users": 100, "storage_gb": 50})';



COMMENT ON COLUMN "public"."company_service_pricing"."notes" IS 'Internal notes for Super Admin (not shown to company)';



CREATE OR REPLACE VIEW "public"."dashboard_overview" AS
 SELECT "c"."id" AS "company_id",
    "c"."name" AS "company_name",
    "c"."status" AS "company_status",
    ( SELECT "count"(*) AS "count"
           FROM "public"."company_services" "cs"
          WHERE (("cs"."company_id" = "c"."id") AND ("cs"."status" = 'active'::"text"))) AS "active_services_count",
    COALESCE("dm"."total_messages_sent", 0) AS "messages_today",
    COALESCE("dm"."active_users", 0) AS "active_users_today",
    COALESCE("dm"."session_count", 0) AS "sessions_today",
    ( SELECT "count"(*) AS "count"
           FROM "public"."support_tickets" "st"
          WHERE (("st"."company_id" = "c"."id") AND ("st"."status" = ANY (ARRAY['open'::"text", 'in_progress'::"text"])))) AS "open_tickets",
    ( SELECT "count"(*) AS "count"
           FROM "public"."invoices" "i"
          WHERE (("i"."company_id" = "c"."id") AND ("i"."status" = 'pending'::"text"))) AS "pending_invoices",
    ( SELECT "max"("al"."created_at") AS "max"
           FROM "public"."activity_logs" "al"
          WHERE ("al"."company_id" = "c"."id")) AS "last_activity_at"
   FROM ("public"."companies" "c"
     LEFT JOIN "public"."company_daily_metrics" "dm" ON ((("dm"."company_id" = "c"."id") AND ("dm"."metric_date" = CURRENT_DATE))));


ALTER VIEW "public"."dashboard_overview" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."docs_instances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "google_drive_folder_id" "text",
    "google_drive_folder_name" "text",
    "google_credentials_encrypted" "text",
    "whatsapp_integration_enabled" boolean DEFAULT true,
    "auto_generate_enabled" boolean DEFAULT true,
    "default_template_id" "text",
    "n8n_workflow_id" "text",
    "n8n_webhook_url" "text",
    "status" "text" DEFAULT 'active'::"text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text",
    "updated_by" "text",
    "instance_name" character varying(255) DEFAULT 'Main Docs'::character varying
);


ALTER TABLE "public"."docs_instances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."docs_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "metric_date" "date" NOT NULL,
    "documents_created" integer DEFAULT 0,
    "documents_shared" integer DEFAULT 0,
    "whatsapp_requests" integer DEFAULT 0,
    "total_word_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."docs_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_actions_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "document_id" "uuid",
    "company_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "action_by" "text" NOT NULL,
    "action_by_name" "text",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_actions_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "docs_instance_id" "uuid",
    "whatsapp_customer_id" "text",
    "whatsapp_session_id" "text",
    "whatsapp_message_id" "text",
    "customer_phone" "text" NOT NULL,
    "customer_name" "text",
    "request_type" "text" NOT NULL,
    "request_text" "text" NOT NULL,
    "ai_parsed_request" "jsonb",
    "ai_confidence" numeric,
    "document_type" "text",
    "document_title" "text",
    "document_instructions" "text",
    "bot_response" "text",
    "generated_document_id" "uuid",
    "n8n_execution_id" "text",
    "status" "text" DEFAULT 'completed'::"text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "template_name" "text" NOT NULL,
    "template_type" "text",
    "template_content" "text" NOT NULL,
    "variables" "jsonb",
    "google_doc_template_id" "text",
    "usage_count" integer DEFAULT 0,
    "last_used_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."drive_actions_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "drive_file_id" "uuid",
    "company_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "action_by" "text" NOT NULL,
    "action_by_name" "text",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."drive_actions_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."drive_files" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "drive_instance_id" "uuid",
    "google_file_id" "text" NOT NULL,
    "google_file_name" "text" NOT NULL,
    "google_file_url" "text",
    "google_file_type" "text",
    "mime_type" "text",
    "file_size_bytes" bigint,
    "file_extension" "text",
    "parent_folder_id" "text",
    "parent_folder_name" "text",
    "folder_path" "text",
    "description" "text",
    "tags" "text"[],
    "whatsapp_customer_id" "text",
    "whatsapp_session_id" "text",
    "whatsapp_message_id" "text",
    "customer_phone" "text",
    "uploaded_via_whatsapp" boolean DEFAULT false,
    "is_shared" boolean DEFAULT false,
    "shared_with" "text"[],
    "share_link" "text",
    "share_permissions" "text",
    "ai_summary" "text",
    "ai_tags" "text"[],
    "ocr_text" "text",
    "n8n_execution_id" "text",
    "status" "text" DEFAULT 'active'::"text",
    "is_deleted" boolean DEFAULT false,
    "google_created_at" timestamp with time zone,
    "google_modified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."drive_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."drive_folders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "drive_instance_id" "uuid",
    "google_folder_id" "text" NOT NULL,
    "folder_name" "text" NOT NULL,
    "parent_folder_id" "text",
    "folder_path" "text",
    "files_count" integer DEFAULT 0,
    "total_size_bytes" bigint DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."drive_folders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."drive_instances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "google_drive_email" "text" NOT NULL,
    "root_folder_id" "text",
    "root_folder_name" "text",
    "google_credentials_encrypted" "text",
    "whatsapp_integration_enabled" boolean DEFAULT true,
    "auto_organize_enabled" boolean DEFAULT true,
    "organization_rules" "jsonb",
    "n8n_workflow_id" "text",
    "n8n_webhook_url" "text",
    "auto_sync_enabled" boolean DEFAULT true,
    "sync_interval_minutes" integer DEFAULT 30,
    "last_sync_at" timestamp with time zone,
    "status" "text" DEFAULT 'active'::"text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text",
    "updated_by" "text",
    "instance_name" character varying(255) DEFAULT 'Main Drive'::character varying
);


ALTER TABLE "public"."drive_instances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."drive_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "metric_date" "date" NOT NULL,
    "files_uploaded" integer DEFAULT 0,
    "files_downloaded" integer DEFAULT 0,
    "files_shared" integer DEFAULT 0,
    "files_deleted" integer DEFAULT 0,
    "whatsapp_uploads" integer DEFAULT 0,
    "total_storage_bytes" bigint DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."drive_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."drive_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "drive_instance_id" "uuid",
    "whatsapp_customer_id" "text",
    "whatsapp_session_id" "text",
    "whatsapp_message_id" "text",
    "customer_phone" "text" NOT NULL,
    "customer_name" "text",
    "request_type" "text" NOT NULL,
    "request_text" "text" NOT NULL,
    "ai_parsed_request" "jsonb",
    "ai_confidence" numeric,
    "uploaded_file_id" "uuid",
    "search_query" "text",
    "search_results_count" integer,
    "search_results" "jsonb",
    "bot_response" "text",
    "n8n_execution_id" "text",
    "status" "text" DEFAULT 'completed'::"text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."drive_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."generated_documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "docs_instance_id" "uuid",
    "google_doc_id" "text" NOT NULL,
    "google_doc_url" "text" NOT NULL,
    "google_doc_name" "text" NOT NULL,
    "document_type" "text",
    "document_title" "text",
    "document_content" "text",
    "word_count" integer,
    "whatsapp_customer_id" "text",
    "whatsapp_session_id" "text",
    "whatsapp_message_id" "text",
    "customer_phone" "text",
    "customer_name" "text",
    "request_text" "text",
    "ai_prompt" "text",
    "ai_generated_content" "text",
    "ai_model" "text",
    "ai_confidence" numeric,
    "template_used" "text",
    "variables_used" "jsonb",
    "is_shared" boolean DEFAULT false,
    "shared_with" "text"[],
    "share_link" "text",
    "n8n_execution_id" "text",
    "status" "text" DEFAULT 'completed'::"text",
    "error_message" "text",
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "last_modified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."generated_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gmail_actions_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "gmail_message_id" "uuid",
    "company_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "action_by" "text" NOT NULL,
    "action_by_name" "text",
    "action_by_role" "text",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gmail_actions_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gmail_instances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "gmail_address" "text" NOT NULL,
    "gmail_account_name" "text",
    "google_credentials_encrypted" "text",
    "access_token_encrypted" "text",
    "refresh_token_encrypted" "text",
    "token_expires_at" timestamp with time zone,
    "auto_reply_enabled" boolean DEFAULT false,
    "auto_reply_template" "text",
    "whatsapp_integration_enabled" boolean DEFAULT true,
    "allowed_senders" "text"[],
    "blocked_senders" "text"[],
    "allowed_domains" "text"[],
    "n8n_workflow_id" "text",
    "n8n_webhook_url" "text",
    "auto_sync_enabled" boolean DEFAULT true,
    "sync_interval_minutes" integer DEFAULT 5,
    "last_sync_at" timestamp with time zone,
    "next_sync_at" timestamp with time zone,
    "status" "text" DEFAULT 'active'::"text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text",
    "updated_by" "text",
    "instance_name" character varying(255) DEFAULT 'Main Gmail'::character varying
);


ALTER TABLE "public"."gmail_instances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gmail_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "gmail_instance_id" "uuid",
    "gmail_message_id" "text" NOT NULL,
    "gmail_thread_id" "text",
    "from_email" "text" NOT NULL,
    "from_name" "text",
    "to_emails" "text"[] NOT NULL,
    "cc_emails" "text"[],
    "bcc_emails" "text"[],
    "subject" "text",
    "body_text" "text",
    "body_html" "text",
    "has_attachments" boolean DEFAULT false,
    "attachments_count" integer DEFAULT 0,
    "attachments_info" "jsonb",
    "gmail_labels" "text"[],
    "is_read" boolean DEFAULT false,
    "is_starred" boolean DEFAULT false,
    "is_important" boolean DEFAULT false,
    "whatsapp_customer_id" "text",
    "whatsapp_session_id" "text",
    "whatsapp_message_id" "text",
    "customer_phone" "text",
    "direction" "text",
    "ai_summary" "text",
    "ai_intent" "text",
    "ai_sentiment" "text",
    "ai_priority" "text",
    "n8n_execution_id" "text",
    "status" "text" DEFAULT 'delivered'::"text",
    "error_message" "text",
    "gmail_sent_at" timestamp with time zone,
    "gmail_received_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gmail_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gmail_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "metric_date" "date" NOT NULL,
    "emails_received" integer DEFAULT 0,
    "emails_sent" integer DEFAULT 0,
    "emails_read" integer DEFAULT 0,
    "whatsapp_requests" integer DEFAULT 0,
    "avg_response_time_minutes" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gmail_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gmail_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "gmail_instance_id" "uuid",
    "whatsapp_customer_id" "text",
    "whatsapp_session_id" "text",
    "whatsapp_message_id" "text",
    "customer_phone" "text" NOT NULL,
    "customer_name" "text",
    "request_type" "text" NOT NULL,
    "request_text" "text" NOT NULL,
    "ai_parsed_request" "jsonb",
    "ai_confidence" numeric,
    "to_email" "text",
    "subject" "text",
    "body" "text",
    "search_query" "text",
    "search_results_count" integer,
    "bot_response" "text",
    "gmail_message_id" "uuid",
    "n8n_execution_id" "text",
    "status" "text" DEFAULT 'completed'::"text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gmail_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gmail_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "template_name" "text" NOT NULL,
    "template_subject" "text",
    "template_body" "text" NOT NULL,
    "variables" "jsonb",
    "usage_count" integer DEFAULT 0,
    "last_used_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gmail_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instagram_comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "instance_id" "uuid" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "comment_id" character varying(255) NOT NULL,
    "parent_comment_id" character varying(255),
    "user_id" character varying(255) NOT NULL,
    "username" character varying(255) NOT NULL,
    "comment_text" "text" NOT NULL,
    "bot_response" "text",
    "sentiment" character varying(20),
    "is_bot_reply" boolean DEFAULT false,
    "is_filtered" boolean DEFAULT false,
    "filter_reason" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "responded_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."instagram_comments" OWNER TO "postgres";


COMMENT ON TABLE "public"."instagram_comments" IS 'Instagram comments and bot responses';



COMMENT ON COLUMN "public"."instagram_comments"."sentiment" IS 'AI-detected sentiment: positive, neutral, negative';



COMMENT ON COLUMN "public"."instagram_comments"."is_filtered" IS 'Whether comment was filtered (spam, self, etc)';



CREATE TABLE IF NOT EXISTS "public"."instagram_dm_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "message_id" character varying(255),
    "sender" character varying(20) NOT NULL,
    "sender_name" character varying(255),
    "message_text" "text" NOT NULL,
    "message_owner" character varying(20),
    "message_type" character varying(50) DEFAULT 'text'::character varying,
    "media_url" "text",
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "instagram_dm_messages_message_owner_check" CHECK ((("message_owner")::"text" = ANY ((ARRAY['incoming'::character varying, 'outgoing'::character varying])::"text"[]))),
    CONSTRAINT "instagram_dm_messages_message_type_check" CHECK ((("message_type")::"text" = ANY ((ARRAY['text'::character varying, 'image'::character varying, 'video'::character varying, 'audio'::character varying, 'link'::character varying])::"text"[]))),
    CONSTRAINT "instagram_dm_messages_sender_check" CHECK ((("sender")::"text" = ANY ((ARRAY['customer'::character varying, 'bot'::character varying, 'agent'::character varying])::"text"[])))
);


ALTER TABLE "public"."instagram_dm_messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."instagram_dm_messages" IS 'Individual Instagram DM messages';



CREATE TABLE IF NOT EXISTS "public"."instagram_dm_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "instance_id" "uuid" NOT NULL,
    "user_id" character varying(255) NOT NULL,
    "username" character varying(255) NOT NULL,
    "profile_picture_url" "text",
    "last_message" "text",
    "last_message_time" timestamp with time zone,
    "unread_count" integer DEFAULT 0,
    "message_count" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "session_start" timestamp with time zone DEFAULT "now"(),
    "session_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "instagram_dm_sessions_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'closed'::character varying, 'archived'::character varying])::"text"[])))
);


ALTER TABLE "public"."instagram_dm_sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."instagram_dm_sessions" IS 'Instagram Direct Message conversation sessions';



CREATE TABLE IF NOT EXISTS "public"."instagram_hourly_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "instance_id" "uuid" NOT NULL,
    "metric_hour" timestamp with time zone NOT NULL,
    "total_comments" integer DEFAULT 0,
    "total_dms" integer DEFAULT 0,
    "bot_responses" integer DEFAULT 0,
    "avg_response_time" integer,
    "positive_sentiment" integer DEFAULT 0,
    "neutral_sentiment" integer DEFAULT 0,
    "negative_sentiment" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."instagram_hourly_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."instagram_hourly_metrics" IS 'Hourly metrics for peak time analysis';



CREATE TABLE IF NOT EXISTS "public"."instagram_instances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "instance_id" character varying(255) NOT NULL,
    "instagram_account_id" character varying(255) NOT NULL,
    "username" character varying(255) NOT NULL,
    "profile_picture_url" "text",
    "status" character varying(20) DEFAULT 'active'::character varying,
    "is_connected" boolean DEFAULT false,
    "last_connected_at" timestamp with time zone,
    "access_token" "text",
    "webhook_url" "text",
    "settings" "jsonb" DEFAULT '{"filter_spam": true, "dm_auto_reply": true, "response_language": "en", "comment_auto_reply": true}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "instance_name" character varying(255),
    CONSTRAINT "instagram_instances_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying, 'disconnected'::character varying])::"text"[])))
);


ALTER TABLE "public"."instagram_instances" OWNER TO "postgres";


COMMENT ON TABLE "public"."instagram_instances" IS 'Instagram account information for each company';



COMMENT ON COLUMN "public"."instagram_instances"."instagram_account_id" IS 'Instagram Business Account ID from Graph API';



COMMENT ON COLUMN "public"."instagram_instances"."settings" IS 'JSON settings: auto_reply preferences, filters, etc.';



CREATE TABLE IF NOT EXISTS "public"."instagram_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "instance_id" "uuid" NOT NULL,
    "metric_date" "date" NOT NULL,
    "total_comments" integer DEFAULT 0,
    "bot_comment_responses" integer DEFAULT 0,
    "total_dms" integer DEFAULT 0,
    "bot_dm_responses" integer DEFAULT 0,
    "avg_comment_response_time" integer,
    "avg_dm_response_time" integer,
    "positive_sentiment" integer DEFAULT 0,
    "neutral_sentiment" integer DEFAULT 0,
    "negative_sentiment" integer DEFAULT 0,
    "total_posts_commented" integer DEFAULT 0,
    "active_dm_sessions" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."instagram_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."instagram_metrics" IS 'Daily aggregated metrics for Instagram automation';



CREATE TABLE IF NOT EXISTS "public"."instagram_posts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "instance_id" "uuid" NOT NULL,
    "post_id" character varying(255) NOT NULL,
    "media_type" character varying(50),
    "caption" "text",
    "image_url" "text",
    "permalink" "text",
    "like_count" integer DEFAULT 0,
    "comment_count" integer DEFAULT 0,
    "last_comment_time" timestamp with time zone,
    "posted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."instagram_posts" OWNER TO "postgres";


COMMENT ON TABLE "public"."instagram_posts" IS 'Instagram posts that have received comments';



COMMENT ON COLUMN "public"."instagram_posts"."post_id" IS 'Instagram media ID from Graph API';



CREATE TABLE IF NOT EXISTS "public"."instagram_user_profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "user_id" character varying(255) NOT NULL,
    "username" character varying(255) NOT NULL,
    "profile_picture_url" "text",
    "full_name" character varying(255),
    "bio" "text",
    "follower_count" integer,
    "following_count" integer,
    "tags" "text"[],
    "total_comments" integer DEFAULT 0,
    "total_dms" integer DEFAULT 0,
    "last_interaction" timestamp with time zone,
    "customer_status" character varying(20) DEFAULT 'active'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "instagram_user_profiles_customer_status_check" CHECK ((("customer_status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'blocked'::character varying])::"text"[])))
);


ALTER TABLE "public"."instagram_user_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."instagram_user_profiles" IS 'Instagram user profiles who interacted with company';



CREATE TABLE IF NOT EXISTS "public"."invoice_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "service_type_id" "uuid",
    "description_tr" "text" NOT NULL,
    "description_en" "text" NOT NULL,
    "quantity" numeric(10,2) DEFAULT 1,
    "unit_price" numeric(10,2) NOT NULL,
    "discount_amount" numeric(10,2) DEFAULT 0,
    "total_amount" numeric(10,2) NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."invoice_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance_windows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scheduled_by" "uuid" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "message_tr" "text" NOT NULL,
    "message_en" "text" NOT NULL,
    "affected_services" "uuid"[],
    "is_active" boolean DEFAULT true,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "maintenance_windows_check" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "public"."maintenance_windows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mobile_app_milestones" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "title" character varying(255) NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "progress" integer DEFAULT 0,
    "notes" "text",
    "completed_date" "date",
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "mobile_app_milestones_progress_check" CHECK ((("progress" >= 0) AND ("progress" <= 100))),
    CONSTRAINT "mobile_app_milestones_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['completed'::character varying, 'in-progress'::character varying, 'pending'::character varying, 'blocked'::character varying])::"text"[])))
);


ALTER TABLE "public"."mobile_app_milestones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mobile_app_projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid",
    "platform" character varying(50) NOT NULL,
    "app_name" character varying(255) NOT NULL,
    "package_name" character varying(255),
    "bundle_id" character varying(255),
    "play_store_status" character varying(50),
    "play_store_url" "text",
    "app_store_status" character varying(50),
    "app_store_url" "text",
    "estimated_completion" "date",
    "overall_progress" integer DEFAULT 0,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "last_update" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "project_name" character varying(255) DEFAULT 'Main App'::character varying,
    "company_service_id" "uuid" NOT NULL,
    CONSTRAINT "mobile_app_projects_app_store_status_check" CHECK ((("app_store_status")::"text" = ANY ((ARRAY['pending'::character varying, 'submitted'::character varying, 'in-review'::character varying, 'approved'::character varying, 'published'::character varying, 'rejected'::character varying])::"text"[]))),
    CONSTRAINT "mobile_app_projects_overall_progress_check" CHECK ((("overall_progress" >= 0) AND ("overall_progress" <= 100))),
    CONSTRAINT "mobile_app_projects_platform_check" CHECK ((("platform")::"text" = ANY ((ARRAY['android'::character varying, 'ios'::character varying, 'both'::character varying])::"text"[]))),
    CONSTRAINT "mobile_app_projects_play_store_status_check" CHECK ((("play_store_status")::"text" = ANY ((ARRAY['pending'::character varying, 'submitted'::character varying, 'in-review'::character varying, 'approved'::character varying, 'published'::character varying, 'rejected'::character varying])::"text"[]))),
    CONSTRAINT "mobile_app_projects_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'paused'::character varying, 'completed'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."mobile_app_projects" OWNER TO "postgres";


COMMENT ON COLUMN "public"."mobile_app_projects"."company_service_id" IS 'Links this project to a specific company service instance. Allows multiple mobile app projects per company.';



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid",
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text" NOT NULL,
    "title_tr" "text" NOT NULL,
    "title_en" "text" NOT NULL,
    "message_tr" "text" NOT NULL,
    "message_en" "text" NOT NULL,
    "action_url" "text",
    "action_label_tr" "text",
    "action_label_en" "text",
    "is_read" boolean DEFAULT false,
    "is_archived" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "read_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    CONSTRAINT "notifications_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['info'::"text", 'warning'::"text", 'error'::"text", 'success'::"text", 'maintenance'::"text", 'billing'::"text", 'feature'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "gateway" "text" NOT NULL,
    "gateway_session_id" "text",
    "gateway_redirect_url" "text",
    "status" "text" DEFAULT 'created'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    CONSTRAINT "payment_sessions_status_check" CHECK (("status" = ANY (ARRAY['created'::"text", 'redirected'::"text", 'completed'::"text", 'expired'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."payment_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_actions_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "photo_id" "uuid",
    "company_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "action_by" "text" NOT NULL,
    "action_by_name" "text",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."photo_actions_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_albums" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "photos_instance_id" "uuid",
    "google_album_id" "text",
    "album_name" "text" NOT NULL,
    "album_description" "text",
    "cover_photo_id" "uuid",
    "cover_photo_url" "text",
    "photos_count" integer DEFAULT 0,
    "created_via_whatsapp" boolean DEFAULT false,
    "customer_phone" "text",
    "is_shared" boolean DEFAULT false,
    "share_link" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."photo_albums" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "photos_instance_id" "uuid",
    "whatsapp_customer_id" "text",
    "whatsapp_session_id" "text",
    "whatsapp_message_id" "text",
    "customer_phone" "text" NOT NULL,
    "customer_name" "text",
    "request_type" "text" NOT NULL,
    "request_text" "text" NOT NULL,
    "ai_parsed_request" "jsonb",
    "ai_confidence" numeric,
    "uploaded_photo_id" "uuid",
    "search_query" "text",
    "search_results_count" integer,
    "search_results" "jsonb",
    "bot_response" "text",
    "n8n_execution_id" "text",
    "status" "text" DEFAULT 'completed'::"text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."photo_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "photos_instance_id" "uuid",
    "google_photo_id" "text" NOT NULL,
    "google_photo_url" "text",
    "thumbnail_url" "text",
    "filename" "text" NOT NULL,
    "file_size_bytes" bigint,
    "mime_type" "text",
    "width" integer,
    "height" integer,
    "description" "text",
    "tags" "text"[],
    "album_id" "uuid",
    "album_name" "text",
    "whatsapp_customer_id" "text",
    "whatsapp_session_id" "text",
    "whatsapp_message_id" "text",
    "customer_phone" "text",
    "customer_name" "text",
    "uploaded_via_whatsapp" boolean DEFAULT false,
    "ai_description" "text",
    "ai_tags" "text"[],
    "ai_objects_detected" "jsonb",
    "ai_text_detected" "text",
    "ai_faces_count" integer DEFAULT 0,
    "latitude" numeric,
    "longitude" numeric,
    "location_name" "text",
    "photo_taken_at" timestamp with time zone,
    "google_uploaded_at" timestamp with time zone,
    "n8n_execution_id" "text",
    "status" "text" DEFAULT 'active'::"text",
    "is_deleted" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photos_instances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "google_photos_email" "text" NOT NULL,
    "google_credentials_encrypted" "text",
    "whatsapp_integration_enabled" boolean DEFAULT true,
    "auto_upload_enabled" boolean DEFAULT true,
    "auto_organize_enabled" boolean DEFAULT true,
    "create_albums_by_date" boolean DEFAULT true,
    "create_albums_by_customer" boolean DEFAULT false,
    "n8n_workflow_id" "text",
    "n8n_webhook_url" "text",
    "status" "text" DEFAULT 'active'::"text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text",
    "updated_by" "text",
    "instance_name" character varying(255) DEFAULT 'Main Photos'::character varying
);


ALTER TABLE "public"."photos_instances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photos_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "metric_date" "date" NOT NULL,
    "photos_uploaded" integer DEFAULT 0,
    "photos_downloaded" integer DEFAULT 0,
    "photos_shared" integer DEFAULT 0,
    "photos_deleted" integer DEFAULT 0,
    "albums_created" integer DEFAULT 0,
    "whatsapp_uploads" integer DEFAULT 0,
    "total_storage_bytes" bigint DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."photos_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "project_type" "text" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "milestone_id" "uuid",
    "milestone_name" "text",
    "file_path" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "mime_type" "text" NOT NULL,
    "file_size" bigint NOT NULL,
    "title" "text",
    "description" "text",
    "display_order" integer DEFAULT 0,
    "is_featured" boolean DEFAULT false,
    "uploaded_by" "uuid" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "project_media_file_type_check" CHECK (("file_type" = ANY (ARRAY['image'::"text", 'video'::"text"]))),
    CONSTRAINT "project_media_project_type_check" CHECK (("project_type" = ANY (ARRAY['website'::"text", 'mobile-app'::"text"])))
);


ALTER TABLE "public"."project_media" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_media" IS 'Stores media (images/videos) for website and mobile app projects';



COMMENT ON COLUMN "public"."project_media"."project_id" IS 'Reference to website_projects or mobile_app_projects';



COMMENT ON COLUMN "public"."project_media"."project_type" IS 'Type of project: website or mobile-app';



COMMENT ON COLUMN "public"."project_media"."milestone_id" IS 'Optional reference to specific milestone';



COMMENT ON COLUMN "public"."project_media"."file_path" IS 'Path in Supabase storage bucket';



COMMENT ON COLUMN "public"."project_media"."display_order" IS 'Order for displaying in gallery (lower = first)';



COMMENT ON COLUMN "public"."project_media"."is_featured" IS 'Mark as featured/highlight image';



CREATE TABLE IF NOT EXISTS "public"."push_notifications_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "notification_id" "uuid",
    "user_id" "uuid",
    "push_token" "text" NOT NULL,
    "status" "text" NOT NULL,
    "error_message" "text",
    "ticket_id" "text",
    "receipt_id" "text",
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "delivered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "push_notifications_log_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'sent'::"text", 'delivered'::"text", 'failed'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."push_notifications_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."push_notifications_log" IS 'Tracks push notification delivery status';



COMMENT ON COLUMN "public"."push_notifications_log"."status" IS 'Status: pending, sent, delivered, failed, error';



COMMENT ON COLUMN "public"."push_notifications_log"."ticket_id" IS 'Expo push notification ticket ID';



COMMENT ON COLUMN "public"."push_notifications_log"."receipt_id" IS 'Expo push notification receipt ID';



CREATE TABLE IF NOT EXISTS "public"."revenue_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_date" "date" NOT NULL,
    "total_revenue" numeric(10,2) DEFAULT 0,
    "recurring_revenue" numeric(10,2) DEFAULT 0,
    "one_time_revenue" numeric(10,2) DEFAULT 0,
    "new_customers" integer DEFAULT 0,
    "churned_customers" integer DEFAULT 0,
    "active_customers" integer DEFAULT 0,
    "revenue_by_service" "jsonb" DEFAULT '{}'::"jsonb",
    "revenue_by_country" "jsonb" DEFAULT '{}'::"jsonb",
    "growth_rate" numeric(5,2),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."revenue_metrics" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."revenue_summary" AS
 SELECT "date_trunc"('month'::"text", ("issue_date")::timestamp with time zone) AS "month",
    "sum"("total_amount") AS "total_revenue_usd",
    "sum"(
        CASE
            WHEN ("status" = 'paid'::"text") THEN "total_amount"
            ELSE (0)::numeric
        END) AS "paid_revenue_usd",
    "sum"(
        CASE
            WHEN ("status" = 'pending'::"text") THEN "total_amount"
            ELSE (0)::numeric
        END) AS "pending_revenue_usd",
    "count"(*) AS "total_invoices",
    "count"(*) FILTER (WHERE ("status" = 'paid'::"text")) AS "paid_invoices",
    "count"(*) FILTER (WHERE ("status" = 'pending'::"text")) AS "pending_invoices",
    "avg"("total_amount") AS "avg_invoice_amount_usd",
    "round"(((("sum"("total_amount") - "lag"("sum"("total_amount")) OVER (ORDER BY ("date_trunc"('month'::"text", ("issue_date")::timestamp with time zone)))) / NULLIF("lag"("sum"("total_amount")) OVER (ORDER BY ("date_trunc"('month'::"text", ("issue_date")::timestamp with time zone))), (0)::numeric)) * (100)::numeric), 2) AS "growth_rate_percent"
   FROM "public"."invoices" "i"
  GROUP BY ("date_trunc"('month'::"text", ("issue_date")::timestamp with time zone))
  ORDER BY ("date_trunc"('month'::"text", ("issue_date")::timestamp with time zone)) DESC;


ALTER VIEW "public"."revenue_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."service_health_status" AS
 SELECT "cs"."id" AS "service_id",
    "cs"."company_id",
    "c"."name" AS "company_name",
    "st"."name_en" AS "service_name",
    "st"."slug" AS "service_slug",
    "cs"."status" AS "service_status",
    "cs"."package",
    "cs"."usage_limits",
    "cs"."current_usage",
        CASE
            WHEN (("cs"."usage_limits" ->> 'messages'::"text") IS NOT NULL) THEN "round"((((("cs"."current_usage" ->> 'messages'::"text"))::numeric / NULLIF((("cs"."usage_limits" ->> 'messages'::"text"))::numeric, (0)::numeric)) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS "usage_percentage",
        CASE
            WHEN ("cs"."status" <> 'active'::"text") THEN 'inactive'::"text"
            WHEN (((("cs"."current_usage" ->> 'messages'::"text"))::numeric / NULLIF((("cs"."usage_limits" ->> 'messages'::"text"))::numeric, (0)::numeric)) > 0.9) THEN 'critical'::"text"
            WHEN (((("cs"."current_usage" ->> 'messages'::"text"))::numeric / NULLIF((("cs"."usage_limits" ->> 'messages'::"text"))::numeric, (0)::numeric)) > 0.7) THEN 'warning'::"text"
            ELSE 'healthy'::"text"
        END AS "health_status",
    "cs"."start_date",
    "cs"."end_date",
    "cs"."next_billing_date"
   FROM (("public"."company_services" "cs"
     JOIN "public"."companies" "c" ON (("c"."id" = "cs"."company_id")))
     JOIN "public"."service_types" "st" ON (("st"."id" = "cs"."service_type_id")));


ALTER VIEW "public"."service_health_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "service_type_id" "uuid" NOT NULL,
    "requested_by" "uuid" NOT NULL,
    "package" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "notes" "text",
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_at" timestamp with time zone,
    "reviewed_by" "uuid",
    CONSTRAINT "service_requests_package_check" CHECK (("package" = ANY (ARRAY['basic'::"text", 'pro'::"text", 'premium'::"text", 'custom'::"text"]))),
    CONSTRAINT "service_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."service_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_suspension_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "service_id" "uuid" NOT NULL,
    "suspended_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "suspended_by" "uuid",
    "suspension_reason" "text" NOT NULL,
    "invoice_id" "uuid",
    "reactivated_at" timestamp with time zone,
    "reactivated_by" "uuid",
    "reactivation_reason" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."service_suspension_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."service_suspension_history" IS 'Service suspension and reactivation log';



COMMENT ON COLUMN "public"."service_suspension_history"."suspended_by" IS 'Profile ID who suspended (NULL = automatic)';



COMMENT ON COLUMN "public"."service_suspension_history"."invoice_id" IS 'Invoice that caused suspension (NULL = manual)';



COMMENT ON COLUMN "public"."service_suspension_history"."reactivated_by" IS 'Profile ID who reactivated (NULL = automatic)';



COMMENT ON COLUMN "public"."service_suspension_history"."is_active" IS 'True if currently suspended';



CREATE TABLE IF NOT EXISTS "public"."service_usage_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "service_type_id" "uuid" NOT NULL,
    "metric_date" "date" NOT NULL,
    "total_requests" integer DEFAULT 0,
    "successful_requests" integer DEFAULT 0,
    "failed_requests" integer DEFAULT 0,
    "avg_response_time_ms" numeric(10,2),
    "p95_response_time_ms" numeric(10,2),
    "p99_response_time_ms" numeric(10,2),
    "bandwidth_used_gb" numeric(10,4) DEFAULT 0,
    "compute_time_seconds" integer DEFAULT 0,
    "usage_percentage" numeric(5,2) DEFAULT 0,
    "estimated_cost" numeric(10,2) DEFAULT 0,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."service_usage_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sheets_access_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "sheets_instance_id" "uuid",
    "action_type" "text",
    "action_by" "text",
    "action_by_name" "text",
    "action_by_role" "text",
    "affected_worksheets" "text"[],
    "rows_affected" integer,
    "query_executed" "text",
    "success" boolean,
    "error_message" "text",
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sheets_access_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sheets_columns_mapping" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "sheets_instance_id" "uuid",
    "worksheet_name" "text" NOT NULL,
    "column_letter" "text" NOT NULL,
    "column_index" integer,
    "column_name" "text" NOT NULL,
    "column_type" "text" NOT NULL,
    "ai_aliases" "text"[],
    "ai_description" "text",
    "format_pattern" "text",
    "is_searchable" boolean DEFAULT true,
    "is_filterable" boolean DEFAULT true,
    "search_weight" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sheets_columns_mapping" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sheets_data_cache" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "sheets_instance_id" "uuid",
    "worksheet_name" "text" NOT NULL,
    "row_number" integer,
    "data_json" "jsonb" NOT NULL,
    "data_text" "text",
    "sheet_row_id" "text",
    "data_hash" "text",
    "search_vector" "tsvector",
    "synced_at" timestamp with time zone DEFAULT "now"(),
    "is_deleted" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sheets_data_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sheets_instances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "google_sheet_id" "text" NOT NULL,
    "google_sheet_name" "text",
    "google_sheet_url" "text",
    "google_service_account_email" "text",
    "google_credentials_encrypted" "text",
    "active_worksheets" "jsonb",
    "data_mapping" "jsonb",
    "auto_sync_enabled" boolean DEFAULT true,
    "sync_interval_minutes" integer DEFAULT 15,
    "last_sync_at" timestamp with time zone,
    "next_sync_at" timestamp with time zone,
    "whatsapp_integration_enabled" boolean DEFAULT true,
    "n8n_workflow_id" "text",
    "n8n_webhook_url" "text",
    "status" "text" DEFAULT 'active'::"text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text",
    "updated_by" "text",
    "instance_name" character varying(255) DEFAULT 'Main Sheets'::character varying
);


ALTER TABLE "public"."sheets_instances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sheets_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "metric_date" "date" NOT NULL,
    "total_queries" integer DEFAULT 0,
    "successful_queries" integer DEFAULT 0,
    "failed_queries" integer DEFAULT 0,
    "found_results" integer DEFAULT 0,
    "not_found_results" integer DEFAULT 0,
    "multiple_results" integer DEFAULT 0,
    "avg_query_duration_ms" integer,
    "avg_search_duration_ms" integer,
    "sync_count" integer DEFAULT 0,
    "rows_synced" integer DEFAULT 0,
    "top_queries" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sheets_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sheets_query_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "sheets_instance_id" "uuid",
    "whatsapp_customer_id" "text",
    "whatsapp_session_id" "text",
    "whatsapp_message_id" "text",
    "customer_phone" "text" NOT NULL,
    "customer_name" "text",
    "query_text" "text" NOT NULL,
    "query_intent" "text",
    "query_language" "text" DEFAULT 'tr'::"text",
    "ai_parsed_query" "jsonb",
    "ai_confidence" numeric,
    "search_results" "jsonb",
    "results_count" integer DEFAULT 0,
    "bot_response" "text",
    "response_type" "text",
    "n8n_execution_id" "text",
    "query_duration_ms" integer,
    "search_duration_ms" integer,
    "status" "text" DEFAULT 'completed'::"text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sheets_query_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sheets_query_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "template_name" "text" NOT NULL,
    "template_description" "text",
    "trigger_keywords" "text"[],
    "sample_questions" "text"[],
    "response_template" "text",
    "sheet_query" "jsonb",
    "usage_count" integer DEFAULT 0,
    "last_used_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sheets_query_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sheets_sync_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "sheets_instance_id" "uuid",
    "sync_type" "text",
    "worksheet_name" "text",
    "rows_synced" integer DEFAULT 0,
    "rows_added" integer DEFAULT 0,
    "rows_updated" integer DEFAULT 0,
    "rows_deleted" integer DEFAULT 0,
    "sync_duration_ms" integer,
    "status" "text",
    "error_message" "text",
    "error_details" "jsonb",
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sheets_sync_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sheets_webhook_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "sheets_instance_id" "uuid",
    "event_type" "text",
    "worksheet_name" "text",
    "affected_rows" "jsonb",
    "change_summary" "text",
    "processed" boolean DEFAULT false,
    "processed_at" timestamp with time zone,
    "n8n_execution_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sheets_webhook_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_sla_config" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "response_time_urgent" integer DEFAULT 3600 NOT NULL,
    "response_time_high" integer DEFAULT 14400 NOT NULL,
    "response_time_medium" integer DEFAULT 28800 NOT NULL,
    "response_time_low" integer DEFAULT 86400 NOT NULL,
    "resolution_time_urgent" integer DEFAULT 14400 NOT NULL,
    "resolution_time_high" integer DEFAULT 86400 NOT NULL,
    "resolution_time_medium" integer DEFAULT 172800 NOT NULL,
    "resolution_time_low" integer DEFAULT 432000 NOT NULL,
    "business_hours_start" time without time zone DEFAULT '09:00:00'::time without time zone,
    "business_hours_end" time without time zone DEFAULT '18:00:00'::time without time zone,
    "business_days" integer[] DEFAULT ARRAY[1, 2, 3, 4, 5],
    "timezone" character varying(50) DEFAULT 'UTC'::character varying,
    "warning_threshold" integer DEFAULT 75,
    "critical_threshold" integer DEFAULT 90,
    "is_active" boolean DEFAULT true,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."support_sla_config" OWNER TO "postgres";


COMMENT ON TABLE "public"."support_sla_config" IS 'SLA configuration for support tickets';



CREATE OR REPLACE VIEW "public"."ticket_sla_status" AS
 SELECT "t"."id" AS "ticket_id",
    "t"."ticket_number",
    "t"."subject",
    "t"."priority",
    "t"."status",
    "t"."company_id",
    "c"."name" AS "company_name",
    "t"."created_at",
    "t"."first_response_at",
    "t"."resolved_at",
        CASE
            WHEN ("t"."first_response_at" IS NOT NULL) THEN (EXTRACT(epoch FROM ("t"."first_response_at" - "t"."created_at")))::integer
            ELSE (EXTRACT(epoch FROM ("now"() - "t"."created_at")))::integer
        END AS "current_response_time",
        CASE
            WHEN ("t"."resolved_at" IS NOT NULL) THEN (EXTRACT(epoch FROM ("t"."resolved_at" - "t"."created_at")))::integer
            ELSE (EXTRACT(epoch FROM ("now"() - "t"."created_at")))::integer
        END AS "current_resolution_time",
        CASE "t"."priority"
            WHEN 'urgent'::"text" THEN "sla"."response_time_urgent"
            WHEN 'high'::"text" THEN "sla"."response_time_high"
            WHEN 'medium'::"text" THEN "sla"."response_time_medium"
            WHEN 'low'::"text" THEN "sla"."response_time_low"
            ELSE NULL::integer
        END AS "response_time_target",
        CASE "t"."priority"
            WHEN 'urgent'::"text" THEN "sla"."resolution_time_urgent"
            WHEN 'high'::"text" THEN "sla"."resolution_time_high"
            WHEN 'medium'::"text" THEN "sla"."resolution_time_medium"
            WHEN 'low'::"text" THEN "sla"."resolution_time_low"
            ELSE NULL::integer
        END AS "resolution_time_target",
        CASE
            WHEN ("t"."first_response_at" IS NULL) THEN
            CASE
                WHEN (EXTRACT(epoch FROM ("now"() - "t"."created_at")) > (
                CASE "t"."priority"
                    WHEN 'urgent'::"text" THEN "sla"."response_time_urgent"
                    WHEN 'high'::"text" THEN "sla"."response_time_high"
                    WHEN 'medium'::"text" THEN "sla"."response_time_medium"
                    WHEN 'low'::"text" THEN "sla"."response_time_low"
                    ELSE NULL::integer
                END)::numeric) THEN 'violated'::"text"
                WHEN (EXTRACT(epoch FROM ("now"() - "t"."created_at")) > (((
                CASE "t"."priority"
                    WHEN 'urgent'::"text" THEN "sla"."response_time_urgent"
                    WHEN 'high'::"text" THEN "sla"."response_time_high"
                    WHEN 'medium'::"text" THEN "sla"."response_time_medium"
                    WHEN 'low'::"text" THEN "sla"."response_time_low"
                    ELSE NULL::integer
                END * "sla"."critical_threshold"))::numeric / 100.0)) THEN 'critical'::"text"
                WHEN (EXTRACT(epoch FROM ("now"() - "t"."created_at")) > (((
                CASE "t"."priority"
                    WHEN 'urgent'::"text" THEN "sla"."response_time_urgent"
                    WHEN 'high'::"text" THEN "sla"."response_time_high"
                    WHEN 'medium'::"text" THEN "sla"."response_time_medium"
                    WHEN 'low'::"text" THEN "sla"."response_time_low"
                    ELSE NULL::integer
                END * "sla"."warning_threshold"))::numeric / 100.0)) THEN 'warning'::"text"
                ELSE 'ok'::"text"
            END
            ELSE 'met'::"text"
        END AS "response_sla_status",
        CASE
            WHEN (("t"."resolved_at" IS NULL) AND ("t"."status" <> ALL (ARRAY['resolved'::"text", 'closed'::"text"]))) THEN
            CASE
                WHEN (EXTRACT(epoch FROM ("now"() - "t"."created_at")) > (
                CASE "t"."priority"
                    WHEN 'urgent'::"text" THEN "sla"."resolution_time_urgent"
                    WHEN 'high'::"text" THEN "sla"."resolution_time_high"
                    WHEN 'medium'::"text" THEN "sla"."resolution_time_medium"
                    WHEN 'low'::"text" THEN "sla"."resolution_time_low"
                    ELSE NULL::integer
                END)::numeric) THEN 'violated'::"text"
                WHEN (EXTRACT(epoch FROM ("now"() - "t"."created_at")) > (((
                CASE "t"."priority"
                    WHEN 'urgent'::"text" THEN "sla"."resolution_time_urgent"
                    WHEN 'high'::"text" THEN "sla"."resolution_time_high"
                    WHEN 'medium'::"text" THEN "sla"."resolution_time_medium"
                    WHEN 'low'::"text" THEN "sla"."resolution_time_low"
                    ELSE NULL::integer
                END * "sla"."critical_threshold"))::numeric / 100.0)) THEN 'critical'::"text"
                WHEN (EXTRACT(epoch FROM ("now"() - "t"."created_at")) > (((
                CASE "t"."priority"
                    WHEN 'urgent'::"text" THEN "sla"."resolution_time_urgent"
                    WHEN 'high'::"text" THEN "sla"."resolution_time_high"
                    WHEN 'medium'::"text" THEN "sla"."resolution_time_medium"
                    WHEN 'low'::"text" THEN "sla"."resolution_time_low"
                    ELSE NULL::integer
                END * "sla"."warning_threshold"))::numeric / 100.0)) THEN 'warning'::"text"
                ELSE 'ok'::"text"
            END
            WHEN ("t"."resolved_at" IS NOT NULL) THEN
            CASE
                WHEN (EXTRACT(epoch FROM ("t"."resolved_at" - "t"."created_at")) <= (
                CASE "t"."priority"
                    WHEN 'urgent'::"text" THEN "sla"."resolution_time_urgent"
                    WHEN 'high'::"text" THEN "sla"."resolution_time_high"
                    WHEN 'medium'::"text" THEN "sla"."resolution_time_medium"
                    WHEN 'low'::"text" THEN "sla"."resolution_time_low"
                    ELSE NULL::integer
                END)::numeric) THEN 'met'::"text"
                ELSE 'violated'::"text"
            END
            ELSE 'ok'::"text"
        END AS "resolution_sla_status"
   FROM (("public"."support_tickets" "t"
     CROSS JOIN "public"."support_sla_config" "sla")
     LEFT JOIN "public"."companies" "c" ON (("c"."id" = "t"."company_id")))
  WHERE (("sla"."is_active" = true) AND ("t"."status" <> 'closed'::"text"));


ALTER VIEW "public"."ticket_sla_status" OWNER TO "postgres";


COMMENT ON VIEW "public"."ticket_sla_status" IS 'Real-time SLA status for all active tickets';



CREATE OR REPLACE VIEW "public"."sla_performance_summary" AS
 SELECT "count"(*) AS "total_tickets",
    "count"(*) FILTER (WHERE ("response_sla_status" = 'met'::"text")) AS "response_met",
    "count"(*) FILTER (WHERE ("response_sla_status" = 'violated'::"text")) AS "response_violated",
    "count"(*) FILTER (WHERE ("resolution_sla_status" = 'met'::"text")) AS "resolution_met",
    "count"(*) FILTER (WHERE ("resolution_sla_status" = 'violated'::"text")) AS "resolution_violated",
    "round"(((("count"(*) FILTER (WHERE ("response_sla_status" = 'met'::"text")))::numeric / (NULLIF("count"(*) FILTER (WHERE ("first_response_at" IS NOT NULL)), 0))::numeric) * (100)::numeric), 2) AS "response_sla_percentage",
    "round"(((("count"(*) FILTER (WHERE ("resolution_sla_status" = 'met'::"text")))::numeric / (NULLIF("count"(*) FILTER (WHERE ("resolved_at" IS NOT NULL)), 0))::numeric) * (100)::numeric), 2) AS "resolution_sla_percentage",
    "round"("avg"("current_response_time") FILTER (WHERE ("first_response_at" IS NOT NULL))) AS "avg_response_time",
    "round"("avg"("current_resolution_time") FILTER (WHERE ("resolved_at" IS NOT NULL))) AS "avg_resolution_time"
   FROM "public"."ticket_sla_status";


ALTER VIEW "public"."sla_performance_summary" OWNER TO "postgres";


COMMENT ON VIEW "public"."sla_performance_summary" IS 'Overall SLA performance metrics';



CREATE TABLE IF NOT EXISTS "public"."support_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "attachments" "text"[] DEFAULT ARRAY[]::"text"[],
    "is_internal" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "edited_at" timestamp with time zone,
    "read_by" "uuid"[] DEFAULT ARRAY[]::"uuid"[]
);


ALTER TABLE "public"."support_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_sla_violations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "sla_config_id" "uuid" NOT NULL,
    "violation_type" character varying(20) NOT NULL,
    "priority" character varying(20) NOT NULL,
    "target_time" integer NOT NULL,
    "actual_time" integer,
    "time_remaining" integer,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "violated_at" timestamp with time zone,
    "resolved_at" timestamp with time zone
);


ALTER TABLE "public"."support_sla_violations" OWNER TO "postgres";


COMMENT ON TABLE "public"."support_sla_violations" IS 'Tracks SLA violations and warnings';



CREATE TABLE IF NOT EXISTS "public"."support_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "subject_tr" "text",
    "subject_en" "text",
    "content_tr" "text" NOT NULL,
    "content_en" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "usage_count" integer DEFAULT 0,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."support_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_ticket_categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "icon" character varying(50),
    "color" character varying(7),
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "parent_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."support_ticket_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."support_ticket_categories" IS 'Categories for organizing support tickets';



COMMENT ON COLUMN "public"."support_ticket_categories"."icon" IS 'Emoji or icon identifier';



COMMENT ON COLUMN "public"."support_ticket_categories"."color" IS 'Hex color code for UI display';



COMMENT ON COLUMN "public"."support_ticket_categories"."parent_id" IS 'Parent category ID for hierarchical structure';



CREATE TABLE IF NOT EXISTS "public"."support_ticket_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "is_internal" boolean DEFAULT false,
    "is_from_support" boolean DEFAULT false,
    "attachments" "jsonb" DEFAULT '[]'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."support_ticket_messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."support_ticket_messages" IS 'Messages/replies for support tickets';



COMMENT ON COLUMN "public"."support_ticket_messages"."is_internal" IS 'Internal notes visible only to support team';



COMMENT ON COLUMN "public"."support_ticket_messages"."is_from_support" IS 'Whether message is from support team or customer';



COMMENT ON COLUMN "public"."support_ticket_messages"."attachments" IS 'Array of file attachments {id, name, url, size, type}';



CREATE OR REPLACE VIEW "public"."support_ticket_summary" AS
 SELECT "st"."company_id",
    "c"."name" AS "company_name",
    "count"(*) FILTER (WHERE ("st"."status" = 'open'::"text")) AS "open_count",
    "count"(*) FILTER (WHERE ("st"."status" = 'in_progress'::"text")) AS "in_progress_count",
    "count"(*) FILTER (WHERE ("st"."status" = 'waiting_customer'::"text")) AS "waiting_customer_count",
    "count"(*) FILTER (WHERE ("st"."status" = 'resolved'::"text")) AS "resolved_count",
    "count"(*) FILTER (WHERE ("st"."status" = 'closed'::"text")) AS "closed_count",
    "count"(*) FILTER (WHERE ("st"."priority" = 'urgent'::"text")) AS "urgent_count",
    "count"(*) FILTER (WHERE ("st"."priority" = 'high'::"text")) AS "high_count",
    "avg"("st"."response_time") AS "avg_response_time",
    "avg"("st"."resolution_time") AS "avg_resolution_time",
    "avg"("st"."satisfaction_rating") FILTER (WHERE ("st"."satisfaction_rating" IS NOT NULL)) AS "avg_satisfaction",
    "max"("st"."updated_at") AS "last_ticket_update"
   FROM ("public"."support_tickets" "st"
     JOIN "public"."companies" "c" ON (("c"."id" = "st"."company_id")))
  GROUP BY "st"."company_id", "c"."name";


ALTER VIEW "public"."support_ticket_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" character varying(50) NOT NULL,
    "title" character varying(255) NOT NULL,
    "message" "text" NOT NULL,
    "icon" character varying(100),
    "action_url" "text",
    "action_label" character varying(100),
    "target_audience" character varying(50) DEFAULT 'all'::character varying NOT NULL,
    "target_company_ids" "uuid"[],
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "system_notifications_target_audience_check" CHECK ((("target_audience")::"text" = ANY ((ARRAY['all'::character varying, 'super_admins'::character varying, 'company_admins'::character varying, 'users'::character varying, 'specific_companies'::character varying])::"text"[]))),
    CONSTRAINT "system_notifications_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['success'::character varying, 'warning'::character varying, 'info'::character varying, 'maintenance'::character varying, 'service'::character varying])::"text"[])))
);


ALTER TABLE "public"."system_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_performance_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_timestamp" timestamp with time zone NOT NULL,
    "total_requests" integer DEFAULT 0,
    "avg_response_time_ms" numeric(10,2),
    "error_rate" numeric(5,2),
    "db_connections" integer DEFAULT 0,
    "db_query_time_ms" numeric(10,2),
    "total_storage_used_gb" numeric(10,2) DEFAULT 0,
    "storage_growth_gb" numeric(10,2) DEFAULT 0,
    "active_users_1h" integer DEFAULT 0,
    "active_users_24h" integer DEFAULT 0,
    "services_status" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."system_performance_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "description" "text",
    "category" "text",
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_encrypted" boolean DEFAULT false,
    "last_updated_by" "uuid"
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."ticket_category_stats" AS
 SELECT "c"."id" AS "category_id",
    "c"."name" AS "category_name",
    "c"."icon" AS "category_icon",
    "c"."color" AS "category_color",
    "count"("t"."id") AS "total_tickets",
    "count"("t"."id") FILTER (WHERE ("t"."status" = 'open'::"text")) AS "open_tickets",
    "count"("t"."id") FILTER (WHERE ("t"."status" = 'in_progress'::"text")) AS "in_progress_tickets",
    "count"("t"."id") FILTER (WHERE ("t"."status" = 'resolved'::"text")) AS "resolved_tickets",
    "count"("t"."id") FILTER (WHERE ("t"."priority" = 'urgent'::"text")) AS "urgent_tickets",
    "avg"("t"."response_time") AS "avg_response_time",
    "avg"("t"."resolution_time") AS "avg_resolution_time",
    "max"("t"."created_at") AS "last_ticket_created"
   FROM ("public"."support_ticket_categories" "c"
     LEFT JOIN "public"."support_tickets" "t" ON (("t"."category_id" = "c"."id")))
  WHERE ("c"."is_active" = true)
  GROUP BY "c"."id", "c"."name", "c"."icon", "c"."color", "c"."sort_order"
  ORDER BY "c"."sort_order";


ALTER VIEW "public"."ticket_category_stats" OWNER TO "postgres";


COMMENT ON VIEW "public"."ticket_category_stats" IS 'Statistics for each ticket category';



CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "gateway" "text" NOT NULL,
    "gateway_transaction_id" "text",
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "error_code" "text",
    "error_message" "text",
    "gateway_response" "jsonb",
    "webhook_signature" "text",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "processed_at" timestamp with time zone,
    CONSTRAINT "transactions_currency_check" CHECK (("currency" = 'USD'::"text")),
    CONSTRAINT "transactions_gateway_check" CHECK (("gateway" = ANY (ARRAY['paytr'::"text", 'stripe'::"text", 'qtap'::"text", 'manual'::"text"]))),
    CONSTRAINT "transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'success'::"text", 'failed'::"text", 'refunded'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "status" "text" DEFAULT 'sent'::"text",
    "invited_by" "uuid",
    "invite_token" "text" DEFAULT "encode"("extensions"."gen_random_bytes"(32), 'hex'::"text") NOT NULL,
    "temporary_password" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "accepted_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_invites_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'company_admin'::"text"]))),
    CONSTRAINT "user_invites_status_check" CHECK (("status" = ANY (ARRAY['sent'::"text", 'accepted'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."user_invites" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_invites" IS 'User invitation tracking for the platform';



CREATE TABLE IF NOT EXISTS "public"."user_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notification_id" "uuid" NOT NULL,
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_service_consents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL,
    "service_type" "text" NOT NULL,
    "consent_given" boolean DEFAULT false NOT NULL,
    "consent_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "consent_version" "text" DEFAULT '1.0'::"text" NOT NULL,
    "ip_address" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_service_consents" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_service_consents" IS 'Tracks user consent for data processing per service (KVKK/GDPR compliance)';



COMMENT ON COLUMN "public"."user_service_consents"."user_id" IS 'User who gave or revoked consent';



COMMENT ON COLUMN "public"."user_service_consents"."company_id" IS 'Company context for the consent';



COMMENT ON COLUMN "public"."user_service_consents"."service_type" IS 'Service type (e.g., whatsapp-automation)';



COMMENT ON COLUMN "public"."user_service_consents"."consent_given" IS 'True if user gave consent, false if revoked/deleted';



COMMENT ON COLUMN "public"."user_service_consents"."consent_date" IS 'When consent was given or revoked';



COMMENT ON COLUMN "public"."user_service_consents"."consent_version" IS 'Version of privacy policy/terms';



COMMENT ON COLUMN "public"."user_service_consents"."ip_address" IS 'IP address when consent was recorded (optional for audit)';



COMMENT ON COLUMN "public"."user_service_consents"."notes" IS 'Additional context (e.g., "User requested data deletion")';



CREATE TABLE IF NOT EXISTS "public"."website_milestones" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "title" character varying(255) NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "progress" integer DEFAULT 0,
    "notes" "text",
    "completed_date" "date",
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "website_milestones_progress_check" CHECK ((("progress" >= 0) AND ("progress" <= 100))),
    CONSTRAINT "website_milestones_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['completed'::character varying, 'in-progress'::character varying, 'pending'::character varying, 'blocked'::character varying])::"text"[])))
);


ALTER TABLE "public"."website_milestones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."website_projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid",
    "project_type" character varying(50) NOT NULL,
    "domain" character varying(255),
    "email" character varying(255),
    "estimated_completion" "date",
    "overall_progress" integer DEFAULT 0,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "last_update" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "project_name" character varying(255) DEFAULT 'Main Website'::character varying,
    "company_service_id" "uuid" NOT NULL,
    CONSTRAINT "website_projects_overall_progress_check" CHECK ((("overall_progress" >= 0) AND ("overall_progress" <= 100))),
    CONSTRAINT "website_projects_project_type_check" CHECK ((("project_type")::"text" = ANY ((ARRAY['e-commerce'::character varying, 'corporate'::character varying, 'personal'::character varying])::"text"[]))),
    CONSTRAINT "website_projects_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'paused'::character varying, 'completed'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."website_projects" OWNER TO "postgres";


COMMENT ON COLUMN "public"."website_projects"."company_service_id" IS 'Links this project to a specific company service instance. Allows multiple website projects per company.';



CREATE TABLE IF NOT EXISTS "public"."whatsapp_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "metric_date" "date" NOT NULL,
    "total_messages" integer DEFAULT 0,
    "customer_messages" integer DEFAULT 0,
    "bot_messages" integer DEFAULT 0,
    "agent_messages" integer DEFAULT 0,
    "new_sessions" integer DEFAULT 0,
    "active_sessions" integer DEFAULT 0,
    "resolved_sessions" integer DEFAULT 0,
    "avg_response_time" interval,
    "avg_session_duration" interval,
    "satisfaction_score" numeric(3,2),
    "resolved_rate" numeric(5,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."whatsapp_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."whatsapp_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "sender" "text" NOT NULL,
    "session_start" timestamp with time zone DEFAULT "now"(),
    "session_end" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_message" "text",
    "last_message_time" timestamp without time zone,
    "unread_count" integer DEFAULT 0,
    "message_count" integer DEFAULT 0,
    "customer_name" character varying,
    "customer_phone" character varying,
    "status" character varying(20) DEFAULT 'active'::character varying,
    CONSTRAINT "whatsapp_sessions_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'closed'::character varying, 'archived'::character varying])::"text"[])))
);


ALTER TABLE "public"."whatsapp_sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."whatsapp_sessions" IS 'Duplicate trigger removed: whatsapp_sessions_updated_at';



COMMENT ON COLUMN "public"."whatsapp_sessions"."last_message" IS 'Last message text for conversation preview';



COMMENT ON COLUMN "public"."whatsapp_sessions"."unread_count" IS 'Number of unread messages from customer';



COMMENT ON COLUMN "public"."whatsapp_sessions"."message_count" IS 'Total messages in this session';



COMMENT ON COLUMN "public"."whatsapp_sessions"."status" IS 'Session status: active, closed, archived';



CREATE TABLE IF NOT EXISTS "public"."whatsapp_user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "phone_number" "text" NOT NULL,
    "name" "text",
    "email" "text",
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "tags" "text"[] DEFAULT ARRAY[]::"text"[],
    "total_messages" integer DEFAULT 0,
    "last_seen" timestamp with time zone,
    "customer_status" "text" DEFAULT 'new'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "whatsapp_user_profiles_customer_status_check" CHECK (("customer_status" = ANY (ARRAY['new'::"text", 'active'::"text", 'inactive'::"text", 'blocked'::"text"])))
);


ALTER TABLE "public"."whatsapp_user_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."whatsapp_user_profiles" IS 'Duplicate trigger removed: whatsapp_users_updated_at';



CREATE OR REPLACE VIEW "public"."whatsapp_analytics_detailed" AS
 SELECT "cs"."company_id",
    "c"."name" AS "company_name",
    COALESCE("wm"."total_messages", 0) AS "messages_today",
    COALESCE("wm"."customer_messages", 0) AS "customer_messages_today",
    COALESCE("wm"."bot_messages", 0) AS "bot_messages_today",
    ( SELECT "count"(*) AS "count"
           FROM "public"."whatsapp_user_profiles" "wup"
          WHERE ("wup"."company_id" = "cs"."company_id")) AS "total_users",
    ( SELECT "count"(*) AS "count"
           FROM "public"."whatsapp_user_profiles" "wup"
          WHERE (("wup"."company_id" = "cs"."company_id") AND ("wup"."customer_status" = 'active'::"text"))) AS "active_users",
    ( SELECT "count"(*) AS "count"
           FROM "public"."whatsapp_sessions" "ws"
          WHERE (("ws"."company_id" = "cs"."company_id") AND ("ws"."is_active" = true))) AS "active_sessions",
    "cs"."package",
    ("cs"."usage_limits" ->> 'messages'::"text") AS "message_limit",
    ("cs"."current_usage" ->> 'messages'::"text") AS "messages_used",
    ("cs"."metadata" ->> 'bot_name'::"text") AS "bot_name",
    ("cs"."metadata" ->> 'instance_id'::"text") AS "instance_id"
   FROM ((("public"."company_services" "cs"
     JOIN "public"."companies" "c" ON (("c"."id" = "cs"."company_id")))
     JOIN "public"."service_types" "st" ON (("st"."id" = "cs"."service_type_id")))
     LEFT JOIN "public"."whatsapp_metrics" "wm" ON ((("wm"."company_id" = "cs"."company_id") AND ("wm"."metric_date" = CURRENT_DATE))))
  WHERE (("st"."slug" = 'whatsapp-automation'::"text") AND ("cs"."status" = 'active'::"text"));


ALTER VIEW "public"."whatsapp_analytics_detailed" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."whatsapp_errors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "instance_id" "text",
    "error_type" "text" NOT NULL,
    "error_message" "text" NOT NULL,
    "error_details" "jsonb" DEFAULT '{}'::"jsonb",
    "node_name" "text",
    "workflow_id" "text",
    "execution_id" "text",
    "user_id" "uuid",
    "session_id" "uuid",
    "phone_number" "text",
    "http_status_code" integer,
    "severity" "text" DEFAULT 'error'::"text",
    "is_resolved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "whatsapp_errors_error_type_check" CHECK (("error_type" = ANY (ARRAY['webhook_error'::"text", 'gemini_api_error'::"text", 'evolution_api_error'::"text", 'database_error'::"text", 'session_error'::"text", 'validation_error'::"text", 'timeout_error'::"text", 'network_error'::"text", 'unknown_error'::"text"]))),
    CONSTRAINT "whatsapp_errors_severity_check" CHECK (("severity" = ANY (ARRAY['warning'::"text", 'error'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."whatsapp_errors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."whatsapp_hourly_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "metric_hour" timestamp with time zone NOT NULL,
    "total_messages" integer DEFAULT 0,
    "customer_messages" integer DEFAULT 0,
    "bot_messages" integer DEFAULT 0,
    "agent_messages" integer DEFAULT 0,
    "new_sessions" integer DEFAULT 0,
    "active_sessions" integer DEFAULT 0,
    "avg_response_time" interval,
    "messages_per_session" numeric(5,2),
    "positive_sentiment" integer DEFAULT 0,
    "neutral_sentiment" integer DEFAULT 0,
    "negative_sentiment" integer DEFAULT 0,
    "intents" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."whatsapp_hourly_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."whatsapp_instances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid",
    "instance_id" character varying NOT NULL,
    "instance_name" character varying,
    "phone_number" character varying,
    "status" character varying DEFAULT 'active'::character varying,
    "qr_code" "text",
    "is_connected" boolean DEFAULT false,
    "last_connected_at" timestamp without time zone,
    "webhook_url" "text",
    "api_key" "text",
    "settings" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "evolution_api_url" "text",
    "evolution_api_key" "text",
    "gemini_api_key" "text",
    "instance_type" "text",
    "ai_system_prompt" "text",
    "ai_settings" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "whatsapp_instances_instance_type_check" CHECK (("instance_type" = ANY (ARRAY['sales'::"text", 'support'::"text", 'general'::"text", 'info'::"text", 'marketing'::"text"])))
);


ALTER TABLE "public"."whatsapp_instances" OWNER TO "postgres";


COMMENT ON TABLE "public"."whatsapp_instances" IS 'WhatsApp instance information for each company';



COMMENT ON COLUMN "public"."whatsapp_instances"."company_id" IS 'Reference to companies table - one instance per company';



COMMENT ON COLUMN "public"."whatsapp_instances"."instance_id" IS 'Unique instance ID from n8n/WhatsApp provider';



COMMENT ON COLUMN "public"."whatsapp_instances"."settings" IS 'JSON settings: bot_name, greeting_message, auto_reply, etc.';



CREATE TABLE IF NOT EXISTS "public"."whatsapp_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "session_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "sender" "text" NOT NULL,
    "sender_name" "text",
    "message_body" "text" NOT NULL,
    "message_owner" "text" NOT NULL,
    "message_type" "text" DEFAULT 'text'::"text",
    "media_url" "text",
    "instance_id" "text",
    "sentiment" "text",
    "intent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "whatsapp_messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['text'::"text", 'image'::"text", 'audio'::"text", 'video'::"text", 'document'::"text", 'location'::"text"]))),
    CONSTRAINT "whatsapp_messages_sender_check" CHECK (("sender" = ANY (ARRAY['customer'::"text", 'bot'::"text", 'agent'::"text"])))
);


ALTER TABLE "public"."whatsapp_messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."whatsapp_messages" IS 'Duplicate trigger removed: whatsapp_messages_updated_at';



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointment_actions_log"
    ADD CONSTRAINT "appointment_actions_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointment_metrics"
    ADD CONSTRAINT "appointment_metrics_company_id_metric_date_key" UNIQUE ("company_id", "metric_date");



ALTER TABLE ONLY "public"."appointment_metrics"
    ADD CONSTRAINT "appointment_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointment_reminders"
    ADD CONSTRAINT "appointment_reminders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointment_requests"
    ADD CONSTRAINT "appointment_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointment_types"
    ADD CONSTRAINT "appointment_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blocked_time_slots"
    ADD CONSTRAINT "blocked_time_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calendar_instances"
    ADD CONSTRAINT "calendar_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calendar_staff"
    ADD CONSTRAINT "calendar_staff_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_daily_metrics"
    ADD CONSTRAINT "company_daily_metrics_company_id_metric_date_key" UNIQUE ("company_id", "metric_date");



ALTER TABLE ONLY "public"."company_daily_metrics"
    ADD CONSTRAINT "company_daily_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_service_pricing"
    ADD CONSTRAINT "company_service_pricing_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_services"
    ADD CONSTRAINT "company_services_company_instance_name_unique" UNIQUE ("company_id", "instance_name");



COMMENT ON CONSTRAINT "company_services_company_instance_name_unique" ON "public"."company_services" IS 'Ensures each service instance has a unique name within a company. Prevents confusion with multiple instances.';



ALTER TABLE ONLY "public"."company_services"
    ADD CONSTRAINT "company_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."docs_instances"
    ADD CONSTRAINT "docs_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."docs_metrics"
    ADD CONSTRAINT "docs_metrics_company_id_metric_date_key" UNIQUE ("company_id", "metric_date");



ALTER TABLE ONLY "public"."docs_metrics"
    ADD CONSTRAINT "docs_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_actions_log"
    ADD CONSTRAINT "document_actions_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_requests"
    ADD CONSTRAINT "document_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_templates"
    ADD CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drive_actions_log"
    ADD CONSTRAINT "drive_actions_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drive_files"
    ADD CONSTRAINT "drive_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drive_folders"
    ADD CONSTRAINT "drive_folders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drive_instances"
    ADD CONSTRAINT "drive_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drive_metrics"
    ADD CONSTRAINT "drive_metrics_company_id_metric_date_key" UNIQUE ("company_id", "metric_date");



ALTER TABLE ONLY "public"."drive_metrics"
    ADD CONSTRAINT "drive_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drive_requests"
    ADD CONSTRAINT "drive_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."generated_documents"
    ADD CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gmail_actions_log"
    ADD CONSTRAINT "gmail_actions_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gmail_instances"
    ADD CONSTRAINT "gmail_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gmail_messages"
    ADD CONSTRAINT "gmail_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gmail_metrics"
    ADD CONSTRAINT "gmail_metrics_company_id_metric_date_key" UNIQUE ("company_id", "metric_date");



ALTER TABLE ONLY "public"."gmail_metrics"
    ADD CONSTRAINT "gmail_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gmail_requests"
    ADD CONSTRAINT "gmail_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gmail_templates"
    ADD CONSTRAINT "gmail_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instagram_comments"
    ADD CONSTRAINT "instagram_comments_comment_id_key" UNIQUE ("comment_id");



ALTER TABLE ONLY "public"."instagram_comments"
    ADD CONSTRAINT "instagram_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instagram_dm_messages"
    ADD CONSTRAINT "instagram_dm_messages_message_id_key" UNIQUE ("message_id");



ALTER TABLE ONLY "public"."instagram_dm_messages"
    ADD CONSTRAINT "instagram_dm_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instagram_dm_sessions"
    ADD CONSTRAINT "instagram_dm_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instagram_hourly_metrics"
    ADD CONSTRAINT "instagram_hourly_metrics_company_id_instance_id_metric_hour_key" UNIQUE ("company_id", "instance_id", "metric_hour");



ALTER TABLE ONLY "public"."instagram_hourly_metrics"
    ADD CONSTRAINT "instagram_hourly_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instagram_instances"
    ADD CONSTRAINT "instagram_instances_instance_id_key" UNIQUE ("instance_id");



ALTER TABLE ONLY "public"."instagram_instances"
    ADD CONSTRAINT "instagram_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instagram_metrics"
    ADD CONSTRAINT "instagram_metrics_company_id_instance_id_metric_date_key" UNIQUE ("company_id", "instance_id", "metric_date");



ALTER TABLE ONLY "public"."instagram_metrics"
    ADD CONSTRAINT "instagram_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instagram_posts"
    ADD CONSTRAINT "instagram_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instagram_posts"
    ADD CONSTRAINT "instagram_posts_post_id_key" UNIQUE ("post_id");



ALTER TABLE ONLY "public"."instagram_user_profiles"
    ADD CONSTRAINT "instagram_user_profiles_company_id_user_id_key" UNIQUE ("company_id", "user_id");



ALTER TABLE ONLY "public"."instagram_user_profiles"
    ADD CONSTRAINT "instagram_user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance_windows"
    ADD CONSTRAINT "maintenance_windows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mobile_app_milestones"
    ADD CONSTRAINT "mobile_app_milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mobile_app_projects"
    ADD CONSTRAINT "mobile_app_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_sessions"
    ADD CONSTRAINT "payment_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_actions_log"
    ADD CONSTRAINT "photo_actions_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_albums"
    ADD CONSTRAINT "photo_albums_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_requests"
    ADD CONSTRAINT "photo_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photos_instances"
    ADD CONSTRAINT "photos_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photos_metrics"
    ADD CONSTRAINT "photos_metrics_company_id_metric_date_key" UNIQUE ("company_id", "metric_date");



ALTER TABLE ONLY "public"."photos_metrics"
    ADD CONSTRAINT "photos_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photos"
    ADD CONSTRAINT "photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_media"
    ADD CONSTRAINT "project_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_notifications_log"
    ADD CONSTRAINT "push_notifications_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."revenue_metrics"
    ADD CONSTRAINT "revenue_metrics_metric_date_key" UNIQUE ("metric_date");



ALTER TABLE ONLY "public"."revenue_metrics"
    ADD CONSTRAINT "revenue_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_suspension_history"
    ADD CONSTRAINT "service_suspension_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_types"
    ADD CONSTRAINT "service_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_types"
    ADD CONSTRAINT "service_types_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."service_usage_metrics"
    ADD CONSTRAINT "service_usage_metrics_company_id_service_type_id_metric_dat_key" UNIQUE ("company_id", "service_type_id", "metric_date");



ALTER TABLE ONLY "public"."service_usage_metrics"
    ADD CONSTRAINT "service_usage_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sheets_access_log"
    ADD CONSTRAINT "sheets_access_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sheets_columns_mapping"
    ADD CONSTRAINT "sheets_columns_mapping_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sheets_data_cache"
    ADD CONSTRAINT "sheets_data_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sheets_instances"
    ADD CONSTRAINT "sheets_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sheets_metrics"
    ADD CONSTRAINT "sheets_metrics_company_id_metric_date_key" UNIQUE ("company_id", "metric_date");



ALTER TABLE ONLY "public"."sheets_metrics"
    ADD CONSTRAINT "sheets_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sheets_query_log"
    ADD CONSTRAINT "sheets_query_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sheets_query_templates"
    ADD CONSTRAINT "sheets_query_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sheets_sync_history"
    ADD CONSTRAINT "sheets_sync_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sheets_webhook_events"
    ADD CONSTRAINT "sheets_webhook_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_messages"
    ADD CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_sla_config"
    ADD CONSTRAINT "support_sla_config_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."support_sla_config"
    ADD CONSTRAINT "support_sla_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_sla_violations"
    ADD CONSTRAINT "support_sla_violations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_templates"
    ADD CONSTRAINT "support_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_ticket_categories"
    ADD CONSTRAINT "support_ticket_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."support_ticket_categories"
    ADD CONSTRAINT "support_ticket_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_ticket_messages"
    ADD CONSTRAINT "support_ticket_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_ticket_number_key" UNIQUE ("ticket_number");



ALTER TABLE ONLY "public"."system_notifications"
    ADD CONSTRAINT "system_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_performance_metrics"
    ADD CONSTRAINT "system_performance_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_gateway_transaction_id_key" UNIQUE ("gateway_transaction_id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calendar_instances"
    ADD CONSTRAINT "unique_company_calendar_instance" UNIQUE ("company_id", "instance_name");



ALTER TABLE ONLY "public"."docs_instances"
    ADD CONSTRAINT "unique_company_docs_instance" UNIQUE ("company_id", "instance_name");



ALTER TABLE ONLY "public"."drive_instances"
    ADD CONSTRAINT "unique_company_drive_instance" UNIQUE ("company_id", "instance_name");



ALTER TABLE ONLY "public"."gmail_instances"
    ADD CONSTRAINT "unique_company_gmail_instance" UNIQUE ("company_id", "instance_name");



ALTER TABLE ONLY "public"."instagram_instances"
    ADD CONSTRAINT "unique_company_instagram_username" UNIQUE ("company_id", "username");



ALTER TABLE ONLY "public"."mobile_app_projects"
    ADD CONSTRAINT "unique_company_mobile_project" UNIQUE ("company_id", "project_name");



ALTER TABLE ONLY "public"."photos_instances"
    ADD CONSTRAINT "unique_company_photos_instance" UNIQUE ("company_id", "instance_name");



ALTER TABLE ONLY "public"."company_service_pricing"
    ADD CONSTRAINT "unique_company_service_package" UNIQUE ("company_id", "service_type_id", "package");



ALTER TABLE ONLY "public"."sheets_instances"
    ADD CONSTRAINT "unique_company_sheets_instance" UNIQUE ("company_id", "instance_name");



ALTER TABLE ONLY "public"."website_projects"
    ADD CONSTRAINT "unique_company_website_project" UNIQUE ("company_id", "project_name");



ALTER TABLE ONLY "public"."whatsapp_instances"
    ADD CONSTRAINT "unique_company_whatsapp_phone" UNIQUE ("company_id", "phone_number");



ALTER TABLE ONLY "public"."whatsapp_hourly_metrics"
    ADD CONSTRAINT "unique_whatsapp_hourly_metrics_company_hour" UNIQUE ("company_id", "metric_hour");



ALTER TABLE ONLY "public"."whatsapp_instances"
    ADD CONSTRAINT "unique_whatsapp_instance_id" UNIQUE ("instance_id");



ALTER TABLE ONLY "public"."whatsapp_metrics"
    ADD CONSTRAINT "unique_whatsapp_metrics_company_date" UNIQUE ("company_id", "metric_date");



ALTER TABLE ONLY "public"."user_invites"
    ADD CONSTRAINT "user_invites_invite_token_key" UNIQUE ("invite_token");



ALTER TABLE ONLY "public"."user_invites"
    ADD CONSTRAINT "user_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_user_id_notification_id_key" UNIQUE ("user_id", "notification_id");



ALTER TABLE ONLY "public"."user_service_consents"
    ADD CONSTRAINT "user_service_consents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."website_milestones"
    ADD CONSTRAINT "website_milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."website_projects"
    ADD CONSTRAINT "website_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_errors"
    ADD CONSTRAINT "whatsapp_errors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_hourly_metrics"
    ADD CONSTRAINT "whatsapp_hourly_metrics_company_id_metric_hour_key" UNIQUE ("company_id", "metric_hour");



ALTER TABLE ONLY "public"."whatsapp_hourly_metrics"
    ADD CONSTRAINT "whatsapp_hourly_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_instances"
    ADD CONSTRAINT "whatsapp_instances_instance_id_key" UNIQUE ("instance_id");



ALTER TABLE ONLY "public"."whatsapp_instances"
    ADD CONSTRAINT "whatsapp_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_messages"
    ADD CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_metrics"
    ADD CONSTRAINT "whatsapp_metrics_company_id_metric_date_key" UNIQUE ("company_id", "metric_date");



ALTER TABLE ONLY "public"."whatsapp_metrics"
    ADD CONSTRAINT "whatsapp_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_sessions"
    ADD CONSTRAINT "whatsapp_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_user_profiles"
    ADD CONSTRAINT "whatsapp_user_profiles_company_id_phone_number_key" UNIQUE ("company_id", "phone_number");



ALTER TABLE ONLY "public"."whatsapp_user_profiles"
    ADD CONSTRAINT "whatsapp_user_profiles_company_phone_unique" UNIQUE ("company_id", "phone_number");



ALTER TABLE ONLY "public"."whatsapp_user_profiles"
    ADD CONSTRAINT "whatsapp_user_profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activity_logs_action" ON "public"."activity_logs" USING "btree" ("action");



CREATE INDEX "idx_activity_logs_action_date" ON "public"."activity_logs" USING "btree" ("action_category", "created_at" DESC);



CREATE INDEX "idx_activity_logs_browser" ON "public"."activity_logs" USING "btree" ("browser");



CREATE INDEX "idx_activity_logs_category" ON "public"."activity_logs" USING "btree" ("action_category");



CREATE INDEX "idx_activity_logs_changed_data" ON "public"."activity_logs" USING "gin" ("changed_data");



CREATE INDEX "idx_activity_logs_company" ON "public"."activity_logs" USING "btree" ("company_id");



CREATE INDEX "idx_activity_logs_company_created" ON "public"."activity_logs" USING "btree" ("company_id", "created_at" DESC);



CREATE INDEX "idx_activity_logs_company_date" ON "public"."activity_logs" USING "btree" ("company_id", "created_at" DESC);



CREATE INDEX "idx_activity_logs_company_id" ON "public"."activity_logs" USING "btree" ("company_id");



CREATE INDEX "idx_activity_logs_created" ON "public"."activity_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_activity_logs_created_at" ON "public"."activity_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_activity_logs_device" ON "public"."activity_logs" USING "btree" ("device_type");



CREATE INDEX "idx_activity_logs_entity" ON "public"."activity_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_activity_logs_location" ON "public"."activity_logs" USING "gin" ("location_data");



CREATE INDEX "idx_activity_logs_session" ON "public"."activity_logs" USING "btree" ("session_id");



CREATE INDEX "idx_activity_logs_severity" ON "public"."activity_logs" USING "btree" ("severity_level");



CREATE INDEX "idx_activity_logs_status" ON "public"."activity_logs" USING "btree" ("status");



CREATE INDEX "idx_activity_logs_status_date" ON "public"."activity_logs" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_activity_logs_tags" ON "public"."activity_logs" USING "gin" ("tags");



CREATE INDEX "idx_activity_logs_user" ON "public"."activity_logs" USING "btree" ("user_id");



CREATE INDEX "idx_activity_logs_user_date" ON "public"."activity_logs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_activity_logs_user_id" ON "public"."activity_logs" USING "btree" ("user_id");



CREATE INDEX "idx_appointment_actions_log_appointment" ON "public"."appointment_actions_log" USING "btree" ("appointment_id");



CREATE INDEX "idx_appointment_actions_log_company" ON "public"."appointment_actions_log" USING "btree" ("company_id");



CREATE INDEX "idx_appointment_metrics_company_date" ON "public"."appointment_metrics" USING "btree" ("company_id", "metric_date");



CREATE INDEX "idx_appointment_requests_company" ON "public"."appointment_requests" USING "btree" ("company_id");



CREATE INDEX "idx_appointment_requests_customer_phone" ON "public"."appointment_requests" USING "btree" ("customer_phone");



CREATE INDEX "idx_appointment_requests_date" ON "public"."appointment_requests" USING "btree" ("requested_date");



CREATE INDEX "idx_appointment_requests_status" ON "public"."appointment_requests" USING "btree" ("status");



CREATE INDEX "idx_appointment_requests_whatsapp_session" ON "public"."appointment_requests" USING "btree" ("whatsapp_session_id");



CREATE INDEX "idx_appointment_types_company" ON "public"."appointment_types" USING "btree" ("company_id");



CREATE INDEX "idx_blocked_slots_company_date" ON "public"."blocked_time_slots" USING "btree" ("company_id", "blocked_date");



CREATE INDEX "idx_calendar_staff_active" ON "public"."calendar_staff" USING "btree" ("is_active");



CREATE INDEX "idx_calendar_staff_company" ON "public"."calendar_staff" USING "btree" ("company_id");



CREATE INDEX "idx_companies_country" ON "public"."companies" USING "btree" ("country");



CREATE INDEX "idx_companies_name_search" ON "public"."companies" USING "gin" ("to_tsvector"('"english"'::"regconfig", "name"));



CREATE INDEX "idx_companies_status" ON "public"."companies" USING "btree" ("status");



CREATE INDEX "idx_company_daily_metrics_company" ON "public"."company_daily_metrics" USING "btree" ("company_id");



CREATE INDEX "idx_company_daily_metrics_company_date" ON "public"."company_daily_metrics" USING "btree" ("company_id", "metric_date" DESC);



CREATE INDEX "idx_company_daily_metrics_date" ON "public"."company_daily_metrics" USING "btree" ("metric_date" DESC);



CREATE INDEX "idx_company_service_pricing_active" ON "public"."company_service_pricing" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_company_service_pricing_company" ON "public"."company_service_pricing" USING "btree" ("company_id");



CREATE INDEX "idx_company_service_pricing_service" ON "public"."company_service_pricing" USING "btree" ("service_type_id");



CREATE INDEX "idx_company_services_active" ON "public"."company_services" USING "btree" ("company_id", "status") WHERE ("status" = 'active'::"text");



CREATE INDEX "idx_company_services_company" ON "public"."company_services" USING "btree" ("company_id");



CREATE INDEX "idx_company_services_company_id" ON "public"."company_services" USING "btree" ("company_id");



CREATE INDEX "idx_company_services_company_service_type" ON "public"."company_services" USING "btree" ("company_id", "service_type_id");



COMMENT ON INDEX "public"."idx_company_services_company_service_type" IS 'Improves performance for queries fetching services by company and service type';



CREATE INDEX "idx_company_services_company_status" ON "public"."company_services" USING "btree" ("company_id", "status");



CREATE INDEX "idx_company_services_next_billing" ON "public"."company_services" USING "btree" ("next_billing_date") WHERE (("next_billing_date" IS NOT NULL) AND ("status" = 'active'::"text"));



CREATE INDEX "idx_company_services_service_type" ON "public"."company_services" USING "btree" ("service_type_id");



CREATE INDEX "idx_company_services_service_type_id" ON "public"."company_services" USING "btree" ("service_type_id");



CREATE INDEX "idx_company_services_status" ON "public"."company_services" USING "btree" ("status");



CREATE INDEX "idx_docs_instances_company" ON "public"."docs_instances" USING "btree" ("company_id");



CREATE INDEX "idx_document_requests_company" ON "public"."document_requests" USING "btree" ("company_id");



CREATE INDEX "idx_drive_files_company" ON "public"."drive_files" USING "btree" ("company_id");



CREATE INDEX "idx_drive_files_google_id" ON "public"."drive_files" USING "btree" ("google_file_id");



CREATE INDEX "idx_drive_files_name" ON "public"."drive_files" USING "btree" ("google_file_name");



CREATE INDEX "idx_drive_files_whatsapp" ON "public"."drive_files" USING "btree" ("whatsapp_session_id");



CREATE INDEX "idx_drive_instances_company" ON "public"."drive_instances" USING "btree" ("company_id");



CREATE INDEX "idx_drive_requests_company" ON "public"."drive_requests" USING "btree" ("company_id");



CREATE INDEX "idx_errors_company" ON "public"."whatsapp_errors" USING "btree" ("company_id");



CREATE INDEX "idx_errors_created" ON "public"."whatsapp_errors" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_errors_instance" ON "public"."whatsapp_errors" USING "btree" ("instance_id");



CREATE INDEX "idx_generated_documents_company" ON "public"."generated_documents" USING "btree" ("company_id");



CREATE INDEX "idx_generated_documents_google_id" ON "public"."generated_documents" USING "btree" ("google_doc_id");



CREATE INDEX "idx_generated_documents_whatsapp" ON "public"."generated_documents" USING "btree" ("whatsapp_session_id");



CREATE INDEX "idx_gmail_instances_company" ON "public"."gmail_instances" USING "btree" ("company_id");



CREATE INDEX "idx_gmail_messages_company" ON "public"."gmail_messages" USING "btree" ("company_id");



CREATE INDEX "idx_gmail_messages_gmail_id" ON "public"."gmail_messages" USING "btree" ("gmail_message_id");



CREATE INDEX "idx_gmail_messages_thread" ON "public"."gmail_messages" USING "btree" ("gmail_thread_id");



CREATE INDEX "idx_gmail_messages_whatsapp" ON "public"."gmail_messages" USING "btree" ("whatsapp_session_id");



CREATE INDEX "idx_gmail_requests_company" ON "public"."gmail_requests" USING "btree" ("company_id");



CREATE INDEX "idx_gmail_requests_whatsapp" ON "public"."gmail_requests" USING "btree" ("whatsapp_session_id");



CREATE INDEX "idx_hourly_metrics_company_hour" ON "public"."whatsapp_hourly_metrics" USING "btree" ("company_id", "metric_hour" DESC);



CREATE INDEX "idx_hourly_metrics_hour" ON "public"."whatsapp_hourly_metrics" USING "btree" ("metric_hour" DESC);



CREATE INDEX "idx_instagram_comments_comment_id" ON "public"."instagram_comments" USING "btree" ("comment_id");



CREATE INDEX "idx_instagram_comments_company" ON "public"."instagram_comments" USING "btree" ("company_id");



CREATE INDEX "idx_instagram_comments_company_id" ON "public"."instagram_comments" USING "btree" ("company_id");



CREATE INDEX "idx_instagram_comments_created_at" ON "public"."instagram_comments" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_instagram_comments_instance" ON "public"."instagram_comments" USING "btree" ("instance_id");



CREATE INDEX "idx_instagram_comments_post" ON "public"."instagram_comments" USING "btree" ("post_id");



CREATE INDEX "idx_instagram_comments_post_id" ON "public"."instagram_comments" USING "btree" ("post_id");



CREATE INDEX "idx_instagram_comments_sentiment" ON "public"."instagram_comments" USING "btree" ("sentiment");



CREATE INDEX "idx_instagram_dm_messages_company" ON "public"."instagram_dm_messages" USING "btree" ("company_id");



CREATE INDEX "idx_instagram_dm_messages_company_id" ON "public"."instagram_dm_messages" USING "btree" ("company_id");



CREATE INDEX "idx_instagram_dm_messages_session" ON "public"."instagram_dm_messages" USING "btree" ("session_id", "timestamp" DESC);



CREATE INDEX "idx_instagram_dm_messages_session_id" ON "public"."instagram_dm_messages" USING "btree" ("session_id");



CREATE INDEX "idx_instagram_dm_messages_timestamp" ON "public"."instagram_dm_messages" USING "btree" ("timestamp" DESC);



CREATE INDEX "idx_instagram_dm_sessions_active" ON "public"."instagram_dm_sessions" USING "btree" ("company_id", "is_active");



CREATE INDEX "idx_instagram_dm_sessions_company" ON "public"."instagram_dm_sessions" USING "btree" ("company_id");



CREATE INDEX "idx_instagram_dm_sessions_company_id" ON "public"."instagram_dm_sessions" USING "btree" ("company_id");



CREATE INDEX "idx_instagram_dm_sessions_instance" ON "public"."instagram_dm_sessions" USING "btree" ("instance_id");



CREATE INDEX "idx_instagram_dm_sessions_instance_id" ON "public"."instagram_dm_sessions" USING "btree" ("instance_id");



CREATE INDEX "idx_instagram_dm_sessions_last_message" ON "public"."instagram_dm_sessions" USING "btree" ("last_message_time" DESC);



CREATE INDEX "idx_instagram_dm_sessions_user" ON "public"."instagram_dm_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_instagram_hourly_metrics_company_hour" ON "public"."instagram_hourly_metrics" USING "btree" ("company_id", "metric_hour" DESC);



CREATE INDEX "idx_instagram_instances_company" ON "public"."instagram_instances" USING "btree" ("company_id");



CREATE INDEX "idx_instagram_instances_company_id" ON "public"."instagram_instances" USING "btree" ("company_id");



CREATE INDEX "idx_instagram_instances_status" ON "public"."instagram_instances" USING "btree" ("status");



CREATE INDEX "idx_instagram_instances_username" ON "public"."instagram_instances" USING "btree" ("username");



CREATE INDEX "idx_instagram_metrics_company_date" ON "public"."instagram_metrics" USING "btree" ("company_id", "metric_date" DESC);



CREATE INDEX "idx_instagram_metrics_date" ON "public"."instagram_metrics" USING "btree" ("metric_date" DESC);



CREATE INDEX "idx_instagram_posts_company" ON "public"."instagram_posts" USING "btree" ("company_id");



CREATE INDEX "idx_instagram_posts_company_id" ON "public"."instagram_posts" USING "btree" ("company_id");



CREATE INDEX "idx_instagram_posts_instance" ON "public"."instagram_posts" USING "btree" ("instance_id");



CREATE INDEX "idx_instagram_posts_instance_id" ON "public"."instagram_posts" USING "btree" ("instance_id");



CREATE INDEX "idx_instagram_posts_post_id" ON "public"."instagram_posts" USING "btree" ("post_id");



CREATE INDEX "idx_instagram_posts_posted_at" ON "public"."instagram_posts" USING "btree" ("posted_at" DESC);



CREATE INDEX "idx_instagram_user_profiles_company_user" ON "public"."instagram_user_profiles" USING "btree" ("company_id", "user_id");



CREATE INDEX "idx_instagram_user_profiles_last_interaction" ON "public"."instagram_user_profiles" USING "btree" ("last_interaction" DESC);



CREATE INDEX "idx_instagram_user_profiles_username" ON "public"."instagram_user_profiles" USING "btree" ("username");



CREATE INDEX "idx_invoice_items_invoice" ON "public"."invoice_items" USING "btree" ("invoice_id");



CREATE INDEX "idx_invoice_items_invoice_id" ON "public"."invoice_items" USING "btree" ("invoice_id");



CREATE INDEX "idx_invoice_items_service" ON "public"."invoice_items" USING "btree" ("service_type_id");



CREATE INDEX "idx_invoice_items_service_type_id" ON "public"."invoice_items" USING "btree" ("service_type_id");



CREATE INDEX "idx_invoices_company" ON "public"."invoices" USING "btree" ("company_id");



CREATE INDEX "idx_invoices_company_date" ON "public"."invoices" USING "btree" ("company_id", "issue_date" DESC);



CREATE INDEX "idx_invoices_company_id" ON "public"."invoices" USING "btree" ("company_id");



CREATE INDEX "idx_invoices_company_status" ON "public"."invoices" USING "btree" ("company_id", "status");



CREATE INDEX "idx_invoices_due_date" ON "public"."invoices" USING "btree" ("due_date");



CREATE INDEX "idx_invoices_gateway_payment" ON "public"."invoices" USING "btree" ("gateway_payment_id");



CREATE INDEX "idx_invoices_number" ON "public"."invoices" USING "btree" ("invoice_number");



CREATE INDEX "idx_invoices_overdue_suspension" ON "public"."invoices" USING "btree" ("status", "due_date", "auto_suspend_on_overdue") WHERE (("auto_suspend_on_overdue" = true) AND ("status" <> 'paid'::"text"));



CREATE INDEX "idx_invoices_paid_at" ON "public"."invoices" USING "btree" ("paid_at") WHERE ("paid_at" IS NOT NULL);



CREATE INDEX "idx_invoices_status" ON "public"."invoices" USING "btree" ("status");



CREATE INDEX "idx_maintenance_active" ON "public"."maintenance_windows" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_maintenance_scheduled_by" ON "public"."maintenance_windows" USING "btree" ("scheduled_by");



CREATE INDEX "idx_maintenance_timerange" ON "public"."maintenance_windows" USING "btree" ("start_time", "end_time");



CREATE INDEX "idx_maintenance_windows_end_time" ON "public"."maintenance_windows" USING "btree" ("end_time");



CREATE INDEX "idx_maintenance_windows_is_active" ON "public"."maintenance_windows" USING "btree" ("is_active");



CREATE INDEX "idx_maintenance_windows_scheduled_by" ON "public"."maintenance_windows" USING "btree" ("scheduled_by");



CREATE INDEX "idx_maintenance_windows_start_time" ON "public"."maintenance_windows" USING "btree" ("start_time");



CREATE INDEX "idx_maintenance_windows_time_range" ON "public"."maintenance_windows" USING "btree" ("start_time", "end_time");



CREATE INDEX "idx_messages_company_time" ON "public"."whatsapp_messages" USING "btree" ("company_id", "created_at" DESC);



CREATE INDEX "idx_messages_owner" ON "public"."whatsapp_messages" USING "btree" ("message_owner");



CREATE INDEX "idx_messages_sender" ON "public"."whatsapp_messages" USING "btree" ("sender");



CREATE INDEX "idx_messages_session_time" ON "public"."whatsapp_messages" USING "btree" ("session_id", "created_at" DESC);



CREATE INDEX "idx_metrics_company_date" ON "public"."whatsapp_metrics" USING "btree" ("company_id", "metric_date" DESC);



CREATE INDEX "idx_metrics_date" ON "public"."whatsapp_metrics" USING "btree" ("metric_date" DESC);



CREATE INDEX "idx_mobile_app_milestones_project" ON "public"."mobile_app_milestones" USING "btree" ("project_id");



CREATE INDEX "idx_mobile_app_milestones_project_id" ON "public"."mobile_app_milestones" USING "btree" ("project_id");



CREATE INDEX "idx_mobile_app_projects_company" ON "public"."mobile_app_projects" USING "btree" ("company_id");



CREATE INDEX "idx_mobile_app_projects_company_id" ON "public"."mobile_app_projects" USING "btree" ("company_id");



CREATE INDEX "idx_mobile_app_projects_company_service_id" ON "public"."mobile_app_projects" USING "btree" ("company_service_id");



CREATE INDEX "idx_mobile_app_projects_status" ON "public"."mobile_app_projects" USING "btree" ("status");



CREATE INDEX "idx_notifications_company" ON "public"."notifications" USING "btree" ("company_id");



CREATE INDEX "idx_notifications_company_id" ON "public"."notifications" USING "btree" ("company_id");



CREATE INDEX "idx_notifications_created" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_notifications_unread" ON "public"."notifications" USING "btree" ("is_read") WHERE ("is_read" = false);



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_payment_sessions_gateway_session" ON "public"."payment_sessions" USING "btree" ("gateway_session_id");



CREATE INDEX "idx_payment_sessions_invoice" ON "public"."payment_sessions" USING "btree" ("invoice_id");



CREATE INDEX "idx_payment_sessions_status" ON "public"."payment_sessions" USING "btree" ("status");



CREATE INDEX "idx_photo_albums_company" ON "public"."photo_albums" USING "btree" ("company_id");



CREATE INDEX "idx_photo_requests_company" ON "public"."photo_requests" USING "btree" ("company_id");



CREATE INDEX "idx_photos_company" ON "public"."photos" USING "btree" ("company_id");



CREATE INDEX "idx_photos_google_id" ON "public"."photos" USING "btree" ("google_photo_id");



CREATE INDEX "idx_photos_instances_company" ON "public"."photos_instances" USING "btree" ("company_id");



CREATE INDEX "idx_photos_tags" ON "public"."photos" USING "gin" ("tags");



CREATE INDEX "idx_photos_whatsapp" ON "public"."photos" USING "btree" ("whatsapp_session_id");



CREATE INDEX "idx_profiles_company_id" ON "public"."profiles" USING "btree" ("company_id");



CREATE INDEX "idx_profiles_last_login" ON "public"."profiles" USING "btree" ("last_login" DESC NULLS LAST);



CREATE INDEX "idx_profiles_must_change_password" ON "public"."profiles" USING "btree" ("must_change_password") WHERE ("must_change_password" = true);



CREATE INDEX "idx_profiles_push_token" ON "public"."profiles" USING "btree" ("push_token") WHERE (("push_token" IS NOT NULL) AND ("push_enabled" = true));



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_project_media_company" ON "public"."project_media" USING "btree" ("company_id");



CREATE INDEX "idx_project_media_milestone" ON "public"."project_media" USING "btree" ("milestone_id");



CREATE INDEX "idx_project_media_order" ON "public"."project_media" USING "btree" ("display_order");



CREATE INDEX "idx_project_media_project" ON "public"."project_media" USING "btree" ("project_id", "project_type");



CREATE INDEX "idx_project_media_type" ON "public"."project_media" USING "btree" ("file_type");



CREATE INDEX "idx_push_log_notification_id" ON "public"."push_notifications_log" USING "btree" ("notification_id");



CREATE INDEX "idx_push_log_sent_at" ON "public"."push_notifications_log" USING "btree" ("sent_at" DESC);



CREATE INDEX "idx_push_log_status" ON "public"."push_notifications_log" USING "btree" ("status");



CREATE INDEX "idx_push_log_user_id" ON "public"."push_notifications_log" USING "btree" ("user_id");



CREATE INDEX "idx_revenue_metrics_date" ON "public"."revenue_metrics" USING "btree" ("metric_date" DESC);



CREATE INDEX "idx_service_requests_company_id" ON "public"."service_requests" USING "btree" ("company_id");



CREATE INDEX "idx_service_requests_company_status" ON "public"."service_requests" USING "btree" ("company_id", "status");



CREATE INDEX "idx_service_requests_requested_by" ON "public"."service_requests" USING "btree" ("requested_by");



CREATE INDEX "idx_service_requests_service_type_id" ON "public"."service_requests" USING "btree" ("service_type_id");



CREATE INDEX "idx_service_requests_status" ON "public"."service_requests" USING "btree" ("status");



CREATE INDEX "idx_service_types_active" ON "public"."service_types" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_service_types_category" ON "public"."service_types" USING "btree" ("category");



CREATE INDEX "idx_service_types_featured" ON "public"."service_types" USING "btree" ("is_featured");



CREATE INDEX "idx_service_types_status" ON "public"."service_types" USING "btree" ("status");



CREATE INDEX "idx_service_types_updated_at" ON "public"."service_types" USING "btree" ("updated_at");



CREATE INDEX "idx_service_usage_company" ON "public"."service_usage_metrics" USING "btree" ("company_id");



CREATE INDEX "idx_service_usage_company_service" ON "public"."service_usage_metrics" USING "btree" ("company_id", "service_type_id");



CREATE INDEX "idx_service_usage_date" ON "public"."service_usage_metrics" USING "btree" ("metric_date" DESC);



CREATE INDEX "idx_service_usage_service" ON "public"."service_usage_metrics" USING "btree" ("service_type_id");



CREATE INDEX "idx_sessions_company_active" ON "public"."whatsapp_sessions" USING "btree" ("company_id", "is_active");



CREATE INDEX "idx_sessions_company_status" ON "public"."whatsapp_sessions" USING "btree" ("company_id", "status");



CREATE INDEX "idx_sessions_customer_phone" ON "public"."whatsapp_sessions" USING "btree" ("customer_phone");



CREATE INDEX "idx_sessions_last_message_time" ON "public"."whatsapp_sessions" USING "btree" ("last_message_time" DESC);



CREATE INDEX "idx_sheets_columns_mapping_company" ON "public"."sheets_columns_mapping" USING "btree" ("company_id");



CREATE INDEX "idx_sheets_columns_mapping_sheet" ON "public"."sheets_columns_mapping" USING "btree" ("worksheet_name");



CREATE INDEX "idx_sheets_data_cache_company" ON "public"."sheets_data_cache" USING "btree" ("company_id");



CREATE INDEX "idx_sheets_data_cache_data" ON "public"."sheets_data_cache" USING "gin" ("data_json");



CREATE INDEX "idx_sheets_data_cache_search" ON "public"."sheets_data_cache" USING "gin" ("search_vector");



CREATE INDEX "idx_sheets_data_cache_text_search" ON "public"."sheets_data_cache" USING "gin" ("to_tsvector"('"turkish"'::"regconfig", "data_text"));



CREATE INDEX "idx_sheets_data_cache_worksheet" ON "public"."sheets_data_cache" USING "btree" ("worksheet_name");



CREATE INDEX "idx_sheets_instances_company" ON "public"."sheets_instances" USING "btree" ("company_id");



CREATE INDEX "idx_sheets_instances_status" ON "public"."sheets_instances" USING "btree" ("status");



CREATE INDEX "idx_sheets_metrics_company_date" ON "public"."sheets_metrics" USING "btree" ("company_id", "metric_date");



CREATE INDEX "idx_sheets_query_log_company" ON "public"."sheets_query_log" USING "btree" ("company_id");



CREATE INDEX "idx_sheets_query_log_created" ON "public"."sheets_query_log" USING "btree" ("created_at");



CREATE INDEX "idx_sheets_query_log_whatsapp_session" ON "public"."sheets_query_log" USING "btree" ("whatsapp_session_id");



CREATE INDEX "idx_sheets_sync_history_company" ON "public"."sheets_sync_history" USING "btree" ("company_id");



CREATE INDEX "idx_sheets_sync_history_created" ON "public"."sheets_sync_history" USING "btree" ("created_at");



CREATE INDEX "idx_sla_violations_status" ON "public"."support_sla_violations" USING "btree" ("status");



CREATE INDEX "idx_sla_violations_ticket_id" ON "public"."support_sla_violations" USING "btree" ("ticket_id");



CREATE INDEX "idx_sla_violations_type" ON "public"."support_sla_violations" USING "btree" ("violation_type");



CREATE INDEX "idx_support_messages_created" ON "public"."support_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_support_messages_internal" ON "public"."support_messages" USING "btree" ("is_internal") WHERE ("is_internal" = false);



CREATE INDEX "idx_support_messages_sender" ON "public"."support_messages" USING "btree" ("sender_id");



CREATE INDEX "idx_support_messages_sender_id" ON "public"."support_messages" USING "btree" ("sender_id");



CREATE INDEX "idx_support_messages_ticket" ON "public"."support_messages" USING "btree" ("ticket_id");



CREATE INDEX "idx_support_messages_ticket_id" ON "public"."support_messages" USING "btree" ("ticket_id");



CREATE INDEX "idx_support_templates_active" ON "public"."support_templates" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_support_templates_category" ON "public"."support_templates" USING "btree" ("category");



CREATE INDEX "idx_support_ticket_messages_sender_id" ON "public"."support_ticket_messages" USING "btree" ("sender_id");



CREATE INDEX "idx_support_ticket_messages_ticket_id" ON "public"."support_ticket_messages" USING "btree" ("ticket_id");



CREATE INDEX "idx_support_tickets_assigned" ON "public"."support_tickets" USING "btree" ("assigned_to");



CREATE INDEX "idx_support_tickets_assigned_to" ON "public"."support_tickets" USING "btree" ("assigned_to");



CREATE INDEX "idx_support_tickets_company" ON "public"."support_tickets" USING "btree" ("company_id");



CREATE INDEX "idx_support_tickets_company_id" ON "public"."support_tickets" USING "btree" ("company_id");



CREATE INDEX "idx_support_tickets_company_priority" ON "public"."support_tickets" USING "btree" ("company_id", "priority");



CREATE INDEX "idx_support_tickets_company_status" ON "public"."support_tickets" USING "btree" ("company_id", "status");



CREATE INDEX "idx_support_tickets_created_at" ON "public"."support_tickets" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_support_tickets_created_by" ON "public"."support_tickets" USING "btree" ("created_by");



CREATE INDEX "idx_support_tickets_description_search" ON "public"."support_tickets" USING "gin" ("to_tsvector"('"english"'::"regconfig", "description"));



CREATE INDEX "idx_support_tickets_number" ON "public"."support_tickets" USING "btree" ("ticket_number");



CREATE INDEX "idx_support_tickets_priority" ON "public"."support_tickets" USING "btree" ("priority");



CREATE INDEX "idx_support_tickets_service" ON "public"."support_tickets" USING "btree" ("service_type_id");



CREATE INDEX "idx_support_tickets_status" ON "public"."support_tickets" USING "btree" ("status");



CREATE INDEX "idx_support_tickets_subject_search" ON "public"."support_tickets" USING "gin" ("to_tsvector"('"english"'::"regconfig", "subject"));



CREATE INDEX "idx_suspension_history_active" ON "public"."service_suspension_history" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_suspension_history_company" ON "public"."service_suspension_history" USING "btree" ("company_id");



CREATE INDEX "idx_suspension_history_company_service_active" ON "public"."service_suspension_history" USING "btree" ("company_id", "service_id", "is_active");



CREATE INDEX "idx_suspension_history_invoice" ON "public"."service_suspension_history" USING "btree" ("invoice_id") WHERE ("invoice_id" IS NOT NULL);



CREATE INDEX "idx_suspension_history_service" ON "public"."service_suspension_history" USING "btree" ("service_id");



CREATE INDEX "idx_suspension_history_suspended_by" ON "public"."service_suspension_history" USING "btree" ("suspended_by") WHERE ("suspended_by" IS NOT NULL);



CREATE INDEX "idx_system_notifications_created_at" ON "public"."system_notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_system_notifications_deleted_at" ON "public"."system_notifications" USING "btree" ("deleted_at");



CREATE INDEX "idx_system_notifications_is_active" ON "public"."system_notifications" USING "btree" ("is_active");



CREATE INDEX "idx_system_notifications_target_audience" ON "public"."system_notifications" USING "btree" ("target_audience");



CREATE INDEX "idx_system_notifications_type" ON "public"."system_notifications" USING "btree" ("type");



CREATE INDEX "idx_system_performance_timestamp" ON "public"."system_performance_metrics" USING "btree" ("metric_timestamp" DESC);



CREATE INDEX "idx_system_settings_category" ON "public"."system_settings" USING "btree" ("category");



CREATE INDEX "idx_system_settings_key" ON "public"."system_settings" USING "btree" ("key");



CREATE INDEX "idx_system_settings_public" ON "public"."system_settings" USING "btree" ("is_public") WHERE ("is_public" = true);



CREATE INDEX "idx_ticket_categories_active" ON "public"."support_ticket_categories" USING "btree" ("is_active");



CREATE INDEX "idx_ticket_categories_parent_id" ON "public"."support_ticket_categories" USING "btree" ("parent_id");



CREATE INDEX "idx_ticket_categories_sort_order" ON "public"."support_ticket_categories" USING "btree" ("sort_order");



CREATE INDEX "idx_ticket_messages_created_at" ON "public"."support_ticket_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_ticket_messages_sender_id" ON "public"."support_ticket_messages" USING "btree" ("sender_id");



CREATE INDEX "idx_ticket_messages_ticket_id" ON "public"."support_ticket_messages" USING "btree" ("ticket_id");



CREATE INDEX "idx_tickets_category_id" ON "public"."support_tickets" USING "btree" ("category_id");



CREATE INDEX "idx_transactions_company" ON "public"."transactions" USING "btree" ("company_id");



CREATE INDEX "idx_transactions_company_id" ON "public"."transactions" USING "btree" ("company_id");



CREATE INDEX "idx_transactions_company_status" ON "public"."transactions" USING "btree" ("company_id", "status");



CREATE INDEX "idx_transactions_gateway_id" ON "public"."transactions" USING "btree" ("gateway_transaction_id");



CREATE INDEX "idx_transactions_invoice" ON "public"."transactions" USING "btree" ("invoice_id");



CREATE INDEX "idx_transactions_invoice_id" ON "public"."transactions" USING "btree" ("invoice_id");



CREATE INDEX "idx_transactions_status" ON "public"."transactions" USING "btree" ("status");



CREATE INDEX "idx_user_invites_company" ON "public"."user_invites" USING "btree" ("company_id");



CREATE INDEX "idx_user_invites_email" ON "public"."user_invites" USING "btree" ("email");



CREATE INDEX "idx_user_invites_status" ON "public"."user_invites" USING "btree" ("status");



CREATE INDEX "idx_user_invites_token" ON "public"."user_invites" USING "btree" ("invite_token");



CREATE INDEX "idx_user_notifications_created_at" ON "public"."user_notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_user_notifications_is_read" ON "public"."user_notifications" USING "btree" ("is_read");



CREATE INDEX "idx_user_notifications_notification_id" ON "public"."user_notifications" USING "btree" ("notification_id");



CREATE INDEX "idx_user_notifications_user_id" ON "public"."user_notifications" USING "btree" ("user_id");



CREATE INDEX "idx_user_profiles_company_phone" ON "public"."whatsapp_user_profiles" USING "btree" ("company_id", "phone_number");



CREATE INDEX "idx_user_profiles_last_seen" ON "public"."whatsapp_user_profiles" USING "btree" ("last_seen" DESC);



CREATE INDEX "idx_user_service_consents_company_id" ON "public"."user_service_consents" USING "btree" ("company_id");



CREATE INDEX "idx_user_service_consents_service_type" ON "public"."user_service_consents" USING "btree" ("service_type");



CREATE INDEX "idx_user_service_consents_user_id" ON "public"."user_service_consents" USING "btree" ("user_id");



CREATE INDEX "idx_user_service_consents_user_service" ON "public"."user_service_consents" USING "btree" ("user_id", "service_type");



CREATE INDEX "idx_website_milestones_project" ON "public"."website_milestones" USING "btree" ("project_id");



CREATE INDEX "idx_website_milestones_project_id" ON "public"."website_milestones" USING "btree" ("project_id");



CREATE INDEX "idx_website_milestones_status" ON "public"."website_milestones" USING "btree" ("status");



CREATE INDEX "idx_website_projects_company" ON "public"."website_projects" USING "btree" ("company_id");



CREATE INDEX "idx_website_projects_company_id" ON "public"."website_projects" USING "btree" ("company_id");



CREATE INDEX "idx_website_projects_company_service_id" ON "public"."website_projects" USING "btree" ("company_service_id");



CREATE INDEX "idx_website_projects_status" ON "public"."website_projects" USING "btree" ("status");



CREATE INDEX "idx_whatsapp_errors_company" ON "public"."whatsapp_errors" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_errors_error_details" ON "public"."whatsapp_errors" USING "gin" ("error_details");



CREATE INDEX "idx_whatsapp_errors_is_resolved" ON "public"."whatsapp_errors" USING "btree" ("is_resolved") WHERE ("is_resolved" = false);



CREATE INDEX "idx_whatsapp_errors_severity" ON "public"."whatsapp_errors" USING "btree" ("severity");



CREATE INDEX "idx_whatsapp_hourly_company" ON "public"."whatsapp_hourly_metrics" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_hourly_company_hour" ON "public"."whatsapp_hourly_metrics" USING "btree" ("company_id", "metric_hour" DESC);



CREATE INDEX "idx_whatsapp_hourly_hour" ON "public"."whatsapp_hourly_metrics" USING "btree" ("metric_hour" DESC);



CREATE INDEX "idx_whatsapp_hourly_metrics_company_id" ON "public"."whatsapp_hourly_metrics" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_hourly_metrics_hour" ON "public"."whatsapp_hourly_metrics" USING "btree" ("metric_hour" DESC);



CREATE INDEX "idx_whatsapp_hourly_metrics_intents" ON "public"."whatsapp_hourly_metrics" USING "gin" ("intents");



CREATE INDEX "idx_whatsapp_hourly_metrics_metadata" ON "public"."whatsapp_hourly_metrics" USING "gin" ("metadata");



CREATE INDEX "idx_whatsapp_instances_ai_settings" ON "public"."whatsapp_instances" USING "gin" ("ai_settings");



CREATE INDEX "idx_whatsapp_instances_company" ON "public"."whatsapp_instances" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_instances_company_id" ON "public"."whatsapp_instances" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_instances_instance" ON "public"."whatsapp_instances" USING "btree" ("instance_id");



CREATE INDEX "idx_whatsapp_instances_instance_id" ON "public"."whatsapp_instances" USING "btree" ("instance_id");



CREATE INDEX "idx_whatsapp_instances_settings" ON "public"."whatsapp_instances" USING "gin" ("settings");



CREATE INDEX "idx_whatsapp_instances_status" ON "public"."whatsapp_instances" USING "btree" ("status");



CREATE INDEX "idx_whatsapp_instances_type" ON "public"."whatsapp_instances" USING "btree" ("instance_type");



CREATE INDEX "idx_whatsapp_messages_company" ON "public"."whatsapp_messages" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_messages_company_date" ON "public"."whatsapp_messages" USING "btree" ("company_id", "created_at" DESC);



CREATE INDEX "idx_whatsapp_messages_company_id" ON "public"."whatsapp_messages" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_messages_created" ON "public"."whatsapp_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_whatsapp_messages_created_at" ON "public"."whatsapp_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_whatsapp_messages_message_body_trgm" ON "public"."whatsapp_messages" USING "gin" ("message_body" "public"."gin_trgm_ops");



CREATE INDEX "idx_whatsapp_messages_message_type" ON "public"."whatsapp_messages" USING "btree" ("message_type");



CREATE INDEX "idx_whatsapp_messages_sender" ON "public"."whatsapp_messages" USING "btree" ("sender");



CREATE INDEX "idx_whatsapp_messages_session" ON "public"."whatsapp_messages" USING "btree" ("session_id");



CREATE INDEX "idx_whatsapp_messages_session_created" ON "public"."whatsapp_messages" USING "btree" ("session_id", "created_at" DESC);



CREATE INDEX "idx_whatsapp_messages_session_id" ON "public"."whatsapp_messages" USING "btree" ("session_id");



CREATE INDEX "idx_whatsapp_messages_user" ON "public"."whatsapp_messages" USING "btree" ("user_id");



CREATE INDEX "idx_whatsapp_metrics_company" ON "public"."whatsapp_metrics" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_metrics_company_id" ON "public"."whatsapp_metrics" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_metrics_date" ON "public"."whatsapp_metrics" USING "btree" ("metric_date" DESC);



CREATE INDEX "idx_whatsapp_sessions_active" ON "public"."whatsapp_sessions" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_whatsapp_sessions_company" ON "public"."whatsapp_sessions" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_sessions_company_active" ON "public"."whatsapp_sessions" USING "btree" ("company_id", "is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_whatsapp_sessions_company_id" ON "public"."whatsapp_sessions" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_sessions_context" ON "public"."whatsapp_sessions" USING "gin" ("context");



CREATE INDEX "idx_whatsapp_sessions_last_message_time" ON "public"."whatsapp_sessions" USING "btree" ("last_message_time" DESC);



CREATE INDEX "idx_whatsapp_sessions_start" ON "public"."whatsapp_sessions" USING "btree" ("session_start" DESC);



CREATE INDEX "idx_whatsapp_sessions_status" ON "public"."whatsapp_sessions" USING "btree" ("status");



CREATE INDEX "idx_whatsapp_sessions_user" ON "public"."whatsapp_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_whatsapp_sessions_user_id" ON "public"."whatsapp_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_whatsapp_user_profiles_company_id" ON "public"."whatsapp_user_profiles" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_user_profiles_company_phone" ON "public"."whatsapp_user_profiles" USING "btree" ("company_id", "phone_number");



CREATE INDEX "idx_whatsapp_user_profiles_last_seen" ON "public"."whatsapp_user_profiles" USING "btree" ("last_seen" DESC);



CREATE INDEX "idx_whatsapp_user_profiles_name_trgm" ON "public"."whatsapp_user_profiles" USING "gin" ("name" "public"."gin_trgm_ops");



CREATE INDEX "idx_whatsapp_user_profiles_phone" ON "public"."whatsapp_user_profiles" USING "btree" ("company_id", "phone_number");



CREATE INDEX "idx_whatsapp_user_profiles_preferences" ON "public"."whatsapp_user_profiles" USING "gin" ("preferences");



CREATE INDEX "idx_whatsapp_user_profiles_status" ON "public"."whatsapp_user_profiles" USING "btree" ("customer_status");



CREATE INDEX "idx_whatsapp_user_profiles_tags" ON "public"."whatsapp_user_profiles" USING "gin" ("tags");



CREATE INDEX "idx_whatsapp_users_company" ON "public"."whatsapp_user_profiles" USING "btree" ("company_id");



CREATE INDEX "idx_whatsapp_users_company_phone" ON "public"."whatsapp_user_profiles" USING "btree" ("company_id", "phone_number");



CREATE INDEX "idx_whatsapp_users_last_seen" ON "public"."whatsapp_user_profiles" USING "btree" ("last_seen" DESC);



CREATE INDEX "idx_whatsapp_users_phone" ON "public"."whatsapp_user_profiles" USING "btree" ("phone_number");



CREATE INDEX "idx_whatsapp_users_status" ON "public"."whatsapp_user_profiles" USING "btree" ("customer_status");



CREATE OR REPLACE TRIGGER "calculate_invoice_totals_trigger" BEFORE INSERT OR UPDATE ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_invoice_totals"();



CREATE OR REPLACE TRIGGER "companies_updated_at" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "company_services_updated_at" BEFORE UPDATE ON "public"."company_services" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "delete_auth_user_trigger" AFTER DELETE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."delete_auth_user"();



CREATE OR REPLACE TRIGGER "enforce_usd_invoices" BEFORE INSERT OR UPDATE ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."validate_usd_only"();



CREATE OR REPLACE TRIGGER "enforce_usd_services" BEFORE INSERT OR UPDATE ON "public"."company_services" FOR EACH ROW EXECUTE FUNCTION "public"."validate_usd_only"();



CREATE OR REPLACE TRIGGER "enforce_usd_transactions" BEFORE INSERT OR UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."validate_usd_only"();



CREATE OR REPLACE TRIGGER "generate_invoice_number_trigger" BEFORE INSERT ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."generate_invoice_number"();



CREATE OR REPLACE TRIGGER "generate_ticket_number_trigger" BEFORE INSERT ON "public"."support_tickets" FOR EACH ROW EXECUTE FUNCTION "public"."generate_ticket_number"();



CREATE OR REPLACE TRIGGER "invoices_updated_at" BEFORE UPDATE ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "maintenance_windows_updated_at" BEFORE UPDATE ON "public"."maintenance_windows" FOR EACH ROW EXECUTE FUNCTION "public"."update_maintenance_windows_updated_at"();



CREATE OR REPLACE TRIGGER "on_service_request_approved" AFTER UPDATE ON "public"."service_requests" FOR EACH ROW EXECUTE FUNCTION "public"."auto_create_company_service"();



CREATE OR REPLACE TRIGGER "profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "push_notifications_log_updated_at" BEFORE UPDATE ON "public"."push_notifications_log" FOR EACH ROW EXECUTE FUNCTION "public"."update_push_notifications_log_updated_at"();



CREATE OR REPLACE TRIGGER "support_templates_updated_at" BEFORE UPDATE ON "public"."support_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "support_tickets_updated_at" BEFORE UPDATE ON "public"."support_tickets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "system_settings_updated_at" BEFORE UPDATE ON "public"."system_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_system_settings_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_calculate_ticket_times" BEFORE UPDATE ON "public"."support_tickets" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_ticket_times"();



CREATE OR REPLACE TRIGGER "trigger_company_service_pricing_updated_at" BEFORE UPDATE ON "public"."company_service_pricing" FOR EACH ROW EXECUTE FUNCTION "public"."update_company_service_pricing_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_company_services_updated_at" BEFORE UPDATE ON "public"."company_services" FOR EACH ROW EXECUTE FUNCTION "public"."update_company_services_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_create_user_notifications" AFTER INSERT ON "public"."system_notifications" FOR EACH ROW WHEN ((("new"."is_active" = true) AND ("new"."deleted_at" IS NULL))) EXECUTE FUNCTION "public"."create_user_notifications_for_new_system_notification"();



CREATE OR REPLACE TRIGGER "trigger_set_invoice_payment_gateway" BEFORE INSERT OR UPDATE ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."set_invoice_payment_gateway"();



CREATE OR REPLACE TRIGGER "trigger_set_payment_gateway" BEFORE INSERT OR UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."set_payment_gateway_by_country"();



CREATE OR REPLACE TRIGGER "trigger_update_service_types_updated_at" BEFORE UPDATE ON "public"."service_types" FOR EACH ROW EXECUTE FUNCTION "public"."update_service_types_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_suspension_history_updated_at" BEFORE UPDATE ON "public"."service_suspension_history" FOR EACH ROW EXECUTE FUNCTION "public"."update_suspension_history_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_system_notifications_updated_at" BEFORE UPDATE ON "public"."system_notifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_system_notifications_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_ticket_categories_updated_at" BEFORE UPDATE ON "public"."support_ticket_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_ticket_categories_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_ticket_messages_updated_at" BEFORE UPDATE ON "public"."support_ticket_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_ticket_messages_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_ticket_on_message" AFTER INSERT ON "public"."support_ticket_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_ticket_on_message"();



CREATE OR REPLACE TRIGGER "update_instagram_comments_updated_at" BEFORE UPDATE ON "public"."instagram_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_instagram_dm_sessions_updated_at" BEFORE UPDATE ON "public"."instagram_dm_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_instagram_instances_updated_at" BEFORE UPDATE ON "public"."instagram_instances" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_instagram_posts_updated_at" BEFORE UPDATE ON "public"."instagram_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_instagram_user_profiles_updated_at" BEFORE UPDATE ON "public"."instagram_user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_invoice_on_transaction_trigger" AFTER INSERT OR UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_invoice_on_transaction"();



CREATE OR REPLACE TRIGGER "update_mobile_app_milestones_updated_at" BEFORE UPDATE ON "public"."mobile_app_milestones" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_mobile_app_projects_updated_at" BEFORE UPDATE ON "public"."mobile_app_projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_project_media_updated_at_trigger" BEFORE UPDATE ON "public"."project_media" FOR EACH ROW EXECUTE FUNCTION "public"."update_project_media_updated_at"();



CREATE OR REPLACE TRIGGER "update_ticket_first_response_trigger" AFTER INSERT ON "public"."support_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_ticket_first_response"();



CREATE OR REPLACE TRIGGER "update_ticket_resolution_time_trigger" BEFORE UPDATE ON "public"."support_tickets" FOR EACH ROW EXECUTE FUNCTION "public"."update_ticket_resolution_time"();



CREATE OR REPLACE TRIGGER "update_user_message_count" AFTER INSERT ON "public"."whatsapp_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_message_count"();



CREATE OR REPLACE TRIGGER "update_user_service_consents_updated_at_trigger" BEFORE UPDATE ON "public"."user_service_consents" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_service_consents_updated_at"();



CREATE OR REPLACE TRIGGER "update_website_milestones_updated_at" BEFORE UPDATE ON "public"."website_milestones" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_website_projects_updated_at" BEFORE UPDATE ON "public"."website_projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_whatsapp_instances_updated_at" BEFORE UPDATE ON "public"."whatsapp_instances" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_whatsapp_messages_updated_at" BEFORE UPDATE ON "public"."whatsapp_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_whatsapp_sessions_updated_at" BEFORE UPDATE ON "public"."whatsapp_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_whatsapp_user_profiles_updated_at" BEFORE UPDATE ON "public"."whatsapp_user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "user_invites_updated_at" BEFORE UPDATE ON "public"."user_invites" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_invites_updated_at"();



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appointment_actions_log"
    ADD CONSTRAINT "appointment_actions_log_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_reminders"
    ADD CONSTRAINT "appointment_reminders_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blocked_time_slots"
    ADD CONSTRAINT "blocked_time_slots_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."calendar_staff"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_daily_metrics"
    ADD CONSTRAINT "company_daily_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_service_pricing"
    ADD CONSTRAINT "company_service_pricing_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_service_pricing"
    ADD CONSTRAINT "company_service_pricing_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_services"
    ADD CONSTRAINT "company_services_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



COMMENT ON CONSTRAINT "company_services_company_id_fkey" ON "public"."company_services" IS 'CASCADE delete: When a company is deleted, all its service instances are automatically removed';



ALTER TABLE ONLY "public"."company_services"
    ADD CONSTRAINT "company_services_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_types"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



COMMENT ON CONSTRAINT "company_services_service_type_id_fkey" ON "public"."company_services" IS 'RESTRICT delete: Prevents deletion of service types that are actively used by companies';



ALTER TABLE ONLY "public"."document_actions_log"
    ADD CONSTRAINT "document_actions_log_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."generated_documents"("id");



ALTER TABLE ONLY "public"."document_requests"
    ADD CONSTRAINT "document_requests_docs_instance_id_fkey" FOREIGN KEY ("docs_instance_id") REFERENCES "public"."docs_instances"("id");



ALTER TABLE ONLY "public"."document_requests"
    ADD CONSTRAINT "document_requests_generated_document_id_fkey" FOREIGN KEY ("generated_document_id") REFERENCES "public"."generated_documents"("id");



ALTER TABLE ONLY "public"."drive_actions_log"
    ADD CONSTRAINT "drive_actions_log_drive_file_id_fkey" FOREIGN KEY ("drive_file_id") REFERENCES "public"."drive_files"("id");



ALTER TABLE ONLY "public"."drive_files"
    ADD CONSTRAINT "drive_files_drive_instance_id_fkey" FOREIGN KEY ("drive_instance_id") REFERENCES "public"."drive_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."drive_folders"
    ADD CONSTRAINT "drive_folders_drive_instance_id_fkey" FOREIGN KEY ("drive_instance_id") REFERENCES "public"."drive_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."drive_requests"
    ADD CONSTRAINT "drive_requests_drive_instance_id_fkey" FOREIGN KEY ("drive_instance_id") REFERENCES "public"."drive_instances"("id");



ALTER TABLE ONLY "public"."drive_requests"
    ADD CONSTRAINT "drive_requests_uploaded_file_id_fkey" FOREIGN KEY ("uploaded_file_id") REFERENCES "public"."drive_files"("id");



ALTER TABLE ONLY "public"."appointment_actions_log"
    ADD CONSTRAINT "fk_appointment_actions_log_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_metrics"
    ADD CONSTRAINT "fk_appointment_metrics_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_reminders"
    ADD CONSTRAINT "fk_appointment_reminders_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_requests"
    ADD CONSTRAINT "fk_appointment_requests_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_types"
    ADD CONSTRAINT "fk_appointment_types_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blocked_time_slots"
    ADD CONSTRAINT "fk_blocked_time_slots_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calendar_instances"
    ADD CONSTRAINT "fk_calendar_instances_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calendar_staff"
    ADD CONSTRAINT "fk_calendar_staff_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."docs_instances"
    ADD CONSTRAINT "fk_docs_instances_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."docs_metrics"
    ADD CONSTRAINT "fk_docs_metrics_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_actions_log"
    ADD CONSTRAINT "fk_document_actions_log_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_requests"
    ADD CONSTRAINT "fk_document_requests_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_templates"
    ADD CONSTRAINT "fk_document_templates_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."drive_actions_log"
    ADD CONSTRAINT "fk_drive_actions_log_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."drive_files"
    ADD CONSTRAINT "fk_drive_files_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."drive_folders"
    ADD CONSTRAINT "fk_drive_folders_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."drive_instances"
    ADD CONSTRAINT "fk_drive_instances_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."drive_metrics"
    ADD CONSTRAINT "fk_drive_metrics_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."drive_requests"
    ADD CONSTRAINT "fk_drive_requests_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."generated_documents"
    ADD CONSTRAINT "fk_generated_documents_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gmail_actions_log"
    ADD CONSTRAINT "fk_gmail_actions_log_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gmail_instances"
    ADD CONSTRAINT "fk_gmail_instances_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gmail_messages"
    ADD CONSTRAINT "fk_gmail_messages_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gmail_metrics"
    ADD CONSTRAINT "fk_gmail_metrics_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gmail_requests"
    ADD CONSTRAINT "fk_gmail_requests_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gmail_templates"
    ADD CONSTRAINT "fk_gmail_templates_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_actions_log"
    ADD CONSTRAINT "fk_photo_actions_log_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_albums"
    ADD CONSTRAINT "fk_photo_albums_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_requests"
    ADD CONSTRAINT "fk_photo_requests_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photos"
    ADD CONSTRAINT "fk_photos_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photos_instances"
    ADD CONSTRAINT "fk_photos_instances_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photos_metrics"
    ADD CONSTRAINT "fk_photos_metrics_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_ticket_messages"
    ADD CONSTRAINT "fk_sender" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."sheets_access_log"
    ADD CONSTRAINT "fk_sheets_access_log_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sheets_columns_mapping"
    ADD CONSTRAINT "fk_sheets_columns_mapping_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sheets_data_cache"
    ADD CONSTRAINT "fk_sheets_data_cache_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sheets_instances"
    ADD CONSTRAINT "fk_sheets_instances_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sheets_metrics"
    ADD CONSTRAINT "fk_sheets_metrics_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sheets_query_log"
    ADD CONSTRAINT "fk_sheets_query_log_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sheets_query_templates"
    ADD CONSTRAINT "fk_sheets_query_templates_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sheets_sync_history"
    ADD CONSTRAINT "fk_sheets_sync_history_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sheets_webhook_events"
    ADD CONSTRAINT "fk_sheets_webhook_events_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_ticket_messages"
    ADD CONSTRAINT "fk_ticket" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id");



ALTER TABLE ONLY "public"."generated_documents"
    ADD CONSTRAINT "generated_documents_docs_instance_id_fkey" FOREIGN KEY ("docs_instance_id") REFERENCES "public"."docs_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gmail_actions_log"
    ADD CONSTRAINT "gmail_actions_log_gmail_message_id_fkey" FOREIGN KEY ("gmail_message_id") REFERENCES "public"."gmail_messages"("id");



ALTER TABLE ONLY "public"."gmail_messages"
    ADD CONSTRAINT "gmail_messages_gmail_instance_id_fkey" FOREIGN KEY ("gmail_instance_id") REFERENCES "public"."gmail_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gmail_requests"
    ADD CONSTRAINT "gmail_requests_gmail_instance_id_fkey" FOREIGN KEY ("gmail_instance_id") REFERENCES "public"."gmail_instances"("id");



ALTER TABLE ONLY "public"."gmail_requests"
    ADD CONSTRAINT "gmail_requests_gmail_message_id_fkey" FOREIGN KEY ("gmail_message_id") REFERENCES "public"."gmail_messages"("id");



ALTER TABLE ONLY "public"."instagram_comments"
    ADD CONSTRAINT "instagram_comments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_comments"
    ADD CONSTRAINT "instagram_comments_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."instagram_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_comments"
    ADD CONSTRAINT "instagram_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."instagram_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_dm_messages"
    ADD CONSTRAINT "instagram_dm_messages_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_dm_messages"
    ADD CONSTRAINT "instagram_dm_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."instagram_dm_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_dm_sessions"
    ADD CONSTRAINT "instagram_dm_sessions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_dm_sessions"
    ADD CONSTRAINT "instagram_dm_sessions_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."instagram_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_hourly_metrics"
    ADD CONSTRAINT "instagram_hourly_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_hourly_metrics"
    ADD CONSTRAINT "instagram_hourly_metrics_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."instagram_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_instances"
    ADD CONSTRAINT "instagram_instances_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_metrics"
    ADD CONSTRAINT "instagram_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_metrics"
    ADD CONSTRAINT "instagram_metrics_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."instagram_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_posts"
    ADD CONSTRAINT "instagram_posts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_posts"
    ADD CONSTRAINT "instagram_posts_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "public"."instagram_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."instagram_user_profiles"
    ADD CONSTRAINT "instagram_user_profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_types"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."maintenance_windows"
    ADD CONSTRAINT "maintenance_windows_scheduled_by_fkey" FOREIGN KEY ("scheduled_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mobile_app_milestones"
    ADD CONSTRAINT "mobile_app_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."mobile_app_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mobile_app_projects"
    ADD CONSTRAINT "mobile_app_projects_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mobile_app_projects"
    ADD CONSTRAINT "mobile_app_projects_company_service_id_fkey" FOREIGN KEY ("company_service_id") REFERENCES "public"."company_services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_sessions"
    ADD CONSTRAINT "payment_sessions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_sessions"
    ADD CONSTRAINT "payment_sessions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_actions_log"
    ADD CONSTRAINT "photo_actions_log_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id");



ALTER TABLE ONLY "public"."photo_albums"
    ADD CONSTRAINT "photo_albums_cover_photo_id_fkey" FOREIGN KEY ("cover_photo_id") REFERENCES "public"."photos"("id");



ALTER TABLE ONLY "public"."photo_albums"
    ADD CONSTRAINT "photo_albums_photos_instance_id_fkey" FOREIGN KEY ("photos_instance_id") REFERENCES "public"."photos_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_requests"
    ADD CONSTRAINT "photo_requests_photos_instance_id_fkey" FOREIGN KEY ("photos_instance_id") REFERENCES "public"."photos_instances"("id");



ALTER TABLE ONLY "public"."photo_requests"
    ADD CONSTRAINT "photo_requests_uploaded_photo_id_fkey" FOREIGN KEY ("uploaded_photo_id") REFERENCES "public"."photos"("id");



ALTER TABLE ONLY "public"."photos"
    ADD CONSTRAINT "photos_photos_instance_id_fkey" FOREIGN KEY ("photos_instance_id") REFERENCES "public"."photos_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_media"
    ADD CONSTRAINT "project_media_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_media"
    ADD CONSTRAINT "project_media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."push_notifications_log"
    ADD CONSTRAINT "push_notifications_log_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."system_notifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."push_notifications_log"
    ADD CONSTRAINT "push_notifications_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_suspension_history"
    ADD CONSTRAINT "service_suspension_history_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_suspension_history"
    ADD CONSTRAINT "service_suspension_history_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_suspension_history"
    ADD CONSTRAINT "service_suspension_history_reactivated_by_fkey" FOREIGN KEY ("reactivated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_suspension_history"
    ADD CONSTRAINT "service_suspension_history_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."company_services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_suspension_history"
    ADD CONSTRAINT "service_suspension_history_suspended_by_fkey" FOREIGN KEY ("suspended_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_usage_metrics"
    ADD CONSTRAINT "service_usage_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_usage_metrics"
    ADD CONSTRAINT "service_usage_metrics_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sheets_access_log"
    ADD CONSTRAINT "sheets_access_log_sheets_instance_id_fkey" FOREIGN KEY ("sheets_instance_id") REFERENCES "public"."sheets_instances"("id");



ALTER TABLE ONLY "public"."sheets_columns_mapping"
    ADD CONSTRAINT "sheets_columns_mapping_sheets_instance_id_fkey" FOREIGN KEY ("sheets_instance_id") REFERENCES "public"."sheets_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sheets_data_cache"
    ADD CONSTRAINT "sheets_data_cache_sheets_instance_id_fkey" FOREIGN KEY ("sheets_instance_id") REFERENCES "public"."sheets_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sheets_query_log"
    ADD CONSTRAINT "sheets_query_log_sheets_instance_id_fkey" FOREIGN KEY ("sheets_instance_id") REFERENCES "public"."sheets_instances"("id");



ALTER TABLE ONLY "public"."sheets_sync_history"
    ADD CONSTRAINT "sheets_sync_history_sheets_instance_id_fkey" FOREIGN KEY ("sheets_instance_id") REFERENCES "public"."sheets_instances"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sheets_webhook_events"
    ADD CONSTRAINT "sheets_webhook_events_sheets_instance_id_fkey" FOREIGN KEY ("sheets_instance_id") REFERENCES "public"."sheets_instances"("id");



ALTER TABLE ONLY "public"."support_messages"
    ADD CONSTRAINT "support_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_messages"
    ADD CONSTRAINT "support_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_sla_violations"
    ADD CONSTRAINT "support_sla_violations_sla_config_id_fkey" FOREIGN KEY ("sla_config_id") REFERENCES "public"."support_sla_config"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_sla_violations"
    ADD CONSTRAINT "support_sla_violations_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_ticket_categories"
    ADD CONSTRAINT "support_ticket_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."support_ticket_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."support_ticket_messages"
    ADD CONSTRAINT "support_ticket_messages_sender_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_ticket_messages"
    ADD CONSTRAINT "support_ticket_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_ticket_messages"
    ADD CONSTRAINT "support_ticket_messages_ticket_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_ticket_messages"
    ADD CONSTRAINT "support_ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."support_ticket_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_types"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."system_notifications"
    ADD CONSTRAINT "system_notifications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_last_updated_by_fkey" FOREIGN KEY ("last_updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_invites"
    ADD CONSTRAINT "user_invites_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_invites"
    ADD CONSTRAINT "user_invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."system_notifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_service_consents"
    ADD CONSTRAINT "user_service_consents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_service_consents"
    ADD CONSTRAINT "user_service_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."website_milestones"
    ADD CONSTRAINT "website_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."website_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."website_projects"
    ADD CONSTRAINT "website_projects_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."website_projects"
    ADD CONSTRAINT "website_projects_company_service_id_fkey" FOREIGN KEY ("company_service_id") REFERENCES "public"."company_services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."whatsapp_errors"
    ADD CONSTRAINT "whatsapp_errors_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."whatsapp_errors"
    ADD CONSTRAINT "whatsapp_errors_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."whatsapp_sessions"("id");



ALTER TABLE ONLY "public"."whatsapp_errors"
    ADD CONSTRAINT "whatsapp_errors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."whatsapp_user_profiles"("id");



ALTER TABLE ONLY "public"."whatsapp_hourly_metrics"
    ADD CONSTRAINT "whatsapp_hourly_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."whatsapp_instances"
    ADD CONSTRAINT "whatsapp_instances_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."whatsapp_messages"
    ADD CONSTRAINT "whatsapp_messages_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."whatsapp_messages"
    ADD CONSTRAINT "whatsapp_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."whatsapp_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."whatsapp_messages"
    ADD CONSTRAINT "whatsapp_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."whatsapp_user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."whatsapp_metrics"
    ADD CONSTRAINT "whatsapp_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."whatsapp_sessions"
    ADD CONSTRAINT "whatsapp_sessions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."whatsapp_sessions"
    ADD CONSTRAINT "whatsapp_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."whatsapp_user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."whatsapp_user_profiles"
    ADD CONSTRAINT "whatsapp_user_profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



CREATE POLICY "All users can view maintenance windows" ON "public"."maintenance_windows" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Anyone can view active categories" ON "public"."support_ticket_categories" FOR SELECT TO "authenticated" USING (("is_active" = true));



CREATE POLICY "Anyone can view active maintenance" ON "public"."maintenance_windows" FOR SELECT TO "authenticated" USING ((("is_active" = true) AND (("now"() >= "start_time") AND ("now"() <= "end_time"))));



CREATE POLICY "Anyone can view public settings" ON "public"."system_settings" FOR SELECT TO "authenticated" USING (("is_public" = true));



CREATE POLICY "Companies can only access their own Instagram DM messages" ON "public"."instagram_dm_messages" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own Instagram DM sessions" ON "public"."instagram_dm_sessions" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own Instagram comments" ON "public"."instagram_comments" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own Instagram hourly metrics" ON "public"."instagram_hourly_metrics" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own Instagram instance" ON "public"."instagram_instances" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own Instagram metrics" ON "public"."instagram_metrics" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own Instagram posts" ON "public"."instagram_posts" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own Instagram user profiles" ON "public"."instagram_user_profiles" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own WhatsApp hourly metrics" ON "public"."whatsapp_hourly_metrics" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own WhatsApp instance" ON "public"."whatsapp_instances" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own WhatsApp messages" ON "public"."whatsapp_messages" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own WhatsApp metrics" ON "public"."whatsapp_metrics" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own WhatsApp sessions" ON "public"."whatsapp_sessions" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only access their own WhatsApp user profiles" ON "public"."whatsapp_user_profiles" USING (("company_id" = ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'company_id'::"text"))::"uuid"));



CREATE POLICY "Companies can only see their own errors" ON "public"."whatsapp_errors" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Companies can only see their own instances" ON "public"."whatsapp_instances" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Companies can only see their own messages" ON "public"."whatsapp_messages" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Companies can only see their own sessions" ON "public"."whatsapp_sessions" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Companies can only see their own users" ON "public"."whatsapp_user_profiles" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Company admins can insert customers" ON "public"."whatsapp_user_profiles" FOR INSERT TO "authenticated" WITH CHECK (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['company_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Company admins can manage sessions" ON "public"."whatsapp_sessions" TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['company_admin'::"text", 'super_admin'::"text"])))))) WITH CHECK (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['company_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Company admins can update customers" ON "public"."whatsapp_user_profiles" FOR UPDATE TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['company_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Company admins can update own services" ON "public"."company_services" FOR UPDATE TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['company_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Company admins can update their company tickets" ON "public"."support_tickets" FOR UPDATE TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['company_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Company admins can view their company logs" ON "public"."activity_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'company_admin'::"text") AND ("profiles"."company_id" = "activity_logs"."company_id")))));



CREATE POLICY "Company admins can view their own pricing" ON "public"."company_service_pricing" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("auth"."uid"() = "profiles"."id") AND ("profiles"."company_id" = "company_service_pricing"."company_id") AND ("profiles"."role" = 'company_admin'::"text") AND ("company_service_pricing"."is_active" = true)))));



CREATE POLICY "Company admins view their history" ON "public"."service_suspension_history" FOR SELECT USING (("company_id" = ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Company users can create tickets for their company" ON "public"."support_tickets" FOR INSERT TO "authenticated" WITH CHECK (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Company users can view their company tickets" ON "public"."support_tickets" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Service role bypass" ON "public"."whatsapp_errors" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass" ON "public"."whatsapp_instances" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass" ON "public"."whatsapp_messages" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass" ON "public"."whatsapp_sessions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass" ON "public"."whatsapp_user_profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can insert customers" ON "public"."whatsapp_user_profiles" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Service role can manage messages" ON "public"."whatsapp_messages" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage metrics" ON "public"."whatsapp_metrics" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage sessions" ON "public"."whatsapp_sessions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can update customers" ON "public"."whatsapp_user_profiles" FOR UPDATE TO "service_role" USING (true);



CREATE POLICY "Service role full access company metrics" ON "public"."company_daily_metrics" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access company services" ON "public"."company_services" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access invoice items" ON "public"."invoice_items" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access logs" ON "public"."activity_logs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access maintenance" ON "public"."maintenance_windows" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access messages" ON "public"."support_messages" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access notifications" ON "public"."notifications" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access payment sessions" ON "public"."payment_sessions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access revenue" ON "public"."revenue_metrics" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access service usage" ON "public"."service_usage_metrics" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access settings" ON "public"."system_settings" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access system performance" ON "public"."system_performance_metrics" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access templates" ON "public"."support_templates" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access transactions" ON "public"."transactions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access whatsapp hourly" ON "public"."whatsapp_hourly_metrics" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Super Admin can access all Instagram DM messages" ON "public"."instagram_dm_messages" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'SUPER_ADMIN'::"text"));



CREATE POLICY "Super Admin can access all Instagram DM sessions" ON "public"."instagram_dm_sessions" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'SUPER_ADMIN'::"text"));



CREATE POLICY "Super Admin can access all Instagram comments" ON "public"."instagram_comments" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'SUPER_ADMIN'::"text"));



CREATE POLICY "Super Admin can access all Instagram instances" ON "public"."instagram_instances" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'SUPER_ADMIN'::"text"));



CREATE POLICY "Super Admin can access all Instagram metrics" ON "public"."instagram_metrics" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'SUPER_ADMIN'::"text"));



CREATE POLICY "Super Admin can access all Instagram posts" ON "public"."instagram_posts" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'SUPER_ADMIN'::"text"));



CREATE POLICY "Super Admin can access all WhatsApp hourly metrics" ON "public"."whatsapp_hourly_metrics" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'SUPER_ADMIN'::"text"));



CREATE POLICY "Super Admin can access all WhatsApp instances" ON "public"."whatsapp_instances" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'SUPER_ADMIN'::"text"));



CREATE POLICY "Super Admin can access all WhatsApp messages" ON "public"."whatsapp_messages" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'SUPER_ADMIN'::"text"));



CREATE POLICY "Super Admin can access all WhatsApp metrics" ON "public"."whatsapp_metrics" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'SUPER_ADMIN'::"text"));



CREATE POLICY "Super Admin can access all WhatsApp sessions" ON "public"."whatsapp_sessions" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'SUPER_ADMIN'::"text"));



CREATE POLICY "Super Admin can access all WhatsApp user profiles" ON "public"."whatsapp_user_profiles" USING (((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'SUPER_ADMIN'::"text"));



CREATE POLICY "Super admins can create any ticket" ON "public"."support_tickets" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can delete any ticket" ON "public"."support_tickets" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can insert logs" ON "public"."activity_logs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage all messages" ON "public"."support_messages" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage all services" ON "public"."company_services" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage categories" ON "public"."support_ticket_categories" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage invoice items" ON "public"."invoice_items" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage logs" ON "public"."activity_logs" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage maintenance" ON "public"."maintenance_windows" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage maintenance windows" ON "public"."maintenance_windows" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage metrics" ON "public"."company_daily_metrics" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage notifications" ON "public"."notifications" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage revenue metrics" ON "public"."revenue_metrics" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage service usage" ON "public"."service_usage_metrics" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage settings" ON "public"."system_settings" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage system performance" ON "public"."system_performance_metrics" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage system settings" ON "public"."system_settings" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage templates" ON "public"."support_templates" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage whatsapp hourly" ON "public"."whatsapp_hourly_metrics" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can update all tickets" ON "public"."support_tickets" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all activity logs" ON "public"."activity_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all consents" ON "public"."user_service_consents" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."raw_user_meta_data" ->> 'role'::"text") = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all customers" ON "public"."whatsapp_user_profiles" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all logs" ON "public"."activity_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all messages" ON "public"."support_messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all messages" ON "public"."whatsapp_messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all metrics" ON "public"."company_daily_metrics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all metrics" ON "public"."whatsapp_metrics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all payment sessions" ON "public"."payment_sessions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all service usage" ON "public"."service_usage_metrics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all services" ON "public"."company_services" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all sessions" ON "public"."whatsapp_sessions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all tickets" ON "public"."support_tickets" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all transactions" ON "public"."transactions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view all whatsapp hourly" ON "public"."whatsapp_hourly_metrics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view revenue metrics" ON "public"."revenue_metrics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can view system performance" ON "public"."system_performance_metrics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins full access" ON "public"."service_suspension_history" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins have full access to company_service_pricing" ON "public"."company_service_pricing" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("auth"."uid"() = "profiles"."id") AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "Users can create messages in own tickets" ON "public"."support_messages" FOR INSERT TO "authenticated" WITH CHECK ((("ticket_id" IN ( SELECT "support_tickets"."id"
   FROM "public"."support_tickets"
  WHERE ("support_tickets"."company_id" IN ( SELECT "profiles"."company_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"()))))) AND ("sender_id" = "auth"."uid"()) AND ("is_internal" = false)));



CREATE POLICY "Users can insert own consents" ON "public"."user_service_consents" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own logs" ON "public"."activity_logs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own consents" ON "public"."user_service_consents" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR ("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))));



CREATE POLICY "Users can view own company customers" ON "public"."whatsapp_user_profiles" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view own company logs" ON "public"."activity_logs" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view own company messages" ON "public"."support_messages" FOR SELECT TO "authenticated" USING ((("ticket_id" IN ( SELECT "support_tickets"."id"
   FROM "public"."support_tickets"
  WHERE ("support_tickets"."company_id" IN ( SELECT "profiles"."company_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"()))))) AND ("is_internal" = false)));



CREATE POLICY "Users can view own company messages" ON "public"."whatsapp_messages" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view own company metrics" ON "public"."company_daily_metrics" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view own company metrics" ON "public"."whatsapp_metrics" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view own company services" ON "public"."company_services" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view own company sessions" ON "public"."whatsapp_sessions" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view own consents" ON "public"."user_service_consents" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own invoice items" ON "public"."invoice_items" FOR SELECT TO "authenticated" USING (("invoice_id" IN ( SELECT "invoices"."id"
   FROM "public"."invoices"
  WHERE ("invoices"."company_id" IN ( SELECT "profiles"."company_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"()))))));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR ("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))) OR (("user_id" IS NULL) AND ("company_id" IS NULL))));



CREATE POLICY "Users can view own payment sessions" ON "public"."payment_sessions" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view own service usage" ON "public"."service_usage_metrics" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view own transactions" ON "public"."transactions" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view own whatsapp hourly" ON "public"."whatsapp_hourly_metrics" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own logs" ON "public"."activity_logs" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointment_actions_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointment_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointment_reminders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointment_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointment_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "authenticated_can_delete_invites" ON "public"."user_invites" FOR DELETE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "authenticated_can_insert_invites" ON "public"."user_invites" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "authenticated_can_update_invites" ON "public"."user_invites" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "authenticated_can_view_invites" ON "public"."user_invites" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "authenticated_select_companies" ON "public"."companies" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_select_invoices" ON "public"."invoices" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_select_service_requests" ON "public"."service_requests" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_select_service_types" ON "public"."service_types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_select_support_tickets" ON "public"."support_tickets" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."blocked_time_slots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calendar_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calendar_staff" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "company_admins_invites_company" ON "public"."user_invites" USING (("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'company_admin'::"text")))));



CREATE POLICY "company_admins_read_own_company" ON "public"."companies" FOR SELECT USING (("id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'company_admin'::"text")))));



ALTER TABLE "public"."company_daily_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_service_pricing" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_services" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "company_user_insert_own" ON "public"."support_ticket_messages" FOR INSERT WITH CHECK (("ticket_id" IN ( SELECT "support_tickets"."id"
   FROM "public"."support_tickets"
  WHERE ("support_tickets"."company_id" = ( SELECT "profiles"."company_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"()))))));



CREATE POLICY "company_user_select_own" ON "public"."support_ticket_messages" FOR SELECT USING (("ticket_id" IN ( SELECT "support_tickets"."id"
   FROM "public"."support_tickets"
  WHERE ("support_tickets"."company_id" = ( SELECT "profiles"."company_id"
           FROM "public"."profiles"
          WHERE ("profiles"."id" = "auth"."uid"()))))));



ALTER TABLE "public"."docs_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."docs_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_actions_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."drive_actions_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."drive_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."drive_folders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."drive_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."drive_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."drive_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."generated_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gmail_actions_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gmail_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gmail_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gmail_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gmail_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gmail_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instagram_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instagram_dm_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instagram_dm_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instagram_hourly_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instagram_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instagram_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instagram_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."instagram_user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."maintenance_windows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."photo_actions_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."photo_albums" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."photo_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."photos_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."photos_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_media" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "push_logs_super_admin_select" ON "public"."push_notifications_log" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "push_logs_system_insert" ON "public"."push_notifications_log" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "push_logs_system_update" ON "public"."push_notifications_log" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "push_logs_user_select" ON "public"."push_notifications_log" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."push_notifications_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."revenue_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_suspension_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_usage_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sheets_access_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sheets_columns_mapping" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sheets_data_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sheets_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sheets_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sheets_query_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sheets_query_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sheets_sync_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sheets_webhook_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "super_admin_all_system_notifications" ON "public"."system_notifications" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "super_admin_all_user_notifications" ON "public"."user_notifications" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "super_admin_delete_media" ON "public"."project_media" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "super_admin_insert" ON "public"."support_ticket_messages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "super_admin_insert_media" ON "public"."project_media" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "super_admin_select_all" ON "public"."support_ticket_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "super_admin_update_media" ON "public"."project_media" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "super_admins_companies_all" ON "public"."companies" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "super_admins_invites_all" ON "public"."user_invites" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



ALTER TABLE "public"."support_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_ticket_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_ticket_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_tickets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_performance_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_service_consents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_read_accessible_system_notifications" ON "public"."system_notifications" FOR SELECT TO "authenticated" USING ((("is_active" = true) AND ("deleted_at" IS NULL) AND (("expires_at" IS NULL) OR ("expires_at" > "now"())) AND ((("target_audience")::"text" = 'all'::"text") OR ((("target_audience")::"text" = 'super_admins'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text"))))) OR ((("target_audience")::"text" = 'company_admins'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'company_admin'::"text"))))) OR ((("target_audience")::"text" = 'users'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'user'::"text"))))) OR ((("target_audience")::"text" = 'specific_companies'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."company_id" = ANY ("system_notifications"."target_company_ids")))))))));



CREATE POLICY "users_read_own_notifications" ON "public"."user_notifications" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "users_select_media" ON "public"."project_media" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))) OR ("company_id" IN ( SELECT "profiles"."company_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))));



CREATE POLICY "users_update_own_notifications" ON "public"."user_notifications" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."whatsapp_errors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "whatsapp_errors_insert" ON "public"."whatsapp_errors" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_errors"."company_id"))))));



CREATE POLICY "whatsapp_errors_select" ON "public"."whatsapp_errors" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_errors"."company_id"))))));



CREATE POLICY "whatsapp_errors_update" ON "public"."whatsapp_errors" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



ALTER TABLE "public"."whatsapp_hourly_metrics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "whatsapp_hourly_metrics_insert" ON "public"."whatsapp_hourly_metrics" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "whatsapp_hourly_metrics_select" ON "public"."whatsapp_hourly_metrics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_hourly_metrics"."company_id"))))));



ALTER TABLE "public"."whatsapp_instances" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "whatsapp_instances_delete" ON "public"."whatsapp_instances" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



COMMENT ON POLICY "whatsapp_instances_delete" ON "public"."whatsapp_instances" IS 'Only super admins can delete WhatsApp instances';



CREATE POLICY "whatsapp_instances_insert" ON "public"."whatsapp_instances" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



COMMENT ON POLICY "whatsapp_instances_insert" ON "public"."whatsapp_instances" IS 'Only super admins can create WhatsApp instances';



CREATE POLICY "whatsapp_instances_select" ON "public"."whatsapp_instances" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."company_id" = "whatsapp_instances"."company_id") AND ("profiles"."role" = ANY (ARRAY['company_admin'::"text", 'company_user'::"text"])))))));



COMMENT ON POLICY "whatsapp_instances_select" ON "public"."whatsapp_instances" IS 'Super admins see all, company users see their own';



CREATE POLICY "whatsapp_instances_update" ON "public"."whatsapp_instances" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



COMMENT ON POLICY "whatsapp_instances_update" ON "public"."whatsapp_instances" IS 'Only super admins can update WhatsApp instances';



ALTER TABLE "public"."whatsapp_messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "whatsapp_messages_insert" ON "public"."whatsapp_messages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_messages"."company_id"))))));



CREATE POLICY "whatsapp_messages_select" ON "public"."whatsapp_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_messages"."company_id"))))));



CREATE POLICY "whatsapp_messages_update" ON "public"."whatsapp_messages" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_messages"."company_id"))))));



ALTER TABLE "public"."whatsapp_metrics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "whatsapp_metrics_insert" ON "public"."whatsapp_metrics" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"text")))));



CREATE POLICY "whatsapp_metrics_select" ON "public"."whatsapp_metrics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_metrics"."company_id"))))));



ALTER TABLE "public"."whatsapp_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "whatsapp_sessions_insert" ON "public"."whatsapp_sessions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_sessions"."company_id"))))));



CREATE POLICY "whatsapp_sessions_select" ON "public"."whatsapp_sessions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_sessions"."company_id"))))));



CREATE POLICY "whatsapp_sessions_update" ON "public"."whatsapp_sessions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_sessions"."company_id"))))));



ALTER TABLE "public"."whatsapp_user_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "whatsapp_user_profiles_insert" ON "public"."whatsapp_user_profiles" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_user_profiles"."company_id"))))));



CREATE POLICY "whatsapp_user_profiles_select" ON "public"."whatsapp_user_profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_user_profiles"."company_id"))))));



CREATE POLICY "whatsapp_user_profiles_update" ON "public"."whatsapp_user_profiles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."role" = 'super_admin'::"text") OR ("profiles"."company_id" = "whatsapp_user_profiles"."company_id"))))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."support_messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."support_tickets";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."whatsapp_messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."whatsapp_sessions";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."whatsapp_user_profiles";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."aggregate_daily_metrics"("p_company_id" "uuid", "p_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."aggregate_daily_metrics"("p_company_id" "uuid", "p_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."aggregate_daily_metrics"("p_company_id" "uuid", "p_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_expired_notifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."archive_expired_notifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_expired_notifications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_create_company_service"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_create_company_service"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_create_company_service"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_invoice_totals"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_invoice_totals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_invoice_totals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_ticket_times"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_ticket_times"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_ticket_times"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_usage_percentage"("p_company_id" "uuid", "p_service_type_id" "uuid", "p_current_usage" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_usage_percentage"("p_company_id" "uuid", "p_service_type_id" "uuid", "p_current_usage" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_usage_percentage"("p_company_id" "uuid", "p_service_type_id" "uuid", "p_current_usage" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_sla_violations"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_sla_violations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_sla_violations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_notifications_for_new_system_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_notifications_for_new_system_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_notifications_for_new_system_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_auth_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_auth_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_auth_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."expire_old_invitations"() TO "anon";
GRANT ALL ON FUNCTION "public"."expire_old_invitations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."expire_old_invitations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_invoice_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_invoice_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_invoice_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_ticket_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_ticket_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_ticket_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_active_maintenance"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_maintenance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_maintenance"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_activity_statistics"("p_company_id" "uuid", "p_user_id" "uuid", "p_start_date" timestamp without time zone, "p_end_date" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_activity_statistics"("p_company_id" "uuid", "p_user_id" "uuid", "p_start_date" timestamp without time zone, "p_end_date" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_activity_statistics"("p_company_id" "uuid", "p_user_id" "uuid", "p_start_date" timestamp without time zone, "p_end_date" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_activity_timeline"("p_company_id" "uuid", "p_hours" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_activity_timeline"("p_company_id" "uuid", "p_hours" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_activity_timeline"("p_company_id" "uuid", "p_hours" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_company_service_pricing"("p_company_id" "uuid", "p_service_type_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_company_service_pricing"("p_company_id" "uuid", "p_service_type_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_company_service_pricing"("p_company_id" "uuid", "p_service_type_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_display_price"("usd_amount" numeric, "target_currency" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_display_price"("usd_amount" numeric, "target_currency" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_display_price"("usd_amount" numeric, "target_currency" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_project_media_url"("file_path" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_project_media_url"("file_path" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_project_media_url"("file_path" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_top_active_users"("p_company_id" "uuid", "p_limit" integer, "p_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_active_users"("p_company_id" "uuid", "p_limit" integer, "p_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_active_users"("p_company_id" "uuid", "p_limit" integer, "p_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_upcoming_maintenance"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_upcoming_maintenance"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_upcoming_maintenance"("limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_maintenance_mode"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_maintenance_mode"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_maintenance_mode"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_activity"("p_company_id" "uuid", "p_user_id" "uuid", "p_action" "text", "p_action_category" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_description" "text", "p_details" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_activity"("p_company_id" "uuid", "p_user_id" "uuid", "p_action" "text", "p_action_category" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_description" "text", "p_details" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_activity"("p_company_id" "uuid", "p_user_id" "uuid", "p_action" "text", "p_action_category" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_description" "text", "p_details" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_invoice_payment_gateway"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_invoice_payment_gateway"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_invoice_payment_gateway"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_payment_gateway_by_country"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_payment_gateway_by_country"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_payment_gateway_by_country"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_company_service_pricing_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_company_service_pricing_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_company_service_pricing_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_company_services_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_company_services_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_company_services_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_invoice_on_transaction"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_invoice_on_transaction"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_invoice_on_transaction"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_maintenance_windows_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_maintenance_windows_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_maintenance_windows_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_message_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_message_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_message_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_project_media_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_project_media_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_project_media_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_push_notifications_log_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_push_notifications_log_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_push_notifications_log_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_service_types_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_service_types_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_service_types_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_suspension_history_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_suspension_history_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_suspension_history_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_system_notifications_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_system_notifications_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_system_notifications_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_system_settings_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_system_settings_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_system_settings_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ticket_categories_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ticket_categories_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ticket_categories_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ticket_first_response"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ticket_first_response"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ticket_first_response"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ticket_messages_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ticket_messages_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ticket_messages_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ticket_on_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ticket_on_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ticket_on_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ticket_resolution_time"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ticket_resolution_time"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ticket_resolution_time"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_invites_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_invites_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_invites_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_service_consents_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_service_consents_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_service_consents_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_usd_only"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_usd_only"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_usd_only"() TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_services" TO "anon";
GRANT ALL ON TABLE "public"."company_services" TO "authenticated";
GRANT ALL ON TABLE "public"."company_services" TO "service_role";



GRANT ALL ON TABLE "public"."service_types" TO "anon";
GRANT ALL ON TABLE "public"."service_types" TO "authenticated";
GRANT ALL ON TABLE "public"."service_types" TO "service_role";



GRANT ALL ON TABLE "public"."active_company_services" TO "anon";
GRANT ALL ON TABLE "public"."active_company_services" TO "authenticated";
GRANT ALL ON TABLE "public"."active_company_services" TO "service_role";



GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."appointment_actions_log" TO "anon";
GRANT ALL ON TABLE "public"."appointment_actions_log" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_actions_log" TO "service_role";



GRANT ALL ON TABLE "public"."appointment_metrics" TO "anon";
GRANT ALL ON TABLE "public"."appointment_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."appointment_reminders" TO "anon";
GRANT ALL ON TABLE "public"."appointment_reminders" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_reminders" TO "service_role";



GRANT ALL ON TABLE "public"."appointment_requests" TO "anon";
GRANT ALL ON TABLE "public"."appointment_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_requests" TO "service_role";



GRANT ALL ON TABLE "public"."appointment_types" TO "anon";
GRANT ALL ON TABLE "public"."appointment_types" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_types" TO "service_role";



GRANT ALL ON TABLE "public"."blocked_time_slots" TO "anon";
GRANT ALL ON TABLE "public"."blocked_time_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."blocked_time_slots" TO "service_role";



GRANT ALL ON TABLE "public"."calendar_instances" TO "anon";
GRANT ALL ON TABLE "public"."calendar_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_instances" TO "service_role";



GRANT ALL ON TABLE "public"."calendar_staff" TO "anon";
GRANT ALL ON TABLE "public"."calendar_staff" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_staff" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."support_tickets" TO "anon";
GRANT ALL ON TABLE "public"."support_tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."support_tickets" TO "service_role";



GRANT ALL ON TABLE "public"."company_complete_profile" TO "anon";
GRANT ALL ON TABLE "public"."company_complete_profile" TO "authenticated";
GRANT ALL ON TABLE "public"."company_complete_profile" TO "service_role";



GRANT ALL ON TABLE "public"."company_daily_metrics" TO "anon";
GRANT ALL ON TABLE "public"."company_daily_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."company_daily_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."company_service_pricing" TO "anon";
GRANT ALL ON TABLE "public"."company_service_pricing" TO "authenticated";
GRANT ALL ON TABLE "public"."company_service_pricing" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_overview" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_overview" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_overview" TO "service_role";



GRANT ALL ON TABLE "public"."docs_instances" TO "anon";
GRANT ALL ON TABLE "public"."docs_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."docs_instances" TO "service_role";



GRANT ALL ON TABLE "public"."docs_metrics" TO "anon";
GRANT ALL ON TABLE "public"."docs_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."docs_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."document_actions_log" TO "anon";
GRANT ALL ON TABLE "public"."document_actions_log" TO "authenticated";
GRANT ALL ON TABLE "public"."document_actions_log" TO "service_role";



GRANT ALL ON TABLE "public"."document_requests" TO "anon";
GRANT ALL ON TABLE "public"."document_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."document_requests" TO "service_role";



GRANT ALL ON TABLE "public"."document_templates" TO "anon";
GRANT ALL ON TABLE "public"."document_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."document_templates" TO "service_role";



GRANT ALL ON TABLE "public"."drive_actions_log" TO "anon";
GRANT ALL ON TABLE "public"."drive_actions_log" TO "authenticated";
GRANT ALL ON TABLE "public"."drive_actions_log" TO "service_role";



GRANT ALL ON TABLE "public"."drive_files" TO "anon";
GRANT ALL ON TABLE "public"."drive_files" TO "authenticated";
GRANT ALL ON TABLE "public"."drive_files" TO "service_role";



GRANT ALL ON TABLE "public"."drive_folders" TO "anon";
GRANT ALL ON TABLE "public"."drive_folders" TO "authenticated";
GRANT ALL ON TABLE "public"."drive_folders" TO "service_role";



GRANT ALL ON TABLE "public"."drive_instances" TO "anon";
GRANT ALL ON TABLE "public"."drive_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."drive_instances" TO "service_role";



GRANT ALL ON TABLE "public"."drive_metrics" TO "anon";
GRANT ALL ON TABLE "public"."drive_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."drive_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."drive_requests" TO "anon";
GRANT ALL ON TABLE "public"."drive_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."drive_requests" TO "service_role";



GRANT ALL ON TABLE "public"."generated_documents" TO "anon";
GRANT ALL ON TABLE "public"."generated_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."generated_documents" TO "service_role";



GRANT ALL ON TABLE "public"."gmail_actions_log" TO "anon";
GRANT ALL ON TABLE "public"."gmail_actions_log" TO "authenticated";
GRANT ALL ON TABLE "public"."gmail_actions_log" TO "service_role";



GRANT ALL ON TABLE "public"."gmail_instances" TO "anon";
GRANT ALL ON TABLE "public"."gmail_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."gmail_instances" TO "service_role";



GRANT ALL ON TABLE "public"."gmail_messages" TO "anon";
GRANT ALL ON TABLE "public"."gmail_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."gmail_messages" TO "service_role";



GRANT ALL ON TABLE "public"."gmail_metrics" TO "anon";
GRANT ALL ON TABLE "public"."gmail_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."gmail_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."gmail_requests" TO "anon";
GRANT ALL ON TABLE "public"."gmail_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."gmail_requests" TO "service_role";



GRANT ALL ON TABLE "public"."gmail_templates" TO "anon";
GRANT ALL ON TABLE "public"."gmail_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."gmail_templates" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_comments" TO "anon";
GRANT ALL ON TABLE "public"."instagram_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_comments" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_dm_messages" TO "anon";
GRANT ALL ON TABLE "public"."instagram_dm_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_dm_messages" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_dm_sessions" TO "anon";
GRANT ALL ON TABLE "public"."instagram_dm_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_dm_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_hourly_metrics" TO "anon";
GRANT ALL ON TABLE "public"."instagram_hourly_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_hourly_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_instances" TO "anon";
GRANT ALL ON TABLE "public"."instagram_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_instances" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_metrics" TO "anon";
GRANT ALL ON TABLE "public"."instagram_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_posts" TO "anon";
GRANT ALL ON TABLE "public"."instagram_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_posts" TO "service_role";



GRANT ALL ON TABLE "public"."instagram_user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."instagram_user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."instagram_user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_items" TO "anon";
GRANT ALL ON TABLE "public"."invoice_items" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_items" TO "service_role";



GRANT ALL ON TABLE "public"."maintenance_windows" TO "anon";
GRANT ALL ON TABLE "public"."maintenance_windows" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance_windows" TO "service_role";



GRANT ALL ON TABLE "public"."mobile_app_milestones" TO "anon";
GRANT ALL ON TABLE "public"."mobile_app_milestones" TO "authenticated";
GRANT ALL ON TABLE "public"."mobile_app_milestones" TO "service_role";



GRANT ALL ON TABLE "public"."mobile_app_projects" TO "anon";
GRANT ALL ON TABLE "public"."mobile_app_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."mobile_app_projects" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."payment_sessions" TO "anon";
GRANT ALL ON TABLE "public"."payment_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."photo_actions_log" TO "anon";
GRANT ALL ON TABLE "public"."photo_actions_log" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_actions_log" TO "service_role";



GRANT ALL ON TABLE "public"."photo_albums" TO "anon";
GRANT ALL ON TABLE "public"."photo_albums" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_albums" TO "service_role";



GRANT ALL ON TABLE "public"."photo_requests" TO "anon";
GRANT ALL ON TABLE "public"."photo_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_requests" TO "service_role";



GRANT ALL ON TABLE "public"."photos" TO "anon";
GRANT ALL ON TABLE "public"."photos" TO "authenticated";
GRANT ALL ON TABLE "public"."photos" TO "service_role";



GRANT ALL ON TABLE "public"."photos_instances" TO "anon";
GRANT ALL ON TABLE "public"."photos_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."photos_instances" TO "service_role";



GRANT ALL ON TABLE "public"."photos_metrics" TO "anon";
GRANT ALL ON TABLE "public"."photos_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."photos_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."project_media" TO "anon";
GRANT ALL ON TABLE "public"."project_media" TO "authenticated";
GRANT ALL ON TABLE "public"."project_media" TO "service_role";



GRANT ALL ON TABLE "public"."push_notifications_log" TO "anon";
GRANT ALL ON TABLE "public"."push_notifications_log" TO "authenticated";
GRANT ALL ON TABLE "public"."push_notifications_log" TO "service_role";



GRANT ALL ON TABLE "public"."revenue_metrics" TO "anon";
GRANT ALL ON TABLE "public"."revenue_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."revenue_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."revenue_summary" TO "anon";
GRANT ALL ON TABLE "public"."revenue_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."revenue_summary" TO "service_role";



GRANT ALL ON TABLE "public"."service_health_status" TO "anon";
GRANT ALL ON TABLE "public"."service_health_status" TO "authenticated";
GRANT ALL ON TABLE "public"."service_health_status" TO "service_role";



GRANT ALL ON TABLE "public"."service_requests" TO "anon";
GRANT ALL ON TABLE "public"."service_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."service_requests" TO "service_role";



GRANT ALL ON TABLE "public"."service_suspension_history" TO "anon";
GRANT ALL ON TABLE "public"."service_suspension_history" TO "authenticated";
GRANT ALL ON TABLE "public"."service_suspension_history" TO "service_role";



GRANT ALL ON TABLE "public"."service_usage_metrics" TO "anon";
GRANT ALL ON TABLE "public"."service_usage_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."service_usage_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."sheets_access_log" TO "anon";
GRANT ALL ON TABLE "public"."sheets_access_log" TO "authenticated";
GRANT ALL ON TABLE "public"."sheets_access_log" TO "service_role";



GRANT ALL ON TABLE "public"."sheets_columns_mapping" TO "anon";
GRANT ALL ON TABLE "public"."sheets_columns_mapping" TO "authenticated";
GRANT ALL ON TABLE "public"."sheets_columns_mapping" TO "service_role";



GRANT ALL ON TABLE "public"."sheets_data_cache" TO "anon";
GRANT ALL ON TABLE "public"."sheets_data_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."sheets_data_cache" TO "service_role";



GRANT ALL ON TABLE "public"."sheets_instances" TO "anon";
GRANT ALL ON TABLE "public"."sheets_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."sheets_instances" TO "service_role";



GRANT ALL ON TABLE "public"."sheets_metrics" TO "anon";
GRANT ALL ON TABLE "public"."sheets_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."sheets_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."sheets_query_log" TO "anon";
GRANT ALL ON TABLE "public"."sheets_query_log" TO "authenticated";
GRANT ALL ON TABLE "public"."sheets_query_log" TO "service_role";



GRANT ALL ON TABLE "public"."sheets_query_templates" TO "anon";
GRANT ALL ON TABLE "public"."sheets_query_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."sheets_query_templates" TO "service_role";



GRANT ALL ON TABLE "public"."sheets_sync_history" TO "anon";
GRANT ALL ON TABLE "public"."sheets_sync_history" TO "authenticated";
GRANT ALL ON TABLE "public"."sheets_sync_history" TO "service_role";



GRANT ALL ON TABLE "public"."sheets_webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."sheets_webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."sheets_webhook_events" TO "service_role";



GRANT ALL ON TABLE "public"."support_sla_config" TO "anon";
GRANT ALL ON TABLE "public"."support_sla_config" TO "authenticated";
GRANT ALL ON TABLE "public"."support_sla_config" TO "service_role";



GRANT ALL ON TABLE "public"."ticket_sla_status" TO "anon";
GRANT ALL ON TABLE "public"."ticket_sla_status" TO "authenticated";
GRANT ALL ON TABLE "public"."ticket_sla_status" TO "service_role";



GRANT ALL ON TABLE "public"."sla_performance_summary" TO "anon";
GRANT ALL ON TABLE "public"."sla_performance_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."sla_performance_summary" TO "service_role";



GRANT ALL ON TABLE "public"."support_messages" TO "anon";
GRANT ALL ON TABLE "public"."support_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."support_messages" TO "service_role";



GRANT ALL ON TABLE "public"."support_sla_violations" TO "anon";
GRANT ALL ON TABLE "public"."support_sla_violations" TO "authenticated";
GRANT ALL ON TABLE "public"."support_sla_violations" TO "service_role";



GRANT ALL ON TABLE "public"."support_templates" TO "anon";
GRANT ALL ON TABLE "public"."support_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."support_templates" TO "service_role";



GRANT ALL ON TABLE "public"."support_ticket_categories" TO "anon";
GRANT ALL ON TABLE "public"."support_ticket_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."support_ticket_categories" TO "service_role";



GRANT ALL ON TABLE "public"."support_ticket_messages" TO "anon";
GRANT ALL ON TABLE "public"."support_ticket_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."support_ticket_messages" TO "service_role";



GRANT ALL ON TABLE "public"."support_ticket_summary" TO "anon";
GRANT ALL ON TABLE "public"."support_ticket_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."support_ticket_summary" TO "service_role";



GRANT ALL ON TABLE "public"."system_notifications" TO "anon";
GRANT ALL ON TABLE "public"."system_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."system_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."system_performance_metrics" TO "anon";
GRANT ALL ON TABLE "public"."system_performance_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."system_performance_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."ticket_category_stats" TO "anon";
GRANT ALL ON TABLE "public"."ticket_category_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."ticket_category_stats" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."user_invites" TO "anon";
GRANT ALL ON TABLE "public"."user_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."user_invites" TO "service_role";



GRANT ALL ON TABLE "public"."user_notifications" TO "anon";
GRANT ALL ON TABLE "public"."user_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."user_service_consents" TO "anon";
GRANT ALL ON TABLE "public"."user_service_consents" TO "authenticated";
GRANT ALL ON TABLE "public"."user_service_consents" TO "service_role";



GRANT ALL ON TABLE "public"."website_milestones" TO "anon";
GRANT ALL ON TABLE "public"."website_milestones" TO "authenticated";
GRANT ALL ON TABLE "public"."website_milestones" TO "service_role";



GRANT ALL ON TABLE "public"."website_projects" TO "anon";
GRANT ALL ON TABLE "public"."website_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."website_projects" TO "service_role";



GRANT ALL ON TABLE "public"."whatsapp_metrics" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."whatsapp_sessions" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."whatsapp_user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."whatsapp_analytics_detailed" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_analytics_detailed" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_analytics_detailed" TO "service_role";



GRANT ALL ON TABLE "public"."whatsapp_errors" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_errors" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_errors" TO "service_role";



GRANT ALL ON TABLE "public"."whatsapp_hourly_metrics" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_hourly_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_hourly_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."whatsapp_instances" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_instances" TO "service_role";



GRANT ALL ON TABLE "public"."whatsapp_messages" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_messages" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































