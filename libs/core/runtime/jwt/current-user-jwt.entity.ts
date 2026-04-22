export interface CurrentUserJwt {
  id: number;
  uuid: string;
  email: string;
}

export class CurrentUserJwt {
  constructor(item: Partial<CurrentUserJwt>) {
    Object.assign(this, item);
  }

  protected toJSON?(): CurrentUserJwt {
    return { ...this };
  }
}
