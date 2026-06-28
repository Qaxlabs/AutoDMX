import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

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
  searchParams,
}: {
  searchParams: { accountId?: string };
}) {
  const supabase = createClient();


  // 1. Fetch connected accounts
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id, ig_username, ig_user_id')
    .order('created_at', { ascending: false });

  if (accountsError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 text-center">
        <h1 className="text-xl font-bold text-red-400">Database Error</h1>
        <p className="text-slate-400 mt-2">{accountsError.message}</p>
      </div>
    );
  }

  // Handle empty state
  if (!accounts || accounts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              AutoDMX
            </span>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-24 flex-1 flex flex-col justify-center items-center text-center relative z-10">
          <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">No Connected Accounts</h2>
          <p className="text-sm text-slate-400 max-w-sm mt-2 mb-8 leading-relaxed">
            Please connect your Instagram Creator or Business account in settings to start viewing analytics.
          </p>
          <Link
            href="/dashboard/settings"
            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
          >
            Go to Settings
          </Link>
        </main>
      </div>
    );
  }

  // 2. Select active account
  const activeAccount =
    accounts.find((acc) => acc.id === searchParams.accountId) || accounts[0];

  // 3. Fetch automations for active account
  const { data: automations, error: automationsError } = await supabase
    .from('automations')
    .select('id, name, media_id, media_scope')
    .eq('account_id', activeAccount.id);

  if (automationsError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 text-center">
        <h1 className="text-xl font-bold text-red-400">Database Error</h1>
        <p className="text-slate-400 mt-2">{automationsError.message}</p>
      </div>
    );
  }

  const typedAutomations = automations || [];
  const automationIds = typedAutomations.map((a) => a.id);

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
      console.error('[Analytics] Failed to fetch message logs:', logsError.message);
    } else if (logs) {
      logs.forEach((log) => {
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
      console.error('[Analytics] Failed to fetch link clicks:', clicksError.message);
    } else if (clicksData) {
      clicksData.forEach((click) => {
        const auto = statsList.find((s) => s.id === click.automation_id);
        if (auto) {
          auto.clicks++;
          totalClicks++;
        }
      });
    }
  }

  // Calculate follow pass rate average
  const totalFollowChecks = totalFollowPassed + totalFollowFailed;
  const aggregateFollowRate =
    totalFollowChecks > 0 ? Math.round((totalFollowPassed / totalFollowChecks) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              AutoDMX
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
              Dashboard
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/dashboard/contacts" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
              Contacts
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-sm font-medium text-slate-300">Analytics</span>
            <span className="text-slate-700">|</span>
            <Link href="/dashboard/settings" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
              Settings
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" title="System Status: Online" />
            <span className="text-xs text-slate-400">System Online</span>
          </div>
        </div>
      </header>

      {/* Analytics Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Page Title & Account Switcher */}
        <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Analytics</h1>
            <p className="text-sm text-slate-400 mt-1">Track trigger counts, link clicks, and conversion rates.</p>
          </div>

          {/* Account Dropdown */}
          <div className="relative">
            <select
              defaultValue={activeAccount.id}
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set('accountId', e.target.value);
                window.location.href = url.toString();
              }}
              className="appearance-none bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 focus:border-violet-500/50 outline-none text-sm cursor-pointer font-semibold"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  @{a.ig_username}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Aggregates Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Comments Received</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-100">{totalComments}</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">DMs Acknowledged</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-100">{totalDmsOpened}</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Follow Pass Rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-100">{aggregateFollowRate}%</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Link Clicks</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-100">{totalClicks}</span>
            </div>
          </div>
        </div>

        {/* Automations Performance Table */}
        <div className="border border-slate-900 bg-slate-900/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-900 bg-slate-900/20">
            <h3 className="text-lg font-bold text-slate-200">Automation Performance</h3>
            <p className="text-xs text-slate-500 mt-1">Detailed breakdown of conversions per rule.</p>
          </div>

          {statsList.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-sm">
              <svg className="w-12 h-12 text-slate-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              No automations configured for this account.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-900/20 text-[10px] font-bold tracking-widest uppercase text-slate-400">
                    <th className="px-6 py-4">Automation Name</th>
                    <th className="px-6 py-4">Scope / Post</th>
                    <th className="px-6 py-4 text-center">Comments</th>
                    <th className="px-6 py-4 text-center">DMs Opened</th>
                    <th className="px-6 py-4 text-center">Follow Rate</th>
                    <th className="px-6 py-4 text-center">Link Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50 text-sm text-slate-300">
                  {statsList.map((stat) => {
                    const checks = stat.followPassed + stat.followFailed;
                    const followRate = checks > 0 ? Math.round((stat.followPassed / checks) * 100) : 100;

                    return (
                      <tr key={stat.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-200">{stat.name}</td>
                        <td className="px-6 py-4 text-xs">
                          {stat.media_scope === 'any' ? (
                            <span className="inline-block bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                              Any Post
                            </span>
                          ) : (
                            <span className="inline-block bg-slate-900/50 text-violet-400 px-2 py-0.5 rounded border border-violet-950/30 font-mono">
                              Post: {stat.media_id}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-100">{stat.comments}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-100">{stat.dmsOpened}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-100">
                          {checks > 0 ? `${followRate}%` : <span className="text-slate-500 font-normal">N/A</span>}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-100">{stat.clicks}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-20">
        <p>© {new Date().getFullYear()} AutoDMX. Analytics Hub.</p>
      </footer>
    </div>
  );
}
