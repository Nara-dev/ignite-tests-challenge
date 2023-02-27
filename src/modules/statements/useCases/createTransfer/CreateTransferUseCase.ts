import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferStatementDTO } from "./ICreateTransferDTO.";

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({sender_id, user_id, amount, description, type}: ICreateTransferStatementDTO) {
    const user = await this.usersRepository.findById(user_id)
    const senderUser = await this.usersRepository.findById(sender_id as string)

    if(user === senderUser) {
      throw new CreateTransferError.ImpossibleOperation()
    }

    if(!user) {
      throw new CreateTransferError.UserNotFound()
    }

    if(!senderUser) {
      throw new CreateTransferError.UserNotFound()
    }

    if(type === 'transfer') {
      const { balance } = await this.statementsRepository.getUserBalance({ user_id });

      if (balance < amount) {
        throw new CreateTransferError.InsufficientFunds()
      }
    }

    const statementOperation = await this.statementsRepository.createTransfer({
      sender_id,
      user_id,
      type,
      amount,
      description
    });

    return statementOperation;

  }
}

