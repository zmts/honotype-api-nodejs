import { Hono, Context } from 'hono';

import { getCurrentUserJwt } from '@libs/common/jwt';
import { BaseController, IBaseController } from '@libs/core';

import { CreatePostAction } from './actions';
import { dependency } from './dependency';
import { CreatePostDto } from './inout';

export class PostsController extends BaseController implements IBaseController {
  constructor(private router = new Hono().basePath('posts')) {
    super();
  }

  get routes(): Hono {
    this.router.post('/', async (c: Context) =>
      this.execute(
        c,
        new CreatePostAction(dependency).run(new CreatePostDto(await c.req.json()), getCurrentUserJwt(c)),
      ),
    );
    return this.router;
  }

  init(): Promise<void> {
    console.log(`${this.constructor.name} started...`);
    return Promise.resolve();
  }
}
