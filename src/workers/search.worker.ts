/**
 * search.worker.ts — Web Worker dedicado para Fuse.js
 *
 * Mueve la instanciación y búsqueda de Fuse.js fuera del Main Thread
 * para evitar jank en dispositivos móviles de gama baja.
 *
 * Protocolo de mensajes:
 *  → { type: 'INIT', data: SearchProduct[] }
 *  → { type: 'SEARCH', query: string }
 *  ← { type: 'RESULTS', results: SearchProduct[] }
 */

import Fuse, { type IFuseOptions } from "fuse.js";

export interface SearchProduct {
  id: string;
  title: string;
  categoryName: string;
}

type InMessage =
  | { type: "INIT"; data: SearchProduct[] }
  | { type: "SEARCH"; query: string };

type OutMessage = { type: "RESULTS"; results: SearchProduct[] };

const FUSE_OPTIONS: IFuseOptions<SearchProduct> = {
  keys: ["title", "categoryName"],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: false,
  minMatchCharLength: 2,
};

let fuse: Fuse<SearchProduct> | null = null;

self.onmessage = (event: MessageEvent<InMessage>) => {
  const { type } = event.data;

  if (type === "INIT") {
    fuse = new Fuse(event.data.data, FUSE_OPTIONS);
    return;
  }

  if (type === "SEARCH" && fuse) {
    const query = event.data.query.trim();

    if (!query) {
      const msg: OutMessage = { type: "RESULTS", results: [] };
      self.postMessage(msg);
      return;
    }

    const raw = fuse.search(query);
    // Slice en el Worker — nunca enviamos más de 10 items al Main Thread
    const results = raw.slice(0, 10).map((r) => r.item);
    const msg: OutMessage = { type: "RESULTS", results };
    self.postMessage(msg);
  }
};
