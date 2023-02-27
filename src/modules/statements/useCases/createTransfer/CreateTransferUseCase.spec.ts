import { User } from "../../../users/entities/User"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateTransferError } from "./CreateTransferError"
import { CreateTransferUseCase } from "./CreateTransferUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let valueTransferUseCase: CreateTransferUseCase
let loggedInUser: User
let user : User

describe("Create Transfer", () => {
  beforeEach(async() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    valueTransferUseCase = new CreateTransferUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)

    loggedInUser = await inMemoryUsersRepository.create({
      name: "Test",
      email: "test2@.com",
      password: "1234"
    })

    user = await inMemoryUsersRepository.create({
      name: "Test",
      email: "test1@.com",
      password: "4321"
    })

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      description: "Deposit",
      amount: 200,
      type: OperationType.DEPOSIT
    })
  })

  it("should be able value transfer for another account", async() => {
    const statementCreated = await valueTransferUseCase.execute({
      sender_id: loggedInUser.id as string,
      user_id: user.id as string,
      description: "Deposit",
      amount: 200,
      type: OperationType.TRANSFER
    })

    expect(statementCreated).toHaveProperty("id")
  })

  it("should not be able value transfer for another account if sender user not found", async() => {
    await expect(valueTransferUseCase.execute({
        sender_id: "",
        user_id: user.id as string,
        description: "Deposit",
        amount: 200,
        type: OperationType.TRANSFER
      })
    ).rejects.toEqual(new CreateTransferError.UserNotFound())
  })

  it("should not be able value transfer for another account if user not found", async() => {
    await expect(valueTransferUseCase.execute({
        sender_id: loggedInUser.id as string,
        user_id: "",
        description: "Deposit",
        amount: 200,
        type: OperationType.TRANSFER

      })
    ).rejects.toEqual(new CreateTransferError.UserNotFound())
  })

  it("should not be able value transfer for another account if sender user not found", async() => {
    await expect(valueTransferUseCase.execute({
        sender_id: "",
        user_id: user.id as string,
        description: "Deposit",
        amount: 200,
        type: OperationType.TRANSFER
      })
    ).rejects.toEqual(new CreateTransferError.UserNotFound())
  })

  it("should not be able to transfer amounts from the account to itself", async() => {
    await expect(valueTransferUseCase.execute({
        sender_id: loggedInUser.id as string,
        user_id: loggedInUser.id as string,
        description: "Deposit",
        amount: 200,
        type: OperationType.TRANSFER

      })
    ).rejects.toEqual(new CreateTransferError.ImpossibleOperation())
  })
})
