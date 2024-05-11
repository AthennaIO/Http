/**
 * @athenna/ioc
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotFoundValidatorException extends Exception {
  public constructor(alias: string, namedAlias: string) {
    super({
      status: 500,
      code: 'E_NOT_FOUND_VALIDATOR_ERROR',
      message: `The validator with ${namedAlias} named alias and ${alias} alias has not been found inside the container.`,
      help: `Remember to register the validator in your .athennarc.json file.`
    })
  }
}
