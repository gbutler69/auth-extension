import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Type,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';
import { POLICIES_KEY } from '../decorators/policies.decorator';
import { Policy } from '../policies/interfaces/policy.interface';
import { PolicyHandlerStorage } from '../policies/policy-handlers.storage';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly policyHandlerStorage: PolicyHandlerStorage,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policies = this.reflector.getAllAndOverride<Policy[]>(POLICIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (policies) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const user: ActiveUserData =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        context.switchToHttp().getRequest()[REQUEST_USER_KEY];
      await Promise.all(
        policies.map((policy) => {
          const policyHandler = this.policyHandlerStorage.get(
            policy.constructor as Type,
          );
          return policyHandler && policyHandler.handle(policy, user);
        }),
      ).catch((err) => {
        if (err instanceof Error) throw new ForbiddenException(err.message);
        else throw new ForbiddenException('Forbidden');
      });
    }
    return true;
  }
}
