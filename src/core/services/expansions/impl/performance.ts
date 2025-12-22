import { Expansion, Context, Utils } from '@itsmybot';

export default class PerformanceExpansion extends Expansion {
  name = 'performance';

  async onRequest(context: Context, placeholder: string) {
    const memoryUsage = process.memoryUsage()

    switch (placeholder) {
      case 'total_memory':
        return `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`;
      case 'used_memory':
        return `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`;
      case 'free_memory':
        return `${Math.round((memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024 * 100) / 100} MB`;
      case 'free_memory_percent':
        return Math.round((memoryUsage.heapTotal - memoryUsage.heapUsed) / memoryUsage.heapTotal * 100) + "%";
      case 'uptime':
        return Utils.formatTime(Math.round(process.uptime()))
      case 'cpu_usage_percent':
        return Math.round(process.cpuUsage().user / process.cpuUsage().system * 100) + "%";
    }
  }
}