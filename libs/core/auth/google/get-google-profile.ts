import { SocialAuthProvidersEnum, SocialProfile } from '../';

import { GoogleAuthProfile } from './';

export function getGoogleProfile(profile: GoogleAuthProfile): SocialProfile {
  const fullName = `${profile.given_name} ${profile.family_name}`.trim();

  return {
    id: profile.id,
    email: profile.email,
    name: fullName || profile.name,
    provider: SocialAuthProvidersEnum.GOOGLE,
    picture: profile.picture,
  };
}
