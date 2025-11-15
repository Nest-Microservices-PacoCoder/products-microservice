import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');
  onModuleInit() {
    void this.$connect();
    this.logger.log('Databae conneted...');
  }
  private async findProductOrThrow(id: number) {
    try {
      const product = await this.product.findUnique({
        where: { id, available: true },
      });
      if (!product) {
        throw new NotFoundException(`No existe un producto con id ${id}`);
      }
      return product;
    } catch (error) {
      // Prisma: ID invalido
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2023') {
          throw new BadRequestException(`El ID ${id} no es válido.`);
        }
      }
      // Si ya es un error de Nest lo relanzamos
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error en findOneOrThrow ${error}`);
      throw new InternalServerErrorException(
        'Error interno al buscar el producto.',
      );
    }
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    // Cuántos productos hay en total
    const totalItems = await this.product.count({ where: { available: true } });

    // Número de páginas (si no hay items, dejamos 1 para que la página 1 no explote)
    const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / limit);
    // ❌ Si me piden una página que no existe, lanzo el error
    if (page > totalPages) {
      throw new BadRequestException(
        `La página ${page} no existe. El último número de página es ${totalPages}.`,
      );
    }
    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true },
      }),
      meta: {
        totalItems,
        totalPages,
        page,
        limit,
      },
    };
  }

  async findOne(id: number) {
    try {
      return this.findProductOrThrow(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error en findOneOrThrow ${error}`);
      throw new InternalServerErrorException(
        'Error interno al buscar el producto.',
      );
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    try {
      await this.findProductOrThrow(id);
      const updated = await this.product.update({
        where: { id },
        data,
      });
      return updated;
    } catch (error) {
      // Prisma: ID invalido
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`No existe un procto con id ${id}.`);
        }
      }
      // Si ya es un error de Nest lo relanzamos
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error en findOneOrThrow ${error}`);
      throw new InternalServerErrorException(
        'Error interno al buscar el producto.',
      );
    }
  }

  async remove(id: number) {
    try {
      await this.findProductOrThrow(id);
      const product = await this.product.update({
        where: { id },
        data: {
          available: false,
        },
      });
      return product;
    } catch (error) {
      // Prisma: ID invalido
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`No existe un procto con id ${id}.`);
        }
      }
      // Si ya es un error de Nest lo relanzamos
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error en findOneOrThrow ${error}`);
      throw new InternalServerErrorException(
        'Error interno al buscar el producto.',
      );
    }
  }
}
