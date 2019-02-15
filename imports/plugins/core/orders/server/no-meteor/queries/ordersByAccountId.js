import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name ordersByAccountId
 * @method
 * @memberof Order/NoMeteorQueries
 * @summary Query the Orders collection for orders made by the provided accountId and (optionally) shopIds
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.accountId - Account ID to search orders for
 * @param {String} params.shopIds - Shop IDs for the shops that owns the orders
 * @return {Promise<Object>|undefined} - An Array of Order documents, if found
 */
export default async function ordersByAccountId(context, { accountId, shopIds } = {}) {
  const { accountId: contextAccountId, collections, shopsUserHasPermissionFor, userHasPermission } = context;
  const { Orders } = collections;

  if (!accountId) {
    throw new ReactionError("invalid-param", "You must provide accountId arguments");
  }

  if (accountId !== contextAccountId) {
    // If an admin wants all orders for an account, we force it to be limited to the
    // shops for which they're allowed to see orders.
    if (!shopIds) {
      shopIds = shopsUserHasPermissionFor("orders");
    } else {
      shopIds.forEach((shopId) => {
        if (!userHasPermission(["orders"], shopId)) {
          throw new ReactionError("access-denied", "Access Denied");
        }
      });
    }
  }

  const query = {
    accountId
  };

  if (shopIds) query.shopId = { $in: shopIds };

  return Orders.find(query);
}
