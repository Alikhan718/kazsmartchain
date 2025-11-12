import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../rbac/roles.guard';
import { Roles } from '../rbac/roles.decorator';

@Controller('/api/network')
export class NetworkController {
  @Post('/permissioning/addAccount')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  addAccount(@Body() body: { address: string }) {
    return { ok: true, added: body.address };
  }

  @Post('/permissioning/removeAccount')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  removeAccount(@Body() body: { address: string }) {
    return { ok: true, removed: body.address };
  }
}

