// backend/services/walletService.js
import { prisma } from "../db/prisma.js";

/**
 * Helper : s’assure qu’un wallet existe (par userId ou walletId).
 * Si aucun wallet trouvé mais que l’utilisateur existe → création auto.
 */
async function ensureWallet(userOrWalletId, tx = prisma) {
  // 1) chercher par userId
  let wallet = await tx.walletAccount.findUnique({
    where: { userId: userOrWalletId },
  });
  if (wallet) return wallet;

  // 2) chercher par wallet.id
  wallet = await tx.walletAccount.findUnique({
    where: { id: userOrWalletId },
  });
  if (wallet) return wallet;

  // 3) vérifier si c’est un user et créer un wallet
  const user = await tx.user.findUnique({ where: { id: userOrWalletId } });
  if (user) {
    return tx.walletAccount.create({
      data: { userId: user.id, balance: 0 },
    });
  }

  return null; // ni wallet ni user
}

/**
 * Récupère le solde actuel du wallet d'un utilisateur (via userId OU walletId).
 */
export async function getBalance(userOrWalletId) {
  // D’abord chercher par userId
  let wallet = await prisma.walletAccount.findUnique({
    where: { userId: userOrWalletId },
    select: { balance: true },
  });

  // Sinon essayer par wallet.id
  if (!wallet) {
    wallet = await prisma.walletAccount.findUnique({
      where: { id: userOrWalletId },
      select: { balance: true },
    });
  }

  // PATCH : si aucun wallet → le créer
  if (!wallet) {
    const created = await ensureWallet(userOrWalletId);
    return created?.balance ?? 0;
  }

  return wallet?.balance ?? 0;
}

/**
 * Liste les dernières transactions d’un wallet (via userId OU walletId).
 */
export async function listTxs(userOrWalletId, limit = 50) {
  // D’abord chercher le wallet par userId
  let wallet = await prisma.walletAccount.findUnique({
    where: { userId: userOrWalletId },
    select: { id: true },
  });

  // Sinon fallback par wallet.id
  if (!wallet) {
    wallet = await prisma.walletAccount.findUnique({
      where: { id: userOrWalletId },
      select: { id: true },
    });
  }

  // PATCH : auto-create wallet si inexistant
  if (!wallet) {
    wallet = await ensureWallet(userOrWalletId);
  }

  if (!wallet) return [];

  return prisma.walletTransaction.findMany({
    where: { accountId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Crédite le wallet d’un utilisateur (via userId OU walletId).
 */
export async function credit(userOrWalletId, amount, reference) {
  if (amount <= 0) throw new Error("Montant invalide");

  return prisma.$transaction(async (tx) => {
    // Chercher wallet via userId
    let wallet = await tx.walletAccount.findUnique({
      where: { userId: userOrWalletId },
    });

    // Sinon fallback via wallet.id
    if (!wallet) {
      wallet = await tx.walletAccount.findUnique({
        where: { id: userOrWalletId },
      });
    }

    // PATCH : auto-create si inexistant
    if (!wallet) {
      wallet = await ensureWallet(userOrWalletId, tx);
      if (!wallet) throw new Error("Wallet inexistant, impossible de créditer");
    }

    // Créditer
    const updated = await tx.walletAccount.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });

    return tx.walletTransaction.create({
      data: {
        accountId: wallet.id,
        type: "CREDIT",
        amount,
        reference,
        balanceBefore: wallet.balance,
        balanceAfter: updated.balance,
      },
    });
  });
}

/**
 * Débite le wallet d’un utilisateur (via userId OU walletId).
 */
export async function debit(userOrWalletId, amount, reference) {
  if (amount <= 0) throw new Error("Montant invalide");

  return prisma.$transaction(async (tx) => {
    // Chercher wallet via userId
    let wallet = await tx.walletAccount.findUnique({
      where: { userId: userOrWalletId },
      select: { id: true, balance: true },
    });

    // Sinon fallback via wallet.id
    if (!wallet) {
      wallet = await tx.walletAccount.findUnique({
        where: { id: userOrWalletId },
        select: { id: true, balance: true },
      });
    }

    // PATCH : auto-create si inexistant
    if (!wallet) {
      wallet = await ensureWallet(userOrWalletId, tx);
    }

    if (!wallet || wallet.balance < amount) {
      throw new Error("Solde insuffisant ou wallet inexistant");
    }

    const updated = await tx.walletAccount.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    });

    return tx.walletTransaction.create({
      data: {
        accountId: wallet.id,
        type: "DEBIT",
        amount,
        reference,
        balanceBefore: wallet.balance,
        balanceAfter: updated.balance,
      },
    });
  });
}
