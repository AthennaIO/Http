import { Terminator, TerminateContext, TerminatorContract } from '#src'

@Terminator({ type: 'singleton', alias: 'decoratedGlobalTerminator', isGlobal: true })
export class DecoratedGlobalTerminator implements TerminatorContract {
  terminate(_: TerminateContext) {}
}
