import '@prisma/client';

declare module '@prisma/client' {
  // Extiende la interfaz PrismaClient para exponer los delegados generados
  // Esto evita errores TS cuando se accede a this.prisma.house o this.prisma.houseAccess
  interface PrismaClient {
    house: any;

    houseAccess: any;
  }
}
