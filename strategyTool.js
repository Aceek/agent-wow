import axios from 'axios';
import * as cheerio from 'cheerio';
import { Tool } from 'langchain/tools';

class StrategyTool extends Tool {
  constructor() {
    super();
    this.name = "StrategyTool";
    this.description = "Utilisez cet outil pour obtenir un résumé de la stratégie pour un boss ou un donjon de World of Warcraft. L'entrée doit être le nom du boss ou du donjon.";
  }

  async _call(input) {
    const searchTerm = encodeURIComponent(input.trim());

    try {
      const response = await axios.get(`https://www.wowhead.com/search?q=${searchTerm}`);
      const $ = cheerio.load(response.data);
      
      // Recherche du premier lien pertinent
      const firstResult = $('.search-results-generic .listview-cleartext').first();
      if (!firstResult.length) {
        return "Aucune stratégie trouvée pour cette recherche.";
      }

      const link = firstResult.attr('href');
      const pageResponse = await axios.get(`https://www.wowhead.com${link}`);
      const $page = cheerio.load(pageResponse.data);

      // Extraction du résumé de la stratégie
      let strategy = $page('#tab-overview').text();
      if (!strategy) {
        strategy = $page('.text').first().text();
      }

      // Limiter la longueur de la stratégie
      const maxLength = 500;
      if (strategy.length > maxLength) {
        strategy = strategy.substring(0, maxLength) + '...';
      }

      return `Résumé de la stratégie pour ${input}:\n\n${strategy}\n\nPour plus de détails, consultez : https://www.wowhead.com${link}`;
    } catch (error) {
      return `Erreur lors de la recherche de la stratégie: ${error.message}`;
    }
  }
}

export { StrategyTool };
