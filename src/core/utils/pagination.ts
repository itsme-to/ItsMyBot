import { MessageComponentInteraction, StringSelectMenuInteraction, RepliableInteraction, InteractionResponse } from 'discord.js';
import { manager, Config, Context, TopLevelComponentBuilder, Variable, Utils } from '@itsmybot'

interface Item {
  label?: string;
  emoji?: string;
  description?: string;
  tags?: string[]
  variables: Variable[]
  context?: Context
}

interface Filter {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
}

export class Pagination {
  interaction: RepliableInteraction

  type: 'select_menu' | 'button' = 'select_menu'
  context: Context = {}
  filters: Filter[] = []
  variables: Variable[] = []
  config: Config
  placeholderText: string

  defaultItems: Item[]
  currentFilters: string[] = []
  filteredItems: Item[]
  currentItem: number = 0
  currentPage: number = 0
  itemsPerPage: number = 25
  time: number = 100000;

  message?: InteractionResponse

  constructor(interaction: RepliableInteraction, items: Item[], config: Config) {
    this.interaction = interaction;
    this.config = config
    this.filteredItems = items;
    this.defaultItems = items;

    this.placeholderText = manager.configs.lang.getString("pagination.placeholder");
    return this;
  }

  /**
    * Set the type of pagination
    */
  setType(type: 'select_menu' | 'button') {
    this.type = type;

    return this;
  }

  /**
    * Set the items per page. Default is 25
    */
  setItemsPerPage(itemsPerPage: number) {
    this.itemsPerPage = itemsPerPage;

    return this;
  }

  /**
    * Set the variables to be used in the message
    */
  setVariables(variables: Variable[]) {
    this.variables = variables;

    return this;
  }

  /**
    * Set the categories to be used in the select menu
    */
  setFilters(filters: Filter[]) {
    this.filters = filters;

    return this;
  }

  /**
    * Set the context to be used in the message
    */
  setContext(context: Context) {
    this.context = context;

    return this;
  }

  /**
    * Set the time for the collector to listen
    */
  setTime(interval: number) {
    this.time = interval;

    return this;
  }

  /**
    * Set the placeholder text for the select menu
    */
  setPlaceholderText(placeholderText: string) {
    this.placeholderText = placeholderText;

    return this;
  }

  /**
   * Send the pagination message
   */
  async send() {
    if (!this.filteredItems.length) {
      return this.interaction.reply(await Utils.setupMessage({
        config: manager.configs.lang.getSubsection("pagination.no-data"),
        variables: this.variables,
        context: this.context
      }));
    }

    this.message = await this.interaction.reply(await Utils.setupMessage({
      config: this.getConfig(),
      variables: this.getVariables(),
      context: this.getContext(),
      components: await this.getComponents(),
    }));

    this.createCollector();
    return this.message;
  }

  private createCollector() {
    const filter = (interaction: MessageComponentInteraction) => ['pagination_items', 'pagination_previous', 'pagination_next', 'pagination_filters'].includes(interaction.customId);

    const collector = this.message!.createMessageComponentCollector({ filter,  time: this.time });

    collector.on('collect', async (interaction: MessageComponentInteraction) => {
      if (interaction.customId === 'pagination_previous') this.prevPage();
      if (interaction.customId === 'pagination_next') this.nextPage();

      if (interaction instanceof StringSelectMenuInteraction) {
        if (interaction.values[0]?.startsWith("item_")) {
          this.currentItem = parseInt(interaction.values[0].split("_", 2)[1]);
        } else {
          this.currentFilters = [];

          for (const filter of interaction.values) {
            const filterId = filter.substring(7);
            this.currentFilters.push(filterId);
          }

          this.filteredItems = this.currentFilters.length
            ? this.defaultItems.filter(item => item.tags?.some(tag => this.currentFilters.includes(tag)))
            : this.defaultItems;

          this.currentPage = 0;
          this.currentItem = 0;
        }
      };

      interaction.update(await Utils.setupMessage({
        config: this.getConfig(),
        variables: this.getVariables(),
        context: this.getContext(),
        components: await this.getComponents(),
      }));
    });

    collector.on('end', async () => {
      this.message!.edit(await Utils.setupMessage({
        config: this.getConfig(),
        variables: this.getVariables(),
        context: this.getContext()
      }));
    });
  }

