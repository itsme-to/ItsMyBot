import { Addon, ConfigFile } from '@itsmybot';
import DefaultConfig from './resources/config.js';
import LangConfig from './resources/lang.js';

interface MCStatsConfig {
  config: ConfigFile;
  lang: ConfigFile;
}

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
  version = "1.2.4"
  authors = ["Théo"]
  description = "Get the status of a Minecraft server"
  website = "https://builtbybit.com/resources/31222/"

  configs: MCStatsConfig = {} as MCStatsConfig;

  async load() {
    this.configs.config = await this.createConfig('config.yml', DefaultConfig);
    this.configs.lang = await this.createConfig('lang.yml', LangConfig);
  }

  async fetchStatus(address: string, port: number = 25565) {
    try {
      const response = await fetch(`https://api.mcstatus.io/v2/status/java/${address}:${port}`);
      const data = await response.json();
      return data as ServerStats;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Could not retrieve Minecraft server status (${address}:${port}).`, message);
      return {
        online: false,
        host: address,
        port,
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