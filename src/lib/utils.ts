export function cn(...values: Array<string | undefined | false | null | Record<string, boolean>>): string {
  const classNames: string[] = [];
  values.forEach((value) => {
    if (!value) return;
    if (typeof value === "string") {
      classNames.push(value);
      return;
    }
    Object.entries(value).forEach(([key, condition]) => {
      if (condition) classNames.push(key);
    });
  });
  return classNames.join(" ");
}
