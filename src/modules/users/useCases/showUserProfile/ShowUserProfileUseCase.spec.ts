import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let showUserProfileUseCase: ShowUserProfileUseCase
let createUserUseCase: CreateUserUseCase

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
  })

  it("should be able show user profile", async() => {
    const user = await createUserUseCase.execute({
      name: "Test",
      email: "test1@.com",
      password: "1234"
    })

    const result = await showUserProfileUseCase.execute(user.id as string)

    expect(result).toHaveProperty("id")
    expect(result.email).toBe(user.email)
  })

  it("should not be able show user profile if user doesn't exist", async() => {
    expect(async() => {
      await createUserUseCase.execute({
        name: "Test",
        email: "test1@.com",
        password: "1234"
      })

      await showUserProfileUseCase.execute("1232344")

    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
