import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetStatementOperationError } from "./GetStatementOperationError"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let getStatementOperationUseCase: GetStatementOperationUseCase
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should be able get statement operation", async() => {
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

    const statement = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statementCreated.id as string
    })

    expect(statement).toBe(statementCreated)
  })

  it("should not be able get statement operation if user doesn't exist", () => {
    expect(async() => {
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

      await getStatementOperationUseCase.execute({
        user_id: "1234455",
        statement_id: statementCreated.id as string
      })

    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  /*it("should not be able get statement operation if statement doesn't exist", () => {
    expect(async() => {
      const user = await createUserUseCase.execute({
        name: "Test",
        email: "test2@.com",
        password: "1234"
      })

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "test"
      })

    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })*/

})
