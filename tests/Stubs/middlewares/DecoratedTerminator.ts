import { Terminator, TerminateContext, TerminatorContract } from '#src'

@Terminator({ name: 'terminator', type: 'singleton', alias: 'decoratedTerminator', isGlobal: false })
export class DecoratedTerminator implements TerminatorContract {
  terminate(_: TerminateContext) {}
}
