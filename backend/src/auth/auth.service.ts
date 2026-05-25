import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        plan: 'FREE',
      },
    });

    // Seed default bank account
    await this.prisma.account.create({
      data: {
        name: 'Conta Corrente',
        type: 'CHECKING',
        balance: 1000.0, // Start with some mock funds
        userId: user.id,
      },
    });

    // Seed default credit card
    await this.prisma.creditCard.create({
      data: {
        name: 'Cartão de Crédito',
        limit: 5000.0,
        closingDay: 5,
        dueDay: 15,
        userId: user.id,
      },
    });

    // Seed default goals
    await this.prisma.financialGoal.createMany({
      data: [
        { name: 'Reserva de Emergência', targetAmount: 10000.0, currentAmount: 1000.0, userId: user.id },
        { name: 'Viagem dos Sonhos', targetAmount: 5000.0, currentAmount: 500.0, userId: user.id },
      ],
    });

    // Seed a couple of default notifications
    await this.prisma.notification.createMany({
      data: [
        { title: 'Bem-vindo(a) ao Contable!', message: 'Comece cadastrando suas contas e despesas para ter controle total de suas finanças.', userId: user.id },
      ],
    });

    // Seed initial AI financial insights
    await this.prisma.aiInsight.createMany({
      data: [
        { text: 'Sua reserva de emergência está em 10% da meta. Guardar 15% da sua renda mensal ajudará a atingir mais rápido.', type: 'TIP', userId: user.id },
      ],
    });

    const token = this.jwtService.sign({ userId: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } };
  }

  async login(data: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ userId: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } };
  }

  async socialLogin(data: any) {
    // Simulating OAuth registration/login (Google / Apple)
    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      const randomPassword = Math.random().toString(36).substring(2);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name || 'Usuário Social',
          plan: 'FREE',
        },
      });

      // Seed defaults
      await this.prisma.account.create({
        data: {
          name: 'Conta Corrente',
          type: 'CHECKING',
          balance: 1500.0,
          userId: user.id,
        },
      });
    }

    const token = this.jwtService.sign({ userId: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } };
  }

  async updateProfile(userId: number, data: any) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
      },
    });
    return { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, plan: updatedUser.plan };
  }

  async upgradePlan(userId: number) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        plan: 'PREMIUM',
      },
    });
    return { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, plan: updatedUser.plan };
  }
}
