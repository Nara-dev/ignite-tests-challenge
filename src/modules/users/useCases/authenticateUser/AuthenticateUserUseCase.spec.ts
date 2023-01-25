import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"

let authenticateUserUseCase: AuthenticateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able authenticate user", async() => {
    await createUserUseCase.execute({
      name: "Test",
      email: "test@2.com",
      password: "test"
    })

    const userInformation = await authenticateUserUseCase.execute({
      email: "test@2.com",
      password: "test"
    })

    expect(userInformation).toHaveProperty("token")
  })

  it("should not be able authenticate an no existent user", async() => {
    expect(async() => {
      await createUserUseCase.execute({
        name: "Test",
        email: "test@2.com",
        password: "test"
      })

      await authenticateUserUseCase.execute({
        email: "test.com",
        password: "test"
      })

    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("should not be able authenticate with incorrect password", async() => {
    expect(async() => {
      await createUserUseCase.execute({
        name: "Test",
        email: "test@2.com",
        password: "test"
      })

      await authenticateUserUseCase.execute({
        email: "test@2.com",
        password: "12345"
      })

    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
