/*
 * @poppinss/traits
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import test from 'japa'
import { copyPrototypeProperties } from '../src/trait'

test.group('Copy prototype', () => {
  test('copy instance properties from base class to dest class', (assert) => {
    class Runner {
      public run (): string {
        return this.constructor.name
      }
    }

    class User {}
    copyPrototypeProperties(Runner, User)
    assert.equal(new User()['run'](), 'User')
  })

  test('instance methods should be able to access dest props', (assert) => {
    class Runner {
      public run (): string {
        return `${this['username']} runs`
      }
    }

    class User {
      public username = 'virk'
    }

    copyPrototypeProperties(Runner, User)
    assert.equal(new User()['run'](), 'virk runs')
  })

  test('raise error when base class defines prototype properties', (assert) => {
    class Runner {
      public run (): string {
        return `${this['username']} runs`
      }
    }
    Runner.prototype['username'] = 'virk'

    class User {
      public username = 'virk'
    }

    const fn = () => copyPrototypeProperties(Runner, User)
    assert.throw(fn, 'Traits disallow prototype properties. Enforce the destination class to define them')
  })

  test('allow instance props but do not copy them', (assert) => {
    class Runner {
      public username = 'virk'

      public run (): string {
        return `${this.username} runs`
      }
    }

    class User {
      public username = 'nikk'
    }

    copyPrototypeProperties(Runner, User)
    assert.equal(new User()['run'](), 'nikk runs')
  })

  test('allow initialized getters', (assert) => {
    class Runner {
      private _username: string

      public get username () {
        return this._username.toUpperCase()
      }

      public run (): string {
        return `${this.username} runs`
      }
    }

    class User {
      public _username = 'virk'
    }

    copyPrototypeProperties(Runner, User)
    assert.equal(new User()['run'](), 'VIRK runs')
  })

  test('setter should set the value on destination', (assert) => {
    class Runner {
      private _username: string

      public get username () {
        return this._username
      }

      public set username (value: string) {
        this._username = value
      }

      public run (): string {
        return `${this.username} runs`
      }
    }

    class User {
      public _username = 'virk'
    }

    copyPrototypeProperties(Runner, User)
    User['username'] = 'nikk'

    const user = new User()
    user['username'] = 'nikk'

    // eslint-disable-next-line no-proto
    assert.isUndefined(user['__proto__'].username)
    assert.equal(user['username'], 'nikk')
  })

  test('do not copy ignored members', (assert) => {
    class Runner {
      private _username: string

      public get username () {
        return this._username.toUpperCase()
      }

      public run (): string {
        return `${this.username} runs`
      }
    }

    class User {
      public _username = 'virk'
    }

    copyPrototypeProperties(Runner, User, ['username'])
    assert.equal(new User()['run'](), 'undefined runs')
  })
})
