import axios from 'axios';
import { Tool } from 'langchain/tools';

class SearchTool extends Tool {
  constructor() {
    super();
    this.name = "SearchTool";
    this.description = "Utilisez cet outil pour effectuer une recherche internet et obtenir des informations supplémentaires sur un sujet donné.";
  }

  async _call(input) {
    const apiKey = process.env.TAVILY_API_KEY;
    const baseUrl = 'https://api.tavily.com/search';

    try {
      const response = await axios.get(baseUrl, {
        params: {
          api_key: apiKey,
          query: input
        }
      });

      if (response.data && response.data.results) {
        // Format the results
        const formattedResults = response.data.results.slice(0, 3).map((result, index) => {
          return `${index + 1}. ${result.title}\n${result.content}\nSource: ${result.url}\n`;
        }).join('\n');

        return `Résultats de recherche pour "${input}":\n\n${formattedResults}`;
      } else {
        return "Aucun résultat trouvé pour cette recherche.";
      }
    } catch (error) {
      console.error('Error performing search:', error);
      return `Erreur lors de la recherche: ${error.message}`;
    }
  }
}

export { SearchTool };
