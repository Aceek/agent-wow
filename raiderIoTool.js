import axios from 'axios';
import { Tool } from 'langchain/tools';

class RaiderIoTool extends Tool {
  constructor() {
    super();
    this.name = "RaiderIoTool";
    this.description = "Utilisez cet outil pour obtenir des informations sur un joueur de World of Warcraft à partir de Raider.io. L'entrée doit être au format 'nom-serveur'.";
  }

  async _call(input) {
    const [name, realm] = input.split('-');
    if (!name || !realm) {
      return "Format d'entrée invalide. Veuillez utiliser le format 'nom-serveur'.";
    }

    try {
      const response = await axios.get(`https://raider.io/api/v1/characters/profile?region=eu&realm=${realm}&name=${name}&fields=gear,mythic_plus_scores_by_season:current,raid_progression`);
      const data = response.data;

      return `
        Informations sur ${data.name} (${data.realm}):
        Classe: ${data.class}
        iLvl: ${data.gear.item_level_equipped}
        Score Mythic+ (saison actuelle): ${data.mythic_plus_scores_by_season[0].scores.all}
        Progression en raid:
        ${Object.entries(data.raid_progression).map(([raid, prog]) => `  ${raid}: ${prog.summary}`).join('\n')}
      `;
    } catch (error) {
      return `Erreur lors de la récupération des informations: ${error.message}`;
    }
  }
}

export { RaiderIoTool };