  private getConfig() {
    return this.filteredItems.length ? this.config : manager.configs.lang.getSubsection("pagination.no-data");
  }

  private getContext() {
    let context = this.context;
    const items = this.getCurrentItems();
    const list = []

    if (this.type === 'select_menu') {
      const item = this.filteredItems[this.currentItem];
      if (item) {
        context = { ...context, ...item.context };
      }
    }
    
    for (const item of items) {
      const variables = [ ...item.variables,
        { searchFor: "%item_label%", replaceWith: item.label || "" },
        { searchFor: "%item_value%", replaceWith: `item_${this.filteredItems.indexOf(item)}` },
        { searchFor: "%item_emoji%", replaceWith: item.emoji || "" },
        { searchFor: "%item_description%", replaceWith: item.description || "" },
        { searchFor: "%item_tags%", replaceWith: item.tags?.join(", ") || "" }
      ];

      list.push({
        context: item.context || this.context,
        variables: variables
      });
    }

    if (!context.data) context.data = new Map();
    context.data.set('pagination-items', list);

    const listFilters = [];

    if (this.filters.length) {
      for (const filter of this.filters) {
        const isSelected = this.currentFilters.includes(filter.id);

        const variables = [...this.variables, 
          { searchFor: "%filter_id%", replaceWith: `filter_${filter.id}` },
          { searchFor: "%filter_label%", replaceWith: filter.name },
          { searchFor: "%filter_emoji%", replaceWith: filter.emoji || "" },
          { searchFor: "%filter_description%", replaceWith: filter.description || "" },
          { searchFor: "%filter_selected%", replaceWith: isSelected ? "true" : "false" }
        ];

        listFilters.push({
          context: this.context,
          variables: variables
        });
      }
      context.data.set('pagination-filters', listFilters);
    }

    return context;
  }

  private async getComponents() {
    if (!this.filteredItems.length) return []
    const components = [];

    for (const component of manager.configs.lang.getSubsections('pagination.components')) {
      const comp = await Utils.setupComponent<TopLevelComponentBuilder>({
        config: component,
        variables: this.getVariables(),
        context: this.getContext()
      });

      if (comp?.length) components.push(...comp);
    }

    return components;
  }

  private getVariables() {
    const variables = [...this.variables,
      { searchFor: "%pagination_current_page%", replaceWith: this.currentPage + 1 },
      { searchFor: "%pagination_total_pages%", replaceWith: this.getTotalPages() },
      { searchFor: "%pagination_has_previous%", replaceWith: this.currentPage > 0 },
      { searchFor: "%pagination_has_next%", replaceWith: this.currentPage < this.getTotalPages() - 1 },
      { searchFor: "%pagination_is_select%", replaceWith: this.type === 'select_menu' },
      { searchFor: "%pagination_is_button%", replaceWith: this.type === 'button' },
      { searchFor: "%pagination_placeholder%", replaceWith: this.placeholderText },
      { searchFor: "%pagination_has_filter%", replaceWith: this.filters.length > 0 },
    ];

    if (this.type === 'select_menu') {
      const item = this.filteredItems[this.currentItem];
      if (item) {
        variables.push(...item.variables);
      }
    }

    return variables;
  }

  private getCurrentItems() {
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredItems.length);
    return this.filteredItems.slice(startIndex, endIndex);
  }

  private getTotalPages() {
    return Math.ceil(this.filteredItems.length / this.itemsPerPage);
  }

  private nextPage() {
    if (this.currentPage < this.getTotalPages() - 1) {
      this.currentPage++;
    }
  }

  private prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
}
