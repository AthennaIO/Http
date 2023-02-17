import { TerminateContext } from '#src/Types/Contexts/TerminateContext'
import { TerminatorContract } from '#src/Contracts/Middlewares/TerminatorContract'

export class Terminator implements TerminatorContract {
  terminate(_: TerminateContext) {}
}
