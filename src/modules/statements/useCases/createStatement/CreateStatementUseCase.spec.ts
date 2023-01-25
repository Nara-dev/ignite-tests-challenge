import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let createStatementUseCase: CreateStatementUseCase
let createUserUseCase: CreateUserUseCase
let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,inMemoryStatementsRepository
    )
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able to create a new statement", async() => {
    const user = await createUserUseCase.execute({
      name: "Test",
      email: "test2@.com",
      password: "1234"
    })

    const statementCreated = await createStatementUseCase.execute({
      user_id: user.id as string,
      description: "Deposit",
      amount: 200,
      type: OperationType.DEPOSIT
    })

    expect(statementCreated).toHaveProperty("id")
  })

  it("should not be able to create a new statement if the user doesn't exist", () => {
    expect(async() => {
      await createStatementUseCase.execute({
        user_id: "122333",
        description: "Deposit",
        amount: 200,
        type: OperationType.DEPOSIT
      })

    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should not be able to create a new statement if the withdrawal type operation is greater than the balance", () => {
    expect(async() => {
      const user = await createUserUseCase.execute({
        name: "Test",
        email: "test2@.com",
        password: "1234"
      })

      await createStatementUseCase.execute({
        user_id: user.id as string,
        description: "WITHDRAW",
        amount: 200,
        type: OperationType.WITHDRAW
      })

    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
