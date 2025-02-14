import { BaseAction } from '@libs/core';
import { SocialProfile } from '@libs/core/auth';
import { User } from '@libs/entities';

import { IAuthDependency } from '../dependency';
import { LoginResource } from '../inout';

export class LoginGoogleAction extends BaseAction<[SocialProfile], LoginResource> {
  constructor(
    deps: IAuthDependency,
    private usersRepo = deps.usersRepo,
    private jwtService = deps.jwtService,
  ) {
    super();
  }

  async run(profile: SocialProfile): Promise<LoginResource> {
    const userModel = new User({
      email: profile.email,
      socialId: profile.id,
      socialProvider: profile.provider,
      firstname: profile.name,
    });
    const user = await this.usersRepo.findOrCreateByEmail(userModel);
    const accessToken = this.jwtService.sigh({ id: user.id, uuid: user.uuid });

    return new LoginResource({ accessToken });
  }
}
