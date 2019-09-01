/*
 * @poppinss/traits
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import test from 'japa'
import { copyStaticProperties } from '../src/trait'

test.group('Copy static', () => {
  test('copy static properties from base class to dest class', (assert) => {
    class Runner {
      public static run (): string {
        return this.name
      }
    }

    class User {}
    copyStaticProperties(Runner, User)
    assert.equal(User['run'](), 'User')
  })

  test('static methods should be able to access dest props', (assert) => {
    class Runner {
      public static run (): string {
        return `${this['username']} runs`
      }
    }

    class User {
      public static username = 'virk'
    }

    copyStaticProperties(Runner, User)
    assert.equal(User['run'](), 'virk runs')
  })

  test('raise error when base class defines static properties', (assert) => {
    class Runner {
      public static username = 'virk'
      public static run (): string {
        return `${this['username']} runs`
      }
    }

    class User {
      public static username = 'virk'
    }

    const fn = () => copyStaticProperties(Runner, User)
    assert.throw(fn, 'Traits disallow static properties. Enforce the destination class to define them')
  })

  test('allow uninitialized static props', (assert) => {
    class Runner {
      public static username: string
      public static run (): string {
        return `${this['username']} runs`
      }
    }

    class User {
      public static username = 'virk'
    }

    copyStaticProperties(Runner, User)
    assert.equal(User['run'](), 'virk runs')
  })

  test('allow initialized getters', (assert) => {
    class Runner {
      private static _username: string

      public static get username () {
        return this._username.toUpperCase()
      }

      public static run (): string {
        return `${this.username} runs`
      }
    }

    class User {
      public static _username = 'virk'
    }

    copyStaticProperties(Runner, User)
    assert.equal(User['run'](), 'VIRK runs')
  })

  test('setter should set the value on destination', (assert) => {
    class Runner {
      private static _username: string

      public static get username () {
        return this._username
      }

      public static set username (value: string) {
        this._username = value
      }

      public static run (): string {
        return `${this.username} runs`
      }
    }

    class User {
      public static _username = 'virk'
    }

    copyStaticProperties(Runner, User)
    User['username'] = 'nikk'

    assert.isUndefined(Runner.username)
    assert.equal(User['username'], 'nikk')
  })

  test('do not copy ignored properties', (assert) => {
    class Runner {
      private static _username: string

      public static get username () {
        return this._username.toUpperCase()
      }

      public static run (): string {
        return `${this.username} runs`
      }
    }

    class User {
      public static _username = 'virk'
    }

    copyStaticProperties(Runner, User, ['static::username'])
    assert.equal(User['run'](), 'undefined runs')
  })
})
