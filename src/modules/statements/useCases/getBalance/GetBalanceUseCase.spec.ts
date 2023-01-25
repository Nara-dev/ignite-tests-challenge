import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let getBalanceUseCase: GetBalanceUseCase
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository,)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("should be able get balance", async() => {
    const user = await createUserUseCase.execute({
      name: "Test",
      email: "test2@.com",
      password: "1234"
    })

    await createStatementUseCase.execute({
      user_id: user.id as string,
      description: "Deposit",
      amount: 200,
      type: OperationType.DEPOSIT
    })

    const statement = await getBalanceUseCase.execute({
      user_id: user.id as string,
    })

    expect(statement.statement.length).toBe(1)
  })

  it("should not be able get balance if user doesn't exist", () => {
    expect(async() => {

      await getBalanceUseCase.execute({
        user_id: "1234455",
      })

    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
