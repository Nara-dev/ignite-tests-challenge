import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUserSRepository: InMemoryUsersRepository;

describe("Create User", () => {
    beforeEach(()=> {
        inMemoryUserSRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUserSRepository)
    })

    it("should be able to create a new user", async() => {
      await createUserUseCase.execute({
        name: "Test",
        email: "test@.com",
        password: "test"
      })

      const userCreated = await inMemoryUserSRepository.findByEmail("test@.com")

      expect(userCreated).toHaveProperty("id")
    })

    it("should not be able to create a new user with same email", () => {
      expect(async() => {
        await createUserUseCase.execute({
          name: "Test",
          email: "test@.com",
          password: "test"
        })
        const user = await createUserUseCase.execute({
          name: "Test",
          email: "test@.com",
          password: "test"
        })

      }).rejects.toBeInstanceOf(CreateUserError)
    })
})
