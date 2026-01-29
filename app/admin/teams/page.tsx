import { createClient } from "@/lib/supabase/server";
import { Crown } from "lucide-react";
import AdminTeamActions from "@/components/AdminTeamActions";

export default async function AdminTeamsPage() {
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
      owner:profiles!teams_owner_id_fkey(id, username, role)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">გუნდების მართვა</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-800">
          <thead className="bg-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">გუნდი</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ლიდერი</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">სტატუსი</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">VIP</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">მოქმედება</th>
            </tr>
          </thead>
          <tbody className="bg-neutral-900 divide-y divide-neutral-800">
            {(teams || []).map((team) => (
              <tr key={team.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-white">{team.name}</div>
                      <div className="text-sm text-gray-500">{team.tag}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{team.owner?.username || 'Unknown'}</div>
                  <div className="text-xs text-gray-500">{team.owner?.role || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${team.status === 'APPROVED' ? 'bg-green-900 text-green-200' : 
                      team.status === 'PENDING' ? 'bg-yellow-900 text-yellow-200' : 
                      team.status === 'BLOCKED' ? 'bg-red-900 text-red-200' : 'bg-gray-800 text-gray-200'}`}>
                    {team.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {team.is_vip ? <Crown className="w-5 h-5 text-yellow-500" /> : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <AdminTeamActions team={{
                    id: team.id,
                    name: team.name,
                    tag: team.tag,
                    status: team.status,
                    isVip: team.is_vip,
                    leaderId: team.owner_id
                  }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
