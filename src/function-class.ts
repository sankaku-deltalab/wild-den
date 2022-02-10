export interface FunctionClass<Func extends (...args: any[]) => any> {
  run(...args: Parameters<Func>): ReturnType<Func>;
}
