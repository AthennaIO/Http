/**
 * @athenna/http
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ArtisanProvider } from '@athenna/artisan'
import { Path, File, Folder } from '@athenna/common'
import { AfterEach, BeforeEach } from '@athenna/test'
import { TestCommand } from '@athenna/artisan/testing/plugins'

export class BaseCommandTest {
  public originalPackageJson = new File(Path.pwd('package.json')).getContentAsStringSync()

  @BeforeEach()
  public async beforeEach() {
    new ArtisanProvider().register()

    TestCommand.setArtisanPath(Path.fixtures('consoles/base-console.ts'))
  }

  @AfterEach()
  public async afterEach() {
    await Folder.safeRemove(Path.http())
    await Folder.safeRemove(Path.fixtures('storage'))

    await new File(Path.pwd('package.json')).setContent(this.originalPackageJson)
  }
}
