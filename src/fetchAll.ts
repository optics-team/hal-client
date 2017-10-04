import { Resource } from './Resource';
import { Link } from './Link';

export interface Options {
  embed: string;
  params?: {};
  progress?: (total: number, complete: number) => void;
}

export const fetchAll = async<T extends Resource>(link: Link, { embed, params, progress }: Options) => {
  let items: T[] = [];

  let currentPage = await link.fetch(params);

  while (true) {
    if (currentPage.hasEmbedded(embed)) {
      items = items.concat(currentPage.embedded(embed) as T[]);

      if (progress) {
        progress(currentPage.properties.count, items.length);
      }
    }

    if (!currentPage.hasLink('next')) {
      return {
        items,
        total: items.length
      }
    }

    currentPage = await currentPage.link('next').fetch(params);
  }
}
