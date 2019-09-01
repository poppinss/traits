import { trait } from '../index'
import { Runner, ConstructorStatic } from './Runner'

interface User {
  run (): string
  username: string
}

@trait<ConstructorStatic>(Runner)
class User {
  public username: string
}

const user = new User()
user.run()
