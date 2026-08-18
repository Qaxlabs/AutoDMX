import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { AppShell } from '../../_components/AppShell';

export const dynamic = 'force-dynamic';

type AutomationStats = {
  id: string;
  name: string;
  media_id: string | null;
  media_scope: string;
  comments: number;
  dmsOpened: number;
  followPassed: number;
  followFailed: number;
  clicks: number;
};

export default async function AnalyticsPage({
  searchParams = {},
}: {
  searchParams?: { accountId?: string };
}) {
  try {
    const supabase = createClient();
    const accountId = searchParams?.accountId;

    // 1. Fetch connected accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, ig_username, ig_user_id')
      .order('created_at', { ascending: false });

    if (accountsError) {
      throw new Error(`Database Error fetching accounts: ${accountsError.message}`);
    }

    // Handle empty accounts state
    if (!accounts || accounts.length === 0) {
      return (
        <AppShell variant="dashboard" activeNav="analytics">
          <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center sm:px-8">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
              <svg
                className="h-7 w-7 text-brand-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="m7 14 4-4 4 4 5-6" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              No connected accounts
            </h2>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Connect an Instagram Creator or Business account in settings to
              start seeing analytics.
            </p>
            <Link
              href="/dashboard/settings"
              className="btn-primary mt-6 px-5 py-2.5 text-sm"
            >
              Go to settings
            </Link>
          </div>
        </AppShell>
      );
    }

    // 2. Select active account safely
    const activeAccount =
      accounts.find((acc) => acc.id === accountId) || accounts[0];

    if (!activeAccount) {
      throw new Error('Failed to resolve active Instagram account.');
    }

    // 3. Fetch automations for active account
    const { data: automations, error: automationsError } = await supabase
      .from('automations')
      .select('id, name, media_id, media_scope')
      .eq('account_id', activeAccount.id);

    if (automationsError) {
      throw new Error(
        `Database Error fetching automations: ${automationsError.message}`
      );
    }

    const typedAutomations = automations || [];
    const automationIds = typedAutomations.map((a) => a.id).filter(Boolean);

    // Initialize aggregates
    let totalComments = 0;
    let totalDmsOpened = 0;
    let totalClicks = 0;
    let totalFollowPassed = 0;
    let totalFollowFailed = 0;

    const statsList: AutomationStats[] = typedAutomations.map((auto) => ({
      id: auto.id,
      name: auto.name,
      media_id: auto.media_id,
      media_scope: auto.media_scope,
      comments: 0,
      dmsOpened: 0,
      followPassed: 0,
      followFailed: 0,
      clicks: 0,
    }));

    if (automationIds.length > 0) {
      // 4. Fetch message logs containing triggers for this account's automations
      const { data: logs, error: logsError } = await supabase
        .from('message_log')
        .select('automation_id, status')
        .in('automation_id', automationIds);

      if (logsError) {
        console.error(
          '[Analytics Server Error] Failed to fetch message logs:',
          logsError.message
        );
      } else if (Array.isArray(logs)) {
        logs.forEach((log) => {
          if (!log || !log.automation_id) return;
          const auto = statsList.find((s) => s.id === log.automation_id);
          if (!auto) return;

          if (log.status === 'comment_received') {
            auto.comments++;
            totalComments++;
          } else if (log.status === 'dm_received') {
            auto.dmsOpened++;
            totalDmsOpened++;
          } else if (log.status === 'follow_passed') {
            auto.followPassed++;
            totalFollowPassed++;
          } else if (log.status === 'follow_failed') {
            auto.followFailed++;
            totalFollowFailed++;
          }
        });
      }

      // 5. Fetch link click logs
      const { data: clicksData, error: clicksError } = await supabase
        .from('link_clicks')
        .select('automation_id')
        .in('automation_id', automationIds);

      if (clicksError) {
        console.error(
          '[Analytics Server Error] Failed to fetch link clicks:',
          clicksError.message
        );
      } else if (Array.isArray(clicksData)) {
        clicksData.forEach((click) => {
          if (!click || !click.automation_id) return;
          const auto = statsList.find((s) => s.id === click.automation_id);
          if (auto) {
            auto.clicks++;
            totalClicks++;
          }
        });
      }
    }

    // Calculate follow pass rate average safely
    const totalFollowChecks = totalFollowPassed + totalFollowFailed;
    const aggregateFollowRate =
      totalFollowChecks > 0
        ? Math.round((totalFollowPassed / totalFollowChecks) * 100)
        : 100;

    const hasActivity =
      totalComments > 0 ||
      totalDmsOpened > 0 ||
      totalClicks > 0 ||
      totalFollowPassed > 0 ||
      totalFollowFailed > 0;

    return (
      <AppShell variant="dashboard" activeNav="analytics">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          {/* Page Title & Account Switcher */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-300">
                Performance
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
                Analytics
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Trigger counts, link clicks, and conversion rates per
                automation.
              </p>
            </div>

            <AccountSwitcher accounts={accounts} activeAccountId={activeAccount.id} />

          </div>

          {/* Aggregates Overview Cards */}
          <div className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Comments received"
              value={totalComments}
              accent="from-brand-500/30 to-brand-500/0"
            />
            <MetricCard
              label="DMs acknowledged"
              value={totalDmsOpened}
              accent="from-cyan-400/30 to-cyan-400/0"
            />
            <MetricCard
              label="Follow pass rate"
              value={
                totalFollowChecks > 0 ? `${aggregateFollowRate}%` : '100%'
              }
              accent="from-emerald-400/30 to-emerald-400/0"
            />
            <MetricCard
              label="Total link clicks"
              value={totalClicks}
              accent="from-accent-500/30 to-accent-500/0"
            />
          </div>

          {/* Automations Performance Table / Empty State */}
          {!hasActivity ? (
            <div className="mx-auto max-w-4xl rounded-3xl border border-dashed border-white/8 bg-white/[0.015] px-6 py-20 text-center text-slate-500">
              <svg
                className="mx-auto mb-4 h-12 w-12 text-slate-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="m7 14 4-4 4 4 5-6" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-200">
                No activity yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed">
                Once comments are detected and automations trigger responses or
                track link clicks, your analytics stats will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="border-b border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-base font-semibold text-white">
                  Automation performance
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Detailed breakdown of conversions per rule.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <th className="px-6 py-4">Automation</th>
                      <th className="px-6 py-4">Scope / Post</th>
                      <th className="px-6 py-4 text-center">Comments</th>
                      <th className="px-6 py-4 text-center">DMs</th>
                      <th className="px-6 py-4 text-center">Follow rate</th>
                      <th className="px-6 py-4 text-center">Clicks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                    {statsList.map((stat) => {
                      const checks =
                        stat.followPassed + stat.followFailed;
                      const followRate =
                        checks > 0
                          ? Math.round((stat.followPassed / checks) * 100)
                          : null;

                      return (
                        <tr
                          key={stat.id}
                          className="transition-colors hover:bg-white/[0.02]"
                        >
                          <td className="px-6 py-4 font-medium text-white">
                            {stat.name}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            {stat.media_scope === 'any' ? (
                              <span className="inline-block rounded-md border border-white/8 bg-ink-900 px-2 py-0.5 text-slate-300">
                                Any post
                              </span>
                            ) : (
                              <span className="inline-block rounded-md border border-brand-500/20 bg-brand-500/10 px-2 py-0.5 font-mono text-[11px] text-brand-300">
                                {stat.media_id?.slice(0, 12) ?? '—'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-white">
                            {stat.comments}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-white">
                            {stat.dmsOpened}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-white">
                            {followRate === null ? (
                              <span className="text-slate-500">N/A</span>
                            ) : (
                              `${followRate}%`
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-white">
                            {stat.clicks}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    );
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      ('digest' in err || 'message' in err)
    ) {
      const errorObj = err as { digest?: string; message?: string };
      if (
        errorObj.digest === 'DYNAMIC_SERVER_USAGE' ||
        errorObj.message?.includes('Dynamic server usage')
      ) {
        throw err;
      }
    }
    console.error('[Analytics Page Server Exception]', err);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-red-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <h1 className="text-xl font-semibold text-white">
            Failed to load analytics
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            An unexpected error occurred while compiling your analytics data.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="btn-secondary px-4 py-2 text-xs"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${accent} blur-2xl`}
      />
      <div className="relative">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </div>
        <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}

'use client';

function AccountSwitcher({
  accounts,
  activeAccountId,
}: {
  accounts: { id: string; ig_username: string }[];
  activeAccountId: string;
}) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        defaultValue={activeAccountId}
        onChange={(e) => {
          const url = new URL(window.location.href);
          url.searchParams.set('accountId', e.target.value);
          window.location.href = url.toString();
        }}
        className="w-full appearance-none rounded-xl border border-white/8 bg-ink-900/60 px-4 py-2.5 pr-10 text-sm font-medium text-slate-100 outline-none transition-all focus:border-brand-400/50 focus:ring-2 focus:ring-brand-400/20 sm:min-w-[200px]"
      >
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            @{a.ig_username}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
