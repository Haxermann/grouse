import {legacyLink} from './models/linkLegacy.model';
import {Links} from './models/links.model';

export const startUrl = 'https://nikita.oslomet.no/grouse/';

// Rels
export let REL_PROJECT = 'prosjekt';
export let REL_SELF = 'self';
export let REL_REQUIREMENT = 'krav';
export let REL_DOCUMENT = 'dokument';
export let REL_FUNCTIONALITY = 'funksjon';
export let REL_LOGIN_OAUTH = 'login OAuth2';
export let REL_LOGOUT_OAUTH = 'logout OAuth2';
export let REL_USER = 'konto';

// Legacy Links converter
export function convertFromLegacy(links: legacyLink) {
  // tslint:disable-next-line:new-parens
  const ret = new Links;
  // @ts-ignore
  for (const link of links) {
    if (link.rel === REL_PROJECT) {
      ret.prosjekt.href = link.href;
    } else if (link.rel === REL_SELF) {
      ret.self.href = link.href;
    } else if (link.rel === REL_DOCUMENT) {
      ret.dokument.href = link.href;
    } else if (link.rel === REL_FUNCTIONALITY) {
      ret.funksjon.href = link.href;
    } else if (link.rel === REL_REQUIREMENT) {
      ret.krav.href = link.href;
    }
  }

  return ret;
}

