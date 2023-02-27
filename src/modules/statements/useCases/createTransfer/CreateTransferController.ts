import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

export class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {

    const createTransferUseCase = container.resolve(CreateTransferUseCase)
    const { id: user_id } = request.user;
    const { amount, description, sender_id } = request.body;

    const splittedPath = request.originalUrl.split('/')
    const type = splittedPath[splittedPath.length - 1] as OperationType;

    const transfer = await createTransferUseCase.execute({
      sender_id,
      user_id,
      description,
      amount, type
    })

    return response.status(201).json(transfer)

  }


}
