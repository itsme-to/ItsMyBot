import { Expansion, Context } from '@itsmybot';
import Utils from '@utils';

export default class PerformanceExpansion extends Expansion {
  name = 'performance';

  async onRequest(context: Context, placeholder: string) {
    switch (placeholder) {
      case 'total_memory':
        return process.memoryUsage().heapTotal.toString();
      case 'used_memory':
        return process.memoryUsage().heapUsed.toString();
      case 'free_memory':
        return (process.memoryUsage().heapTotal - process.memoryUsage().heapUsed).toString();
      case 'free_memory_percent':
        return (process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) / process.memoryUsage().heapTotal * 100 + "%";
      case 'uptime':
        return Utils.formatTime(process.uptime())
      case 'cpu_usage':
        return process.cpuUsage().user.toString();
      case 'cpu_usage_percent':
        return process.cpuUsage().user / process.cpuUsage().system * 100 + "%";
      default:
        return "Unknown performance variable";
    }
  }
}