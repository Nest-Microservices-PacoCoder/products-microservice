import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    void this.$connect();
    this.logger.log('Database connected...');
  }

  private async findProductOrThrow(id: number) {
    try {
      const product = await this.product.findUnique({
        where: { id, available: true },
      });

      if (!product) {
        // ⛔ antes: throw new NotFoundException(...)
        throw new RpcException({
          message: `No existe un producto con id ${id}.`,
          status: HttpStatus.NOT_FOUND,
        });
      }

      return product;
    } catch (error) {
      // Prisma: ID inválido
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2023') {
          // ⛔ antes: BadRequestException
          throw new RpcException({
            message: `El id ${id} es inválido.`,
            status: HttpStatus.BAD_REQUEST,
          });
        }
      }

      // Si ya es un RpcException, la relanzamos
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`Error en findProductOrThrow: ${error}`);
      throw new RpcException('Error interno al buscar el producto.');
    }
  }

  async create(createProductDto: CreateProductDto) {
    try {
      return await this.product.create({
        data: createProductDto,
      });
    } catch (error) {
      this.logger.error(`Error en create: ${error}`);
      throw new RpcException('Error interno al crear el producto.');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    try {
      // Cuántos productos hay en total
      const totalItems = await this.product.count({
        where: { available: true },
      });

      // Número de páginas (si no hay items, dejamos 1 para que la página 1 no explote)
      const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / limit);

      // ❌ Si me piden una página que no existe, lanzo el error
      if (page > totalPages) {
        throw new RpcException({
          message: `La página ${page} no existe. El último número de página es ${totalPages}.`,
          status: HttpStatus.BAD_REQUEST,
        });
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
    } catch (error) {
      if (error instanceof RpcException) throw error;

      this.logger.error(`Error en findAll: ${error}`);
      throw new RpcException('Error interno al obtener los productos.');
    }
  }

  async findOne(id: number) {
    try {
      // 👈 importante el await para que el try/catch capture
      return await this.findProductOrThrow(id);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`Error en findOne: ${error}`);
      throw new RpcException('Error interno al buscar el producto.');
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
      // Prisma: registro no encontrado en update
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new RpcException(`No existe un producto con id ${id}.`);
        }
      }

      if (error instanceof RpcException) throw error;

      this.logger.error(`Error en update: ${error}`);
      throw new RpcException('Error interno al actualizar el producto.');
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
      // Prisma: registro no encontrado en update
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new RpcException(`No existe un producto con id ${id}.`);
        }
      }

      if (error instanceof RpcException) throw error;

      this.logger.error(`Error en remove: ${error}`);
      throw new RpcException('Error interno al eliminar el producto.');
    }
  }
}
