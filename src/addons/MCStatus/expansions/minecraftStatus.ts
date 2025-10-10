import { Expansion, Context, Cooldown } from '@itsmybot';
import MCStatsAddon, { ServerStats } from '..';

export default class MCStatusExpansion extends Expansion<MCStatsAddon> {
  name = 'mcstatus';
  cooldown = new Cooldown(300);
  status: Map<string, ServerStats> = new Map();

  async onRequest(context: Context, placeholder: string) {
    const servers = this.addon.configs.config.getSubsections("servers");
    const serverId = placeholder.split("_")[0];

    const server = servers.find((server) => server.getString('id') === serverId);
    if (!server) return "Server not found";

    let stats: ServerStats | undefined = undefined;
    if (this.status.has(serverId)) {
      if (this.cooldown.isOnCooldown(serverId)) {
        stats = this.status.get(serverId);
      }
    }

    if (!stats) {
      stats = await this.addon.fetchStatus(server.getString("address"), server.getNumber("port"));
      if (stats) {
        this.status.set(serverId, stats);
        this.cooldown.setCooldown(serverId);
        return this.handlePlaceholder(placeholder, serverId, stats);
      }
      return "Server not found";
    } else {
      return this.handlePlaceholder(placeholder, serverId, stats);
    } 
  }

  async handlePlaceholder(placeholder: string, serverId: string, stats: ServerStats) {
    switch (placeholder.substring(serverId.length + 1)) {
      case "players":
        return stats.players ? `${stats.players.online}` : "0";
      case "max_players":
        return stats.players ? `${stats.players.max}` : "0";
      case "motd":
        return stats.motd ? stats.motd.clean : this.addon.configs.lang.getString("no-motd");
      case "version":
        return stats.version ? stats.version.name_clean : this.addon.configs.lang.getString("unknown");
      case "host":
        return stats.host;
      case "port":
        return stats.port.toString();
      case "online":
        return stats.online ? 'true' : 'false';
      case "status":
        return stats.online ? this.addon.configs.lang.getString("online") : this.addon.configs.lang.getString("offline");
      default:
        return "Invalid placeholder";
    }
  }
}
