export class OrderUtils {
  public static orderDependencies(
    dependencies: WithDependencies[]
  ): WithDependencies[] {
    let sortedDependencies: WithDependencies[] = [];
    let remaining = dependencies.map(d => ({
      node: d,
      dependencies: d.getDependencies()
    }));
    let toRemove = remaining.filter(d => d.dependencies.length === 0);

    while (toRemove.length) {
      sortedDependencies.push(...toRemove.map(item => item.node));
      // removing items with 0 dependencies
      remaining = remaining.filter(d => !toRemove.includes(d));

      // resolving dependencies from items
      remaining = remaining.map(d => {
        d.dependencies = d.dependencies.filter(
          dep => !toRemove.some(item => item.node === dep)
        );
        return d;
      });

      // assigning toRemove with items that have all dependencies resolved
      toRemove = remaining.filter(d => d.dependencies.length === 0);
    }

    if (remaining.length > 0) {
      console.error(
        'Circle dependency found',
        remaining.map(item => item.node)
      );
      return null;
    }

    return sortedDependencies;
  }
}

export interface WithDependencies {
  getDependencies(): WithDependencies[];
}
