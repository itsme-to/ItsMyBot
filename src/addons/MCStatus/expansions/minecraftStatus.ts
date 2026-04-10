import { Expansion, Context, Cooldown } from '@itsmybot';
import MCStatsAddon, { ServerStats } from '../index.js';

export default class MCStatusExpansion extends Expansion<MCStatsAddon> {
  name = 'mcstatus';
  cooldown = new Cooldown(300);
  status: Map<string, ServerStats> = new Map();

  async onRequest(context: Context, placeholder: string) {
    const serverIp = placeholder.split("_")[0];

    let stats: ServerStats | undefined = undefined;
    if (this.status.has(serverIp)) {
      if (this.cooldown.isOnCooldown(serverIp)) {
        stats = this.status.get(serverIp);
      }
    }

    if (!stats) {
      stats = await this.addon.fetchStatus(serverIp);
      this.status.set(serverIp, stats);
      this.cooldown.setCooldown(serverIp);
      return this.handlePlaceholder(placeholder, serverIp, stats);
    } else {
      return this.handlePlaceholder(placeholder, serverIp, stats);
    } 
  }

  handlePlaceholder(placeholder: string, serverIp: string, stats: ServerStats) {
    switch (placeholder.substring(serverIp.length + 1)) {
      case "players":
        return stats.players ? `${stats.players.online}` : "0";
      case "max_players":
        return stats.players ? `${stats.players.max}` : "0";
      case "motd":
        return stats.motd ? stats.motd.clean : this.addon.lang.getString("no-motd");
      case "version":
        return stats.version ? stats.version.name_clean : this.addon.lang.getString("unknown");
      case "host":
        return stats.host;
      case "port":
        return stats.port.toString();
      case "online":
        return stats.online ? 'true' : 'false';
      case "status":
        return stats.online ? this.addon.lang.getString("online") : this.addon.lang.getString("offline");
      case "icon":
        return `https://mcstatus.snowdev.com.br/api/favicon/${stats.host}:${stats.port}/favicon.png`
      default:
        return "Invalid placeholder";
    }
  }
}
