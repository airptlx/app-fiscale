/**
 * Levée quand la situation décrite par les réponses n'est pas encore prise en
 * charge par le moteur de calcul de l'année concernée. Le message est déjà en
 * langage courant : l'UI l'affiche tel quel plutôt que de dupliquer la logique
 * "qu'est-ce qui est supporté" (CLAUDE.md règle 1).
 */
export class UnsupportedSituationError extends Error {
  constructor(
    message = "Cette situation n'est pas encore prise en charge par l'outil. Pour l'instant, sont gérées : une personne célibataire sans personne à charge, ou un couple marié/pacsé avec ou sans enfants à charge. Les situations de parent isolé, divorce, veuvage ou union libre avec garde partagée ne sont pas encore prises en charge.",
  ) {
    super(message);
    this.name = "UnsupportedSituationError";
  }
}
