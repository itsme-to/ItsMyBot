import { VoiceState } from 'discord.js';
import { Event, Events } from '@itsmybot';

export default class VoiceStateUpdateEvent extends Event {
    name = Events.VoiceStateUpdate;
    priority = 0;

    async execute(oldState: VoiceState, newState: VoiceState) {
        if (oldState.channelId === newState.channelId) {
            return;
        }

        if (oldState.channel) {
            this.manager.client.emit(Events.VoiceLeave, oldState);
        }
        
        if (newState.channel) {
            this.manager.client.emit(Events.VoiceJoin, newState);
        }
    }
}