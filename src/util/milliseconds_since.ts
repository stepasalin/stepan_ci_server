export function millisecondsSince(someDate: Date) : number {
  const now = new Date().getTime();
  const timePassed = now - someDate.getTime();
  return timePassed;
}