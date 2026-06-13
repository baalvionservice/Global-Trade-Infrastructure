/**
 * @file server/repositories/domain-repositories.ts
 * @description Repositories for the trade sub-entities. Each is bound to one
 * trade transaction (`tradeTransactionId`) — enforcing "every object belongs to
 * exactly one trade".
 */
import {
  Rfq,
  Deal,
  Order,
  Escrow,
  Payment,
  Shipment,
  CustomsDeclaration,
  Settlement,
  Notification,
  Buyer,
  Supplier,
} from '@prisma/client';
import { BaseRepository, client } from './base-repository';
import { ModelDelegate, PrismaTransaction } from './types';

abstract class TradeScopedRepository<T extends { id: string; version?: number }> extends BaseRepository<T> {
  async findByTrade(tradeTransactionId: string, tx?: PrismaTransaction): Promise<T | null> {
    return this.findOne({ tradeTransactionId }, tx);
  }
}

export class RFQRepository extends TradeScopedRepository<Rfq> {
  protected readonly entityName = 'Rfq';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<Rfq> {
    return client(tx).rfq as unknown as ModelDelegate<Rfq>;
  }
}

export class DealRepository extends TradeScopedRepository<Deal> {
  protected readonly entityName = 'Deal';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<Deal> {
    return client(tx).deal as unknown as ModelDelegate<Deal>;
  }
}

export class OrderRepository extends TradeScopedRepository<Order> {
  protected readonly entityName = 'Order';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<Order> {
    return client(tx).order as unknown as ModelDelegate<Order>;
  }
}

export class EscrowRepository extends TradeScopedRepository<Escrow> {
  protected readonly entityName = 'Escrow';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<Escrow> {
    return client(tx).escrow as unknown as ModelDelegate<Escrow>;
  }
}

export class PaymentRepository extends TradeScopedRepository<Payment> {
  protected readonly entityName = 'Payment';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<Payment> {
    return client(tx).payment as unknown as ModelDelegate<Payment>;
  }
}

export class ShipmentRepository extends TradeScopedRepository<Shipment> {
  protected readonly entityName = 'Shipment';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<Shipment> {
    return client(tx).shipment as unknown as ModelDelegate<Shipment>;
  }
}

export class CustomsRepository extends TradeScopedRepository<CustomsDeclaration> {
  protected readonly entityName = 'CustomsDeclaration';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<CustomsDeclaration> {
    return client(tx).customsDeclaration as unknown as ModelDelegate<CustomsDeclaration>;
  }
}

export class SettlementRepository extends TradeScopedRepository<Settlement> {
  protected readonly entityName = 'Settlement';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<Settlement> {
    return client(tx).settlement as unknown as ModelDelegate<Settlement>;
  }
}

export class NotificationRepository extends BaseRepository<Notification> {
  protected readonly entityName = 'Notification';
  protected readonly softDeletes = false;
  protected delegate(tx?: PrismaTransaction): ModelDelegate<Notification> {
    return client(tx).notification as unknown as ModelDelegate<Notification>;
  }
  async listByTrade(tradeId: string, tx?: PrismaTransaction): Promise<Notification[]> {
    return client(tx).notification.findMany({ where: { tradeId }, orderBy: { createdAt: 'desc' } });
  }
}

export class BuyerRepository extends BaseRepository<Buyer> {
  protected readonly entityName = 'Buyer';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<Buyer> {
    return client(tx).buyer as unknown as ModelDelegate<Buyer>;
  }
  async findByExternalRef(organizationId: string, externalRef: string, tx?: PrismaTransaction): Promise<Buyer | null> {
    return this.findOne({ organizationId, externalRef }, tx);
  }
}

export class SupplierRepository extends BaseRepository<Supplier> {
  protected readonly entityName = 'Supplier';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<Supplier> {
    return client(tx).supplier as unknown as ModelDelegate<Supplier>;
  }
  async findByExternalRef(organizationId: string, externalRef: string, tx?: PrismaTransaction): Promise<Supplier | null> {
    return this.findOne({ organizationId, externalRef }, tx);
  }
}

export const rfqRepository = new RFQRepository();
export const dealRepository = new DealRepository();
export const orderRepository = new OrderRepository();
export const escrowRepository = new EscrowRepository();
export const paymentRepository = new PaymentRepository();
export const shipmentRepository = new ShipmentRepository();
export const customsRepository = new CustomsRepository();
export const settlementRepository = new SettlementRepository();
export const notificationRepository = new NotificationRepository();
export const buyerRepository = new BuyerRepository();
export const supplierRepository = new SupplierRepository();
