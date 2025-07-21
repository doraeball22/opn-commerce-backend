import { Injectable } from '@nestjs/common';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { FreebieRule } from '../value-objects/freebie-rule.vo';
import { ProductId } from '../value-objects/product-id.vo';
import { Money } from '../value-objects/money.vo';

@Injectable()
export class FreebieService {
  /**
   * Evaluate which freebie rules can be applied to the cart
   * @param cart - Cart to evaluate
   * @param rules - Freebie rules to check
   * @returns Array of applicable freebie rules
   */
  evaluateFreebieRules(cart: Cart, rules: FreebieRule[]): FreebieRule[] {
    const applicableRules: FreebieRule[] = [];

    for (const rule of rules) {
      if (this.canApplyRule(cart, rule)) {
        applicableRules.push(rule);
      }
    }

    return applicableRules;
  }

  /**
   * Check if a freebie rule can be applied to the cart
   * @param cart - Cart to check
   * @param rule - Freebie rule to evaluate
   * @returns True if rule can be applied
   */
  canApplyRule(cart: Cart, rule: FreebieRule): boolean {
    const triggerProductId = rule.getTriggerProductId().getValue();

    // Check if trigger product exists in cart
    if (!cart.hasProduct(triggerProductId)) {
      return false;
    }

    // Check if trigger product is a regular item (not a freebie)
    const triggerItem = this.findRegularItem(cart, triggerProductId);
    if (!triggerItem) {
      return false;
    }

    // Check if freebie product would conflict with existing regular items
    const freebieProductId = rule.getFreebieProductId().getValue();
    const existingFreebieItem = this.findRegularItem(cart, freebieProductId);
    if (existingFreebieItem) {
      // Can't add freebie if the same product already exists as a regular item
      return false;
    }

    return true;
  }

  /**
   * Apply a freebie rule to the cart
   * @param cart - Cart to modify
   * @param rule - Freebie rule to apply
   * @returns True if rule was successfully applied
   */
  applyFreebie(cart: Cart, rule: FreebieRule): boolean {
    if (!this.canApplyRule(cart, rule)) {
      return false;
    }

    try {
      cart.applyFreebie(rule);
      return true;
    } catch (error) {
      // Rule couldn't be applied (e.g., already exists)
      return false;
    }
  }

  /**
   * Remove freebie items triggered by a specific product
   * @param cart - Cart to modify
   * @param triggerProductId - Product ID that triggers the freebie
   */
  removeFreebiesByTrigger(cart: Cart, triggerProductId: string): void {
    const productId = ProductId.create(triggerProductId);
    const items = cart.getItems();

    // Find and collect freebie items to remove
    const freebieItemsToRemove: string[] = [];

    for (const item of items) {
      if (item.getIsFreebie() && item.getFreebieSource()?.equals(productId)) {
        freebieItemsToRemove.push(item.getProductId().getValue());
      }
    }

    // Remove the freebie items
    freebieItemsToRemove.forEach((productId) => {
      try {
        cart.removeItem(productId);
      } catch {
        // Item might already be removed
      }
    });
  }

  /**
   * Get all active freebies in the cart with their trigger information
   * @param cart - Cart to analyze
   * @returns Array of freebie information
   */
  getActiveFreebies(cart: Cart): Array<{
    freebieItem: CartItem;
    triggerProduct: string;
    ruleName: string;
    savings: Money;
  }> {
    const freebieItems = cart.getFreebieItems();
    const freebieRules = cart.getFreebieRules();
    const activeFreebies: Array<{
      freebieItem: CartItem;
      triggerProduct: string;
      ruleName: string;
      savings: Money;
    }> = [];

    for (const freebieItem of freebieItems) {
      const triggerProductId = freebieItem.getFreebieSource();
      if (!triggerProductId) continue;

      // Find the rule that created this freebie
      const matchingRule = freebieRules.find(
        (rule) =>
          rule.getTriggerProductId().equals(triggerProductId) &&
          rule.getFreebieProductId().equals(freebieItem.getProductId()),
      );

      if (matchingRule) {
        // Calculate savings (the value of the freebie item)
        const savings = freebieItem.getLineTotalWithFreebies();

        activeFreebies.push({
          freebieItem,
          triggerProduct: triggerProductId.getValue(),
          ruleName: matchingRule.getName(),
          savings,
        });
      }
    }

    return activeFreebies;
  }

