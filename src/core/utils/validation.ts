import { ValidationError } from 'class-validator';

export type DynamicChildrenProvider = (value: any) => ValidationError[] | undefined;

export function formatValidationErrors(
  errors: ValidationError[],
  dynamicChildren?: Record<string, DynamicChildrenProvider>
): string[] {
  const out: string[] = [];

  walkTree(errors, undefined, 0, out, dynamicChildren, undefined);
  return out;
}

function walkTree(
  errs: ValidationError[],
  parentPath: string | undefined,
  indent: number,
  out: string[],
  dynamicChildren?: Record<string, DynamicChildrenProvider>,
  baseForRel?: string
) {
  for (const e of errs) {
    const path = parentPath ? `${parentPath}.${e.property}` : e.property;
    const hasConstraints = !!e.constraints && Object.keys(e.constraints!).length > 0;

    let dynChildren: ValidationError[] = [];
    if (dynamicChildren && e.constraints) {
      for (const [constraintName, provider] of Object.entries(dynamicChildren)) {
        if (e.constraints[constraintName]) {
          dynChildren = dynChildren.concat(provider(e.value) ?? []);
        }
      }
    }

    const normalChildren = e.children ?? [];
    const allChildren = normalChildren.concat(dynChildren);

    if (hasConstraints) {
      const headerLabel = relLabel(path, baseForRel);
      for (const msg of Object.values(e.constraints!)) {
        out.push(`${'  '.repeat(indent)}- ${headerLabel}: ${msg}`);
      }

      if (!hasDynamicInSubtree(e, dynamicChildren)) {
        flattenToOut(allChildren, path, out, indent);
      } else {
        for (const child of allChildren) {
          walkTree([child], path, indent + 1, out, dynamicChildren, path);
        }
      }
      continue;
    }

    if (allChildren.length > 0) {
      const shouldShowContainer =
        allChildren.length > 1 && hasDynamicInSubtree(e, dynamicChildren);

      if (shouldShowContainer) {
        const containerLabel = relLabel(path, baseForRel);
        out.push(`${'  '.repeat(indent)}- ${containerLabel}`);
        for (const child of allChildren) {
          walkTree([child], path, indent + 1, out, dynamicChildren, path);
        }
      } else {
        for (const child of allChildren) {
          walkTree([child], path, indent, out, dynamicChildren, baseForRel);
        }
      }
    }
  }
}

function relLabel(path: string, base?: string) {
  if (!base) return path;
  const prefix = base + '.';
  return path.startsWith(prefix) ? path.slice(prefix.length) : path;
}

function hasDynamicInSubtree(
  node: ValidationError,
  dynamicChildren?: Record<string, DynamicChildrenProvider>
): boolean {
  if (!dynamicChildren) return false;
  const keys = Object.keys(dynamicChildren);
  const stack: ValidationError[] = [node];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur.constraints && keys.some(k => !!cur.constraints![k])) return true;
    if (cur.children?.length) stack.push(...cur.children);
  }
  return false;
}

function flattenToOut(
  errs: ValidationError[],
  basePath: string,
  out: string[],
  indent: number
) {
  const tmp: string[] = [];
  flatten(errs, basePath, tmp);
  for (const line of tmp) {
    out.push(`${'  '.repeat(indent)}- ${line}`);
  }
}

function flatten(errs: ValidationError[], parentPath: string | undefined, out: string[]) {
  for (const e of errs) {
    const path = parentPath ? `${parentPath}.${e.property}` : e.property;
    if (e.constraints) {
      for (const msg of Object.values(e.constraints)) {
        out.push(`${path}: ${msg}`);
      }
    }
    if (e.children?.length) {
      flatten(e.children, path, out);
    }
  }
}
