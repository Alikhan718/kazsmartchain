import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { DiplomasService } from './diplomas.service';
import { AuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../rbac/tenant.guard';
import { RolesGuard } from '../rbac/roles.guard';
import { Roles } from '../rbac/roles.decorator';

@Controller('/api/diplomas')
export class DiplomasController {
  constructor(private readonly diplomas: DiplomasService) {}

  /**
   * Синхронизация диплома из app.ediploma.kz
   */
  @Post(':orgId/sync')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator')
  async sync(@Param('orgId') orgId: string, @Body() body: { ediplomaId: string }) {
    return this.diplomas.syncFromEdiploma(orgId, body.ediplomaId);
  }

  /**
   * Получение диплома по ID
   */
  @Get(':diplomaId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OrgAdmin', 'Auditor', 'Operator')
  async getById(@Param('diplomaId') diplomaId: string) {
    return this.diplomas.getById(diplomaId);
  }

  /**
   * Верификация диплома (публичный endpoint)
   */
  @Get('/verify/:ediplomaId')
  async verify(
    @Param('ediplomaId') ediplomaId: string,
    @Query('studentIIN') studentIIN?: string,
    @Query('studentName') studentName?: string,
  ) {
    return this.diplomas.verify(ediplomaId, { studentIIN, studentName });
  }

  /**
   * Верификация диплома по ИИН (публичный endpoint для студентов)
   */
  @Get('/verify-by-iin/:iin')
  async verifyByIIN(@Param('iin') iin: string) {
    return this.diplomas.verifyByIIN(iin);
  }

  /**
   * Получение диплома по Solana mint (публичный endpoint для верификации)
   */
  @Get('/solana/:mint')
  async getBySolanaMint(@Param('mint') mint: string) {
    const diploma = await this.diplomas.getBySolanaMint(mint);
    if (!diploma) {
      return { found: false };
    }
    return { found: true, diploma };
  }

  /**
   * Получение приватных данных диплома
   */
  @Get(':orgId/:diplomaId/private')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Operator')
  async getPrivateData(@Param('orgId') orgId: string, @Param('diplomaId') diplomaId: string) {
    return this.diplomas.getPrivateData(diplomaId, orgId);
  }

  /**
   * Отзыв диплома
   */
  @Post(':orgId/:diplomaId/revoke')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin')
  async revoke(@Param('orgId') orgId: string, @Param('diplomaId') diplomaId: string) {
    return this.diplomas.revoke(orgId, diplomaId);
  }

  /**
   * Список дипломов организации
   */
  @Get(':orgId')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('OrgAdmin', 'Auditor', 'Operator')
  async list(
    @Param('orgId') orgId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.diplomas.list(orgId, limit ? parseInt(limit, 10) : 50, offset ? parseInt(offset, 10) : 0);
  }
}

