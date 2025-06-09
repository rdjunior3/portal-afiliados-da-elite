-- Habilita a extensão pg_cron para agendamento de tarefas
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove os triggers existentes para evitar atualizações em tempo real e duplicação de lógica
DROP TRIGGER IF EXISTS update_affiliate_stats_on_commission ON public.commissions;
DROP TRIGGER IF EXISTS update_affiliate_stats_on_click ON public.link_analytics;

-- Remove a função antiga que era chamada pelos triggers
DROP FUNCTION IF EXISTS public.update_affiliate_stats();

-- Cria a nova função para atualizar as estatísticas de todos os afiliados de uma só vez
CREATE OR REPLACE FUNCTION public.update_all_affiliate_stats()
RETURNS void AS $$
BEGIN
    WITH affiliate_stats AS (
        SELECT
            p.id AS affiliate_id,
            COALESCE(SUM(c.amount), 0) AS total_earnings,
            (SELECT COUNT(*) FROM public.link_analytics la WHERE la.link_id IN (SELECT al.id FROM public.affiliate_links al WHERE al.affiliate_id = p.id)) AS total_clicks,
            COALESCE(SUM(CASE WHEN c.status = 'approved' THEN 1 ELSE 0 END), 0) AS total_conversions
        FROM
            public.profiles p
        LEFT JOIN
            public.commissions c ON p.id = c.affiliate_id AND c.status = 'paid'
        WHERE
            p.role = 'affiliate'
        GROUP BY
            p.id
    )
    UPDATE
        public.profiles p
    SET
        total_earnings = s.total_earnings,
        total_clicks = s.total_clicks,
        total_conversions = s.total_conversions,
        conversion_rate = CASE WHEN s.total_clicks > 0 THEN (s.total_conversions::decimal / s.total_clicks) * 100 ELSE 0 END,
        updated_at = NOW()
    FROM
        affiliate_stats s
    WHERE
        p.id = s.affiliate_id;
END;
$$ LANGUAGE plpgsql;

-- Agenda a execução da função a cada 10 minutos
-- A sintaxe '*/10 * * * *' significa "a cada 10 minutos"
-- O comando é desprogramado primeiro para evitar duplicatas em caso de re-execução da migração
SELECT cron.unschedule('update-affiliate-stats-job');
SELECT cron.schedule('update-affiliate-stats-job', '*/10 * * * *', 'SELECT public.update_all_affiliate_stats()'); 