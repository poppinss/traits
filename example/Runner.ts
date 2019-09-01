export class Runner {
  public username = 'virk'
  public run () {
    return `${this.username} runs`
  }
}

type Constructor<T> = { new (): T }
export type ConstructorStatic<T = Constructor<{ username: string }>> = T
