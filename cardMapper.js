/**
 * Card Mapper Service
 * Converts between Prisma Card objects and application Card objects
 */

/**
 * Converts a Prisma Card object to a Card object
 * @param {Object} prismaCard - The Prisma Card object
 * @returns {Object} The Card object
 */
function toCard(prismaCard) {
  return {
    id: prismaCard.id.toString(),
    content: prismaCard.content,
    position: {
      x: prismaCard.posX,
      y: prismaCard.posY
    },
    size: {
      width: prismaCard.width,
      height: prismaCard.height
    }
  };
}

/**
 * Converts a Card object to a Prisma Card data object
 * @param {Object} card - The Card object
 * @param {number} [messageId] - Optional message ID for association
 * @returns {Object} The Prisma Card data object
 */
function toPrismaCard(card, messageId = null) {
  return {
    content: card?.content ?? null,
    posX: card?.position?.x ?? null,
    posY: card?.position?.y ?? null,
    width: card?.size?.width ?? null,
    height: card?.size?.height ?? null,
    messageId: messageId
  };
}

module.exports = {
  toCard,
  toPrismaCard
};