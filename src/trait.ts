/*
 * @poppinss/traits
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * The trait constructor shape. It should not define constructor
 * and hence cannot received `new` arguments as well
 */
type TraitConstructor<T = {}> = { new (): T }

/**
 * The destination class constructor with a generic `new` signature. The
 * trait author can also enforce it's own constructor shape as well
 */
type DestinationConstructor<T = {}> = { new (...args: any[]): T }

/**
 * Ignore these properties from getting copied to the dest class
 */
const BASE_STATIC_PROPS = ['length', 'prototype', 'name']

/**
 * Ignore these prototype properties from getting copied to the
 * dest class
 */
const BASE_INSTANCE_PROPS = ['constructor']

/**
 * Copies static properties from source to the destination
 */
export function copyStaticProperties (source: any, dest: any, ignoreList?: string[]) {
  ignoreList = (ignoreList || [])
    .filter((prop) => prop.startsWith('static::'))
    .map((prop) => prop.replace('static::', ''))

  Object.getOwnPropertyNames(source)
    .filter((prop) => {
      return !BASE_STATIC_PROPS.includes(prop) && !ignoreList!.includes(prop)
    })
    .forEach((prop) => {
      const propDescriptor = Object.getOwnPropertyDescriptor(source, prop)!

      /**
       * Set value when source is a function
       */
      if (typeof (propDescriptor.value) === 'function') {
        Object.defineProperty(dest, prop, propDescriptor)
        return
      }

      /**
       * Set value when source has a getter or setter
       */
      if (propDescriptor.get || propDescriptor.set) {
        Object.defineProperty(dest, prop, propDescriptor)
        return
      }

      throw new Error('Traits disallow static properties. Enforce the destination class to define them')
    })
}

/**
 * Copy prototype properties from source to the destination
 */
export function copyPrototypeProperties (source: any, dest: any, ignoreList?: string[]) {
  ignoreList = (ignoreList || []).filter((prop) => !prop.startsWith('static::'))

  Object.getOwnPropertyNames(source.prototype)
    .filter((prop) => {
      return !BASE_INSTANCE_PROPS.includes(prop) && !ignoreList!.includes(prop)
    })
    .forEach((prop) => {
      const propDescriptor = Object.getOwnPropertyDescriptor(source.prototype, prop)!

      /**
       * Set value when source is a function
       */
      if (typeof (propDescriptor.value) === 'function') {
        Object.defineProperty(dest.prototype, prop, propDescriptor)
        return
      }

      /**
       * Set value when source has a getter or setter
       */
      if (propDescriptor.get || propDescriptor.set) {
        Object.defineProperty(dest.prototype, prop, propDescriptor)
        return
      }

      throw new Error('Traits disallow prototype properties. Enforce the destination class to define them')
    })
}

/**
 * Applies trait to a class constructor
 */
export function trait<Base = DestinationConstructor> (
  sourceTrait: TraitConstructor,
  ignoreList?: string[],
) {
  return function traitScoped (dest: Base) {
    copyStaticProperties(sourceTrait, dest, ignoreList)
    copyPrototypeProperties(sourceTrait, dest, ignoreList)
  }
}

/**
 * Applies an array of traits on a class in one go
 */
export function applyTraits<
  Base = DestinationConstructor,
> (base: Base, traits: TraitConstructor[]) {
  traits.forEach((one) => trait<Base>(one)(base))
}
