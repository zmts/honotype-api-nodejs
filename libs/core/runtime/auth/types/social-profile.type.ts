import { SocialAuthProvidersEnum } from './';

export type SocialProfile = {
  id: string;
  email: string;
  name: string;
  picture: string;
  provider: SocialAuthProvidersEnum;
};
