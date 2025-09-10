import { Embed, Message, MessageComponent, ActionRow, ButtonComponent, TextDisplayComponent, SeparatorComponent, SectionComponent, ContainerComponent, TextBasedChannel } from 'discord.js';
import { Utils } from '@itsmybot';

export async function transcript(channel: TextBasedChannel, limit = 100) {
  const messages = await channel.messages.fetch({ limit });
  const transcriptLines = [];
  for (const message of messages.reverse().values()) {
    if (message.partial) {
      await message.fetch();
    }
    transcriptLines.push(transcriptMessage(message))
    transcriptLines.push(' ')
  }
  transcriptLines.push(`###################################################################`);
  transcriptLines.push(`Transcript of ${'name' in channel ? channel.name : 'Unknown Channel'} (${channel.id})`);
  transcriptLines.push(`Created at ${new Date().toLocaleString()}`);
  return transcriptLines.join('\n');
}

export function transcriptMessage(message: Message) {
  const lines = [];
  lines.push(`###################################################################`);
  lines.push(' ')
  lines.push(`${message.author.username} ${message.author.bot ? '[BOT] ' : ''}- ${message.createdAt.toLocaleString()}`);
  lines.push(`-------------------------------------------------------------------`);
  message.content = Utils.blockPlaceholders(message.content);
  if (message.content) lines.push(...message.cleanContent.split('\n'));
  if (message.embeds) {
    for (const embed of message.embeds) {
      lines.push(...transcriptEmbed(embed).map(line => `| ${line}`));
    }
  }

  if (message.components) {
    const components = [];
    for (const component of message.components) {
      components.push(...transcriptComponent(component))
    }
    if (components.length) {
      if (lines.length > 4) lines.push('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
      lines.push(...components);
    }
  }
  return lines.join('\n');
}

function transcriptComponent(component: MessageComponent) {
  const lines: string[] = [];
  if (component instanceof TextDisplayComponent) {
    lines.push(...component.content.split('\n'));
  } else if (component instanceof SeparatorComponent) {
    lines.push('- - - - -');
  } else if (component instanceof SectionComponent) {
    for (const sectionComponent of component.components) {
      lines.push(...transcriptComponent(sectionComponent));
    }
  } else if (component instanceof ContainerComponent) {
    lines.push(' ')
    for (const containerComponent of component.components) {
      lines.push(...transcriptComponent(containerComponent).map(line => `| ${line}`));
    }
  } else if (component instanceof ActionRow) {
    const actionRowComponents = []
    for (const actionRowComponent of component.components) {
      const actionRowLine = transcriptComponent(actionRowComponent);
      if (actionRowLine.length) actionRowComponents.push(...actionRowLine);
    }
    if (actionRowComponents.length) lines.push(actionRowComponents.join(' '));
  } else if (component instanceof ButtonComponent) {
    lines.push(`[ ${component.label ? component.label : 'Emoji' }${component.url ? ` (${component.url})` : ''} ]`);
  }
  return lines
}

function transcriptEmbed(embed: Embed) {
  const lines = [];
  if (embed.title) lines.push(`[Title] ${embed.title} ${embed.url ? `(${embed.url})` : ''}`);
  if (embed.author) lines.push(`[Author] ${embed.author.name} ${embed.author.url ? `(${embed.author.url})` : ''}`);
  if (embed.description) {
    if (lines.length > 0) lines.push('---');
    lines.push(...embed.description.split('\n'));
  } 
  if (embed.fields.length) {
    if (lines.length > 0 && lines[lines.length - 1] !== '---') lines.push('---');
    for (const field of embed.fields) {
      lines.push(`[Field] ${field.name}`);
      if (field.value) lines.push(...field.value.split('\n'));
    }
  }
  if (embed.footer?.text) {
    if (lines.length > 0 && lines[lines.length - 1] !== '---') lines.push('---');
    lines.push(`[Footer] ${embed.footer.text}}`);
  } 
  return lines;
}