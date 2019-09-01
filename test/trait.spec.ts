/*
* @poppinss/traits
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'
import { trait } from '../src/trait'

test.group('Trait', () => {
  test('apply multiple traits on a class', (assert) => {
    class Runner {
      public static run (): string {
        return this.name
      }
    }

    class Mover {
      public static walk (): string {
        return this.name
      }
    }

    @trait(Runner)
    @trait(Mover)
    class User {}

    assert.equal(User['run'](), 'User')
    assert.equal(User['walk'](), 'User')
  })

  test('enforce properties using types', (assert) => {
    class Runner {
      public static username: string
      public static maxSpeed: string

      public static run (): string {
        return `${this.username} runs at ${this.maxSpeed}kmph/hr`
      }
    }

    class Mover {
      public static username: string
      public static walk (): string {
        return `${this.username} walks`
      }
    }

    type Const<T> = { new(): T }
    type RunnerConstructor<T = Const<{ speed: number }> & { maxSpeed: number }> = T
    type WalkerConstructor<T = Const<{ steps: number }> & { username: string }> = T

    @trait<RunnerConstructor>(Runner)
    @trait<WalkerConstructor>(Mover)
    class User {
      public speed: number
      public steps: number
      public static maxSpeed: number = 22
      public static username: string = 'virk'
    }

    assert.equal(User['run'](), 'virk runs at 22kmph/hr')
    assert.equal(User['walk'](), 'virk walks')
  })
})
