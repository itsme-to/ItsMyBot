import { Addon } from '@itsmybot';

interface VersionStats {
  name_raw: string;
  name_clean: string;
  name_html: string;
  protocol: number;
}

interface PlayersStats {
  online: number;
  max: number;
  list: undefined[];
}

interface MotdStats {
  raw: string;
  clean: string;
  html: string;
}

export interface ServerStats {
  online: boolean;
  host: string;
  port: number;
  ip_address: string | null;
  eula_blocked: boolean;
  version: VersionStats | null;
  players: PlayersStats | null;
  motd: MotdStats | null;
  icon: string | null;
  mods: undefined[] | null;
  software: string | null;
  addons: undefined[] | null;
  srv_record: undefined | null;
}

export default class MCStatsAddon extends Addon {
  version = "2.0.0"
  authors = ["Théo"]
  description = "Get the status of a Minecraft server"
  website = "https://docs.itsmy.studio/itsmybot/addons/mcstatus"
  
  async load() { }

  async fetchStatus(address: string) {
    try {
      const response = await fetch(`https://api.mcstatus.io/v2/status/java/${address}`);
      const data = await response.json();
      return data as ServerStats;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Could not retrieve Minecraft server status (${address}).`, message);
      return {
        online: false,
        host: address.split(":")[0],
        port: 25565,
        ip_address: null,
        eula_blocked: false,
        version: null,
        players: null,
        motd: null,
        icon: null,
        mods: null,
        software: null,
        addons: null,
        srv_record: null
      } as ServerStats;
    }
  }
}