  /**
   * Calculate total savings from freebies
   * @param cart - Cart to analyze
   * @returns Total savings from all freebies
   */
  calculateTotalFreebiesavings(cart: Cart): Money {
    const activeFreebies = this.getActiveFreebies(cart);

    if (activeFreebies.length === 0) {
      return Money.create(0, 'THB');
    }

    let totalSavings = Money.zero(activeFreebies[0].savings.getCurrency());

    for (const freebie of activeFreebies) {
      totalSavings = totalSavings.add(freebie.savings);
    }

    return totalSavings;
  }

  /**
   * Validate freebie rule configuration
   * @param rule - Freebie rule to validate
   * @returns Array of validation errors (empty if valid)
   */
  validateFreebieRule(rule: FreebieRule): string[] {
    const errors: string[] = [];

    try {
      // Basic validation is done in FreebieRule constructor

      // Additional business validation
      if (rule.getTriggerProductId().equals(rule.getFreebieProductId())) {
        errors.push('Trigger product and freebie product cannot be the same');
      }

      if (!rule.getFreebieQuantity().isPositive()) {
        errors.push('Freebie quantity must be positive');
      }

      if (rule.getFreebieQuantity().getValue() > 100) {
        errors.push('Freebie quantity seems unreasonably large');
      }

      if (!rule.getName() || rule.getName().trim().length === 0) {
        errors.push('Freebie rule must have a name');
      }
    } catch (error) {
      errors.push(`Freebie rule validation failed: ${error.message}`);
    }

    return errors;
  }

  /**
   * Create a freebie rule with validation
   * @param name - Rule name
   * @param triggerProductId - Product that triggers the freebie
   * @param freebieProductId - Product to give as freebie
   * @param freebieQuantity - Quantity of freebie product
   * @returns Created freebie rule
   */
  createFreebieRule(
    name: string,
    triggerProductId: string,
    freebieProductId: string,
    freebieQuantity: number = 1,
  ): FreebieRule {
    const rule = FreebieRule.create(
      name,
      triggerProductId,
      freebieProductId,
      freebieQuantity,
    );
    const errors = this.validateFreebieRule(rule);

    if (errors.length > 0) {
      throw new Error(`Invalid freebie rule: ${errors.join(', ')}`);
    }

    return rule;
  }

  /**
   * Check for freebie rule conflicts
   * @param existingRules - Current freebie rules
   * @param newRule - New rule to check
   * @returns Array of conflict descriptions
   */
  checkRuleConflicts(
    existingRules: FreebieRule[],
    newRule: FreebieRule,
  ): string[] {
    const conflicts: string[] = [];

    for (const existingRule of existingRules) {
      // Same name conflict
      if (existingRule.getName() === newRule.getName()) {
        conflicts.push(`Rule with name '${newRule.getName()}' already exists`);
      }

      // Same trigger and freebie conflict
      if (
        existingRule
          .getTriggerProductId()
          .equals(newRule.getTriggerProductId()) &&
        existingRule.getFreebieProductId().equals(newRule.getFreebieProductId())
      ) {
        conflicts.push(
          `Conflicting rule: ${existingRule.getName()} already gives ${newRule.getFreebieProductId().getValue()} for ${newRule.getTriggerProductId().getValue()}`,
        );
      }

      // Circular dependency check
      if (
        existingRule
          .getTriggerProductId()
          .equals(newRule.getFreebieProductId()) &&
        existingRule.getFreebieProductId().equals(newRule.getTriggerProductId())
      ) {
        conflicts.push(
          `Circular dependency: ${existingRule.getName()} and ${newRule.getName()} would create a loop`,
        );
      }
    }

    return conflicts;
  }

  /**
   * Get freebie rule information for display
   * @param rule - Freebie rule
   * @returns Formatted rule information
   */
  getFreebieRuleInfo(rule: FreebieRule): {
    name: string;
    description: string;
    triggerProduct: string;
    freebieProduct: string;
    freebieQuantity: number;
  } {
    return {
      name: rule.getName(),
      description: rule.toString(),
      triggerProduct: rule.getTriggerProductId().getValue(),
      freebieProduct: rule.getFreebieProductId().getValue(),
      freebieQuantity: rule.getFreebieQuantity().getValue(),
    };
  }

  private findRegularItem(cart: Cart, productId: string): CartItem | null {
    const items = cart.getItems();

    for (const item of items) {
      if (
        item.getProductId().getValue() === productId &&
        !item.getIsFreebie()
      ) {
        return item;
      }
    }

    return null;
  }
}
